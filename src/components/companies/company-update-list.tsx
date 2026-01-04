"use client";

import { CompanyUpdateItem } from "./company-update-item";
import { MessageSquare } from "lucide-react";

interface CompanyUpdate {
  id: string;
  content: string;
  imageUrl?: string | null;
  isPinned: boolean;
  createdAt: string | Date;
}

interface CompanyUpdateListProps {
  updates: CompanyUpdate[];
  isOwner?: boolean;
  emptyMessage?: string;
}

export function CompanyUpdateList({
  updates,
  isOwner,
  emptyMessage = "No updates yet",
}: CompanyUpdateListProps) {
  if (updates.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-zinc-900/30 p-8 text-center">
        <MessageSquare className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
        <p className="text-zinc-500">{emptyMessage}</p>
      </div>
    );
  }

  // Sort updates: pinned first, then by date
  const sortedUpdates = [...updates].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="card overflow-hidden divide-y divide-white/5">
      {sortedUpdates.map((update) => (
        <CompanyUpdateItem
          key={update.id}
          update={update}
          isOwner={isOwner}
        />
      ))}
    </div>
  );
}
