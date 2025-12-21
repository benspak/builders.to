-- Migration: Add user profile fields
-- This migration adds profile fields to the User table

-- Add slug column for profile URLs
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "slug" TEXT UNIQUE;

-- Add profile fields
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "zipCode" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "headline" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "websiteUrl" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twitterUrl" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "youtubeUrl" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "linkedinUrl" TEXT;

-- Add index on slug for faster lookups
CREATE INDEX IF NOT EXISTS "User_slug_idx" ON "User"("slug");
