-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "locationSlug" TEXT;

-- CreateIndex
CREATE INDEX "Company_locationSlug_idx" ON "Company"("locationSlug");

-- Update existing companies with locationSlug based on their location
-- This generates slugs by converting to lowercase and replacing non-alphanumeric with hyphens
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
WHERE location IS NOT NULL AND location != '';
