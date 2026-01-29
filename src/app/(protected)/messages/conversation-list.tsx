"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, MessageSquare, Loader2 } from "lucide-react";
import { formatRelativeTime, cn } from "@/lib/utils";

interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  otherParticipants: {
    id: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
    slug: string | null;
  }[];
  lastMessage: {
    id: string;
    content: string;
    gifUrl: string | null;
    imageUrl: string | null;
    createdAt: string;
    senderId: string;
  } | null;
  hasUnread: boolean;
  isArchived: boolean;
  isMuted: boolean;
}

export function ConversationList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchConversations() {
      try {
        const response = await fetch("/api/messages/conversations");
        const data = await response.json();
        setConversations(data.conversations || []);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchConversations();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
        <h3 className="text-lg font-medium text-zinc-300 mb-2">
          No messages yet
        </h3>
        <p className="text-sm text-zinc-500">
          Start a conversation by visiting a builder&apos;s profile and clicking
          &quot;Message&quot;
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const otherUser = conversation.otherParticipants[0];
        const displayName =
          otherUser?.firstName && otherUser?.lastName
            ? `${otherUser.firstName} ${otherUser.lastName}`
            : otherUser?.name || "Unknown User";

        const lastMessagePreview = conversation.lastMessage
          ? conversation.lastMessage.gifUrl
            ? "Sent a GIF"
            : conversation.lastMessage.imageUrl
            ? "Sent an image"
            : conversation.lastMessage.content.slice(0, 60) +
              (conversation.lastMessage.content.length > 60 ? "..." : "")
          : "No messages yet";

        return (
          <Link
            key={conversation.id}
            href={`/messages/${conversation.id}`}
            className={cn(
              "flex items-center gap-4 rounded-xl border border-white/5 bg-zinc-900/30 p-4 transition-colors hover:border-white/10 hover:bg-zinc-900/50",
              conversation.hasUnread && "border-cyan-500/30 bg-cyan-500/5"
            )}
          >
            {/* Avatar */}
            {otherUser?.image ? (
              <Image
                src={otherUser.image}
                alt={displayName}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-700">
                <User className="h-6 w-6 text-zinc-400" />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3
                  className={cn(
                    "font-medium truncate",
                    conversation.hasUnread ? "text-white" : "text-zinc-300"
                  )}
                >
                  {displayName}
                </h3>
                {conversation.lastMessage && (
                  <span className="text-xs text-zinc-500 shrink-0">
                    {formatRelativeTime(conversation.lastMessage.createdAt)}
                  </span>
                )}
              </div>
              <p
                className={cn(
                  "text-sm truncate",
                  conversation.hasUnread ? "text-zinc-300" : "text-zinc-500"
                )}
              >
                {lastMessagePreview}
              </p>
            </div>

            {/* Unread indicator */}
            {conversation.hasUnread && (
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
