-- Migration: Add PROJECT_UPVOTED and PROJECT_COMMENTED notification types
-- Run this migration to enable notifications when someone upvotes or comments on a project

-- Add PROJECT_UPVOTED to NotificationType enum
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PROJECT_UPVOTED';

-- Add PROJECT_COMMENTED to NotificationType enum
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PROJECT_COMMENTED';

-- Add projectId column to Notification table (if not exists)
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "projectId" TEXT;

-- Add foreign key constraint (drop first if exists to avoid duplicate constraint errors)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Notification_projectId_fkey'
    ) THEN
        ALTER TABLE "Notification"
        ADD CONSTRAINT "Notification_projectId_fkey"
        FOREIGN KEY ("projectId")
        REFERENCES "Project"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS "Notification_projectId_idx" ON "Notification"("projectId");
