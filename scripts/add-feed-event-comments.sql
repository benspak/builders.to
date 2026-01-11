-- Migration: Add FeedEventComment table and notification updates
-- This enables comments on all feed events (milestones, projects, status updates, user joined)

-- Create FeedEventComment table
CREATE TABLE IF NOT EXISTS "FeedEventComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "feedEventId" TEXT NOT NULL,

    CONSTRAINT "FeedEventComment_pkey" PRIMARY KEY ("id")
);

-- Create indexes for FeedEventComment
CREATE INDEX IF NOT EXISTS "FeedEventComment_feedEventId_idx" ON "FeedEventComment"("feedEventId");
CREATE INDEX IF NOT EXISTS "FeedEventComment_userId_idx" ON "FeedEventComment"("userId");
CREATE INDEX IF NOT EXISTS "FeedEventComment_createdAt_idx" ON "FeedEventComment"("createdAt");

-- Add foreign key constraints
ALTER TABLE "FeedEventComment" ADD CONSTRAINT "FeedEventComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FeedEventComment" ADD CONSTRAINT "FeedEventComment_feedEventId_fkey" FOREIGN KEY ("feedEventId") REFERENCES "FeedEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add feedEventCommentId column to Notification table
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "feedEventCommentId" TEXT;

-- Add index for feedEventCommentId
CREATE INDEX IF NOT EXISTS "Notification_feedEventCommentId_idx" ON "Notification"("feedEventCommentId");

-- Add foreign key constraint for feedEventCommentId
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_feedEventCommentId_fkey" FOREIGN KEY ("feedEventCommentId") REFERENCES "FeedEventComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
