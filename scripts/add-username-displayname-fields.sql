-- Migration: Add username and displayName fields to User table
-- This migration adds fields to support:
-- 1. username - auto-populated from X/Twitter handle during signup
-- 2. displayName - user-chosen display name (alternative to first/last name)

-- Add username column (unique, stores X/Twitter handle)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" TEXT UNIQUE;

-- Add displayName column
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "displayName" TEXT;

-- Add index on username for faster lookups
CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");

-- Note: For existing users, the username field will be null
-- They can update their profile to set a display name
-- New users signing up with X will have their username auto-populated
