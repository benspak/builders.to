-- Migration script to add locationSlug to existing companies
-- This generates URL-friendly slugs from the existing location field

-- Add the locationSlug column if it doesn't exist
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "locationSlug" TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS "Company_locationSlug_idx" ON "Company"("locationSlug");

-- Update existing companies with locationSlug based on their location
-- This SQL generates slugs by:
-- 1. Converting to lowercase
-- 2. Replacing non-alphanumeric characters with spaces
-- 3. Trimming extra whitespace
-- 4. Replacing spaces with hyphens
-- 5. Removing consecutive hyphens

UPDATE "Company"
SET "locationSlug" =
  LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            TRIM(
              REGEXP_REPLACE(location, '[^\w\s]', ' ', 'g')
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
WHERE location IS NOT NULL AND location != '' AND "locationSlug" IS NULL;
