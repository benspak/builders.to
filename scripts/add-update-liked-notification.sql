-- Migration: Add UPDATE_LIKED notification type and updateId field
-- Run this migration to enable notifications when someone likes an update

-- Add UPDATE_LIKED to NotificationType enum
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'UPDATE_LIKED';

-- Add updateId column to Notification table
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "updateId" TEXT;

-- Add foreign key constraint
ALTER TABLE "Notification"
ADD CONSTRAINT "Notification_updateId_fkey"
FOREIGN KEY ("updateId")
REFERENCES "DailyUpdate"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Create index for better query performance (optional but recommended)
CREATE INDEX IF NOT EXISTS "Notification_updateId_idx" ON "Notification"("updateId");
