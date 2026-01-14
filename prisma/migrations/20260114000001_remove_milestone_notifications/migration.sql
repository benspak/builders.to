-- Remove Weekly Milestone Digest and Milestone Notifications email preferences
-- These features are being removed from the platform

-- Drop the columns from EmailPreferences table
ALTER TABLE "EmailPreferences" DROP COLUMN IF EXISTS "weeklyDigest";
ALTER TABLE "EmailPreferences" DROP COLUMN IF EXISTS "milestoneNotifications";
ALTER TABLE "EmailPreferences" DROP COLUMN IF EXISTS "lastDigestSentAt";
