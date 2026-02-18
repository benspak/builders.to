"use client";

import { useState, useEffect } from "react";
import { Loader2, Pin, X } from "lucide-react";
import { MessageItem, ChatMessageData } from "./message-item";
import { useSession } from "next-auth/react";

interface PinnedMessagesProps {
  channelId: string;
  onClose: () => void;
}

export function PinnedMessages({ channelId, onClose }: PinnedMessagesProps) {
  const { data: session } = useSession();
  const [pins, setPins] = useState<ChatMessageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPins() {
      try {
        const res = await fetch(`/api/chat/channels/${channelId}/pins`);
        const data = await res.json();
        setPins(data.pins || []);
      } catch (error) {
        console.error("Failed to fetch pins:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPins();
  }, [channelId]);

  return (
    <div className="w-[350px] border-l border-white/5 bg-zinc-900/30 flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Pin className="h-4 w-4 text-yellow-500" />
          <h3 className="text-sm font-semibold text-white">Pinned Messages</h3>
        </div>
        <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
          </div>
        ) : pins.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <Pin className="h-6 w-6 mx-auto mb-2 text-zinc-600" />
            <p className="text-sm">No pinned messages</p>
          </div>
        ) : (
          <div className="py-2">
            {pins.map((pin) => (
              <MessageItem
                key={pin.id}
                message={pin}
                currentUserId={session?.user?.id || ""}
                isThreadReply
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
