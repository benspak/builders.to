#!/usr/bin/env node

/**
 * VAPID Key Generator (no web-push dependency)
 * Generates P-256 key pair for Web Push VAPID, base64url-encoded.
 *
 * Run with: node scripts/generate-vapid-keys.mjs
 *
 * Add the output to your .env file:
 * - NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public key>
 * - VAPID_PRIVATE_KEY=<private key>
 */

import crypto from "node:crypto";

function base64urlEncode(buffer) {
  return Buffer.from(buffer)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", {
  namedCurve: "prime256v1",
});

// Export to JWK to get raw x, y, d (all base64url in JWK for EC)
const pubJwk = publicKey.export({ format: "jwk" });
const privJwk = privateKey.export({ format: "jwk" });

// VAPID public key: uncompressed point 04 || x || y (65 bytes)
const x = Buffer.from(pubJwk.x, "base64url");
const y = Buffer.from(pubJwk.y, "base64url");
const vapidPublicKey = base64urlEncode(Buffer.concat([Buffer.from([0x04]), x, y]));

// VAPID private key: raw scalar d (32 bytes)
const vapidPrivateKey = privJwk.d;

console.log("Generating VAPID keys for web push notifications...\n");
console.log("Add these to your .env file:\n");
console.log("# Web Push Notification VAPID Keys");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidPublicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidPrivateKey}`);
console.log("\n");
console.log("Important:");
console.log("- Keep the VAPID_PRIVATE_KEY secret and never expose it client-side");
console.log("- NEXT_PUBLIC_VAPID_PUBLIC_KEY is safe to expose (used for subscription)");
console.log("- These keys should be the same across all environments if you want");
console.log("  subscriptions to work consistently (or generate per-environment)");
