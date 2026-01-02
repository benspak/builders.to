-- Migration: Add DailyUpdate table for user daily updates feature
-- Run this migration to enable the daily updates feature

CREATE TABLE IF NOT EXISTS "DailyUpdate" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "DailyUpdate_pkey" PRIMARY KEY ("id")
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "DailyUpdate_userId_idx" ON "DailyUpdate"("userId");
CREATE INDEX IF NOT EXISTS "DailyUpdate_createdAt_idx" ON "DailyUpdate"("createdAt");

-- Add foreign key constraint
ALTER TABLE "DailyUpdate"
ADD CONSTRAINT "DailyUpdate_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
