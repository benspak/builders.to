#!/usr/bin/env node

/**
 * Generate a secure encryption key for Two-Factor Authentication secrets.
 *
 * This key is used to encrypt/decrypt TOTP secrets stored in the database.
 * Add the generated key to your .env file as:
 *
 * TWO_FACTOR_ENCRYPTION_KEY=<generated_key>
 *
 * IMPORTANT: Keep this key secure and never commit it to version control.
 * If you lose this key, users will need to re-enable 2FA.
 */

import crypto from 'crypto';

const key = crypto.randomBytes(32).toString('hex');

console.log('\n🔐 Two-Factor Authentication Encryption Key Generated\n');
console.log('Add this to your .env file:\n');
console.log(`TWO_FACTOR_ENCRYPTION_KEY=${key}`);
console.log('\n⚠️  WARNING: Keep this key secure! If lost, all users will need to re-enable 2FA.\n');
