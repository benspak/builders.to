"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";

interface TypingUser {
  userId: string;
  channelId: string;
}

interface ChatContextType {
  socket: Socket | null;
  isConnected: boolean;
  typingUsers: TypingUser[];
  onlineUsers: Map<string, string>; // userId -> status
  joinChannel: (channelId: string) => void;
  leaveChannel: (channelId: string) => void;
  markRead: (channelId: string, messageId: string) => void;
}

const ChatContext = createContext<ChatContextType>({
  socket: null,
  isConnected: false,
  typingUsers: [],
  onlineUsers: new Map(),
  joinChannel: () => {},
  leaveChannel: () => {},
  markRead: () => {},
});

export function useChatSocket() {
  return useContext(ChatContext);
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const onlineUsersRef = useRef(new Map<string, string>());
  const [, forceUpdate] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    // Get the session token from cookies for auth
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("authjs.session-token=") || row.startsWith("__Secure-authjs.session-token="))
      ?.split("=")
      .slice(1)
      .join("=");

    if (!token) return;

    const sock = connectSocket(token);
    socketRef.current = sock;

    sock.on("connect", () => setIsConnected(true));
    sock.on("disconnect", () => setIsConnected(false));

    sock.on("presence:changed", (data: { userId: string; status: string }) => {
      onlineUsersRef.current.set(data.userId, data.status);
      forceUpdate((c) => c + 1);
    });

    sock.on("typing:update", (data: { userId: string; channelId: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        if (data.isTyping) {
          if (prev.some((t) => t.userId === data.userId && t.channelId === data.channelId)) return prev;
          return [...prev, { userId: data.userId, channelId: data.channelId }];
        }
        return prev.filter((t) => !(t.userId === data.userId && t.channelId === data.channelId));
      });
    });

    // Heartbeat every 30s
    heartbeatRef.current = setInterval(() => {
      sock.emit("presence:heartbeat");
    }, 30000);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      disconnectSocket();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [session?.user]);

  const joinChannel = useCallback((channelId: string) => {
    socketRef.current?.emit("channel:join", { channelId });
  }, []);

  const leaveChannel = useCallback((channelId: string) => {
    socketRef.current?.emit("channel:leave", { channelId });
  }, []);

  const markRead = useCallback((channelId: string, messageId: string) => {
    socketRef.current?.emit("channel:mark-read", { channelId, messageId });
  }, []);

  return (
    <ChatContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        typingUsers,
        onlineUsers: onlineUsersRef.current,
        joinChannel,
        leaveChannel,
        markRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
