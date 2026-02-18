"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Loader2, Hash, User, X } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface SearchResult {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string | null; firstName: string | null; lastName: string | null; image: string | null; slug: string | null };
  channel: { id: string; name: string; slug: string };
}

interface SearchResultsProps {
  onClose: () => void;
}

export function SearchResults({ onClose }: SearchResultsProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/chat/messages/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.messages || []);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Search Messages</h2>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search messages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            className="w-full rounded-lg border border-white/10 bg-zinc-800/50 pl-9 pr-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
          </div>
        ) : results.length === 0 && searched ? (
          <div className="text-center py-12 text-zinc-500">
            <Search className="h-6 w-6 mx-auto mb-2 text-zinc-600" />
            <p className="text-sm">No results found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {results.map((msg) => {
              const name = msg.sender.firstName && msg.sender.lastName
                ? `${msg.sender.firstName} ${msg.sender.lastName}`
                : msg.sender.name || "User";

              return (
                <Link
                  key={msg.id}
                  href={`/messages/${msg.channel.id}`}
                  className="block rounded-lg border border-white/5 bg-zinc-900/30 p-3 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Hash className="h-3 w-3 text-zinc-500" />
                    <span className="text-xs text-zinc-500">{msg.channel.name}</span>
                    <span className="text-[10px] text-zinc-600">{formatRelativeTime(msg.createdAt)}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    {msg.sender.image ? (
                      <Image src={msg.sender.image} alt={name} width={20} height={20} className="h-5 w-5 rounded-full mt-0.5" />
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-zinc-700 flex items-center justify-center mt-0.5">
                        <User className="h-3 w-3 text-zinc-400" />
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-medium text-zinc-300">{name}</span>
                      <p className="text-xs text-zinc-400 line-clamp-2">{msg.content}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
