-- Remove PAUSED partnership status
-- Migrate any PAUSED partnerships to ENDED, then drop the enum value

-- ============================================
-- Migrate all PAUSED partnerships to ENDED
-- ============================================

UPDATE "AccountabilityPartnership"
SET "status" = 'ENDED'
WHERE "status" = 'PAUSED';

-- ============================================
-- Remove PAUSED from PartnershipStatus enum
-- ============================================
-- PostgreSQL doesn't support DROP VALUE directly,
-- so we recreate the enum without PAUSED.

ALTER TYPE "PartnershipStatus" RENAME TO "PartnershipStatus_old";

CREATE TYPE "PartnershipStatus" AS ENUM ('PENDING', 'ACTIVE', 'ENDED');

ALTER TABLE "AccountabilityPartnership"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "PartnershipStatus" USING ("status"::text::"PartnershipStatus"),
  ALTER COLUMN "status" SET DEFAULT 'PENDING';

DROP TYPE "PartnershipStatus_old";
