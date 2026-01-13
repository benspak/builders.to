-- Add gifUrl field to DailyUpdate table
ALTER TABLE "DailyUpdate" ADD COLUMN IF NOT EXISTS "gifUrl" TEXT;

-- Add gifUrl field to UpdateComment table
ALTER TABLE "UpdateComment" ADD COLUMN IF NOT EXISTS "gifUrl" TEXT;

-- Add gifUrl field to FeedEventComment table
ALTER TABLE "FeedEventComment" ADD COLUMN IF NOT EXISTS "gifUrl" TEXT;
