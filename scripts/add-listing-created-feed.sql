-- Add LISTING_CREATED to FeedEventType enum
-- This allows feed events to be created when new local listings are added

-- Add the new enum value
ALTER TYPE "FeedEventType" ADD VALUE 'LISTING_CREATED';

-- Add localListingId column to FeedEvent
ALTER TABLE "FeedEvent" ADD COLUMN "localListingId" TEXT;

-- Create unique constraint
ALTER TABLE "FeedEvent" ADD CONSTRAINT "FeedEvent_localListingId_key" UNIQUE ("localListingId");

-- Create index for faster queries
CREATE INDEX "FeedEvent_localListingId_idx" ON "FeedEvent"("localListingId");

-- Add foreign key constraint
ALTER TABLE "FeedEvent" ADD CONSTRAINT "FeedEvent_localListingId_fkey"
  FOREIGN KEY ("localListingId") REFERENCES "LocalListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
