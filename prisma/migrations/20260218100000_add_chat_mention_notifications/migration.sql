-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'CHAT_MENTION';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN "chatChannelId" TEXT,
ADD COLUMN "chatMessageId" TEXT;

-- CreateIndex
CREATE INDEX "Notification_chatMessageId_idx" ON "Notification"("chatMessageId");

-- CreateIndex
CREATE INDEX "Notification_chatChannelId_idx" ON "Notification"("chatChannelId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_chatMessageId_fkey" FOREIGN KEY ("chatMessageId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_chatChannelId_fkey" FOREIGN KEY ("chatChannelId") REFERENCES "ChatChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
