-- CreateEnum
CREATE TYPE "ChatChannelType" AS ENUM ('PUBLIC', 'PRIVATE', 'DM', 'GROUP_DM');
CREATE TYPE "ChatChannelMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MODERATOR', 'MEMBER');
CREATE TYPE "ChatNotificationPreference" AS ENUM ('ALL', 'MENTIONS', 'NONE');
CREATE TYPE "ChatMessageType" AS ENUM ('TEXT', 'SYSTEM', 'POLL');
CREATE TYPE "ChatAutoModRuleType" AS ENUM ('WORD_FILTER', 'SPAM', 'LINK_FILTER');
CREATE TYPE "ChatModActionType" AS ENUM ('DELETE_MESSAGE', 'MUTE_USER', 'BAN_USER', 'WARN_USER');
CREATE TYPE "ChatChannelInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');
CREATE TYPE "UserPresenceStatus" AS ENUM ('ONLINE', 'AWAY', 'DND', 'OFFLINE');

-- CreateTable
CREATE TABLE "ChatChannelCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatChannelCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatChannel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "topic" TEXT,
    "type" "ChatChannelType" NOT NULL DEFAULT 'PUBLIC',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "slowModeSeconds" INTEGER NOT NULL DEFAULT 0,
    "messageRetentionDays" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatChannelMember" (
    "id" TEXT NOT NULL,
    "role" "ChatChannelMemberRole" NOT NULL DEFAULT 'MEMBER',
    "notificationPreference" "ChatNotificationPreference" NOT NULL DEFAULT 'MENTIONS',
    "lastReadMessageId" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,

    CONSTRAINT "ChatChannelMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatChannelInvite" (
    "id" TEXT NOT NULL,
    "status" "ChatChannelInviteStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channelId" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "inviteeId" TEXT NOT NULL,

    CONSTRAINT "ChatChannelInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "ChatMessageType" NOT NULL DEFAULT 'TEXT',
    "gifUrl" TEXT,
    "imageUrl" TEXT,
    "codeSnippet" TEXT,
    "codeLanguage" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "pinnedById" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedById" TEXT,
    "editedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "threadParentId" TEXT,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessageReaction" (
    "id" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ChatMessageReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessageBookmark" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ChatMessageBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMention" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ChatMention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatPoll" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "allowMultiple" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "messageId" TEXT NOT NULL,

    CONSTRAINT "ChatPoll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatPollOption" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "pollId" TEXT NOT NULL,

    CONSTRAINT "ChatPollOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatPollVote" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "optionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ChatPollVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatAutoModRule" (
    "id" TEXT NOT NULL,
    "type" "ChatAutoModRuleType" NOT NULL,
    "config" JSONB NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "channelId" TEXT,

    CONSTRAINT "ChatAutoModRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatModAction" (
    "id" TEXT NOT NULL,
    "action" "ChatModActionType" NOT NULL,
    "reason" TEXT,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channelId" TEXT NOT NULL,
    "messageId" TEXT,
    "targetUserId" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,

    CONSTRAINT "ChatModAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPresence" (
    "id" TEXT NOT NULL,
    "status" "UserPresenceStatus" NOT NULL DEFAULT 'OFFLINE',
    "customStatus" TEXT,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserPresence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatChannelCategory_position_idx" ON "ChatChannelCategory"("position");

-- CreateIndex
CREATE UNIQUE INDEX "ChatChannel_slug_key" ON "ChatChannel"("slug");
CREATE INDEX "ChatChannel_type_idx" ON "ChatChannel"("type");
CREATE INDEX "ChatChannel_categoryId_idx" ON "ChatChannel"("categoryId");
CREATE INDEX "ChatChannel_createdById_idx" ON "ChatChannel"("createdById");
CREATE INDEX "ChatChannel_isArchived_idx" ON "ChatChannel"("isArchived");

-- CreateIndex
CREATE UNIQUE INDEX "ChatChannelMember_userId_channelId_key" ON "ChatChannelMember"("userId", "channelId");
CREATE INDEX "ChatChannelMember_channelId_idx" ON "ChatChannelMember"("channelId");
CREATE INDEX "ChatChannelMember_userId_idx" ON "ChatChannelMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatChannelInvite_channelId_inviteeId_key" ON "ChatChannelInvite"("channelId", "inviteeId");
CREATE INDEX "ChatChannelInvite_inviteeId_idx" ON "ChatChannelInvite"("inviteeId");
CREATE INDEX "ChatChannelInvite_channelId_idx" ON "ChatChannelInvite"("channelId");

-- CreateIndex
CREATE INDEX "ChatMessage_channelId_createdAt_idx" ON "ChatMessage"("channelId", "createdAt");
CREATE INDEX "ChatMessage_senderId_idx" ON "ChatMessage"("senderId");
CREATE INDEX "ChatMessage_threadParentId_idx" ON "ChatMessage"("threadParentId");
CREATE INDEX "ChatMessage_isPinned_idx" ON "ChatMessage"("isPinned");

-- CreateIndex
CREATE UNIQUE INDEX "ChatMessageReaction_messageId_userId_emoji_key" ON "ChatMessageReaction"("messageId", "userId", "emoji");
CREATE INDEX "ChatMessageReaction_messageId_idx" ON "ChatMessageReaction"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatMessageBookmark_messageId_userId_key" ON "ChatMessageBookmark"("messageId", "userId");
CREATE INDEX "ChatMessageBookmark_userId_idx" ON "ChatMessageBookmark"("userId");

-- CreateIndex
CREATE INDEX "ChatMention_messageId_idx" ON "ChatMention"("messageId");
CREATE INDEX "ChatMention_userId_idx" ON "ChatMention"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatPoll_messageId_key" ON "ChatPoll"("messageId");

-- CreateIndex
CREATE INDEX "ChatPollOption_pollId_idx" ON "ChatPollOption"("pollId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatPollVote_optionId_userId_key" ON "ChatPollVote"("optionId", "userId");
CREATE INDEX "ChatPollVote_optionId_idx" ON "ChatPollVote"("optionId");

-- CreateIndex
CREATE INDEX "ChatAutoModRule_channelId_idx" ON "ChatAutoModRule"("channelId");
CREATE INDEX "ChatAutoModRule_type_idx" ON "ChatAutoModRule"("type");

-- CreateIndex
CREATE INDEX "ChatModAction_channelId_idx" ON "ChatModAction"("channelId");
CREATE INDEX "ChatModAction_targetUserId_idx" ON "ChatModAction"("targetUserId");
CREATE INDEX "ChatModAction_moderatorId_idx" ON "ChatModAction"("moderatorId");
CREATE INDEX "ChatModAction_createdAt_idx" ON "ChatModAction"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserPresence_userId_key" ON "UserPresence"("userId");

-- AddForeignKey
ALTER TABLE "ChatChannel" ADD CONSTRAINT "ChatChannel_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatChannel" ADD CONSTRAINT "ChatChannel_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ChatChannelCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatChannelMember" ADD CONSTRAINT "ChatChannelMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatChannelMember" ADD CONSTRAINT "ChatChannelMember_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "ChatChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatChannelInvite" ADD CONSTRAINT "ChatChannelInvite_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "ChatChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatChannelInvite" ADD CONSTRAINT "ChatChannelInvite_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatChannelInvite" ADD CONSTRAINT "ChatChannelInvite_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_pinnedById_fkey" FOREIGN KEY ("pinnedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "ChatChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_threadParentId_fkey" FOREIGN KEY ("threadParentId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessageReaction" ADD CONSTRAINT "ChatMessageReaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMessageReaction" ADD CONSTRAINT "ChatMessageReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessageBookmark" ADD CONSTRAINT "ChatMessageBookmark_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMessageBookmark" ADD CONSTRAINT "ChatMessageBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMention" ADD CONSTRAINT "ChatMention_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMention" ADD CONSTRAINT "ChatMention_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatPoll" ADD CONSTRAINT "ChatPoll_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatPollOption" ADD CONSTRAINT "ChatPollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "ChatPoll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatPollVote" ADD CONSTRAINT "ChatPollVote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "ChatPollOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatPollVote" ADD CONSTRAINT "ChatPollVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatAutoModRule" ADD CONSTRAINT "ChatAutoModRule_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "ChatChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatModAction" ADD CONSTRAINT "ChatModAction_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "ChatChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatModAction" ADD CONSTRAINT "ChatModAction_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatModAction" ADD CONSTRAINT "ChatModAction_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPresence" ADD CONSTRAINT "UserPresence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
