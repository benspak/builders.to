-- Migration script: Add Feed Events, Notifications, and Email Preferences
-- This enables milestone feed events, likes, in-app notifications, and weekly digests

-- Step 1: Create FeedEventType enum
DO $$ BEGIN
    CREATE TYPE "FeedEventType" AS ENUM (
        'MILESTONE_ACHIEVED',
        'PROJECT_LAUNCHED',
        'PROJECT_ACQUIRED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Create NotificationType enum
DO $$ BEGIN
    CREATE TYPE "NotificationType" AS ENUM (
        'MILESTONE_LIKED',
        'MILESTONE_CELEBRATED',
        'WEEKLY_DIGEST'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 3: Create FeedEvent table
CREATE TABLE IF NOT EXISTS "FeedEvent" (
    "id" TEXT NOT NULL,
    "type" "FeedEventType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "milestoneId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "FeedEvent_pkey" PRIMARY KEY ("id")
);

-- Step 4: Create FeedEventLike table
CREATE TABLE IF NOT EXISTS "FeedEventLike" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "feedEventId" TEXT NOT NULL,

    CONSTRAINT "FeedEventLike_pkey" PRIMARY KEY ("id")
);

-- Step 5: Create Notification table
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "feedEventId" TEXT,
    "actorId" TEXT,
    "actorName" TEXT,
    "actorImage" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- Step 6: Create EmailPreferences table
CREATE TABLE IF NOT EXISTS "EmailPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weeklyDigest" BOOLEAN NOT NULL DEFAULT true,
    "milestoneNotifications" BOOLEAN NOT NULL DEFAULT true,
    "lastDigestSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailPreferences_pkey" PRIMARY KEY ("id")
);

-- Step 7: Add unique constraints
ALTER TABLE "FeedEvent" ADD CONSTRAINT "FeedEvent_milestoneId_key" UNIQUE ("milestoneId");
ALTER TABLE "FeedEventLike" ADD CONSTRAINT "FeedEventLike_userId_feedEventId_key" UNIQUE ("userId", "feedEventId");
ALTER TABLE "EmailPreferences" ADD CONSTRAINT "EmailPreferences_userId_key" UNIQUE ("userId");

-- Step 8: Add foreign key constraints
DO $$ BEGIN
    ALTER TABLE "FeedEvent" ADD CONSTRAINT "FeedEvent_milestoneId_fkey"
    FOREIGN KEY ("milestoneId") REFERENCES "ProjectMilestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "FeedEventLike" ADD CONSTRAINT "FeedEventLike_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "FeedEventLike" ADD CONSTRAINT "FeedEventLike_feedEventId_fkey"
    FOREIGN KEY ("feedEventId") REFERENCES "FeedEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Notification" ADD CONSTRAINT "Notification_feedEventId_fkey"
    FOREIGN KEY ("feedEventId") REFERENCES "FeedEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "EmailPreferences" ADD CONSTRAINT "EmailPreferences_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 9: Create indexes for performance
CREATE INDEX IF NOT EXISTS "FeedEvent_createdAt_idx" ON "FeedEvent"("createdAt");
CREATE INDEX IF NOT EXISTS "FeedEvent_userId_idx" ON "FeedEvent"("userId");
CREATE INDEX IF NOT EXISTS "FeedEvent_projectId_idx" ON "FeedEvent"("projectId");
CREATE INDEX IF NOT EXISTS "FeedEventLike_feedEventId_idx" ON "FeedEventLike"("feedEventId");
CREATE INDEX IF NOT EXISTS "Notification_userId_read_idx" ON "Notification"("userId", "read");
CREATE INDEX IF NOT EXISTS "Notification_createdAt_idx" ON "Notification"("createdAt");
