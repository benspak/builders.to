-- Migration: Add Builder Operating System fields
-- This adds intent flags, streak tracking, and endorsements to user profiles

-- Add intent flags to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "openToWork" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lookingForCofounder" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "availableForContract" BOOLEAN NOT NULL DEFAULT false;

-- Add streak tracking to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "currentStreak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "longestStreak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastActivityDate" TIMESTAMP(3);

-- Create Endorsement table
CREATE TABLE IF NOT EXISTS "Endorsement" (
    "id" TEXT NOT NULL,
    "message" TEXT,
    "skill" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endorserId" TEXT NOT NULL,
    "endorseeId" TEXT NOT NULL,

    CONSTRAINT "Endorsement_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for one endorsement per user pair
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Endorsement_endorserId_endorseeId_key'
    ) THEN
        ALTER TABLE "Endorsement" ADD CONSTRAINT "Endorsement_endorserId_endorseeId_key" UNIQUE ("endorserId", "endorseeId");
    END IF;
END $$;

-- Create indexes for Endorsement table
CREATE INDEX IF NOT EXISTS "Endorsement_endorseeId_idx" ON "Endorsement"("endorseeId");
CREATE INDEX IF NOT EXISTS "Endorsement_endorserId_idx" ON "Endorsement"("endorserId");

-- Add foreign key constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Endorsement_endorserId_fkey'
    ) THEN
        ALTER TABLE "Endorsement" ADD CONSTRAINT "Endorsement_endorserId_fkey"
        FOREIGN KEY ("endorserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Endorsement_endorseeId_fkey'
    ) THEN
        ALTER TABLE "Endorsement" ADD CONSTRAINT "Endorsement_endorseeId_fkey"
        FOREIGN KEY ("endorseeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
