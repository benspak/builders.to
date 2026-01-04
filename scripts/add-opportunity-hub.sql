-- Migration: Add Opportunity Hub features to Companies
-- This transforms Companies into opportunity aggregation points with:
-- - Company Updates (internal build logs)
-- - Open Roles / Gigs
-- - Tech Stack / Tooling
-- - Traction Badges

-- Step 1: Create new enums for traction badges and roles

-- Customer count ranges
DO $$ BEGIN
    CREATE TYPE "CustomerRange" AS ENUM (
        'RANGE_0',
        'RANGE_1_10',
        'RANGE_11_50',
        'RANGE_51_100',
        'RANGE_101_500',
        'RANGE_500_PLUS'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- User count ranges
DO $$ BEGIN
    CREATE TYPE "UserRange" AS ENUM (
        'RANGE_0',
        'RANGE_1_100',
        'RANGE_101_1K',
        'RANGE_1K_10K',
        'RANGE_10K_100K',
        'RANGE_100K_PLUS'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Revenue ranges (ARR)
DO $$ BEGIN
    CREATE TYPE "RevenueRange" AS ENUM (
        'RANGE_0',
        'RANGE_1_10K',
        'RANGE_10K_50K',
        'RANGE_50K_100K',
        'RANGE_100K_500K',
        'RANGE_500K_1M',
        'RANGE_1M_5M',
        'RANGE_5M_PLUS'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Funding stages
DO $$ BEGIN
    CREATE TYPE "FundingStage" AS ENUM (
        'PRE_SEED',
        'SEED',
        'SERIES_A',
        'SERIES_B',
        'SERIES_C_PLUS'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Role types
DO $$ BEGIN
    CREATE TYPE "RoleType" AS ENUM (
        'FULL_TIME',
        'PART_TIME',
        'CONTRACT',
        'FREELANCE',
        'COFOUNDER',
        'ADVISOR',
        'INTERN'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Role categories
DO $$ BEGIN
    CREATE TYPE "RoleCategory" AS ENUM (
        'ENGINEERING',
        'DESIGN',
        'PRODUCT',
        'MARKETING',
        'SALES',
        'OPERATIONS',
        'FINANCE',
        'LEGAL',
        'SUPPORT',
        'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Compensation types
DO $$ BEGIN
    CREATE TYPE "CompensationType" AS ENUM (
        'SALARY',
        'HOURLY',
        'PROJECT',
        'EQUITY_ONLY',
        'SALARY_PLUS_EQUITY'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Add new columns to Company table

-- Tech Stack / Tooling arrays
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "techStack" TEXT[] DEFAULT '{}';
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "tools" TEXT[] DEFAULT '{}';

-- Traction Badges
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "customerCount" "CustomerRange";
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "revenueRange" "RevenueRange";
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "userCount" "UserRange";
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "isBootstrapped" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "isProfitable" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "hasRaisedFunding" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "fundingStage" "FundingStage";

-- Opportunity Hub flags
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "isHiring" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "acceptsContracts" BOOLEAN NOT NULL DEFAULT false;

-- Add index for hiring filter
CREATE INDEX IF NOT EXISTS "Company_isHiring_idx" ON "Company"("isHiring");

-- Step 3: Create CompanyUpdate table

CREATE TABLE IF NOT EXISTS "CompanyUpdate" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "CompanyUpdate_pkey" PRIMARY KEY ("id")
);

-- Add indexes for CompanyUpdate
CREATE INDEX IF NOT EXISTS "CompanyUpdate_companyId_idx" ON "CompanyUpdate"("companyId");
CREATE INDEX IF NOT EXISTS "CompanyUpdate_createdAt_idx" ON "CompanyUpdate"("createdAt");
CREATE INDEX IF NOT EXISTS "CompanyUpdate_isPinned_idx" ON "CompanyUpdate"("isPinned");

-- Add foreign key constraint
ALTER TABLE "CompanyUpdate" DROP CONSTRAINT IF EXISTS "CompanyUpdate_companyId_fkey";
ALTER TABLE "CompanyUpdate" ADD CONSTRAINT "CompanyUpdate_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 4: Create CompanyRole table

CREATE TABLE IF NOT EXISTS "CompanyRole" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "RoleType" NOT NULL DEFAULT 'FULL_TIME',
    "category" "RoleCategory" NOT NULL DEFAULT 'ENGINEERING',
    "location" TEXT,
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "timezone" TEXT,
    "compensationType" "CompensationType",
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "currency" TEXT DEFAULT 'USD',
    "equityMin" DOUBLE PRECISION,
    "equityMax" DOUBLE PRECISION,
    "skills" TEXT[] DEFAULT '{}',
    "experienceMin" INTEGER,
    "experienceMax" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "applicationUrl" TEXT,
    "applicationEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "companyId" TEXT NOT NULL,

    CONSTRAINT "CompanyRole_pkey" PRIMARY KEY ("id")
);

-- Add indexes for CompanyRole
CREATE INDEX IF NOT EXISTS "CompanyRole_companyId_idx" ON "CompanyRole"("companyId");
CREATE INDEX IF NOT EXISTS "CompanyRole_isActive_idx" ON "CompanyRole"("isActive");
CREATE INDEX IF NOT EXISTS "CompanyRole_type_idx" ON "CompanyRole"("type");
CREATE INDEX IF NOT EXISTS "CompanyRole_category_idx" ON "CompanyRole"("category");
CREATE INDEX IF NOT EXISTS "CompanyRole_createdAt_idx" ON "CompanyRole"("createdAt");

-- Add foreign key constraint
ALTER TABLE "CompanyRole" DROP CONSTRAINT IF EXISTS "CompanyRole_companyId_fkey";
ALTER TABLE "CompanyRole" ADD CONSTRAINT "CompanyRole_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 5: Update isHiring flag automatically when roles change
-- This is a trigger that sets isHiring = true when active roles exist

CREATE OR REPLACE FUNCTION update_company_hiring_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the company's isHiring flag based on active roles
    UPDATE "Company"
    SET "isHiring" = EXISTS (
        SELECT 1 FROM "CompanyRole"
        WHERE "companyId" = COALESCE(NEW."companyId", OLD."companyId")
        AND "isActive" = true
    )
    WHERE "id" = COALESCE(NEW."companyId", OLD."companyId");

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS "update_hiring_status_on_role_change" ON "CompanyRole";
CREATE TRIGGER "update_hiring_status_on_role_change"
AFTER INSERT OR UPDATE OR DELETE ON "CompanyRole"
FOR EACH ROW EXECUTE FUNCTION update_company_hiring_status();

-- Done! The migration adds:
-- 1. Traction badges to show company credibility (customers, revenue, users, funding)
-- 2. Tech stack arrays to showcase technology expertise
-- 3. Company updates for internal build logs/announcements
-- 4. Company roles for job postings, gigs, and co-founder searches
-- 5. Automatic hiring status updates based on active roles
