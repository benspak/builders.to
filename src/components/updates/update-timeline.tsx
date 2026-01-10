"use client";

import { useState } from "react";
import { UpdateItem } from "./update-item";
import { Sparkles, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Update {
  id: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string | Date;
  likesCount?: number;
  isLiked?: boolean;
  commentsCount?: number;
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
  /** Number of updates to show initially before requiring "Load more" */
  initialDisplayCount?: number;
  /** Number of updates to reveal each time "Load more" is clicked */
  loadMoreCount?: number;
}

const DEFAULT_INITIAL_COUNT = 20;
const DEFAULT_LOAD_MORE_COUNT = 20;

export function UpdateTimeline({
  updates,
  currentUserId,
  showAuthor = true,
  emptyMessage = "No updates yet",
  initialDisplayCount = DEFAULT_INITIAL_COUNT,
  loadMoreCount = DEFAULT_LOAD_MORE_COUNT,
}: UpdateTimelineProps) {
  const [visibleCount, setVisibleCount] = useState(initialDisplayCount);
  const [isLoading, setIsLoading] = useState(false);

  const hasMoreUpdates = updates.length > visibleCount;
  const remainingCount = updates.length - visibleCount;

  const handleLoadMore = () => {
    // Small delay to show loading state for better UX
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + loadMoreCount, updates.length));
      setIsLoading(false);
    }, 150);
  };

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
      {/*
        Render ALL updates in the HTML for SEO indexability.
        Updates beyond visibleCount are hidden with CSS but remain in the DOM
        so search engines can crawl and index them.
      */}
      {updates.map((update, index) => (
        <div
          key={update.id}
          className={cn(
            // Hide updates beyond visibleCount visually, but keep in DOM for SEO
            index >= visibleCount && "hidden"
          )}
          // Structured data attributes for better SEO
          data-update-index={index}
        >
          <UpdateItem
            update={update}
            currentUserId={currentUserId}
            showAuthor={showAuthor}
          />
        </div>
      ))}

      {/* Load More Button */}
      {hasMoreUpdates && (
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
                  Load more updates ({remainingCount} remaining)
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/*
        SEO: Render hidden updates as a noscript fallback for crawlers
        that don't execute JavaScript. This ensures all content is indexable.
      */}
      <noscript>
        <style>{`.hidden { display: block !important; }`}</style>
      </noscript>
    </div>
  );
}
