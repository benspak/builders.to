"use client";

import { useState } from "react";
import {
  Hash, Lock, Users, Pin, Search, Settings,
  MessageSquare, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChannelHeaderProps {
  channel: {
    id: string;
    name: string;
    type: string;
    topic: string | null;
    _count: { members: number };
  };
  membership: { role: string } | null;
  onOpenSearch?: () => void;
  onOpenPins?: () => void;
  onOpenMembers?: () => void;
  onOpenSettings?: () => void;
}

export function ChannelHeader({
  channel,
  membership,
  onOpenSearch,
  onOpenPins,
  onOpenMembers,
  onOpenSettings,
}: ChannelHeaderProps) {
  const isDM = channel.type === "DM" || channel.type === "GROUP_DM";
  const isPrivate = channel.type === "PRIVATE";
  const isAdmin = membership && ["OWNER", "ADMIN"].includes(membership.role);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-zinc-900/30">
      <div className="flex items-center gap-2 min-w-0">
        {isDM ? (
          <MessageSquare className="h-4 w-4 text-zinc-400 flex-shrink-0" />
        ) : isPrivate ? (
          <Lock className="h-4 w-4 text-zinc-400 flex-shrink-0" />
        ) : (
          <Hash className="h-4 w-4 text-zinc-400 flex-shrink-0" />
        )}
        <h2 className="text-sm font-semibold text-white truncate">{channel.name}</h2>
        {channel.topic && (
          <>
            <span className="text-zinc-600 mx-1">|</span>
            <span className="text-xs text-zinc-500 truncate">{channel.topic}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-1">
        {!isDM && (
          <button
            onClick={onOpenMembers}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Users className="h-3.5 w-3.5" />
            {channel._count.members}
          </button>
        )}

        <button
          onClick={onOpenPins}
          className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Pinned messages"
        >
          <Pin className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={onOpenSearch}
          className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Search"
        >
          <Search className="h-3.5 w-3.5" />
        </button>

        {isAdmin && (
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Settings"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
