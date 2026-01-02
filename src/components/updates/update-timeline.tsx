"use client";

import { UpdateItem } from "./update-item";
import { Sparkles } from "lucide-react";

interface Update {
  id: string;
  content: string;
  createdAt: string | Date;
  user: {
    id: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
    slug: string | null;
    headline?: string | null;
  };
}

interface UpdateTimelineProps {
  updates: Update[];
  currentUserId?: string;
  showAuthor?: boolean;
  emptyMessage?: string;
}

export function UpdateTimeline({
  updates,
  currentUserId,
  showAuthor = true,
  emptyMessage = "No updates yet"
}: UpdateTimelineProps) {
  if (updates.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-zinc-900/30 p-8 text-center">
        <Sparkles className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
        <p className="text-zinc-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {updates.map((update) => (
        <UpdateItem
          key={update.id}
          update={update}
          currentUserId={currentUserId}
          showAuthor={showAuthor}
        />
      ))}
    </div>
  );
}
