-- Migration script: Add Poll support to DailyUpdate
-- Polls are now an attachment type on updates (like images or GIFs)
-- Polls expire after 7 days and support up to 5 options

-- Step 1: Add poll columns to DailyUpdate table
ALTER TABLE "DailyUpdate" ADD COLUMN IF NOT EXISTS "pollQuestion" TEXT;
ALTER TABLE "DailyUpdate" ADD COLUMN IF NOT EXISTS "pollExpiresAt" TIMESTAMP(3);

-- Step 2: Create UpdatePollOption table
CREATE TABLE IF NOT EXISTS "UpdatePollOption" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "updateId" TEXT NOT NULL,

    CONSTRAINT "UpdatePollOption_pkey" PRIMARY KEY ("id")
);

-- Step 3: Create UpdatePollVote table
CREATE TABLE IF NOT EXISTS "UpdatePollVote" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "updateId" TEXT NOT NULL,

    CONSTRAINT "UpdatePollVote_pkey" PRIMARY KEY ("id")
);

-- Step 4: Add indexes for UpdatePollOption
CREATE INDEX IF NOT EXISTS "UpdatePollOption_updateId_idx" ON "UpdatePollOption"("updateId");

-- Step 5: Add indexes for UpdatePollVote
CREATE INDEX IF NOT EXISTS "UpdatePollVote_optionId_idx" ON "UpdatePollVote"("optionId");
CREATE INDEX IF NOT EXISTS "UpdatePollVote_updateId_idx" ON "UpdatePollVote"("updateId");

-- Step 6: Add unique constraint for one vote per user per update poll
CREATE UNIQUE INDEX IF NOT EXISTS "UpdatePollVote_userId_updateId_key" ON "UpdatePollVote"("userId", "updateId");

-- Step 7: Add foreign keys for UpdatePollOption
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name = 'UpdatePollOption_updateId_fkey') THEN
        ALTER TABLE "UpdatePollOption" ADD CONSTRAINT "UpdatePollOption_updateId_fkey"
            FOREIGN KEY ("updateId") REFERENCES "DailyUpdate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Step 8: Add foreign keys for UpdatePollVote
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name = 'UpdatePollVote_optionId_fkey') THEN
        ALTER TABLE "UpdatePollVote" ADD CONSTRAINT "UpdatePollVote_optionId_fkey"
            FOREIGN KEY ("optionId") REFERENCES "UpdatePollOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name = 'UpdatePollVote_updateId_fkey') THEN
        ALTER TABLE "UpdatePollVote" ADD CONSTRAINT "UpdatePollVote_updateId_fkey"
            FOREIGN KEY ("updateId") REFERENCES "DailyUpdate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Note: The standalone Poll tables (Poll, PollOption, PollVote, PollLike, PollComment)
-- can be dropped if they exist and are no longer needed:
-- DROP TABLE IF EXISTS "PollComment" CASCADE;
-- DROP TABLE IF EXISTS "PollLike" CASCADE;
-- DROP TABLE IF EXISTS "PollVote" CASCADE;
-- DROP TABLE IF EXISTS "PollOption" CASCADE;
-- DROP TABLE IF EXISTS "Poll" CASCADE;
