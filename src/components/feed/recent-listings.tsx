"use client";

import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Tag,
  User,
  Users,
  Wrench,
  MessageSquare,
  Home,
  ShoppingBag,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LocalListing {
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
    displayName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    image?: string | null;
    slug?: string | null;
  };
}

interface RecentListingsProps {
  listings: LocalListing[];
}

const CATEGORY_LABELS: Record<string, string> = {
  COMMUNITY: "Community",
  SERVICES: "Services",
  DISCUSSION: "Discussion",
  COWORKING_HOUSING: "Co-working",
  FOR_SALE: "For Sale",
};

const CATEGORY_COLORS: Record<string, string> = {
  COMMUNITY: "text-blue-400",
  SERVICES: "text-emerald-400",
  DISCUSSION: "text-purple-400",
  COWORKING_HOUSING: "text-amber-400",
  FOR_SALE: "text-rose-400",
};

const CategoryIcons: Record<string, React.ElementType> = {
  COMMUNITY: Users,
  SERVICES: Wrench,
  DISCUSSION: MessageSquare,
  COWORKING_HOUSING: Home,
  FOR_SALE: ShoppingBag,
};

export function RecentListings({ listings }: RecentListingsProps) {
  if (listings.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800/50 bg-gradient-to-r from-cyan-500/10 to-transparent">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20">
            <MapPin className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Local Listings</h3>
            <p className="text-xs text-zinc-500">From the community</p>
          </div>
        </div>
      </div>

      {/* Listings List */}
      <div className="divide-y divide-zinc-800/30">
        {listings.map((listing) => {
          const CategoryIcon = CategoryIcons[listing.category] || Tag;
          const displayName = listing.user?.displayName
            || (listing.user?.firstName && listing.user?.lastName
                ? `${listing.user.firstName} ${listing.user.lastName}`
                : null)
            || listing.user?.name
            || "Builder";

          return (
            <Link
              key={listing.id}
              href={`/listing/${listing.slug}`}
              className="block px-4 py-3 hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-start gap-3">
                {/* User Avatar */}
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800/50 border border-white/5">
                  {listing.user?.image ? (
                    <Image
                      src={listing.user.image}
                      alt={displayName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <User className="h-5 w-5 text-zinc-600" />
                    </div>
                  )}
                </div>

                {/* Listing Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white truncate group-hover:text-orange-400 transition-colors">
                    {listing.title}
                  </h4>
                  <p className="text-xs text-zinc-400 truncate">
                    {displayName}
                  </p>

                  {/* Meta */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                    <span className={cn("flex items-center gap-0.5 font-medium", CATEGORY_COLORS[listing.category] || "text-zinc-400")}>
                      <CategoryIcon className="h-3 w-3" />
                      {CATEGORY_LABELS[listing.category] || listing.category}
                    </span>

                    <span className="flex items-center gap-0.5 text-zinc-500 truncate">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{listing.city}, {listing.state}</span>
                    </span>

                    {listing.category === "SERVICES" && listing.priceInCents && (
                      <span className="flex items-center gap-0.5 text-emerald-400">
                        <DollarSign className="h-3 w-3" />
                        {(listing.priceInCents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* View All Link */}
      <Link
        href="/local"
        className="block px-4 py-2.5 text-center text-sm font-medium text-orange-400 hover:text-orange-300 hover:bg-white/5 border-t border-zinc-800/50 transition-colors"
      >
        View all local listings →
      </Link>
    </div>
  );
}
