"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, MessageSquare, Clock, DollarSign, Users, Wrench, Home, ShoppingBag } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { LocalListing, CATEGORY_LABELS, CATEGORY_COLORS, STATUS_LABELS, STATUS_COLORS } from "./types";

interface LocalListingCardProps {
  listing: LocalListing;
  showStatus?: boolean;
}

const CategoryIcons = {
  COMMUNITY: Users,
  SERVICES: Wrench,
  DISCUSSION: MessageSquare,
  COWORKING_HOUSING: Home,
  FOR_SALE: ShoppingBag,
};

export function LocalListingCard({ listing, showStatus = false }: LocalListingCardProps) {
  const CategoryIcon = CategoryIcons[listing.category];
  const displayName = listing.user.displayName || listing.user.name || "Anonymous";
  const firstImage = listing.images?.[0];

  return (
    <Link
      href={`/listing/${listing.slug}`}
      className="group block rounded-xl border border-zinc-800/50 bg-zinc-900/50 hover:border-orange-500/30 hover:bg-zinc-900/70 transition-all overflow-hidden"
    >
      <div className="flex">
        {/* Image thumbnail */}
        {firstImage && (
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0 bg-zinc-800">
            <Image
              src={firstImage.url}
              alt={listing.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-4 min-w-0">
          {/* Category & Status badges */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border",
                CATEGORY_COLORS[listing.category]
              )}
            >
              <CategoryIcon className="h-3 w-3" />
              {CATEGORY_LABELS[listing.category]}
            </span>
            {showStatus && listing.status !== "ACTIVE" && (
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
                  STATUS_COLORS[listing.status]
                )}
              >
                {STATUS_LABELS[listing.status]}
              </span>
            )}
            {listing.category === "SERVICES" && listing.priceInCents && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                <DollarSign className="h-3 w-3" />
                {(listing.priceInCents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-white group-hover:text-orange-400 transition-colors line-clamp-1 mb-1">
            {listing.title}
          </h3>

          {/* Description preview */}
          <p className="text-sm text-zinc-400 line-clamp-2 mb-3">
            {listing.description}
          </p>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {listing.city}, {listing.state}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(listing.createdAt)}
            </div>
            {listing._count.comments > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {listing._count.comments}
              </div>
            )}
            <div className="text-zinc-600">
              by {displayName}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function LocalListingCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 overflow-hidden animate-pulse">
      <div className="flex">
        <div className="w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0 bg-zinc-800" />
        <div className="flex-1 p-4">
          <div className="flex gap-2 mb-2">
            <div className="h-5 w-20 rounded-full bg-zinc-800" />
          </div>
          <div className="h-5 w-3/4 rounded bg-zinc-800 mb-2" />
          <div className="h-4 w-full rounded bg-zinc-800 mb-1" />
          <div className="h-4 w-2/3 rounded bg-zinc-800 mb-3" />
          <div className="flex gap-3">
            <div className="h-4 w-24 rounded bg-zinc-800" />
            <div className="h-4 w-16 rounded bg-zinc-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
