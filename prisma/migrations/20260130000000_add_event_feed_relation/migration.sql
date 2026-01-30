-- AlterTable
ALTER TABLE "FeedEvent" ADD COLUMN IF NOT EXISTS "eventId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FeedEvent_eventId_idx" ON "FeedEvent"("eventId");

-- AddForeignKey (only if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'FeedEvent_eventId_fkey'
    ) THEN
        ALTER TABLE "FeedEvent" ADD CONSTRAINT "FeedEvent_eventId_fkey" 
        FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
