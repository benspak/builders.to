"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Crown } from "lucide-react";
import { useChatSocket } from "./chat-provider";
import { useThreadState } from "./chat-layout";
import { ChannelHeader } from "./channel-header";
import { MessageItem, ChatMessageData } from "./message-item";
import { MessageComposer } from "./message-composer";
import { TypingIndicator } from "./typing-indicator";
import Link from "next/link";

interface ChannelViewProps {
  channelId: string;
}

export function ChannelView({ channelId }: ChannelViewProps) {
  const { data: session } = useSession();
  const { socket, typingUsers, joinChannel, markRead } = useChatSocket();
  const { openThread } = useThreadState();
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [channel, setChannel] = useState<{
    id: string; name: string; type: string; topic: string | null;
    _count: { members: number; messages: number };
    membership: { role: string; notificationPreference: string; lastReadMessageId: string | null } | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [isPro, setIsPro] = useState(true);
  const [showPins, setShowPins] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const currentUserId = session?.user?.id || "";

  const fetchChannel = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/channels/${channelId}`);
      if (res.ok) {
        const data = await res.json();
        setChannel(data);
      }
    } catch (error) {
      console.error("Failed to fetch channel:", error);
    }
  }, [channelId]);

  const fetchMessages = useCallback(async (cursor?: string) => {
    try {
      const url = `/api/chat/channels/${channelId}/messages${cursor ? `?cursor=${cursor}` : ""}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (cursor) {
          setMessages((prev) => [...data.messages, ...prev]);
        } else {
          setMessages(data.messages);
        }
        setHasMore(data.hasMore);
        setIsPro(data.isPro);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    setIsLoading(true);
    setMessages([]);
    fetchChannel();
    fetchMessages();
    joinChannel(channelId);
  }, [channelId, fetchChannel, fetchMessages, joinChannel]);

  // Socket.io event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: ChatMessageData) => {
      if (msg.channelId === channelId && !msg.threadParentId) {
        setMessages((prev) => [...prev, msg]);
        markRead(channelId, msg.id);
      }
    };

    const handleUpdatedMessage = (msg: ChatMessageData) => {
      if (msg.channelId === channelId) {
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, ...msg } : m)));
      }
    };

    const handleDeletedMessage = (data: { messageId: string; channelId: string }) => {
      if (data.channelId === channelId) {
        setMessages((prev) =>
          prev.map((m) => (m.id === data.messageId ? { ...m, isDeleted: true, content: "[deleted]" } : m))
        );
      }
    };

    const handleReaction = (data: { messageId: string; channelId: string; reactions: ChatMessageData["reactions"] }) => {
      if (data.channelId === channelId) {
        setMessages((prev) =>
          prev.map((m) => (m.id === data.messageId ? { ...m, reactions: data.reactions } : m))
        );
      }
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:updated", handleUpdatedMessage);
    socket.on("message:deleted", handleDeletedMessage);
    socket.on("reaction:updated", handleReaction);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:updated", handleUpdatedMessage);
      socket.off("message:deleted", handleDeletedMessage);
      socket.off("reaction:updated", handleReaction);
    };
  }, [socket, channelId, markRead]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Mark last message as read
  useEffect(() => {
    if (messages.length > 0) {
      markRead(channelId, messages[messages.length - 1].id);
    }
  }, [messages, channelId, markRead]);

  const handleReact = async (messageId: string, emoji: string) => {
    if (socket?.connected) {
      socket.emit("message:react", { messageId, emoji });
    } else {
      await fetch(`/api/chat/messages/${messageId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
    }
  };

  const handlePin = async (messageId: string) => {
    await fetch(`/api/chat/messages/${messageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPinned: true }),
    });
  };

  const handleBookmark = async (messageId: string) => {
    await fetch(`/api/chat/messages/${messageId}/bookmark`, { method: "POST" });
  };

  const handleDelete = async (messageId: string) => {
    if (socket?.connected) {
      socket.emit("message:delete", { messageId });
    } else {
      await fetch(`/api/chat/messages/${messageId}`, { method: "DELETE" });
    }
  };

  const handleEdit = async (messageId: string, content: string) => {
    if (socket?.connected) {
      socket.emit("message:edit", { messageId, content });
    } else {
      await fetch(`/api/chat/messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
    }
  };

  const loadMore = () => {
    if (messages.length > 0) {
      fetchMessages(messages[0].createdAt);
    }
  };

  const channelTypingUsers = typingUsers
    .filter((t) => t.channelId === channelId && t.userId !== currentUserId)
    .map((t) => t.userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        Channel not found
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ChannelHeader
        channel={channel}
        membership={channel.membership}
        onOpenSearch={() => setShowSearch(!showSearch)}
        onOpenPins={() => setShowPins(!showPins)}
        onOpenMembers={() => setShowMembers(!showMembers)}
        onOpenSettings={() => {}}
      />

      {/* Messages area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
        {hasMore && (
          <div className="text-center py-3">
            <button
              onClick={loadMore}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Load older messages
            </button>
          </div>
        )}

        {!isPro && !hasMore && messages.length > 0 && (
          <div className="mx-4 my-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-center">
            <Crown className="h-4 w-4 text-yellow-500 mx-auto mb-1" />
            <p className="text-xs text-yellow-200/80">
              Showing last 90 days of messages.{" "}
              <Link href="/settings" className="text-yellow-400 underline hover:text-yellow-300">
                Upgrade to Pro
              </Link>{" "}
              for unlimited history.
            </p>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Be the first to say something!</p>
          </div>
        ) : (
          <div className="py-2">
            {messages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                currentUserId={currentUserId}
                onOpenThread={(id) => openThread(id, channelId)}
                onReact={handleReact}
                onPin={handlePin}
                onBookmark={handleBookmark}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <TypingIndicator userNames={channelTypingUsers} />

      <MessageComposer channelId={channelId} />
    </div>
  );
}
