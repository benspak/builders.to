"use client";

import { UpdateItem } from "@/components/updates/update-item";
import { MilestoneEventCard } from "./milestone-event-card";

interface DailyUpdate {
  id: string;
  content: string;
  imageUrl?: string | null;
  createdAt: Date | string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
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

interface FeedEvent {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  createdAt: Date | string;
  likesCount: number;
  hasLiked: boolean;
  milestone?: {
    id: string;
    type: string;
    title?: string | null;
    achievedAt: Date | string;
    project: {
      id: string;
      slug?: string | null;
      title: string;
      imageUrl?: string | null;
      status: string;
      user: {
        id: string;
        name?: string | null;
        firstName?: string | null;
        lastName?: string | null;
        image?: string | null;
        slug?: string | null;
      };
    };
  } | null;
}

type FeedItem =
  | { type: "update"; data: DailyUpdate }
  | { type: "milestone"; data: FeedEvent };

interface CombinedFeedProps {
  updates: DailyUpdate[];
  feedEvents: FeedEvent[];
  currentUserId?: string;
  showAuthor?: boolean;
}

export function CombinedFeed({
  updates,
  feedEvents,
  currentUserId,
  showAuthor = true,
}: CombinedFeedProps) {
  // Combine and sort by date
  const feedItems: FeedItem[] = [
    ...updates.map((u) => ({ type: "update" as const, data: u })),
    ...feedEvents.map((e) => ({ type: "milestone" as const, data: e })),
  ].sort((a, b) => {
    const dateA = new Date(a.data.createdAt).getTime();
    const dateB = new Date(b.data.createdAt).getTime();
    return dateB - dateA;
  });

  if (feedItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">No activity yet. Be the first to share!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedItems.map((item) => {
        if (item.type === "update") {
          return (
            <UpdateItem
              key={`update-${item.data.id}`}
              update={item.data}
              currentUserId={currentUserId}
              showAuthor={showAuthor}
            />
          );
        }

        return (
          <MilestoneEventCard
            key={`milestone-${item.data.id}`}
            event={item.data}
            currentUserId={currentUserId}
          />
        );
      })}
    </div>
  );
}
