-- Migration script: Add daily digest fields to EmailPreferences
-- This adds dailyDigest preference and lastDailyDigestSentAt tracking

-- Add dailyDigest column with default true
ALTER TABLE "EmailPreferences"
ADD COLUMN IF NOT EXISTS "dailyDigest" BOOLEAN NOT NULL DEFAULT true;

-- Add lastDailyDigestSentAt column
ALTER TABLE "EmailPreferences"
ADD COLUMN IF NOT EXISTS "lastDailyDigestSentAt" TIMESTAMP(3);
