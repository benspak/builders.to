import { Server, Socket } from "socket.io";
import { PrismaClient } from "@prisma/client";
import webPush from "web-push";
import type { AuthenticatedSocket } from "../server";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails("mailto:support@builders.to", vapidPublicKey, vapidPrivateKey);
}

async function sendMentionPush(
  prisma: PrismaClient,
  mentionedUserId: string,
  senderName: string,
  channelName: string,
  channelId: string,
  messageId: string
) {
  if (!vapidPublicKey || !vapidPrivateKey) return;
  try {
    const subs = await prisma.pushSubscription.findMany({ where: { userId: mentionedUserId } });
    if (subs.length === 0) return;
    const payload = JSON.stringify({
      title: `${senderName} mentioned you`,
      body: `You were mentioned in #${channelName}`,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-96x96.png",
      url: `/messages/${channelId}?highlight=${messageId}`,
      tag: "chat-mention",
    });
    const failed: string[] = [];
    await Promise.allSettled(
      subs.map(async (sub) => {
        try {
          await webPush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload,
            { TTL: 86400, urgency: "normal" }
          );
        } catch (err: unknown) {
          const e = err as { statusCode?: number };
          if (e.statusCode === 404 || e.statusCode === 410) failed.push(sub.endpoint);
        }
      })
    );
    if (failed.length > 0) {
      await prisma.pushSubscription.deleteMany({ where: { endpoint: { in: failed } } });
    }
  } catch (err) {
    console.error("[Push] mention notification error:", err);
  }
}

