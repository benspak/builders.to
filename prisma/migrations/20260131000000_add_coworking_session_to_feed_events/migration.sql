-- Add COWORKING_SESSION_CREATED to FeedEventType enum
ALTER TYPE "FeedEventType" ADD VALUE IF NOT EXISTS 'COWORKING_SESSION_CREATED';

-- Add coworkingSessionId column to FeedEvent table
ALTER TABLE "FeedEvent" ADD COLUMN IF NOT EXISTS "coworkingSessionId" TEXT;

-- Add unique constraint on coworkingSessionId
ALTER TABLE "FeedEvent" ADD CONSTRAINT "FeedEvent_coworkingSessionId_key" UNIQUE ("coworkingSessionId");

-- Add foreign key constraint
ALTER TABLE "FeedEvent" ADD CONSTRAINT "FeedEvent_coworkingSessionId_fkey" 
  FOREIGN KEY ("coworkingSessionId") REFERENCES "CoworkingSession"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Create index for coworkingSessionId
CREATE INDEX IF NOT EXISTS "FeedEvent_coworkingSessionId_idx" ON "FeedEvent"("coworkingSessionId");
