"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Tag,
  User,
  PartyPopper,
  ExternalLink,
  Loader2,
  Users,
  Wrench,
  MessageSquare,
  Home,
  ShoppingBag,
  DollarSign,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { FeedEventComments } from "./feed-event-comments";

const CATEGORY_LABELS: Record<string, string> = {
  COMMUNITY: "Community",
  SERVICES: "Services",
  DISCUSSION: "Discussion",
  COWORKING_HOUSING: "Co-working & Housing",
  FOR_SALE: "For Sale",
};

const CATEGORY_COLORS: Record<string, string> = {
  COMMUNITY: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  SERVICES: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  DISCUSSION: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  COWORKING_HOUSING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  FOR_SALE: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const CategoryIcons: Record<string, React.ElementType> = {
  COMMUNITY: Users,
  SERVICES: Wrench,
  DISCUSSION: MessageSquare,
  COWORKING_HOUSING: Home,
  FOR_SALE: ShoppingBag,
};

interface ListingCreatedCardProps {
  event: {
    id: string;
    type: string;
    title: string;
    description?: string | null;
    createdAt: Date | string;
    likesCount: number;
    hasLiked: boolean;
    commentsCount?: number;
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
  };
  currentUserId?: string;
}

export function ListingCreatedCard({ event, currentUserId }: ListingCreatedCardProps) {
  const [liked, setLiked] = useState(event.hasLiked);
  const [likesCount, setLikesCount] = useState(event.likesCount);
  const [loading, setLoading] = useState(false);

  const listing = event.localListing;
  const user = listing?.user;

  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.name || "Builder";

  const listingUrl = listing ? `/listing/${listing.slug}` : null;
  const userUrl = user?.slug ? `/${user.slug}` : null;

  const CategoryIcon = listing ? CategoryIcons[listing.category] || Tag : Tag;

  const handleLike = async () => {
    if (!currentUserId || loading) return;

    setLoading(true);

    // Optimistic update
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);

    try {
      const response = await fetch(`/api/feed-events/${event.id}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        // Revert on error
        setLiked(liked);
        setLikesCount(likesCount);
      }
    } catch {
      // Revert on error
      setLiked(liked);
      setLikesCount(likesCount);
    } finally {
      setLoading(false);
    }
  };

  if (!listing) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
      {/* New listing header with gradient */}
      <div className="bg-gradient-to-r from-cyan-500/10 via-teal-500/10 to-emerald-500/10 px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/30">
            <CategoryIcon className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-300">
              <span className="font-semibold text-white">New Listing Posted</span>
            </p>
            <p className="text-xs text-zinc-500">
              {formatRelativeTime(event.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Listing info */}
        <div className="space-y-3">
          {/* Category and location */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium border",
                CATEGORY_COLORS[listing.category] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
              )}
            >
              <CategoryIcon className="h-3.5 w-3.5" />
              {CATEGORY_LABELS[listing.category] || listing.category}
            </span>
            <span className="inline-flex items-center gap-1 text-sm text-zinc-400">
              <MapPin className="h-3.5 w-3.5" />
              {listing.city}, {listing.state}
            </span>
            {listing.category === "SERVICES" && listing.priceInCents && (
              <span className="inline-flex items-center gap-1 text-sm text-emerald-400 font-semibold">
                <DollarSign className="h-3.5 w-3.5" />
                {(listing.priceInCents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}
              </span>
            )}
          </div>

          {/* Title */}
          {listingUrl ? (
            <Link href={listingUrl}>
              <h3 className="text-lg font-semibold text-white hover:text-orange-400 transition-colors">
                {listing.title}
              </h3>
            </Link>
          ) : (
            <h3 className="text-lg font-semibold text-white">
              {listing.title}
            </h3>
          )}

          {/* Description preview */}
          <p className="text-sm text-zinc-400 line-clamp-2">
            {listing.description}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          {/* Author */}
          {userUrl ? (
            <Link
              href={userUrl}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={displayName}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-700">
                  <User className="h-3 w-3 text-zinc-400" />
                </div>
              )}
              <span>{displayName}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={displayName}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-700">
                  <User className="h-3 w-3 text-zinc-400" />
                </div>
              )}
              <span>{displayName}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Celebrate button */}
            <button
              onClick={handleLike}
              disabled={!currentUserId || loading}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                liked
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800 hover:text-white hover:border-zinc-600",
                (!currentUserId || loading) && "opacity-50 cursor-not-allowed"
              )}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PartyPopper className={cn("h-4 w-4", liked && "text-cyan-400")} />
              )}
              <span>{likesCount}</span>
            </button>

            {/* View listing */}
            {listingUrl && (
              <Link
                href={listingUrl}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">View</span>
              </Link>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <FeedEventComments
          feedEventId={event.id}
          currentUserId={currentUserId}
          initialCommentsCount={event.commentsCount ?? 0}
          accentColor="cyan"
        />
      </div>
    </div>
  );
}
