import { SocialPlatform } from '@prisma/client';
import {
  getConnectionTokens,
  updateConnectionTokens,
  upsertConnection,
  PlatformTokens,
  PlatformProfile,
} from './platforms.service';
import prisma from '@/lib/prisma';

const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';

interface LinkedInProfile {
  sub: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email?: string;
}

/**
 * Refresh LinkedIn access token
 */
export async function refreshLinkedInToken(refreshToken: string): Promise<PlatformTokens | null> {
  try {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.LINKEDIN_CLIENT_ID || '',
        client_secret: process.env.LINKEDIN_CLIENT_SECRET || '',
      }),
    });

    if (!response.ok) {
      console.error('LinkedIn token refresh failed:', await response.text());
      return null;
    }

    const data = await response.json();

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresAt,
    };
  } catch (error) {
    console.error('LinkedIn token refresh error:', error);
    return null;
  }
}

/**
 * Get LinkedIn user profile via OpenID Connect
 */
export async function getLinkedInProfile(accessToken: string): Promise<LinkedInProfile | null> {
  try {
    const response = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

/**
 * Get valid tokens, refreshing if needed
 */
async function getValidTokens(userId: string): Promise<{ accessToken: string; urn: string } | null> {
  const tokens = await getConnectionTokens(userId, SocialPlatform.LINKEDIN);

  if (!tokens) {
    return null;
  }

  const connection = await prisma.platformConnection.findUnique({
    where: { userId_platform: { userId, platform: SocialPlatform.LINKEDIN } },
  });

  if (!connection?.platformUserId) {
    return null;
  }

  let accessToken = tokens.accessToken;

  // Check if token is expired or expiring within 5 minutes
  if (tokens.expiresAt && tokens.expiresAt.getTime() - 5 * 60 * 1000 < Date.now()) {
    if (!tokens.refreshToken) {
      return null;
    }

    const newTokens = await refreshLinkedInToken(tokens.refreshToken);
    if (!newTokens) {
      return null;
    }

    await updateConnectionTokens(userId, SocialPlatform.LINKEDIN, newTokens);
    accessToken = newTokens.accessToken;
  }

  return {
    accessToken,
    urn: `urn:li:person:${connection.platformUserId}`,
  };
}

/**
 * Post to LinkedIn
 */
export async function postToLinkedIn(
  userId: string,
  text: string,
  options?: {
    visibility?: 'PUBLIC' | 'CONNECTIONS';
    mediaUrls?: string[];
  }
): Promise<{ id: string } | null> {
  const auth = await getValidTokens(userId);

  if (!auth) {
    throw new Error('LinkedIn not connected or token expired');
  }

  try {
    const visibility = options?.visibility || 'PUBLIC';

    const postBody: Record<string, unknown> = {
      author: auth.urn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text,
          },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': visibility,
      },
    };

    // Handle media if provided
    if (options?.mediaUrls && options.mediaUrls.length > 0) {
      postBody.specificContent = {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: 'ARTICLE',
          media: options.mediaUrls.map((url) => ({
            status: 'READY',
            originalUrl: url,
          })),
        },
      };
    }

    const response = await fetch(`${LINKEDIN_API_BASE}/ugcPosts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(postBody),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('LinkedIn post error:', error);
      throw new Error(error.message || 'Failed to post to LinkedIn');
    }

    // LinkedIn returns the post ID in the x-restli-id header
    const postId = response.headers.get('x-restli-id');

    return { id: postId || 'unknown' };
  } catch (error) {
    console.error('LinkedIn post error:', error);
    throw error;
  }
}

/**
 * Delete a LinkedIn post
 */
export async function deleteLinkedInPost(userId: string, postId: string): Promise<boolean> {
  const auth = await getValidTokens(userId);

  if (!auth) {
    throw new Error('LinkedIn not connected or token expired');
  }

  try {
    const response = await fetch(`${LINKEDIN_API_BASE}/ugcPosts/${postId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Connect LinkedIn account
 */
export async function connectLinkedInAccount(
  userId: string,
  code: string
): Promise<boolean> {
  try {
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/platforms/callback/linkedin`;
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID || '',
        client_secret: process.env.LINKEDIN_CLIENT_SECRET || '',
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('LinkedIn token exchange failed:', await tokenResponse.text());
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
    const profile = await getLinkedInProfile(tokens.accessToken);

    if (!profile) {
      return false;
    }

    const platformProfile: PlatformProfile = {
      platformUserId: profile.sub,
      username: profile.email || profile.sub,
      displayName: profile.name,
      avatar: profile.picture,
    };

    // Save connection
    await upsertConnection(userId, SocialPlatform.LINKEDIN, tokens, platformProfile);

    return true;
  } catch (error) {
    console.error('LinkedIn connect error:', error);
    return false;
  }
}

/**
 * Generate LinkedIn OAuth authorization URL
 */
export function getLinkedInAuthUrl(state: string): string {
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/platforms/callback/linkedin`;
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.LINKEDIN_CLIENT_ID || '',
    redirect_uri: redirectUri,
    scope: 'openid profile email w_member_social',
    state,
  });

  return `https://www.linkedin.com/oauth/v2/authorization?${params}`;
}
