-- Add gifUrl field to DailyUpdate table for GIF attachments
ALTER TABLE "DailyUpdate" ADD COLUMN IF NOT EXISTS "gifUrl" TEXT;

-- Add gifUrl field to UpdateComment table for GIF reactions
ALTER TABLE "UpdateComment" ADD COLUMN IF NOT EXISTS "gifUrl" TEXT;

-- Add gifUrl field to FeedEventComment table for GIF reactions
ALTER TABLE "FeedEventComment" ADD COLUMN IF NOT EXISTS "gifUrl" TEXT;
