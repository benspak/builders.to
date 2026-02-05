import { SocialPlatform } from '@prisma/client';
import {
  getConnectionTokens,
  updateConnectionTokens,
  upsertConnection,
  PlatformTokens,
  PlatformProfile,
} from './platforms.service';
import prisma from '@/lib/prisma';

// X API v2 endpoints (using api.x.com as per current documentation)
const TWITTER_API_BASE = 'https://api.x.com/2';
const TWITTER_MEDIA_API = 'https://api.x.com/2/media';
// OAuth token endpoint still uses api.twitter.com
const TWITTER_OAUTH_BASE = 'https://api.twitter.com/2/oauth2';

// Character limits (X Pro supports up to 25,000 chars, but we limit to 3000 for cross-posting)
export const TWITTER_MAX_CHARS = 3000;
export const TWITTER_MAX_MEDIA = 4; // Twitter allows up to 4 images per tweet

// Validate environment variables
function getTwitterCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.TWITTER_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Twitter credentials not configured. Please set TWITTER_CLIENT_ID and TWITTER_CLIENT_SECRET environment variables.');
  }

  return { clientId, clientSecret };
}

interface TwitterUser {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
}

interface TwitterTweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  public_metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
}

// X API v2 media upload response
interface MediaUploadResponse {
  data: {
    id: string;
    media_key?: string;
    expires_after_secs?: number;
    processing_info?: {
      check_after_secs?: number;
      progress_percent?: number;
      state: 'pending' | 'in_progress' | 'succeeded' | 'failed';
      error?: {
        code: number;
        name: string;
        message: string;
      };
    };
    size?: number;
  };
  errors?: Array<{
    title: string;
    type: string;
    detail: string;
    status: number;
  }>;
}

/**
 * Validate tweet content length
 */
export function validateTweetContent(text: string): { valid: boolean; error?: string } {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'Tweet content cannot be empty' };
  }

  // Twitter counts characters differently - URLs count as 23 chars
  // For simplicity, we'll use a basic character count
  // A more accurate implementation would use twitter-text library
  const charCount = text.length;

  if (charCount > TWITTER_MAX_CHARS) {
    return {
      valid: false,
      error: `Tweet exceeds ${TWITTER_MAX_CHARS} character limit (${charCount} characters)`
    };
  }

  return { valid: true };
}

/**
 * Refresh Twitter access token
 */
