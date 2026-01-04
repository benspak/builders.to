-- Add user status field to User table
-- This allows users to display a short status message on their profile

-- Add status column (short text for status message)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "status" TEXT;

-- Add statusUpdatedAt column (timestamp for when status was last updated)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "statusUpdatedAt" TIMESTAMP(3);

-- Add STATUS_UPDATE to FeedEventType enum for displaying status updates in the feed
ALTER TYPE "FeedEventType" ADD VALUE IF NOT EXISTS 'STATUS_UPDATE';

-- Add PROJECT_STATUS_CHANGE to FeedEventType enum for project status transitions
ALTER TYPE "FeedEventType" ADD VALUE IF NOT EXISTS 'PROJECT_STATUS_CHANGE';
