#!/usr/bin/env node

/**
 * VAPID Key Generator
 * Generates the public/private key pair needed for web push notifications
 *
 * Run with: node scripts/generate-vapid-keys.mjs
 *
 * Add the output to your .env file:
 * - NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public key>
 * - VAPID_PRIVATE_KEY=<private key>
 */

import webPush from 'web-push';

console.log('Generating VAPID keys for web push notifications...\n');

const vapidKeys = webPush.generateVAPIDKeys();

console.log('Add these to your .env file:\n');
console.log('# Web Push Notification VAPID Keys');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log('\n');
console.log('Important:');
console.log('- Keep the VAPID_PRIVATE_KEY secret and never expose it client-side');
console.log('- NEXT_PUBLIC_VAPID_PUBLIC_KEY is safe to expose (used for subscription)');
console.log('- These keys should be the same across all environments if you want');
console.log('  subscriptions to work consistently (or generate per-environment)');