export async function refreshTwitterToken(refreshToken: string): Promise<PlatformTokens | null> {
  try {
    const { clientId, clientSecret } = getTwitterCredentials();

    const response = await fetch(`${TWITTER_OAUTH_BASE}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('X token refresh failed:', response.status, errorText);
      return null;
    }

    const data = await response.json();

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
      scopes: data.scope?.split(' ') || [],
    };
  } catch (error) {
    console.error('Twitter token refresh error:', error);
    return null;
  }
}

/**
 * Get authenticated Twitter user
 */
export async function getTwitterUser(accessToken: string): Promise<TwitterUser | null> {
  try {
    const response = await fetch(
      `${TWITTER_API_BASE}/users/me?user.fields=profile_image_url,name,username`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      return null;
    }

    const { data } = await response.json();
    return data;
  } catch {
    return null;
  }
}

/**
 * Get valid tokens, refreshing if needed
 */
async function getValidTokens(userId: string): Promise<string | null> {
  const tokens = await getConnectionTokens(userId, SocialPlatform.TWITTER);

  if (!tokens) {
    console.error('[X] No tokens found for user:', userId);
    return null;
  }

  // Check if token is expired or expiring within 5 minutes
  const now = Date.now();
  const expiresAt = tokens.expiresAt?.getTime() || 0;
  const isExpiringSoon = expiresAt - 5 * 60 * 1000 < now;

  if (tokens.expiresAt && isExpiringSoon) {
    console.log('[X] Token expired or expiring soon, refreshing...', {
      expiresAt: tokens.expiresAt,
      now: new Date(now),
    });

    if (!tokens.refreshToken) {
      console.error('[X] No refresh token available');
      return null;
    }

    const newTokens = await refreshTwitterToken(tokens.refreshToken);
    if (!newTokens) {
      console.error('[X] Token refresh failed');
      return null;
    }

    console.log('[X] Token refreshed successfully, new expiry:', newTokens.expiresAt);
    await updateConnectionTokens(userId, SocialPlatform.TWITTER, newTokens);
    return newTokens.accessToken;
  }

  return tokens.accessToken;
}

/**
 * Map content type to X API v2 media_type enum
 */
function getMediaType(contentType: string): string {
  const typeMap: Record<string, string> = {
    'image/jpeg': 'image/jpeg',
    'image/jpg': 'image/jpeg',
    'image/png': 'image/png',
    'image/gif': 'image/png', // GIFs are handled separately for animated content
    'image/webp': 'image/webp',
    'image/bmp': 'image/bmp',
    'image/tiff': 'image/tiff',
  };
  return typeMap[contentType.toLowerCase()] || 'image/jpeg';
}

/**
 * Upload media to X using API v2
 * Uses the simple upload endpoint for images under 5MB
 * Requires OAuth 2.0 with media.write scope
 */
export async function uploadTwitterMedia(
  accessToken: string,
  mediaUrl: string
): Promise<string | null> {
  try {
    // Fetch the media from the URL
    const mediaResponse = await fetch(mediaUrl);
    if (!mediaResponse.ok) {
      console.error('Failed to fetch media from URL:', mediaUrl);
      return null;
    }

    const mediaBuffer = await mediaResponse.arrayBuffer();
    const mediaBase64 = Buffer.from(mediaBuffer).toString('base64');

    // Determine media type from content-type header
    const contentType = mediaResponse.headers.get('content-type') || 'image/jpeg';
    const mediaType = getMediaType(contentType);

    // Upload to X using v2 media upload endpoint
    const uploadResponse = await fetch(`${TWITTER_MEDIA_API}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        media: mediaBase64,
        media_category: 'tweet_image',
        media_type: mediaType,
      }),
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('X media upload failed:', errorText);

      // Try to parse error for more details
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.errors?.length > 0) {
          console.error('X media upload error details:', errorJson.errors[0]);
        }
      } catch {
        // Error text wasn't JSON, already logged above
      }
      return null;
    }

    const uploadData: MediaUploadResponse = await uploadResponse.json();

    // Check for errors in response
    if (uploadData.errors && uploadData.errors.length > 0) {
      console.error('X media upload returned errors:', uploadData.errors);
      return null;
    }

    // Check if media needs processing (for larger files)
    if (uploadData.data.processing_info) {
      const processingResult = await waitForMediaProcessing(
        accessToken,
        uploadData.data.id
      );
      if (!processingResult) {
        console.error('X media processing failed');
        return null;
      }
    }

    return uploadData.data.id;
  } catch (error) {
    console.error('X media upload error:', error);
    return null;
  }
}

/**
 * Wait for media processing to complete (for larger files that need server-side processing)
 */
