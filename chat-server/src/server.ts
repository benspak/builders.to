import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { verifyToken, AuthPayload } from "./auth";
import { registerMessageHandlers } from "./handlers/messages";
import { registerPresenceHandlers } from "./handlers/presence";
import { registerTypingHandlers } from "./handlers/typing";
import { registerChannelHandlers } from "./handlers/channels";

const prisma = new PrismaClient();

const PORT = parseInt(process.env.PORT || "3001", 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

const app = express();
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingInterval: 25000,
  pingTimeout: 20000,
});

export interface AuthenticatedSocket extends Socket {
  user: AuthPayload;
}

// Auth middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token as string | undefined;

  if (!token) {
    return next(new Error("Authentication required"));
  }

  const user = await verifyToken(token);
  if (!user) {
    return next(new Error("Invalid token"));
  }

  (socket as AuthenticatedSocket).user = user;
  next();
});

// Track connected users: userId -> Set<socketId>
const connectedUsers = new Map<string, Set<string>>();

io.on("connection", async (rawSocket) => {
  const socket = rawSocket as AuthenticatedSocket;
  const userId = socket.user.id;

  // Track connection
  if (!connectedUsers.has(userId)) {
    connectedUsers.set(userId, new Set());
  }
  connectedUsers.get(userId)!.add(socket.id);

  // Update presence to ONLINE
  await prisma.userPresence.upsert({
    where: { userId },
    update: { status: "ONLINE", lastSeenAt: new Date() },
    create: { userId, status: "ONLINE", lastSeenAt: new Date() },
  });

  // Join user's channel rooms
  const memberships = await prisma.chatChannelMember.findMany({
    where: { userId },
    select: { channelId: true },
  });
  for (const m of memberships) {
    socket.join(`channel:${m.channelId}`);
  }

  // Broadcast presence change
  io.emit("presence:changed", { userId, status: "ONLINE" });

  // Register event handlers
  registerMessageHandlers(io, socket, prisma, connectedUsers);
  registerPresenceHandlers(io, socket, prisma, connectedUsers);
  registerTypingHandlers(io, socket);
  registerChannelHandlers(io, socket, prisma);

  socket.on("disconnect", async () => {
    const userSockets = connectedUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        connectedUsers.delete(userId);
        // User fully disconnected
        await prisma.userPresence.upsert({
          where: { userId },
          update: { status: "OFFLINE", lastSeenAt: new Date() },
          create: { userId, status: "OFFLINE", lastSeenAt: new Date() },
        });
        io.emit("presence:changed", { userId, status: "OFFLINE" });
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Chat server running on port ${PORT}`);
});
