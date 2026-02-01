"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { History, User, TrendingUp, TrendingDown } from "lucide-react";
import { KarmaEventType } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";

interface KarmaHistoryItem {
  id: string;
  type: KarmaEventType;
  points: number;
  createdAt: string;
  actorId: string | null;
  actor?: {
    slug: string | null;
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
    name: string | null;
    image: string | null;
  } | null;
}

interface KarmaHistoryProps {
  limit?: number;
}

const eventDescriptions: Record<KarmaEventType, string> = {
  UPDATE_POSTED: "Posted a daily update",
  UPDATE_LIKED: "Received a like on your update",
  COMMENT_POSTED: "Posted a comment",
  COMMENT_LIKED: "Received a like on your comment",
  HELPFUL_COMMENT: "Comment marked as helpful",
  PROJECT_LAUNCHED: "Launched a project",
  PROJECT_UPVOTED: "Received an upvote on your project",
  STREAK_MILESTONE: "Reached a streak milestone",
  PARTNERSHIP_FORMED: "Formed an accountability partnership",
  MENTORSHIP_GIVEN: "Helped another builder",
  SPAM_REMOVED: "Content removed as spam",
  VIOLATION: "Community guideline violation",
};

function getActorDisplayName(actor: KarmaHistoryItem["actor"]): string {
  if (!actor) return "Someone";
  if (actor.displayName) return actor.displayName;
  if (actor.firstName && actor.lastName) {
    return `${actor.firstName} ${actor.lastName}`;
  }
  return actor.name || "Someone";
}

function getEventDescription(event: KarmaHistoryItem): string {
  const description = eventDescriptions[event.type] || "Karma event";
  
  // If there's an actor, personalize the message
  if (event.actor && ["UPDATE_LIKED", "COMMENT_LIKED", "HELPFUL_COMMENT", "PROJECT_UPVOTED"].includes(event.type)) {
    const actorName = getActorDisplayName(event.actor);
    switch (event.type) {
      case "UPDATE_LIKED":
        return `${actorName} liked your update`;
      case "COMMENT_LIKED":
        return `${actorName} liked your comment`;
      case "HELPFUL_COMMENT":
        return `${actorName} marked your comment as helpful`;
      case "PROJECT_UPVOTED":
        return `${actorName} upvoted your project`;
    }
  }
  
  return description;
}

export function KarmaHistory({ limit = 10 }: KarmaHistoryProps) {
  const [events, setEvents] = useState<KarmaHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch(`/api/karma/history?limit=${limit}`);
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events);
        }
      } catch (error) {
        console.error("Error fetching karma history:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [limit]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-zinc-800" />
            <div className="flex-1 space-y-1">
              <div className="h-3 w-48 rounded bg-zinc-800" />
              <div className="h-2 w-24 rounded bg-zinc-800" />
            </div>
            <div className="h-4 w-8 rounded bg-zinc-800" />
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <History className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
        <p className="text-sm text-zinc-500">No karma history yet</p>
        <p className="text-xs text-zinc-600">Start posting and engaging to earn karma!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => {
        const isPositive = event.points > 0;
        const description = getEventDescription(event);

        return (
          <div
            key={event.id}
            className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
          >
            {/* Actor avatar or icon */}
            {event.actor ? (
              <Link href={event.actor.slug ? `/${event.actor.slug}` : "#"}>
                {event.actor.image ? (
                  <Image
                    src={event.actor.image}
                    alt={getActorDisplayName(event.actor)}
                    width={32}
                    height={32}
                    className="rounded-full ring-1 ring-white/10"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800">
                    <User className="h-4 w-4 text-zinc-500" />
                  </div>
                )}
              </Link>
            ) : (
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  isPositive ? "bg-green-500/20" : "bg-red-500/20"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                )}
              </div>
            )}

            {/* Description */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{description}</p>
              <p className="text-xs text-zinc-500">
                {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
              </p>
            </div>

            {/* Points */}
            <span
              className={`text-sm font-medium ${
                isPositive ? "text-green-400" : "text-red-400"
              }`}
            >
              {isPositive ? "+" : ""}
              {event.points}
            </span>
          </div>
        );
      })}
    </div>
  );
}
