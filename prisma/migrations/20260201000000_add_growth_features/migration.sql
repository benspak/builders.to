-- Growth Features Migration
-- Adds: Building Similar Matching, Accountability Partners, Karma/Reputation System

-- ============================================
-- New Enums
-- ============================================

-- Building category for matching
CREATE TYPE "BuildingCategory" AS ENUM ('SAAS', 'MOBILE_APP', 'DEVELOPER_TOOLS', 'ECOMMERCE', 'AI_ML', 'FINTECH', 'HEALTHTECH', 'EDTECH', 'MARKETPLACE', 'AGENCY', 'CONTENT', 'HARDWARE', 'OTHER');

-- Karma levels
CREATE TYPE "KarmaLevel" AS ENUM ('NEWCOMER', 'CONTRIBUTOR', 'BUILDER', 'MENTOR', 'LEGEND');

-- Accountability partnership status
CREATE TYPE "PartnershipStatus" AS ENUM ('PENDING', 'ACTIVE', 'PAUSED', 'ENDED');

-- Check-in frequency
CREATE TYPE "CheckInFrequency" AS ENUM ('DAILY', 'WEEKDAYS', 'WEEKLY');

-- Check-in mood
CREATE TYPE "CheckInMood" AS ENUM ('CRUSHING_IT', 'GOOD', 'OKAY', 'STRUGGLING');

-- Karma event types
CREATE TYPE "KarmaEventType" AS ENUM ('UPDATE_POSTED', 'UPDATE_LIKED', 'COMMENT_POSTED', 'COMMENT_LIKED', 'HELPFUL_COMMENT', 'PROJECT_LAUNCHED', 'PROJECT_UPVOTED', 'STREAK_MILESTONE', 'PARTNERSHIP_FORMED', 'MENTORSHIP_GIVEN', 'SPAM_REMOVED', 'VIOLATION');

-- ============================================
-- User Model Updates
-- ============================================

-- Add Building Similar Matching fields to User
ALTER TABLE "User" ADD COLUMN "techStack" TEXT[] DEFAULT '{}';
ALTER TABLE "User" ADD COLUMN "buildingCategory" "BuildingCategory";
ALTER TABLE "User" ADD COLUMN "interests" TEXT[] DEFAULT '{}';

-- Add Karma/Reputation fields to User
ALTER TABLE "User" ADD COLUMN "karma" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "karmaLevel" "KarmaLevel" NOT NULL DEFAULT 'NEWCOMER';

-- Add index for karma leaderboard queries
CREATE INDEX "User_karma_idx" ON "User"("karma");

-- ============================================
-- Update NotificationType Enum
-- ============================================

-- Add new notification types
ALTER TYPE "NotificationType" ADD VALUE 'ACCOUNTABILITY_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE 'ACCOUNTABILITY_ACCEPTED';
ALTER TYPE "NotificationType" ADD VALUE 'ACCOUNTABILITY_CHECK_IN';
ALTER TYPE "NotificationType" ADD VALUE 'ACCOUNTABILITY_REMINDER';
ALTER TYPE "NotificationType" ADD VALUE 'KARMA_MILESTONE';
ALTER TYPE "NotificationType" ADD VALUE 'COMMENT_MARKED_HELPFUL';

-- ============================================
-- Accountability Partnership Tables
-- ============================================

-- Create AccountabilityPartnership table
CREATE TABLE "AccountabilityPartnership" (
    "id" TEXT NOT NULL,
    "status" "PartnershipStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "requesterId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "checkInFrequency" "CheckInFrequency" NOT NULL DEFAULT 'DAILY',
    "goal" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),

    CONSTRAINT "AccountabilityPartnership_pkey" PRIMARY KEY ("id")
);

-- Create AccountabilityCheckIn table
CREATE TABLE "AccountabilityCheckIn" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "partnershipId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "note" TEXT,
    "mood" "CheckInMood",

    CONSTRAINT "AccountabilityCheckIn_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- Karma Event Table
-- ============================================

-- Create KarmaEvent table
CREATE TABLE "KarmaEvent" (
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
-- Indexes
-- ============================================

-- AccountabilityPartnership indexes
CREATE UNIQUE INDEX "AccountabilityPartnership_requesterId_partnerId_key" ON "AccountabilityPartnership"("requesterId", "partnerId");
CREATE INDEX "AccountabilityPartnership_requesterId_idx" ON "AccountabilityPartnership"("requesterId");
CREATE INDEX "AccountabilityPartnership_partnerId_idx" ON "AccountabilityPartnership"("partnerId");
CREATE INDEX "AccountabilityPartnership_status_idx" ON "AccountabilityPartnership"("status");

-- AccountabilityCheckIn indexes
CREATE INDEX "AccountabilityCheckIn_partnershipId_idx" ON "AccountabilityCheckIn"("partnershipId");
CREATE INDEX "AccountabilityCheckIn_userId_idx" ON "AccountabilityCheckIn"("userId");
CREATE INDEX "AccountabilityCheckIn_createdAt_idx" ON "AccountabilityCheckIn"("createdAt");

-- KarmaEvent indexes
CREATE INDEX "KarmaEvent_userId_idx" ON "KarmaEvent"("userId");
CREATE INDEX "KarmaEvent_createdAt_idx" ON "KarmaEvent"("createdAt");
CREATE INDEX "KarmaEvent_type_idx" ON "KarmaEvent"("type");

-- ============================================
-- Foreign Keys
-- ============================================

-- AccountabilityPartnership foreign keys
ALTER TABLE "AccountabilityPartnership" ADD CONSTRAINT "AccountabilityPartnership_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AccountabilityPartnership" ADD CONSTRAINT "AccountabilityPartnership_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AccountabilityCheckIn foreign keys
ALTER TABLE "AccountabilityCheckIn" ADD CONSTRAINT "AccountabilityCheckIn_partnershipId_fkey" FOREIGN KEY ("partnershipId") REFERENCES "AccountabilityPartnership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AccountabilityCheckIn" ADD CONSTRAINT "AccountabilityCheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- KarmaEvent foreign keys
ALTER TABLE "KarmaEvent" ADD CONSTRAINT "KarmaEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
