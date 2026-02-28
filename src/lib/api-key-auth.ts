import { NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const API_KEY_PREFIX = "bt_";

/**
 * Hash an API key for storage. Keys are stored as SHA-256 hashes.
 */
export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key, "utf8").digest("hex");
}

/**
 * Generate a new API key. Returns { key, keyHash, keyPrefix }.
 * The plain `key` must be shown to the user once; only hash and prefix are stored.
 */
export function generateApiKey(): { key: string; keyHash: string; keyPrefix: string } {
  const secret = crypto.randomBytes(32).toString("hex");
  const key = `${API_KEY_PREFIX}${secret}`;
  const keyHash = hashApiKey(key);
  const keyPrefix = key.slice(0, 12);
  return { key, keyHash, keyPrefix };
}

/**
 * Extract API key from request: Authorization: Bearer <key> or X-API-Key: <key>.
 */
function getApiKeyFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token.startsWith(API_KEY_PREFIX)) return token;
  }
  const apiKeyHeader = request.headers.get("x-api-key");
  if (apiKeyHeader?.trim().startsWith(API_KEY_PREFIX)) {
    return apiKeyHeader.trim();
  }
  return null;
}

/**
 * Authenticate request via API key. Returns userId if valid, null otherwise.
 * Updates lastUsedAt for the key when valid.
 */
export async function getUserIdFromApiKey(request: NextRequest): Promise<string | null> {
  const key = getApiKeyFromRequest(request);
  if (!key) return null;

  const keyHash = hashApiKey(key);
  const record = await prisma.userApiKey.findUnique({
    where: { keyHash },
    select: { userId: true, id: true },
  });

  if (!record) return null;

  await prisma.userApiKey.update({
    where: { id: record.id },
    data: { lastUsedAt: new Date() },
  }).catch(() => {});

  return record.userId;
}

/**
 * Get current user id from either session or API key.
 * Use in API routes that support both browser (session) and programmatic (API key) auth.
 */
export async function getAuthUserId(
  request: NextRequest,
  sessionUserId: string | undefined
): Promise<string | null> {
  if (sessionUserId) return sessionUserId;
  return getUserIdFromApiKey(request);
}
