"use client";

import { cn } from "@/lib/utils";

interface Reaction {
  emoji: string;
  users: { id: string; name: string | null; firstName: string | null; lastName: string | null }[];
}

interface ReactionBarProps {
  reactions: Array<{
    id: string;
    emoji: string;
    userId: string;
    user: { id: string; name: string | null; firstName: string | null; lastName: string | null };
  }>;
  currentUserId: string;
  onToggle: (emoji: string) => void;
}

export function ReactionBar({ reactions, currentUserId, onToggle }: ReactionBarProps) {
  if (!reactions || reactions.length === 0) return null;

  // Group by emoji
  const grouped = new Map<string, Reaction>();
  for (const r of reactions) {
    const existing = grouped.get(r.emoji);
    if (existing) {
      existing.users.push(r.user);
    } else {
      grouped.set(r.emoji, { emoji: r.emoji, users: [r.user] });
    }
  }

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Array.from(grouped.values()).map((group) => {
        const hasReacted = group.users.some((u) => u.id === currentUserId);
        return (
          <button
            key={group.emoji}
            onClick={() => onToggle(group.emoji)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
              hasReacted
                ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300"
                : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20"
            )}
            title={group.users.map((u) => u.firstName || u.name || "User").join(", ")}
          >
            <span>{group.emoji}</span>
            <span>{group.users.length}</span>
          </button>
        );
      })}
    </div>
  );
}
