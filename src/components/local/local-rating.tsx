"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocalRatingProps {
  listingId: string;
  ratedUserId: string;
  initialRating?: {
    average: number;
    count: number;
  };
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function LocalRating({
  listingId,
  ratedUserId,
  initialRating,
  readonly = false,
  size = "md",
}: LocalRatingProps) {
  const { data: session } = useSession();
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(initialRating || { average: 0, count: 0 });

  const isOwnListing = session?.user?.id === ratedUserId;
  const canRate = session?.user && !isOwnListing && !readonly;

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  useEffect(() => {
    async function fetchUserRating() {
      if (!session?.user?.id || isOwnListing) return;

      try {
        const response = await fetch(`/api/local-listings/${listingId}/rating`);
        if (response.ok) {
          const data = await response.json();
          if (data.rating) {
            setUserRating(data.rating.rating);
          }
        }
      } catch (err) {
        console.error("Failed to fetch user rating:", err);
      }
    }
    fetchUserRating();
  }, [listingId, session?.user?.id, isOwnListing]);

  const handleRate = async (rating: number) => {
    if (!canRate || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/local-listings/${listingId}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });

      if (response.ok) {
        setUserRating(rating);
        // Update stats optimistically
        if (userRating) {
          // Updating existing rating
          const newAverage = (stats.average * stats.count - userRating + rating) / stats.count;
          setStats({ ...stats, average: newAverage });
        } else {
          // New rating
          const newCount = stats.count + 1;
          const newAverage = (stats.average * stats.count + rating) / newCount;
          setStats({ average: newAverage, count: newCount });
        }
      }
    } catch (err) {
      console.error("Failed to save rating:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const displayRating = hoverRating || userRating || Math.round(stats.average);

  return (
    <div className="flex items-center gap-2">
      {/* Stars */}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating;
          const isInteractive = canRate && !isLoading;

          return (
            <button
              key={star}
              type="button"
              disabled={!isInteractive}
              onClick={() => handleRate(star)}
              onMouseEnter={() => isInteractive && setHoverRating(star)}
              onMouseLeave={() => setHoverRating(null)}
              className={cn(
                "transition-colors",
                isInteractive ? "cursor-pointer hover:scale-110" : "cursor-default"
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  "transition-colors",
                  isFilled
                    ? "fill-amber-400 text-amber-400"
                    : "fill-transparent text-zinc-600"
                )}
              />
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-1.5 text-sm">
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin text-zinc-500" />
        ) : (
          <>
            <span className="font-medium text-white">
              {stats.average.toFixed(1)}
            </span>
            <span className="text-zinc-500">
              ({stats.count} {stats.count === 1 ? "rating" : "ratings"})
            </span>
          </>
        )}
      </div>

      {/* User's rating indicator */}
      {userRating && !readonly && (
        <span className="text-xs text-amber-400">
          Your rating
        </span>
      )}
    </div>
  );
}

// Compact display version for cards
export function LocalRatingDisplay({
  average,
  count,
  size = "sm",
}: {
  average: number;
  count: number;
  size?: "sm" | "md";
}) {
  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
  };

  return (
    <div className="flex items-center gap-1">
      <Star className={cn(sizeClasses[size], "fill-amber-400 text-amber-400")} />
      <span className="text-sm font-medium text-white">
        {average.toFixed(1)}
      </span>
      <span className="text-xs text-zinc-500">({count})</span>
    </div>
  );
}
