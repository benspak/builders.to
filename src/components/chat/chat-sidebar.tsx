"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Hash, Lock, ChevronDown, ChevronRight, MessageSquare,
  Search, Compass, User, PanelLeftClose, PanelLeft, Bookmark, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatSocket } from "./chat-provider";
import { PresenceIndicator } from "./presence-indicator";
import { CreateChannelDialog } from "./create-channel-dialog";

interface Channel {
  id: string;
  name: string;
  slug: string;
  type: string;
  category: { id: string; name: string } | null;
  unreadCount: number;
  membership: { role: string; notificationPreference: string };
  members?: Array<{
    user: { id: string; name: string | null; firstName: string | null; lastName: string | null; image: string | null; slug: string | null };
  }>;
}

interface ChatSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function ChatSidebar({ collapsed, onToggle }: ChatSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { onlineUsers } = useChatSocket();
  const currentUserId = session?.user?.id;
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const fetchChannels = async () => {
    try {
      const res = await fetch("/api/chat/channels");
      const data = await res.json();
      setChannels(data.channels || []);
      if (data.isAdmin !== undefined) setIsAdminUser(data.isAdmin);
    } catch (error) {
      console.error("Failed to fetch channels:", error);
    }
  };

  useEffect(() => {
    fetchChannels();
    const interval = setInterval(fetchChannels, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const dmChannels = channels.filter((c) => c.type === "DM" || c.type === "GROUP_DM");
  const groupChannels = channels.filter((c) => c.type === "PUBLIC" || c.type === "PRIVATE");

  // Group channels by category
  const categorized = new Map<string, Channel[]>();
  const uncategorized: Channel[] = [];
  for (const ch of groupChannels) {
    if (ch.category) {
      const list = categorized.get(ch.category.id) || [];
      list.push(ch);
      categorized.set(ch.category.id, list);
    } else {
      uncategorized.push(ch);
    }
  }

  const filteredDms = dmChannels.filter((c) => {
    if (!searchQuery) return true;
    return c.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (collapsed) {
    return (
      <div className="w-12 border-r border-white/5 bg-zinc-900/50 flex flex-col items-center py-4 gap-3">
        <button onClick={onToggle} className="p-2 text-zinc-400 hover:text-white transition-colors">
          <PanelLeft className="h-4 w-4" />
        </button>
        <Link href="/messages" className="p-2 text-zinc-400 hover:text-white transition-colors">
          <MessageSquare className="h-4 w-4" />
        </Link>
        <Link href="/messages/bookmarks" className="p-2 text-zinc-400 hover:text-white transition-colors">
          <Bookmark className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-60 border-r border-white/5 bg-zinc-900/50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Chat</h2>
        <div className="flex items-center gap-1">
          {isAdminUser && (
            <button
              onClick={() => setShowCreateDialog(true)}
              className="p-1 text-zinc-400 hover:text-cyan-400 transition-colors"
              title="Create Channel"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
          <button onClick={onToggle} className="p-1 text-zinc-400 hover:text-white transition-colors">
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-white/5 bg-zinc-800/50 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-1">
        {/* Browse Channels */}
        <Link
          href="/messages/search"
          className="flex items-center gap-2 px-2 py-1.5 mx-1 rounded-md text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Compass className="h-3.5 w-3.5" />
          Browse Channels
        </Link>

        {/* Bookmarks */}
        <Link
          href="/messages/bookmarks"
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 mx-1 rounded-md text-xs transition-colors",
            pathname === "/messages/bookmarks" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
          )}
        >
          <Bookmark className="h-3.5 w-3.5" />
          Saved Messages
        </Link>

        {/* Channel Categories */}
        {uncategorized.length > 0 && (
          <ChannelGroup
            label="Channels"
            channels={uncategorized}
            pathname={pathname}
            collapsed={collapsedCategories.has("uncategorized")}
            onToggle={() => toggleCategory("uncategorized")}
            searchQuery={searchQuery}
          />
        )}

        {Array.from(categorized.entries()).map(([catId, chs]) => (
          <ChannelGroup
            key={catId}
            label={chs[0]?.category?.name || "Other"}
            channels={chs}
            pathname={pathname}
            collapsed={collapsedCategories.has(catId)}
            onToggle={() => toggleCategory(catId)}
            searchQuery={searchQuery}
          />
        ))}

        {/* Direct Messages */}
        <div className="mt-3">
          <div className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Direct Messages
          </div>
          {filteredDms.map((dm) => {
            const otherMember = dm.members?.find((m) => m.user.id !== currentUserId) || dm.members?.[0];
            const displayName = otherMember
              ? (otherMember.user.firstName && otherMember.user.lastName
                  ? `${otherMember.user.firstName} ${otherMember.user.lastName}`
                  : otherMember.user.name || "User")
              : dm.name;
            const otherUserId = otherMember?.user.id;
            const presence = otherUserId ? onlineUsers.get(otherUserId) : undefined;

            return (
              <Link
                key={dm.id}
                href={`/messages/${dm.id}`}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 mx-1 rounded-md text-xs transition-colors",
                  pathname === `/messages/${dm.id}` ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                <div className="relative flex-shrink-0">
                  {otherMember?.user.image ? (
                    <Image src={otherMember.user.image} alt="" width={20} height={20} className="h-5 w-5 rounded-full" />
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-zinc-700 flex items-center justify-center">
                      <User className="h-3 w-3 text-zinc-400" />
                    </div>
                  )}
                  {presence && (
                    <PresenceIndicator
                      status={presence}
                      size="sm"
                      className="absolute -bottom-0.5 -right-0.5"
                    />
                  )}
                </div>
                <span className="truncate flex-1">{displayName}</span>
                {dm.unreadCount > 0 && (
                  <span className="bg-cyan-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                    {dm.unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <CreateChannelDialog
        open={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          fetchChannels();
        }}
      />
    </div>
  );
}

function ChannelGroup({
  label,
  channels,
  pathname,
  collapsed,
  onToggle,
  searchQuery,
}: {
  label: string;
  channels: Channel[];
  pathname: string;
  collapsed: boolean;
  onToggle: () => void;
  searchQuery: string;
}) {
  const filtered = channels.filter((c) => {
    if (!searchQuery) return true;
    return c.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (filtered.length === 0) return null;

  return (
    <div className="mt-3">
      <button
        onClick={onToggle}
        className="flex items-center gap-1 px-2 py-1 w-full text-[10px] font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {label}
      </button>
      {!collapsed &&
        filtered.map((ch) => (
          <Link
            key={ch.id}
            href={`/messages/${ch.id}`}
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 mx-1 rounded-md text-xs transition-colors",
              pathname === `/messages/${ch.id}` ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
          >
            {ch.type === "PRIVATE" ? (
              <Lock className="h-3.5 w-3.5 flex-shrink-0" />
            ) : (
              <Hash className="h-3.5 w-3.5 flex-shrink-0" />
            )}
            <span className={cn("truncate flex-1", ch.unreadCount > 0 && "font-semibold text-white")}>
              {ch.name}
            </span>
            {ch.unreadCount > 0 && (
              <span className="bg-cyan-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                {ch.unreadCount}
              </span>
            )}
          </Link>
        ))}
    </div>
  );
}
