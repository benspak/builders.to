-- Add Follows Feature
-- Creates the Follow table and adds USER_FOLLOWED notification type

-- ============================================
-- Add USER_FOLLOWED to NotificationType enum
-- ============================================

DO $$ BEGIN
    ALTER TYPE "NotificationType" ADD VALUE 'USER_FOLLOWED';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- Create Follow Table
-- ============================================

CREATE TABLE IF NOT EXISTS "Follow" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- Indexes
-- ============================================

CREATE UNIQUE INDEX IF NOT EXISTS "Follow_followerId_followingId_key" ON "Follow"("followerId", "followingId");
CREATE INDEX IF NOT EXISTS "Follow_followingId_idx" ON "Follow"("followingId");
CREATE INDEX IF NOT EXISTS "Follow_followerId_idx" ON "Follow"("followerId");

-- ============================================
-- Foreign Keys
-- ============================================

DO $$ BEGIN
    ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
