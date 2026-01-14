-- Migration: Add Two-Factor Authentication support
-- Run this migration manually if not using Prisma migrate

-- Add 2FA columns to User table
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "twoFactorSecret" TEXT,
ADD COLUMN IF NOT EXISTS "twoFactorBackupCodes" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Verify the changes
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'User'
AND column_name IN ('twoFactorEnabled', 'twoFactorSecret', 'twoFactorBackupCodes');
