-- Add username and displayName fields to User table
-- Safe migration: both fields are nullable, no existing data affected

-- Add username column (nullable, not unique - Twitter enforces uniqueness)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" TEXT;

-- Add displayName column (nullable)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "displayName" TEXT;
