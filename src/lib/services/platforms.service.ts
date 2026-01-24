import { SocialPlatform, PlatformConnection } from '@prisma/client';
import prisma from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/encryption';

export interface PlatformTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scopes?: string[];
}

export interface PlatformProfile {
  platformUserId: string;
  username: string;
  displayName?: string;
  avatar?: string;
}

export interface ConnectedPlatform {
  platform: SocialPlatform;
  username: string | null;
  displayName: string | null;
  avatar: string | null;
  connectedAt: Date;
  scopes: string[];
}

/**
 * Get all platform connections for a user
 */
export async function getUserConnections(userId: string): Promise<ConnectedPlatform[]> {
  const connections = await prisma.platformConnection.findMany({
    where: { userId },
    select: {
      platform: true,
      platformUsername: true,
      displayName: true,
      avatar: true,
      connectedAt: true,
      scopes: true,
    },
  });

  return connections.map((c) => ({
    platform: c.platform,
    username: c.platformUsername,
    displayName: c.displayName,
    avatar: c.avatar,
    connectedAt: c.connectedAt,
    scopes: c.scopes,
  }));
}

/**
 * Get a specific platform connection
 */
export async function getConnection(
  userId: string,
  platform: SocialPlatform
): Promise<PlatformConnection | null> {
  return prisma.platformConnection.findUnique({
    where: {
      userId_platform: { userId, platform },
    },
  });
}

/**
 * Get decrypted tokens for a platform connection
 */
export async function getConnectionTokens(
  userId: string,
  platform: SocialPlatform
): Promise<PlatformTokens | null> {
  const connection = await getConnection(userId, platform);

  if (!connection) {
    return null;
  }

  return {
    accessToken: decrypt(connection.accessToken),
    refreshToken: connection.refreshToken ? decrypt(connection.refreshToken) : undefined,
    expiresAt: connection.tokenExpiresAt || undefined,
    scopes: connection.scopes,
  };
}

/**
 * Create or update a platform connection
 */
export async function upsertConnection(
  userId: string,
  platform: SocialPlatform,
  tokens: PlatformTokens,
  profile: PlatformProfile
): Promise<PlatformConnection> {
  const encryptedAccessToken = encrypt(tokens.accessToken);
  const encryptedRefreshToken = tokens.refreshToken ? encrypt(tokens.refreshToken) : null;

  return prisma.platformConnection.upsert({
    where: {
      userId_platform: { userId, platform },
    },
    create: {
      userId,
      platform,
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      tokenExpiresAt: tokens.expiresAt,
      platformUserId: profile.platformUserId,
      platformUsername: profile.username,
      displayName: profile.displayName,
      avatar: profile.avatar,
      scopes: tokens.scopes || [],
    },
    update: {
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      tokenExpiresAt: tokens.expiresAt,
      platformUserId: profile.platformUserId,
      platformUsername: profile.username,
      displayName: profile.displayName,
      avatar: profile.avatar,
      scopes: tokens.scopes || [],
    },
  });
}

/**
 * Update tokens for an existing connection
 */
export async function updateConnectionTokens(
  userId: string,
  platform: SocialPlatform,
  tokens: Partial<PlatformTokens>
): Promise<PlatformConnection | null> {
  const connection = await getConnection(userId, platform);

  if (!connection) {
    return null;
  }

  const updateData: Record<string, unknown> = {};

  if (tokens.accessToken) {
    updateData.accessToken = encrypt(tokens.accessToken);
  }
  if (tokens.refreshToken) {
    updateData.refreshToken = encrypt(tokens.refreshToken);
  }
  if (tokens.expiresAt) {
    updateData.tokenExpiresAt = tokens.expiresAt;
  }
  if (tokens.scopes) {
    updateData.scopes = tokens.scopes;
  }

  return prisma.platformConnection.update({
    where: { id: connection.id },
    data: updateData,
  });
}

/**
 * Disconnect a platform
 */
export async function disconnectPlatform(
  userId: string,
  platform: SocialPlatform
): Promise<boolean> {
  try {
    await prisma.platformConnection.delete({
      where: {
        userId_platform: { userId, platform },
      },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a connection's tokens are expired or expiring soon
 */
export function isTokenExpired(connection: PlatformConnection, bufferMinutes = 5): boolean {
  if (!connection.tokenExpiresAt) {
    return false;
  }

  const bufferMs = bufferMinutes * 60 * 1000;
  return connection.tokenExpiresAt.getTime() - bufferMs < Date.now();
}
