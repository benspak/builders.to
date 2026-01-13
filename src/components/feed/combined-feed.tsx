"use client";

import { useState } from "react";
import { UpdateItem } from "@/components/updates/update-item";
import { MilestoneEventCard } from "./milestone-event-card";
import { StatusUpdateCard } from "./status-update-card";
import { ProjectStatusChangeCard } from "./project-status-change-card";
import { ProjectCreatedCard } from "./project-created-card";
import { JobPostedCard } from "./job-posted-card";
import { UserJoinedCard } from "./user-joined-card";
import { ListingCreatedCard } from "./listing-created-card";
import { ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyUpdate {
  id: string;
  content: string;
  imageUrl?: string | null;
  gifUrl?: string | null;
  videoUrl?: string | null;
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
  commentsCount?: number;
  projectId?: string | null;
  // For milestone events
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
  // For status update events and user joined events
  user?: {
    id: string;
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    image?: string | null;
    slug?: string | null;
    headline?: string | null;
    city?: string | null;
    state?: string | null;
  } | null;
  // For project status change events and project created events
  project?: {
    id: string;
    slug?: string | null;
    title: string;
    tagline?: string | null;
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
  } | null;
  // For job posted events
  companyRole?: {
    id: string;
    title: string;
    type: string;
    category: string;
    location?: string | null;
    isRemote: boolean;
    salaryMin?: number | null;
    salaryMax?: number | null;
    currency?: string | null;
    company: {
      id: string;
      slug?: string | null;
      name: string;
      logo?: string | null;
    };
  } | null;
  // For listing created events
  localListing?: {
    id: string;
    slug: string;
    title: string;
    description: string;
    category: string;
    city: string;
    state: string;
    locationSlug: string;
    priceInCents?: number | null;
    user: {
      id: string;
      name?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      image?: string | null;
      slug?: string | null;
    };
  } | null;
}

type FeedItem =
  | { type: "update"; data: DailyUpdate }
  | { type: "milestone"; data: FeedEvent }
  | { type: "status"; data: FeedEvent }
  | { type: "projectStatusChange"; data: FeedEvent }
  | { type: "projectCreated"; data: FeedEvent }
  | { type: "jobPosted"; data: FeedEvent }
  | { type: "userJoined"; data: FeedEvent }
  | { type: "listingCreated"; data: FeedEvent };

interface CombinedFeedProps {
  updates: DailyUpdate[];
  feedEvents: FeedEvent[];
  currentUserId?: string;
  showAuthor?: boolean;
  /** Number of items to show initially before requiring "Load more" */
  initialDisplayCount?: number;
  /** Number of items to reveal each time "Load more" is clicked */
  loadMoreCount?: number;
}

const DEFAULT_INITIAL_COUNT = 20;
const DEFAULT_LOAD_MORE_COUNT = 20;

export function CombinedFeed({
  updates,
  feedEvents,
  currentUserId,
  showAuthor = true,
  initialDisplayCount = DEFAULT_INITIAL_COUNT,
  loadMoreCount = DEFAULT_LOAD_MORE_COUNT,
}: CombinedFeedProps) {
  const [visibleCount, setVisibleCount] = useState(initialDisplayCount);
  const [isLoading, setIsLoading] = useState(false);
  // Separate different event types
  const milestoneEvents = feedEvents.filter(
    (e) => e.type !== "STATUS_UPDATE" && e.type !== "PROJECT_STATUS_CHANGE" && e.type !== "PROJECT_CREATED" && e.type !== "JOB_POSTED" && e.type !== "USER_JOINED" && e.type !== "LISTING_CREATED"
  );
  const statusEvents = feedEvents.filter((e) => e.type === "STATUS_UPDATE");
  const projectStatusChangeEvents = feedEvents.filter((e) => e.type === "PROJECT_STATUS_CHANGE");
  const projectCreatedEvents = feedEvents.filter((e) => e.type === "PROJECT_CREATED");
  const jobPostedEvents = feedEvents.filter((e) => e.type === "JOB_POSTED");
  const userJoinedEvents = feedEvents.filter((e) => e.type === "USER_JOINED");
  const listingCreatedEvents = feedEvents.filter((e) => e.type === "LISTING_CREATED");

  // Combine and sort by date
  const feedItems: FeedItem[] = [
    ...updates.map((u) => ({ type: "update" as const, data: u })),
    ...milestoneEvents.map((e) => ({ type: "milestone" as const, data: e })),
    ...statusEvents.map((e) => ({ type: "status" as const, data: e })),
    ...projectStatusChangeEvents.map((e) => ({ type: "projectStatusChange" as const, data: e })),
    ...projectCreatedEvents.map((e) => ({ type: "projectCreated" as const, data: e })),
    ...jobPostedEvents.map((e) => ({ type: "jobPosted" as const, data: e })),
    ...userJoinedEvents.map((e) => ({ type: "userJoined" as const, data: e })),
    ...listingCreatedEvents.map((e) => ({ type: "listingCreated" as const, data: e })),
  ].sort((a, b) => {
    const dateA = new Date(a.data.createdAt).getTime();
    const dateB = new Date(b.data.createdAt).getTime();
    return dateB - dateA;
  });

  const hasMoreItems = feedItems.length > visibleCount;
  const remainingCount = feedItems.length - visibleCount;

  const handleLoadMore = () => {
    // Small delay to show loading state for better UX
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + loadMoreCount, feedItems.length));
      setIsLoading(false);
    }, 150);
  };

  if (feedItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">No activity yet. Be the first to share!</p>
      </div>
    );
  }

  // Helper function to render a feed item
  const renderFeedItem = (item: FeedItem) => {
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

    if (item.type === "status" && item.data.user) {
      return (
        <StatusUpdateCard
          key={`status-${item.data.id}`}
          event={{
            ...item.data,
            user: item.data.user,
          }}
          currentUserId={currentUserId}
        />
      );
    }

    if (item.type === "projectStatusChange" && item.data.project) {
      return (
        <ProjectStatusChangeCard
          key={`project-status-${item.data.id}`}
          event={{
            ...item.data,
            project: item.data.project,
          }}
          currentUserId={currentUserId}
        />
      );
    }

    if (item.type === "projectCreated" && item.data.project) {
      return (
        <ProjectCreatedCard
          key={`project-created-${item.data.id}`}
          event={{
            ...item.data,
            project: item.data.project,
          }}
          currentUserId={currentUserId}
        />
      );
    }

    if (item.type === "jobPosted" && item.data.companyRole) {
      return (
        <JobPostedCard
          key={`job-posted-${item.data.id}`}
          event={{
            ...item.data,
            companyRole: item.data.companyRole,
          }}
          currentUserId={currentUserId}
        />
      );
    }

    if (item.type === "userJoined" && item.data.user) {
      return (
        <UserJoinedCard
          key={`user-joined-${item.data.id}`}
          event={{
            ...item.data,
            user: item.data.user,
          }}
          currentUserId={currentUserId}
        />
      );
    }

    if (item.type === "listingCreated" && item.data.localListing) {
      return (
        <ListingCreatedCard
          key={`listing-created-${item.data.id}`}
          event={{
            ...item.data,
            localListing: item.data.localListing,
          }}
          currentUserId={currentUserId}
        />
      );
    }

    // Milestone events
    return (
      <MilestoneEventCard
        key={`milestone-${item.data.id}`}
        event={item.data}
        currentUserId={currentUserId}
      />
    );
  };

  return (
    <div className="space-y-4">
      {/*
        Render ALL feed items in the HTML for SEO indexability.
        Items beyond visibleCount are hidden with CSS but remain in the DOM
        so search engines can crawl and index them.
      */}
      {feedItems.map((item, index) => (
        <div
          key={`wrapper-${item.type}-${item.data.id}`}
          id={item.type !== "update" ? `event-${item.data.id}` : undefined}
          className={cn(
            // Hide items beyond visibleCount visually, but keep in DOM for SEO
            index >= visibleCount && "hidden"
          )}
          // Structured data attributes for better SEO
          data-feed-index={index}
        >
          {renderFeedItem(item)}
        </div>
      ))}

      {/* Load More Button */}
      {hasMoreItems && (
        <div className="pt-4 pb-2">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 px-4",
              "rounded-xl border border-white/10 bg-zinc-800/50",
              "text-sm font-medium text-zinc-300",
              "hover:bg-zinc-800 hover:border-orange-500/30 hover:text-white",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                <span>
                  Load more ({remainingCount} remaining)
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/*
        SEO: Render hidden items as a noscript fallback for crawlers
        that don't execute JavaScript. This ensures all content is indexable.
      */}
      <noscript>
        <style>{`.hidden { display: block !important; }`}</style>
      </noscript>
    </div>
  );
}
