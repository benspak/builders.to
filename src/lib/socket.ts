import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket;

  const url = process.env.NEXT_PUBLIC_CHAT_SERVER_URL || "http://localhost:3001";

  socket = io(url, {
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    console.log("[Chat] Connected");
  });

  socket.on("disconnect", (reason) => {
    console.log("[Chat] Disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("[Chat] Connection error:", error.message);
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