export function registerMessageHandlers(
  io: Server,
  socket: AuthenticatedSocket,
  prisma: PrismaClient,
  connectedUsers: Map<string, Set<string>>
) {
  const userId = socket.user.id;

  socket.on("message:send", async (data, callback) => {
    try {
      const { channelId, content, threadParentId, gifUrl, imageUrl, codeSnippet, codeLanguage } = data;

      if (!channelId || !content?.trim()) {
        return callback?.({ error: "channelId and content are required" });
      }

      const member = await prisma.chatChannelMember.findUnique({
        where: { userId_channelId: { userId, channelId } },
      });
      if (!member) {
        return callback?.({ error: "Not a member of this channel" });
      }

      // Check slow mode
      const channel = await prisma.chatChannel.findUnique({
        where: { id: channelId },
        select: { slowModeSeconds: true, name: true },
      });
      if (channel && channel.slowModeSeconds > 0) {
        const lastMessage = await prisma.chatMessage.findFirst({
          where: { senderId: userId, channelId },
          orderBy: { createdAt: "desc" },
        });
        if (lastMessage) {
          const elapsed = (Date.now() - lastMessage.createdAt.getTime()) / 1000;
          if (elapsed < channel.slowModeSeconds) {
            return callback?.({ error: `Slow mode: wait ${Math.ceil(channel.slowModeSeconds - elapsed)}s` });
          }
        }
      }

      // Auto-mod: word filter
      const wordFilters = await prisma.chatAutoModRule.findMany({
        where: {
          OR: [{ channelId }, { channelId: null }],
          type: "WORD_FILTER",
          isEnabled: true,
        },
      });
      for (const rule of wordFilters) {
        const config = rule.config as { words?: string[] };
        if (config.words) {
          const lower = content.toLowerCase();
          for (const word of config.words) {
            if (lower.includes(word.toLowerCase())) {
              return callback?.({ error: "Message contains blocked content" });
            }
          }
        }
      }

      const message = await prisma.chatMessage.create({
        data: {
          content: content.trim(),
          senderId: userId,
          channelId,
          threadParentId: threadParentId || null,
          gifUrl: gifUrl || null,
          imageUrl: imageUrl || null,
          codeSnippet: codeSnippet || null,
          codeLanguage: codeLanguage || null,
        },
        include: {
          sender: { select: { id: true, name: true, firstName: true, lastName: true, image: true, slug: true } },
          reactions: {
            include: { user: { select: { id: true, name: true, firstName: true, lastName: true } } },
          },
          _count: { select: { threadReplies: true } },
          threadParent: { select: { id: true, senderId: true } },
        },
      });

      // Parse @mentions and create notifications
      const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
      let match;
      const mentionUserIds: string[] = [];
      while ((match = mentionRegex.exec(content)) !== null) {
        mentionUserIds.push(match[2]);
      }

      if (mentionUserIds.length > 0) {
        await prisma.chatMention.createMany({
          data: mentionUserIds.map((uid) => ({ messageId: message.id, userId: uid })),
          skipDuplicates: true,
        });

        const senderName = message.sender.firstName && message.sender.lastName
          ? `${message.sender.firstName} ${message.sender.lastName}`
          : message.sender.name || "Someone";
        const channelName = channel?.name || "chat";

        const contentPreview = content
          .replace(/@\[([^\]]+)\]\([^)]+\)/g, "@$1")
          .slice(0, 120);

        for (const mentionedId of mentionUserIds) {
          if (mentionedId === userId) continue;

          // Check notification preference
          const mentionedMember = await prisma.chatChannelMember.findUnique({
            where: { userId_channelId: { userId: mentionedId, channelId } },
            select: { notificationPreference: true },
          });
          if (mentionedMember?.notificationPreference === "NONE") continue;

          const notification = await prisma.notification.create({
            data: {
              type: "CHAT_MENTION",
              title: `${senderName} mentioned you in #${channelName}`,
              message: contentPreview,
              userId: mentionedId,
              actorId: userId,
              actorName: senderName,
              actorImage: message.sender.image,
              chatMessageId: message.id,
              chatChannelId: channelId,
            },
          });

          // Real-time notification via socket
          const mentionedSockets = connectedUsers.get(mentionedId);
          if (mentionedSockets) {
            for (const sid of mentionedSockets) {
              io.to(sid).emit("notification:new", {
                id: notification.id,
                type: "CHAT_MENTION",
                title: notification.title,
                message: notification.message,
                actorName: senderName,
                actorImage: message.sender.image,
                channelId,
                messageId: message.id,
                createdAt: notification.createdAt.toISOString(),
              });
            }
          }

          // Push notification (fire-and-forget)
          sendMentionPush(prisma, mentionedId, senderName, channelName, channelId, message.id);
        }
      }

      // Broadcast to channel
      io.to(`channel:${channelId}`).emit("message:new", message);

      // Notify thread participants if this is a thread reply
      if (threadParentId) {
        const threadParticipants = await prisma.chatMessage.findMany({
          where: { OR: [{ id: threadParentId }, { threadParentId }] },
          select: { senderId: true },
          distinct: ["senderId"],
        });
        for (const p of threadParticipants) {
          if (p.senderId !== userId) {
            const sockets = connectedUsers.get(p.senderId);
            if (sockets) {
              for (const sid of sockets) {
                io.to(sid).emit("thread:new", { threadParentId, message });
              }
            }
          }
        }
      }

      callback?.({ success: true, message });
    } catch (error) {
      console.error("message:send error:", error);
      callback?.({ error: "Failed to send message" });
    }
  });

  socket.on("message:edit", async (data, callback) => {
    try {
      const { messageId, content } = data;
      if (!messageId || !content?.trim()) {
        return callback?.({ error: "messageId and content are required" });
      }

      const message = await prisma.chatMessage.findUnique({ where: { id: messageId } });
      if (!message || message.senderId !== userId) {
        return callback?.({ error: "Cannot edit this message" });
      }

      const updated = await prisma.chatMessage.update({
        where: { id: messageId },
        data: { content: content.trim(), editedAt: new Date() },
        include: {
          sender: { select: { id: true, name: true, firstName: true, lastName: true, image: true, slug: true } },
          reactions: {
            include: { user: { select: { id: true, name: true, firstName: true, lastName: true } } },
          },
          _count: { select: { threadReplies: true } },
        },
      });

      io.to(`channel:${message.channelId}`).emit("message:updated", updated);
      callback?.({ success: true, message: updated });
    } catch (error) {
      console.error("message:edit error:", error);
      callback?.({ error: "Failed to edit message" });
    }
  });

  socket.on("message:delete", async (data, callback) => {
    try {
      const { messageId } = data;
      if (!messageId) return callback?.({ error: "messageId is required" });

      const message = await prisma.chatMessage.findUnique({ where: { id: messageId } });
      if (!message) return callback?.({ error: "Message not found" });

      // Check permission: sender or channel admin/mod
      if (message.senderId !== userId) {
        const member = await prisma.chatChannelMember.findUnique({
          where: { userId_channelId: { userId, channelId: message.channelId } },
        });
        if (!member || !["OWNER", "ADMIN", "MODERATOR"].includes(member.role)) {
          return callback?.({ error: "No permission to delete this message" });
        }
      }

      await prisma.chatMessage.update({
        where: { id: messageId },
        data: { isDeleted: true, deletedById: userId, content: "[deleted]" },
      });

      io.to(`channel:${message.channelId}`).emit("message:deleted", {
        messageId,
        channelId: message.channelId,
      });
      callback?.({ success: true });
    } catch (error) {
      console.error("message:delete error:", error);
      callback?.({ error: "Failed to delete message" });
    }
  });

  socket.on("message:react", async (data, callback) => {
    try {
      const { messageId, emoji } = data;
      if (!messageId || !emoji) return callback?.({ error: "messageId and emoji are required" });

      const message = await prisma.chatMessage.findUnique({ where: { id: messageId } });
      if (!message) return callback?.({ error: "Message not found" });

      // Toggle reaction
      const existing = await prisma.chatMessageReaction.findUnique({
        where: { messageId_userId_emoji: { messageId, userId, emoji } },
      });

      if (existing) {
        await prisma.chatMessageReaction.delete({ where: { id: existing.id } });
      } else {
        await prisma.chatMessageReaction.create({
          data: { messageId, userId, emoji },
        });
      }

      // Fetch all reactions for this message
      const reactions = await prisma.chatMessageReaction.findMany({
        where: { messageId },
        include: { user: { select: { id: true, name: true, firstName: true, lastName: true } } },
      });

      io.to(`channel:${message.channelId}`).emit("reaction:updated", {
        messageId,
        channelId: message.channelId,
        reactions,
      });
      callback?.({ success: true });
    } catch (error) {
      console.error("message:react error:", error);
      callback?.({ error: "Failed to update reaction" });
    }
  });
}
