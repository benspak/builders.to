-- Add contactUrl field to LocalListing table
-- Run this with: psql $DATABASE_URL -f scripts/add-local-listing-url.sql

ALTER TABLE "LocalListing" ADD COLUMN IF NOT EXISTS "contactUrl" TEXT;
