"use client";

import { useState, useEffect } from "react";
import { Hash, Users, Search, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiscoverChannel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  topic: string | null;
  category: { id: string; name: string } | null;
  memberCount: number;
  isJoined: boolean;
}

export function ChannelBrowser() {
  const [channels, setChannels] = useState<DiscoverChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChannels() {
      try {
        const params = new URLSearchParams();
        if (search) params.set("q", search);
        const res = await fetch(`/api/chat/channels/discover?${params}`);
        const data = await res.json();
        setChannels(data.channels || []);
      } catch (error) {
        console.error("Failed to fetch channels:", error);
      } finally {
        setIsLoading(false);
      }
    }
    const debounce = setTimeout(fetchChannels, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleJoin = async (channelId: string) => {
    setJoiningId(channelId);
    try {
      await fetch(`/api/chat/channels/${channelId}/members`, { method: "POST" });
      setChannels((prev) =>
        prev.map((c) => (c.id === channelId ? { ...c, isJoined: true, memberCount: c.memberCount + 1 } : c))
      );
    } catch (error) {
      console.error("Failed to join channel:", error);
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/5">
        <h2 className="text-lg font-semibold text-white mb-3">Browse Channels</h2>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search channels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-zinc-800/50 pl-9 pr-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
          </div>
        ) : channels.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <Hash className="h-8 w-8 mx-auto mb-2 text-zinc-600" />
            <p className="text-sm">No channels found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {channels.map((ch) => (
              <div
                key={ch.id}
                className="rounded-lg border border-white/5 bg-zinc-900/30 p-4 hover:border-white/10 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-zinc-400" />
                      <h3 className="text-sm font-medium text-white">{ch.name}</h3>
                      {ch.category && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-zinc-500">
                          {ch.category.name}
                        </span>
                      )}
                    </div>
                    {ch.description && (
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{ch.description}</p>
                    )}
                    <div className="flex items-center gap-1 mt-2 text-xs text-zinc-500">
                      <Users className="h-3 w-3" />
                      {ch.memberCount} members
                    </div>
                  </div>

                  {ch.isJoined ? (
                    <a
                      href={`/messages/${ch.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-white/5 text-xs text-zinc-300 hover:bg-white/10 transition-colors"
                    >
                      Open <ArrowRight className="h-3 w-3" />
                    </a>
                  ) : (
                    <button
                      onClick={() => handleJoin(ch.id)}
                      disabled={joiningId === ch.id}
                      className="px-3 py-1.5 rounded-md bg-cyan-500/20 text-xs text-cyan-400 hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
                    >
                      {joiningId === ch.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Join"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
