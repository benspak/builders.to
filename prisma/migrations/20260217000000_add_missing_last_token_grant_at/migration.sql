-- Add missing lastTokenGrantAt column to ProSubscription table
-- This column was defined in the schema but missing from the production database
ALTER TABLE "ProSubscription" ADD COLUMN IF NOT EXISTS "lastTokenGrantAt" TIMESTAMP(3);
