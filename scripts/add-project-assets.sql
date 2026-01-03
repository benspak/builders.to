-- Migration script: Evolve Projects from Posts to Assets
-- This adds lifecycle states, milestones, and artifact fields

-- Step 1: Add new enum values to ProjectStatus
-- PostgreSQL allows adding new values to existing enums
ALTER TYPE "ProjectStatus" ADD VALUE IF NOT EXISTS 'PAUSED';
ALTER TYPE "ProjectStatus" ADD VALUE IF NOT EXISTS 'ACQUIRED';

-- Step 2: Create MilestoneType enum
DO $$ BEGIN
    CREATE TYPE "MilestoneType" AS ENUM (
        'V1_SHIPPED',
        'FIRST_USER',
        'FIRST_CUSTOMER',
        'MRR_1K',
        'MRR_10K',
        'PROFITABLE',
        'TEAM_HIRE',
        'FUNDING',
        'PIVOT',
        'CUSTOM'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 3: Add artifact columns to Project table
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "demoUrl" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "docsUrl" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "changelogUrl" TEXT;

-- Step 4: Create ProjectMilestone table
CREATE TABLE IF NOT EXISTS "ProjectMilestone" (
    "id" TEXT NOT NULL,
    "type" "MilestoneType" NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "achievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ProjectMilestone_pkey" PRIMARY KEY ("id")
);

-- Step 5: Add foreign key constraint
DO $$ BEGIN
    ALTER TABLE "ProjectMilestone" ADD CONSTRAINT "ProjectMilestone_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS "ProjectMilestone_projectId_idx" ON "ProjectMilestone"("projectId");
CREATE INDEX IF NOT EXISTS "ProjectMilestone_achievedAt_idx" ON "ProjectMilestone"("achievedAt");

-- Verification query (optional - run to verify changes)
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Project';
-- SELECT * FROM pg_type WHERE typname = 'ProjectStatus';
-- SELECT * FROM pg_type WHERE typname = 'MilestoneType';
