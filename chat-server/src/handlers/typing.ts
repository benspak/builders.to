import { Server } from "socket.io";
import type { AuthenticatedSocket } from "../server";

const typingTimers = new Map<string, NodeJS.Timeout>();

export function registerTypingHandlers(
  io: Server,
  socket: AuthenticatedSocket
) {
  const userId = socket.user.id;

  socket.on("typing:start", (data) => {
    const { channelId } = data;
    if (!channelId) return;

    const key = `${userId}:${channelId}`;

    // Clear existing timer
    const existing = typingTimers.get(key);
    if (existing) clearTimeout(existing);

    // Broadcast typing to channel (exclude sender)
    socket.to(`channel:${channelId}`).emit("typing:update", {
      userId,
      channelId,
      isTyping: true,
    });

    // Auto-clear after 5 seconds
    typingTimers.set(
      key,
      setTimeout(() => {
        socket.to(`channel:${channelId}`).emit("typing:update", {
          userId,
          channelId,
          isTyping: false,
        });
        typingTimers.delete(key);
      }, 5000)
    );
  });

  socket.on("typing:stop", (data) => {
    const { channelId } = data;
    if (!channelId) return;

    const key = `${userId}:${channelId}`;
    const existing = typingTimers.get(key);
    if (existing) {
      clearTimeout(existing);
      typingTimers.delete(key);
    }

    socket.to(`channel:${channelId}`).emit("typing:update", {
      userId,
      channelId,
      isTyping: false,
    });
  });
}
