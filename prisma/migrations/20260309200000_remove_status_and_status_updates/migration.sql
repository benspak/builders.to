-- Remove status and status updates feature
-- 1. Delete feed events that were status updates (type no longer in Prisma enum)
DELETE FROM "FeedEvent" WHERE type = 'STATUS_UPDATE';

-- 2. Drop User profile status columns
ALTER TABLE "User" DROP COLUMN IF EXISTS "status";
ALTER TABLE "User" DROP COLUMN IF EXISTS "statusUpdatedAt";
