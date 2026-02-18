import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import type { AuthenticatedSocket } from "../server";

export function registerPresenceHandlers(
  io: Server,
  socket: AuthenticatedSocket,
  prisma: PrismaClient,
  connectedUsers: Map<string, Set<string>>
) {
  const userId = socket.user.id;

  socket.on("presence:update", async (data, callback) => {
    try {
      const { status, customStatus } = data;
      const validStatuses = ["ONLINE", "AWAY", "DND", "OFFLINE"];
      if (!validStatuses.includes(status)) {
        return callback?.({ error: "Invalid status" });
      }

      await prisma.userPresence.upsert({
        where: { userId },
        update: { status, customStatus: customStatus ?? undefined, lastSeenAt: new Date() },
        create: { userId, status, customStatus: customStatus ?? null, lastSeenAt: new Date() },
      });

      io.emit("presence:changed", { userId, status, customStatus });
      callback?.({ success: true });
    } catch (error) {
      console.error("presence:update error:", error);
      callback?.({ error: "Failed to update presence" });
    }
  });

  // Heartbeat to keep presence alive and detect away
  socket.on("presence:heartbeat", async () => {
    try {
      await prisma.userPresence.upsert({
        where: { userId },
        update: { lastSeenAt: new Date(), status: "ONLINE" },
        create: { userId, status: "ONLINE", lastSeenAt: new Date() },
      });
    } catch {
      // Heartbeat failures are non-critical
    }
  });

  socket.on("presence:get-bulk", async (data, callback) => {
    try {
      const { userIds } = data;
      if (!Array.isArray(userIds)) return callback?.({ error: "userIds must be an array" });

      const presences = await prisma.userPresence.findMany({
        where: { userId: { in: userIds } },
        select: { userId: true, status: true, customStatus: true, lastSeenAt: true },
      });

      const presenceMap: Record<string, { status: string; customStatus: string | null; lastSeenAt: Date }> = {};
      for (const p of presences) {
        presenceMap[p.userId] = { status: p.status, customStatus: p.customStatus, lastSeenAt: p.lastSeenAt };
      }
      // Users without a presence record are OFFLINE
      for (const uid of userIds) {
        if (!presenceMap[uid]) {
          presenceMap[uid] = { status: "OFFLINE", customStatus: null, lastSeenAt: new Date(0) };
        }
      }

      callback?.({ success: true, presences: presenceMap });
    } catch (error) {
      console.error("presence:get-bulk error:", error);
      callback?.({ error: "Failed to get presences" });
    }
  });
}
