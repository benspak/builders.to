-- Emergency Growth Features Migration
-- Run this manually if the Prisma migrations didn't apply correctly
-- This adds all required columns for the growth features

-- ============================================
-- Create Enums (safe - won't error if exists)
-- ============================================

DO $$ BEGIN
    CREATE TYPE "BuildingCategory" AS ENUM ('SAAS', 'MOBILE_APP', 'DEVELOPER_TOOLS', 'ECOMMERCE', 'AI_ML', 'FINTECH', 'HEALTHTECH', 'EDTECH', 'MARKETPLACE', 'AGENCY', 'CONTENT', 'HARDWARE', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "KarmaLevel" AS ENUM ('NEWCOMER', 'CONTRIBUTOR', 'BUILDER', 'MENTOR', 'LEGEND');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PartnershipStatus" AS ENUM ('PENDING', 'ACTIVE', 'PAUSED', 'ENDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CheckInFrequency" AS ENUM ('DAILY', 'WEEKDAYS', 'WEEKLY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CheckInMood" AS ENUM ('CRUSHING_IT', 'GOOD', 'OKAY', 'STRUGGLING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "KarmaEventType" AS ENUM ('UPDATE_POSTED', 'UPDATE_LIKED', 'COMMENT_POSTED', 'COMMENT_LIKED', 'HELPFUL_COMMENT', 'PROJECT_LAUNCHED', 'PROJECT_UPVOTED', 'STREAK_MILESTONE', 'PARTNERSHIP_FORMED', 'MENTORSHIP_GIVEN', 'SPAM_REMOVED', 'VIOLATION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- Add User Columns (safe - won't error if exists)
-- ============================================

DO $$ BEGIN
    ALTER TABLE "User" ADD COLUMN "techStack" TEXT[] DEFAULT '{}';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "User" ADD COLUMN "buildingCategory" "BuildingCategory";
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "User" ADD COLUMN "interests" TEXT[] DEFAULT '{}';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "User" ADD COLUMN "karma" INTEGER NOT NULL DEFAULT 0;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "User" ADD COLUMN "karmaLevel" "KarmaLevel" NOT NULL DEFAULT 'NEWCOMER';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add karma index
CREATE INDEX IF NOT EXISTS "User_karma_idx" ON "User"("karma");

-- ============================================
-- Add NotificationType Values (safe)
-- ============================================

DO $$ BEGIN
    ALTER TYPE "NotificationType" ADD VALUE 'ACCOUNTABILITY_REQUEST';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE "NotificationType" ADD VALUE 'ACCOUNTABILITY_ACCEPTED';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE "NotificationType" ADD VALUE 'ACCOUNTABILITY_CHECK_IN';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE "NotificationType" ADD VALUE 'ACCOUNTABILITY_REMINDER';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE "NotificationType" ADD VALUE 'KARMA_MILESTONE';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE "NotificationType" ADD VALUE 'COMMENT_MARKED_HELPFUL';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- Create AccountabilityPartnership Table
-- ============================================

CREATE TABLE IF NOT EXISTS "AccountabilityPartnership" (
    "id" TEXT NOT NULL,
    "status" "PartnershipStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requesterId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "checkInFrequency" "CheckInFrequency" NOT NULL DEFAULT 'DAILY',
    "goal" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),

    CONSTRAINT "AccountabilityPartnership_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- Create AccountabilityCheckIn Table
-- ============================================

CREATE TABLE IF NOT EXISTS "AccountabilityCheckIn" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "partnershipId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "note" TEXT,
    "mood" "CheckInMood",

    CONSTRAINT "AccountabilityCheckIn_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- Create KarmaEvent Table
-- ============================================

CREATE TABLE IF NOT EXISTS "KarmaEvent" (
    "id" TEXT NOT NULL,
    "type" "KarmaEventType" NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "updateId" TEXT,
    "commentId" TEXT,
    "projectId" TEXT,
    "actorId" TEXT,

    CONSTRAINT "KarmaEvent_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- Create Indexes
-- ============================================

CREATE UNIQUE INDEX IF NOT EXISTS "AccountabilityPartnership_requesterId_partnerId_key" ON "AccountabilityPartnership"("requesterId", "partnerId");
CREATE INDEX IF NOT EXISTS "AccountabilityPartnership_requesterId_idx" ON "AccountabilityPartnership"("requesterId");
CREATE INDEX IF NOT EXISTS "AccountabilityPartnership_partnerId_idx" ON "AccountabilityPartnership"("partnerId");
CREATE INDEX IF NOT EXISTS "AccountabilityPartnership_status_idx" ON "AccountabilityPartnership"("status");

CREATE INDEX IF NOT EXISTS "AccountabilityCheckIn_partnershipId_idx" ON "AccountabilityCheckIn"("partnershipId");
CREATE INDEX IF NOT EXISTS "AccountabilityCheckIn_userId_idx" ON "AccountabilityCheckIn"("userId");
CREATE INDEX IF NOT EXISTS "AccountabilityCheckIn_createdAt_idx" ON "AccountabilityCheckIn"("createdAt");

CREATE INDEX IF NOT EXISTS "KarmaEvent_userId_idx" ON "KarmaEvent"("userId");
CREATE INDEX IF NOT EXISTS "KarmaEvent_createdAt_idx" ON "KarmaEvent"("createdAt");
CREATE INDEX IF NOT EXISTS "KarmaEvent_type_idx" ON "KarmaEvent"("type");

-- ============================================
-- Add Foreign Keys (safe)
-- ============================================

DO $$ BEGIN
    ALTER TABLE "AccountabilityPartnership" ADD CONSTRAINT "AccountabilityPartnership_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "AccountabilityPartnership" ADD CONSTRAINT "AccountabilityPartnership_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "AccountabilityCheckIn" ADD CONSTRAINT "AccountabilityCheckIn_partnershipId_fkey" FOREIGN KEY ("partnershipId") REFERENCES "AccountabilityPartnership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "AccountabilityCheckIn" ADD CONSTRAINT "AccountabilityCheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "KarmaEvent" ADD CONSTRAINT "KarmaEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- Verification
-- ============================================

SELECT 'Growth features migration complete!' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'User' 
AND column_name IN ('techStack', 'interests', 'karma', 'karmaLevel', 'buildingCategory');