async function waitForMediaProcessing(
  accessToken: string,
  mediaId: string,
  maxAttempts = 30
): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const statusResponse = await fetch(
        `${TWITTER_MEDIA_API}/upload?media_id=${mediaId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!statusResponse.ok) {
        console.error('Failed to check media processing status');
        return false;
      }

      const statusData: MediaUploadResponse = await statusResponse.json();
      const processingInfo = statusData.data.processing_info;

      if (!processingInfo) {
        // No processing info means processing is complete
        return true;
      }

      if (processingInfo.state === 'succeeded') {
        return true;
      }

      if (processingInfo.state === 'failed') {
        console.error('Media processing failed:', processingInfo.error);
        return false;
      }

      // Wait before checking again
      const waitSeconds = processingInfo.check_after_secs || 2;
      await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));
    } catch (error) {
      console.error('Error checking media processing status:', error);
      return false;
    }
  }

  console.error('Media processing timed out');
  return false;
}

/**
 * Post a tweet with optional media
 */
export async function postTweet(
  userId: string,
  text: string,
  options?: {
    replyTo?: string;
    quoteTweetId?: string;
    mediaUrls?: string[];
  }
): Promise<{ id: string; text: string } | null> {
  // Validate content length
  const validation = validateTweetContent(text);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const accessToken = await getValidTokens(userId);

  if (!accessToken) {
    throw new Error('Twitter not connected or token expired. Please reconnect your Twitter account.');
  }

  try {
    const body: Record<string, unknown> = { text };

    if (options?.replyTo) {
      body.reply = { in_reply_to_tweet_id: options.replyTo };
    }

    if (options?.quoteTweetId) {
      body.quote_tweet_id = options.quoteTweetId;
    }

    // Upload media if provided
    if (options?.mediaUrls && options.mediaUrls.length > 0) {
      // Limit to max allowed media
      const mediaToUpload = options.mediaUrls.slice(0, TWITTER_MAX_MEDIA);
      const mediaIds: string[] = [];

      for (const mediaUrl of mediaToUpload) {
        const mediaId = await uploadTwitterMedia(accessToken, mediaUrl);
        if (mediaId) {
          mediaIds.push(mediaId);
        } else {
          console.warn(`Failed to upload media: ${mediaUrl}`);
        }
      }

      if (mediaIds.length > 0) {
        body.media = { media_ids: mediaIds };
      }
    }

    const response = await fetch(`${TWITTER_API_BASE}/tweets`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('X post error:', response.status, errorText);

      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        throw new Error(`X API error (${response.status}): ${errorText}`);
      }

      // Provide more helpful error messages based on status code and error details
      if (response.status === 403) {
        // 403 can mean access tier issues or permission problems
        if (error.detail?.includes('not authorized') || error.title === 'Forbidden') {
          throw new Error('X API access denied. Your app may need upgraded API access or the user needs to reconnect their account.');
        }
        throw new Error('X API access forbidden. Please check your API access tier and app permissions.');
      }
      if (response.status === 429 || error.detail?.includes('rate limit')) {
        throw new Error('X rate limit reached. Please try again later.');
      }
      if (response.status === 401 || error.title === 'Unauthorized') {
        throw new Error('X authentication failed. Please reconnect your account.');
      }
      if (error.detail?.includes('duplicate')) {
        throw new Error('This post has already been published (duplicate content)');
      }

      throw new Error(error.detail || error.title || `Failed to post to X (${response.status})`);
    }

    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error('Twitter post error:', error);
    throw error;
  }
}

/**
 * Delete a tweet
 */
export async function deleteTweet(userId: string, tweetId: string): Promise<boolean> {
  const accessToken = await getValidTokens(userId);

  if (!accessToken) {
    throw new Error('Twitter not connected or token expired');
  }

  try {
    const response = await fetch(`${TWITTER_API_BASE}/tweets/${tweetId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get user's home timeline
 */
export async function getTwitterTimeline(
  userId: string,
  options?: {
    maxResults?: number;
    paginationToken?: string;
  }
): Promise<{ tweets: TwitterTweet[]; users: TwitterUser[]; nextToken?: string } | null> {
  const accessToken = await getValidTokens(userId);

  if (!accessToken) {
    return null;
  }

  try {
    const connection = await prisma.platformConnection.findUnique({
      where: { userId_platform: { userId, platform: SocialPlatform.TWITTER } },
    });

    if (!connection?.platformUserId) {
      return null;
    }

    const params = new URLSearchParams({
      'tweet.fields': 'created_at,public_metrics,author_id',
      'user.fields': 'profile_image_url,name,username',
      expansions: 'author_id',
      max_results: String(options?.maxResults || 25),
    });

    if (options?.paginationToken) {
      params.set('pagination_token', options.paginationToken);
    }

    const response = await fetch(
      `${TWITTER_API_BASE}/users/${connection.platformUserId}/timelines/reverse_chronological?${params}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Twitter timeline error:', error);
      return null;
    }

    const data = await response.json();

    return {
      tweets: data.data || [],
      users: data.includes?.users || [],
      nextToken: data.meta?.next_token,
    };
  } catch (error) {
    console.error('Twitter timeline error:', error);
    return null;
  }
}

/**
 * Connect Twitter account (OAuth callback handling)
 */
export async function connectTwitterAccount(
  userId: string,
  code: string,
  codeVerifier: string
): Promise<boolean> {
  try {
    const { clientId, clientSecret } = getTwitterCredentials();
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/platforms/callback/twitter`;

    // Exchange code for tokens
    const tokenResponse = await fetch(`${TWITTER_OAUTH_BASE}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: clientId,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('X token exchange failed:', tokenResponse.status, errorText);
      return false;
    }

    const tokenData = await tokenResponse.json();

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

    const tokens: PlatformTokens = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt,
      scopes: tokenData.scope?.split(' ') || [],
    };

    // Get user profile
    const user = await getTwitterUser(tokens.accessToken);

    if (!user) {
      console.error('Failed to fetch Twitter user profile');
      return false;
    }

    const profile: PlatformProfile = {
      platformUserId: user.id,
      username: user.username,
      displayName: user.name,
      avatar: user.profile_image_url,
    };

    // Save connection
    await upsertConnection(userId, SocialPlatform.TWITTER, tokens, profile);

    // Sync username to User record if not already set
    // This ensures users who connect Twitter after signup get their username populated
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, twitterUrl: true },
    });

    if (!existingUser?.username && user.username) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          username: user.username,
          // Also set twitterUrl if not already set
          ...(!existingUser?.twitterUrl && {
            twitterUrl: `https://x.com/${user.username}`,
          }),
        },
      });
    }

    return true;
  } catch (error) {
    console.error('Twitter connect error:', error);
    return false;
  }
}

