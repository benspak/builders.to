"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { User, ArrowLeft, Send, Loader2, ImagePlus } from "lucide-react";
import { formatRelativeTime, cn } from "@/lib/utils";
import { GifButton, GiphyPicker, GifPreview } from "@/components/ui/giphy-picker";

interface Message {
  id: string;
  content: string;
  gifUrl: string | null;
  imageUrl: string | null;
  createdAt: string;
  editedAt: string | null;
  senderId: string;
  sender: {
    id: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
    slug: string | null;
  };
}

interface Participant {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  slug: string | null;
  headline?: string | null;
}

export default function ConversationPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const conversationId = params.conversationId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [otherParticipant, setOtherParticipant] = useState<Participant | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversation = useCallback(async () => {
    try {
      const [convResponse, messagesResponse] = await Promise.all([
        fetch(`/api/messages/conversations/${conversationId}`),
        fetch(`/api/messages/conversations/${conversationId}/messages`),
      ]);

      if (convResponse.ok) {
        const convData = await convResponse.json();
        setOtherParticipant(convData.otherParticipants[0] || null);
      }

      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        // Reverse to show oldest first
        setMessages((messagesData.messages || []).reverse());
      }

      // Mark as read
      await fetch(`/api/messages/conversations/${conversationId}/read`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Error fetching conversation:", error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!session?.user) {
      router.push("/signin");
      return;
    }
    fetchConversation();
  }, [session, router, fetchConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() && !gifUrl) return;

    setIsSending(true);

    try {
      const response = await fetch(
        `/api/messages/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: newMessage.trim(),
            gifUrl,
          }),
        }
      );

      if (response.ok) {
        const message = await response.json();
        setMessages((prev) => [...prev, message]);
        setNewMessage("");
        setGifUrl(null);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const displayName = otherParticipant
    ? otherParticipant.firstName && otherParticipant.lastName
      ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
      : otherParticipant.name || "Unknown User"
    : "Loading...";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="border-b border-white/5 bg-zinc-900/50 sticky top-0 z-10">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/messages"
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            {otherParticipant?.slug ? (
              <Link
                href={`/${otherParticipant.slug}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                {otherParticipant?.image ? (
                  <Image
                    src={otherParticipant.image}
                    alt={displayName}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700">
                    <User className="h-5 w-5 text-zinc-400" />
                  </div>
                )}
                <div>
                  <h2 className="font-medium text-white">{displayName}</h2>
                  {otherParticipant?.headline && (
                    <p className="text-xs text-zinc-500 truncate max-w-[200px]">
                      {otherParticipant.headline}
                    </p>
                  )}
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700">
                  <User className="h-5 w-5 text-zinc-400" />
                </div>
                <h2 className="font-medium text-white">{displayName}</h2>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwn = message.senderId === session?.user?.id;
              return (
                <div
                  key={message.id}
                  className={cn("flex", isOwn ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-2",
                      isOwn
                        ? "bg-cyan-500/20 text-cyan-50"
                        : "bg-zinc-800/50 text-zinc-100"
                    )}
                  >
                    {message.content && (
                      <p className="whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    )}
                    {message.gifUrl && (
                      <div className="mt-2 rounded-lg overflow-hidden max-w-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={message.gifUrl}
                          alt="GIF"
                          className="w-full h-auto max-h-48 object-contain"
                        />
                      </div>
                    )}
                    {message.imageUrl && (
                      <div className="mt-2 rounded-lg overflow-hidden max-w-xs">
                        <Image
                          src={message.imageUrl}
                          alt="Image"
                          width={300}
                          height={200}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )}
                    <p
                      className={cn(
                        "text-xs mt-1",
                        isOwn ? "text-cyan-300/50" : "text-zinc-500"
                      )}
                    >
                      {formatRelativeTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/5 bg-zinc-900/50 sticky bottom-0">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          {gifUrl && (
            <GifPreview
              gifUrl={gifUrl}
              onRemove={() => setGifUrl(null)}
              className="mb-3 max-w-xs"
            />
          )}

          <form onSubmit={handleSend} className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                rows={1}
                className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
              />
            </div>

            <GifButton
              onClick={() => setShowGifPicker(true)}
              disabled={isSending}
              className="p-3"
            />

            <button
              type="submit"
              disabled={isSending || (!newMessage.trim() && !gifUrl)}
              className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>
        </div>
      </div>

      <GiphyPicker
        isOpen={showGifPicker}
        onClose={() => setShowGifPicker(false)}
        onSelect={(gif) => {
          setGifUrl(gif.url);
          setShowGifPicker(false);
        }}
      />
    </div>
  );
}
