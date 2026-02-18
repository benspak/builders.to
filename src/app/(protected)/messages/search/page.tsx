"use client";

import { useState } from "react";
import { ChannelBrowser } from "@/components/chat/channel-browser";
import { SearchResults } from "@/components/chat/search-results";

export default function SearchPage() {
  const [mode, setMode] = useState<"browse" | "search">("browse");

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-white/5">
        <button
          onClick={() => setMode("browse")}
          className={`px-4 py-2.5 text-sm ${mode === "browse" ? "text-white border-b-2 border-cyan-500" : "text-zinc-400 hover:text-white"}`}
        >
          Browse Channels
        </button>
        <button
          onClick={() => setMode("search")}
          className={`px-4 py-2.5 text-sm ${mode === "search" ? "text-white border-b-2 border-cyan-500" : "text-zinc-400 hover:text-white"}`}
        >
          Search Messages
        </button>
      </div>
      {mode === "browse" ? (
        <ChannelBrowser />
      ) : (
        <SearchResults onClose={() => setMode("browse")} />
      )}
    </div>
  );
}