/**
 * Test X API connection and diagnose issues
 * Returns diagnostic info about the connection status
 */
export async function diagnoseXConnection(userId: string): Promise<{
  connected: boolean;
  hasValidToken: boolean;
  tokenExpiry: Date | null;
  scopes: string[];
  canFetchProfile: boolean;
  profileData: TwitterUser | null;
  error?: string;
}> {
  try {
    const tokens = await getConnectionTokens(userId, SocialPlatform.TWITTER);

    if (!tokens) {
      return {
        connected: false,
        hasValidToken: false,
        tokenExpiry: null,
        scopes: [],
        canFetchProfile: false,
        profileData: null,
        error: 'No X connection found for this user',
      };
    }

    const accessToken = await getValidTokens(userId);

    if (!accessToken) {
      return {
        connected: true,
        hasValidToken: false,
        tokenExpiry: tokens.expiresAt || null,
        scopes: tokens.scopes || [],
        canFetchProfile: false,
        profileData: null,
        error: 'Token expired and refresh failed',
      };
    }

    // Try to fetch user profile to verify token works
    const profileData = await getTwitterUser(accessToken);

    return {
      connected: true,
      hasValidToken: true,
      tokenExpiry: tokens.expiresAt || null,
      scopes: tokens.scopes || [],
      canFetchProfile: !!profileData,
      profileData,
      error: profileData ? undefined : 'Token valid but cannot fetch profile',
    };
  } catch (error) {
    return {
      connected: false,
      hasValidToken: false,
      tokenExpiry: null,
      scopes: [],
      canFetchProfile: false,
      profileData: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate Twitter OAuth authorization URL
 */
export function getTwitterAuthUrl(state: string, codeChallenge: string): string {
  const { clientId } = getTwitterCredentials();
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/platforms/callback/twitter`;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    // Scopes for reading/writing tweets, media uploads, and refreshing tokens
    // media.write is required for X API v2 media uploads
    scope: 'tweet.read tweet.write users.read media.write offline.access',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  return `https://twitter.com/i/oauth2/authorize?${params}`;
}
