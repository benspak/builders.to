-- Migration: Add country field to User table
-- This field replaces the zipCode-based location system with direct city/country input

-- Add the country column to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "country" TEXT;

-- Optional: If you want to migrate existing state values to country for US users,
-- you could uncomment and run this (but keep in mind state abbreviations like "CA"
-- are not country names, so this is just a placeholder):
-- UPDATE "User" SET "country" = 'USA' WHERE "state" IS NOT NULL AND "country" IS NULL;

-- Note: The zipCode and state fields are kept for backward compatibility
-- but new users will only have city and country populated.
