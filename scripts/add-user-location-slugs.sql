-- Migration script to add locationSlug to users
-- This generates URL-friendly slugs from the existing city and state fields

-- Add the locationSlug column if it doesn't exist
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "locationSlug" TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS "User_locationSlug_idx" ON "User"("locationSlug");

-- Update existing users with locationSlug based on their city and state
-- This SQL generates slugs by:
-- 1. Combining city and state (e.g., "San Francisco, CA")
-- 2. Converting to lowercase
-- 3. Replacing non-alphanumeric characters with spaces
-- 4. Trimming extra whitespace
-- 5. Replacing spaces with hyphens
-- 6. Removing consecutive hyphens

UPDATE "User"
SET "locationSlug" =
  LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            TRIM(
              REGEXP_REPLACE(city || ' ' || state, '[^\w\s]', ' ', 'g')
            ),
            '\s+', '-', 'g'
          ),
          '-+', '-', 'g'
        ),
        '^-|-$', '', 'g'
      ),
      '-+', '-', 'g'
    )
  )
WHERE city IS NOT NULL AND city != '' AND state IS NOT NULL AND state != '' AND "locationSlug" IS NULL;
