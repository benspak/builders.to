import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import type { AuthenticatedSocket } from "../server";

export function registerChannelHandlers(
  io: Server,
  socket: AuthenticatedSocket,
  prisma: PrismaClient
) {
  const userId = socket.user.id;

  socket.on("channel:join", async (data, callback) => {
    try {
      const { channelId } = data;
      if (!channelId) return callback?.({ error: "channelId is required" });

      const member = await prisma.chatChannelMember.findUnique({
        where: { userId_channelId: { userId, channelId } },
      });

      if (!member) {
        return callback?.({ error: "Not a member of this channel" });
      }

      socket.join(`channel:${channelId}`);
      callback?.({ success: true });
    } catch (error) {
      console.error("channel:join error:", error);
      callback?.({ error: "Failed to join channel room" });
    }
  });

  socket.on("channel:leave", (data) => {
    const { channelId } = data;
    if (channelId) {
      socket.leave(`channel:${channelId}`);
    }
  });

  // Mark channel as read
  socket.on("channel:mark-read", async (data, callback) => {
    try {
      const { channelId, messageId } = data;
      if (!channelId || !messageId) {
        return callback?.({ error: "channelId and messageId are required" });
      }

      await prisma.chatChannelMember.update({
        where: { userId_channelId: { userId, channelId } },
        data: { lastReadMessageId: messageId },
      });

      callback?.({ success: true });
    } catch (error) {
      console.error("channel:mark-read error:", error);
      callback?.({ error: "Failed to mark channel as read" });
    }
  });
}
