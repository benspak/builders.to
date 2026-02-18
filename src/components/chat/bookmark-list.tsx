"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, Loader2, Hash, User } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface BookmarkData {
  id: string;
  createdAt: string;
  message: {
    id: string;
    content: string;
    createdAt: string;
    sender: { id: string; name: string | null; firstName: string | null; lastName: string | null; image: string | null; slug: string | null };
    channel: { id: string; name: string; slug: string };
  };
}

export function BookmarkList() {
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBookmarks() {
      try {
        const res = await fetch("/api/chat/bookmarks");
        const data = await res.json();
        setBookmarks(data.bookmarks || []);
      } catch (error) {
        console.error("Failed to fetch bookmarks:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBookmarks();
  }, []);

  const handleRemove = async (messageId: string) => {
    try {
      await fetch(`/api/chat/messages/${messageId}/bookmark`, { method: "POST" });
      setBookmarks((prev) => prev.filter((b) => b.message.id !== messageId));
    } catch (error) {
      console.error("Failed to remove bookmark:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-cyan-400" />
          <h2 className="text-lg font-semibold text-white">Saved Messages</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {bookmarks.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <Bookmark className="h-8 w-8 mx-auto mb-2 text-zinc-600" />
            <p className="text-sm">No saved messages yet</p>
            <p className="text-xs mt-1 text-zinc-600">Bookmark messages to find them here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {bookmarks.map((bm) => {
              const name = bm.message.sender.firstName && bm.message.sender.lastName
                ? `${bm.message.sender.firstName} ${bm.message.sender.lastName}`
                : bm.message.sender.name || "User";

              return (
                <div key={bm.id} className="rounded-lg border border-white/5 bg-zinc-900/30 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <Link
                      href={`/messages/${bm.message.channel.id}`}
                      className="flex items-center gap-1 text-xs text-zinc-500 hover:text-cyan-400 transition-colors"
                    >
                      <Hash className="h-3 w-3" />
                      {bm.message.channel.name}
                    </Link>
                    <button
                      onClick={() => handleRemove(bm.message.id)}
                      className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex items-start gap-2">
                    {bm.message.sender.image ? (
                      <Image src={bm.message.sender.image} alt={name} width={24} height={24} className="h-6 w-6 rounded-full mt-0.5" />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-zinc-700 flex items-center justify-center mt-0.5">
                        <User className="h-3 w-3 text-zinc-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-zinc-300">{name}</span>
                        <span className="text-[10px] text-zinc-600">{formatRelativeTime(bm.message.createdAt)}</span>
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-3">{bm.message.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
