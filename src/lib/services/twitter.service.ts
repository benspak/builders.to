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

/**
 * Refresh Twitter access token
 */
export async function refreshTwitterToken(refreshToken: string): Promise<PlatformTokens | null> {
  try {
    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.TWITTER_CLIENT_ID || '',
      }),
    });

    if (!response.ok) {
      console.error('Twitter token refresh failed:', await response.text());
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
 * Post a tweet
 */
export async function postTweet(
  userId: string,
  text: string,
  options?: {
    replyTo?: string;
    quoteTweetId?: string;
  }
): Promise<{ id: string; text: string } | null> {
  const accessToken = await getValidTokens(userId);

  if (!accessToken) {
    throw new Error('Twitter not connected or token expired');
  }

  try {
    const body: Record<string, unknown> = { text };

    if (options?.replyTo) {
      body.reply = { in_reply_to_tweet_id: options.replyTo };
    }

    if (options?.quoteTweetId) {
      body.quote_tweet_id = options.quoteTweetId;
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
      throw new Error(error.detail || 'Failed to post tweet');
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
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/platforms/callback/twitter`;
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: process.env.TWITTER_CLIENT_ID || '',
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Twitter token exchange failed:', await tokenResponse.text());
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
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/platforms/callback/twitter`;
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.TWITTER_CLIENT_ID || '',
    redirect_uri: redirectUri,
    scope: 'tweet.read tweet.write users.read offline.access',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  return `https://twitter.com/i/oauth2/authorize?${params}`;
}
