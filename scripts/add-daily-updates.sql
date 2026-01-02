-- Migration: Add DailyUpdate, UpdateLike, and UpdateComment tables for user daily updates feature
-- Run this migration to enable the daily updates feature

-- Create DailyUpdate table
CREATE TABLE IF NOT EXISTS "DailyUpdate" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "DailyUpdate_pkey" PRIMARY KEY ("id")
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "DailyUpdate_userId_idx" ON "DailyUpdate"("userId");
CREATE INDEX IF NOT EXISTS "DailyUpdate_createdAt_idx" ON "DailyUpdate"("createdAt");

-- Add foreign key constraint for DailyUpdate
ALTER TABLE "DailyUpdate"
ADD CONSTRAINT "DailyUpdate_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Create UpdateLike table for likes on updates
CREATE TABLE IF NOT EXISTS "UpdateLike" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "updateId" TEXT NOT NULL,

    CONSTRAINT "UpdateLike_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint to prevent duplicate likes
ALTER TABLE "UpdateLike"
ADD CONSTRAINT "UpdateLike_userId_updateId_key"
UNIQUE ("userId", "updateId");

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS "UpdateLike_updateId_idx" ON "UpdateLike"("updateId");

-- Add foreign key constraints for UpdateLike
ALTER TABLE "UpdateLike"
ADD CONSTRAINT "UpdateLike_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UpdateLike"
ADD CONSTRAINT "UpdateLike_updateId_fkey"
FOREIGN KEY ("updateId") REFERENCES "DailyUpdate"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Create UpdateComment table for comments on updates
CREATE TABLE IF NOT EXISTS "UpdateComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "updateId" TEXT NOT NULL,

    CONSTRAINT "UpdateComment_pkey" PRIMARY KEY ("id")
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "UpdateComment_updateId_idx" ON "UpdateComment"("updateId");
CREATE INDEX IF NOT EXISTS "UpdateComment_userId_idx" ON "UpdateComment"("userId");

-- Add foreign key constraints for UpdateComment
ALTER TABLE "UpdateComment"
ADD CONSTRAINT "UpdateComment_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UpdateComment"
ADD CONSTRAINT "UpdateComment_updateId_fkey"
FOREIGN KEY ("updateId") REFERENCES "DailyUpdate"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
