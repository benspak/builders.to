-- Add AdClick table for tracking ad clicks and CTR analytics
-- Run this migration before deploying the click tracking feature

-- Create AdClick table
CREATE TABLE IF NOT EXISTS "AdClick" (
    "id" TEXT NOT NULL,
    "adId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitorId" TEXT,

    CONSTRAINT "AdClick_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint
ALTER TABLE "AdClick" ADD CONSTRAINT "AdClick_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Advertisement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "AdClick_adId_idx" ON "AdClick"("adId");
CREATE INDEX IF NOT EXISTS "AdClick_createdAt_idx" ON "AdClick"("createdAt");
CREATE INDEX IF NOT EXISTS "AdClick_adId_visitorId_idx" ON "AdClick"("adId", "visitorId");
