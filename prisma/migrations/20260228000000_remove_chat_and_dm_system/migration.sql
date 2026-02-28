-- Remove chat/DM references from Notification
ALTER TABLE "Notification" DROP CONSTRAINT IF EXISTS "Notification_chatMessageId_fkey";
ALTER TABLE "Notification" DROP CONSTRAINT IF EXISTS "Notification_chatChannelId_fkey";
DROP INDEX IF EXISTS "Notification_chatMessageId_idx";
DROP INDEX IF EXISTS "Notification_chatChannelId_idx";
ALTER TABLE "Notification" DROP COLUMN IF EXISTS "chatMessageId";
ALTER TABLE "Notification" DROP COLUMN IF EXISTS "chatChannelId";

-- Drop chat and DM tables (dependency order)
DROP TABLE IF EXISTS "ChatMention";
DROP TABLE IF EXISTS "ChatMessageReaction";
DROP TABLE IF EXISTS "ChatMessageBookmark";
DROP TABLE IF EXISTS "ChatPollVote";
DROP TABLE IF EXISTS "ChatPollOption";
DROP TABLE IF EXISTS "ChatPoll";
DROP TABLE IF EXISTS "ChatModAction";
DROP TABLE IF EXISTS "ChatAutoModRule";
DROP TABLE IF EXISTS "ChatChannelInvite";
DROP TABLE IF EXISTS "ChatChannelMember";
DROP TABLE IF EXISTS "ChatMessage";
DROP TABLE IF EXISTS "ChatChannel";
DROP TABLE IF EXISTS "ChatChannelCategory";
DROP TABLE IF EXISTS "UserPresence";
DROP TABLE IF EXISTS "ConversationParticipant";
DROP TABLE IF EXISTS "Message";
DROP TABLE IF EXISTS "Conversation";

-- Drop chat/DM enums
DROP TYPE IF EXISTS "UserPresenceStatus";
DROP TYPE IF EXISTS "ChatChannelInviteStatus";
DROP TYPE IF EXISTS "ChatModActionType";
DROP TYPE IF EXISTS "ChatAutoModRuleType";
DROP TYPE IF EXISTS "ChatMessageType";
DROP TYPE IF EXISTS "ChatNotificationPreference";
DROP TYPE IF EXISTS "ChatChannelMemberRole";
DROP TYPE IF EXISTS "ChatChannelType";

-- Remove CHAT_MENTION from NotificationType (PostgreSQL: create new enum, migrate, drop old)
CREATE TYPE "NotificationType_new" AS ENUM (
  'MILESTONE_LIKED',
  'MILESTONE_CELEBRATED',
  'UPDATE_LIKED',
  'UPDATE_COMMENTED',
  'COMMENT_REPLIED',
  'USER_MENTIONED',
  'WEEKLY_DIGEST',
  'PROJECT_UPVOTED',
  'PROJECT_COMMENTED',
  'COMMENT_LIKED',
  'FEED_EVENT_COMMENTED',
  'TOKEN_GIFTED',
  'ACCOUNTABILITY_REQUEST',
  'ACCOUNTABILITY_ACCEPTED',
  'ACCOUNTABILITY_CHECK_IN',
  'ACCOUNTABILITY_REMINDER',
  'KARMA_MILESTONE',
  'COMMENT_MARKED_HELPFUL',
  'USER_FOLLOWED'
);

-- Update any existing CHAT_MENTION to USER_FOLLOWED so the cast succeeds
UPDATE "Notification" SET "type" = 'USER_FOLLOWED' WHERE "type" = 'CHAT_MENTION';

ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
DROP TYPE "NotificationType";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
