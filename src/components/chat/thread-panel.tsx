"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { X, Loader2 } from "lucide-react";
import { useChatSocket } from "./chat-provider";
import { MessageItem, ChatMessageData } from "./message-item";
import { MessageComposer } from "./message-composer";
import { TypingIndicator } from "./typing-indicator";

interface ThreadPanelProps {
  messageId: string;
  channelId: string;
  onClose: () => void;
}

export function ThreadPanel({ messageId, channelId, onClose }: ThreadPanelProps) {
  const { data: session } = useSession();
  const { socket, typingUsers } = useChatSocket();
  const [parentMessage, setParentMessage] = useState<ChatMessageData | null>(null);
  const [replies, setReplies] = useState<ChatMessageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const repliesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = session?.user?.id || "";

  useEffect(() => {
    async function fetchThread() {
      try {
        const res = await fetch(`/api/chat/messages/${messageId}/thread`);
        if (res.ok) {
          const data = await res.json();
          setParentMessage(data.parentMessage);
          setReplies(data.replies);
        }
      } catch (error) {
        console.error("Failed to fetch thread:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchThread();
  }, [messageId]);

  useEffect(() => {
    if (!socket) return;

    const handleThreadReply = (data: { threadParentId: string; message: ChatMessageData }) => {
      if (data.threadParentId === messageId) {
        setReplies((prev) => [...prev, data.message]);
      }
    };

    socket.on("thread:new", handleThreadReply);
    socket.on("message:new", (msg: ChatMessageData) => {
      if (msg.threadParentId === messageId) {
        setReplies((prev) => {
          if (prev.some((r) => r.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    });

    return () => {
      socket.off("thread:new", handleThreadReply);
    };
  }, [socket, messageId]);

  useEffect(() => {
    repliesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [replies.length]);

  const handleReact = async (msgId: string, emoji: string) => {
    if (socket?.connected) {
      socket.emit("message:react", { messageId: msgId, emoji });
    } else {
      await fetch(`/api/chat/messages/${msgId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
    }
  };

  const handleDelete = async (msgId: string) => {
    if (socket?.connected) {
      socket.emit("message:delete", { messageId: msgId });
    } else {
      await fetch(`/api/chat/messages/${msgId}`, { method: "DELETE" });
    }
  };

  const handleEdit = async (msgId: string, content: string) => {
    if (socket?.connected) {
      socket.emit("message:edit", { messageId: msgId, content });
    } else {
      await fetch(`/api/chat/messages/${msgId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
    }
  };

  const threadTypingUsers = typingUsers
    .filter((t) => t.channelId === channelId && t.userId !== currentUserId)
    .map((t) => t.userId);

  return (
    <div className="w-[400px] border-l border-white/5 bg-zinc-900/30 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <h3 className="text-sm font-semibold text-white">Thread</h3>
        <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
        </div>
      ) : (
        <>
          {/* Parent message */}
          <div className="border-b border-white/5">
            {parentMessage && (
              <MessageItem
                message={parentMessage}
                currentUserId={currentUserId}
                onReact={handleReact}
                onDelete={handleDelete}
                onEdit={handleEdit}
                isThreadReply
              />
            )}
          </div>

          {/* Replies count */}
          <div className="px-4 py-2 text-xs text-zinc-500 border-b border-white/5">
            {replies.length} {replies.length === 1 ? "reply" : "replies"}
          </div>

          {/* Thread replies */}
          <div className="flex-1 overflow-y-auto py-2">
            {replies.map((reply) => (
              <MessageItem
                key={reply.id}
                message={reply}
                currentUserId={currentUserId}
                onReact={handleReact}
                onDelete={handleDelete}
                onEdit={handleEdit}
                isThreadReply
              />
            ))}
            <div ref={repliesEndRef} />
          </div>

          <TypingIndicator userNames={threadTypingUsers} />

          <MessageComposer
            channelId={channelId}
            threadParentId={messageId}
            placeholder="Reply in thread..."
          />
        </>
      )}
    </div>
  );
}
