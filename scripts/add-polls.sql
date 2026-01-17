-- Migration script: Add Polls System (X/Twitter-style polls)
-- Polls expire after 7 days and support up to 5 options

-- Step 1: Create Poll table
CREATE TABLE IF NOT EXISTS "Poll" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Poll_pkey" PRIMARY KEY ("id")
);

-- Step 2: Create PollOption table
CREATE TABLE IF NOT EXISTS "PollOption" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "pollId" TEXT NOT NULL,

    CONSTRAINT "PollOption_pkey" PRIMARY KEY ("id")
);

-- Step 3: Create PollVote table
CREATE TABLE IF NOT EXISTS "PollVote" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,

    CONSTRAINT "PollVote_pkey" PRIMARY KEY ("id")
);

-- Step 4: Create PollLike table
CREATE TABLE IF NOT EXISTS "PollLike" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,

    CONSTRAINT "PollLike_pkey" PRIMARY KEY ("id")
);

-- Step 5: Create PollComment table
CREATE TABLE IF NOT EXISTS "PollComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "gifUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,

    CONSTRAINT "PollComment_pkey" PRIMARY KEY ("id")
);

-- Step 6: Add indexes for Poll
CREATE INDEX IF NOT EXISTS "Poll_userId_idx" ON "Poll"("userId");
CREATE INDEX IF NOT EXISTS "Poll_createdAt_idx" ON "Poll"("createdAt");
CREATE INDEX IF NOT EXISTS "Poll_expiresAt_idx" ON "Poll"("expiresAt");

-- Step 7: Add indexes for PollOption
CREATE INDEX IF NOT EXISTS "PollOption_pollId_idx" ON "PollOption"("pollId");

-- Step 8: Add indexes for PollVote
CREATE INDEX IF NOT EXISTS "PollVote_optionId_idx" ON "PollVote"("optionId");
CREATE INDEX IF NOT EXISTS "PollVote_pollId_idx" ON "PollVote"("pollId");

-- Step 9: Add unique constraint for one vote per user per poll
CREATE UNIQUE INDEX IF NOT EXISTS "PollVote_userId_pollId_key" ON "PollVote"("userId", "pollId");

-- Step 10: Add indexes for PollLike
CREATE INDEX IF NOT EXISTS "PollLike_pollId_idx" ON "PollLike"("pollId");

-- Step 11: Add unique constraint for one like per user per poll
CREATE UNIQUE INDEX IF NOT EXISTS "PollLike_userId_pollId_key" ON "PollLike"("userId", "pollId");

-- Step 12: Add indexes for PollComment
CREATE INDEX IF NOT EXISTS "PollComment_pollId_idx" ON "PollComment"("pollId");
CREATE INDEX IF NOT EXISTS "PollComment_userId_idx" ON "PollComment"("userId");
CREATE INDEX IF NOT EXISTS "PollComment_createdAt_idx" ON "PollComment"("createdAt");

-- Step 13: Add foreign keys for Poll
ALTER TABLE "Poll" ADD CONSTRAINT "Poll_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 14: Add foreign keys for PollOption
ALTER TABLE "PollOption" ADD CONSTRAINT "PollOption_pollId_fkey"
    FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 15: Add foreign keys for PollVote
ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_optionId_fkey"
    FOREIGN KEY ("optionId") REFERENCES "PollOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 16: Add foreign keys for PollLike
ALTER TABLE "PollLike" ADD CONSTRAINT "PollLike_pollId_fkey"
    FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 17: Add foreign keys for PollComment
ALTER TABLE "PollComment" ADD CONSTRAINT "PollComment_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PollComment" ADD CONSTRAINT "PollComment_pollId_fkey"
    FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 18: Add pollId column to Notification table (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'Notification' AND column_name = 'pollId') THEN
        ALTER TABLE "Notification" ADD COLUMN "pollId" TEXT;
    END IF;
END $$;

-- Step 19: Add foreign key for Notification.pollId
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name = 'Notification_pollId_fkey') THEN
        ALTER TABLE "Notification" ADD CONSTRAINT "Notification_pollId_fkey"
            FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Step 20: Add index for Notification.pollId
CREATE INDEX IF NOT EXISTS "Notification_pollId_idx" ON "Notification"("pollId");
