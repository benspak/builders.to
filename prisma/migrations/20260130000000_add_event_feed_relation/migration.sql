-- AlterTable: Add eventId column to FeedEvent
ALTER TABLE "FeedEvent" ADD COLUMN IF NOT EXISTS "eventId" TEXT;

-- CreateIndex: Add index on eventId
CREATE INDEX IF NOT EXISTS "FeedEvent_eventId_idx" ON "FeedEvent"("eventId");

-- CreateIndex: Add unique constraint on eventId (one feed event per event)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'FeedEvent_eventId_key'
    ) THEN
        ALTER TABLE "FeedEvent" ADD CONSTRAINT "FeedEvent_eventId_key" UNIQUE ("eventId");
    END IF;
END $$;

-- AddForeignKey: Link FeedEvent to Event
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'FeedEvent_eventId_fkey'
    ) THEN
        ALTER TABLE "FeedEvent" ADD CONSTRAINT "FeedEvent_eventId_fkey" 
        FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
