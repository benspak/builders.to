-- Add openToMeeting intent flag to User table
-- This allows users to indicate they're open to meeting with other builders

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "openToMeeting" BOOLEAN NOT NULL DEFAULT false;
