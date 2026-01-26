import { SocialPlatform } from '@prisma/client';
import {
  getConnectionTokens,
  updateConnectionTokens,
  upsertConnection,
  PlatformTokens,
  PlatformProfile,
} from './platforms.service';
import prisma from '@/lib/prisma';

const TWITTER_API_BASE = 'https://api.twitter.com/2';
const TWITTER_UPLOAD_API = 'https://upload.twitter.com/1.1';

// Character limits
export const TWITTER_MAX_CHARS = 280;
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

interface MediaUploadResponse {
  media_id_string: string;
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
    
    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
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
      console.error('Twitter token refresh failed:', errorText);
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
    return null;
  }

  // Check if token is expired or expiring within 5 minutes
  if (tokens.expiresAt && tokens.expiresAt.getTime() - 5 * 60 * 1000 < Date.now()) {
    if (!tokens.refreshToken) {
      return null;
    }

    const newTokens = await refreshTwitterToken(tokens.refreshToken);
    if (!newTokens) {
      return null;
    }

    await updateConnectionTokens(userId, SocialPlatform.TWITTER, newTokens);
    return newTokens.accessToken;
  }

  return tokens.accessToken;
}

/**
 * Upload media to Twitter
 * Twitter API v1.1 is still used for media uploads as v2 doesn't support it directly
 * Note: This requires OAuth 1.0a or OAuth 2.0 with appropriate scopes
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
    
    // Determine media type from URL or content-type
    const contentType = mediaResponse.headers.get('content-type') || 'image/jpeg';
    
    // Upload to Twitter using v1.1 media upload endpoint
    // Note: Twitter API v2 doesn't have a media upload endpoint yet,
    // so we use the v1.1 endpoint which works with OAuth 2.0 bearer tokens
    const uploadResponse = await fetch(`${TWITTER_UPLOAD_API}/media/upload.json`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        media_data: mediaBase64,
        media_category: contentType.startsWith('video/') ? 'tweet_video' : 'tweet_image',
      }),
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Twitter media upload failed:', errorText);
      return null;
    }

    const uploadData: MediaUploadResponse = await uploadResponse.json();
    return uploadData.media_id_string;
  } catch (error) {
    console.error('Twitter media upload error:', error);
    return null;
  }
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
      const error = await response.json();
      console.error('Twitter post error:', error);
      
      // Provide more helpful error messages
      if (error.detail?.includes('duplicate')) {
        throw new Error('This tweet has already been posted (duplicate content)');
      }
      if (error.detail?.includes('rate limit')) {
        throw new Error('Twitter rate limit reached. Please try again later.');
      }
      if (error.status === 401 || error.title === 'Unauthorized') {
        throw new Error('Twitter authentication failed. Please reconnect your account.');
      }
      
      throw new Error(error.detail || error.title || 'Failed to post tweet');
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
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
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
      console.error('Twitter token exchange failed:', errorText);
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

    return true;
  } catch (error) {
    console.error('Twitter connect error:', error);
    return false;
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
    // Scopes for reading/writing tweets and refreshing tokens
    // Media uploads use v1.1 endpoint which works with these scopes
    scope: 'tweet.read tweet.write users.read offline.access',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  return `https://twitter.com/i/oauth2/authorize?${params}`;
}
