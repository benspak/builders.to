import { jwtDecrypt } from "jose";
import crypto from "crypto";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

async function getDerivedEncryptionKey(secret: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    crypto.hkdf(
      "sha256",
      secret,
      "",
      "NextAuth.js Generated Encryption Key",
      32,
      (err, derivedKey) => {
        if (err) reject(err);
        else resolve(new Uint8Array(derivedKey));
      }
    );
  });
}

export interface AuthPayload {
  id: string;
  name?: string;
  email?: string;
  picture?: string;
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
  if (!NEXTAUTH_SECRET) {
    console.error("NEXTAUTH_SECRET is not set");
    return null;
  }

  try {
    const key = await getDerivedEncryptionKey(NEXTAUTH_SECRET);
    const { payload } = await jwtDecrypt(token, key, {
      clockTolerance: 15,
    });

    if (!payload.id || typeof payload.id !== "string") {
      return null;
    }

    return {
      id: payload.id as string,
      name: payload.name as string | undefined,
      email: payload.email as string | undefined,
      picture: payload.picture as string | undefined,
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}
