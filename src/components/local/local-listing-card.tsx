"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MapPin,
  MessageSquare,
  Clock,
  DollarSign,
  Users,
  Wrench,
  Home,
  ShoppingBag,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Loader2
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { LocalListing, CATEGORY_LABELS, CATEGORY_COLORS, STATUS_LABELS, STATUS_COLORS } from "./types";

interface LocalListingCardProps {
  listing: LocalListing;
  showStatus?: boolean;
  isOwner?: boolean;
  onDeleted?: () => void;
}

const CategoryIcons = {
  COMMUNITY: Users,
  SERVICES: Wrench,
  DISCUSSION: MessageSquare,
  COWORKING_HOUSING: Home,
  FOR_SALE: ShoppingBag,
};

export function LocalListingCard({ listing, showStatus = false, isOwner = false, onDeleted }: LocalListingCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const CategoryIcon = CategoryIcons[listing.category];
  const displayName = listing.user.displayName || listing.user.name || "Anonymous";
  const firstImage = listing.images?.[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
        setShowDeleteConfirm(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/local-listings/${listing.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete listing");
      }

      setMenuOpen(false);
      onDeleted?.();
      router.refresh();
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert(error instanceof Error ? error.message : "Failed to delete listing");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const CardContent = (
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
          {(listing.category === "SERVICES" || listing.category === "FOR_SALE") && listing.priceInCents && (
            <span className={cn(
              "inline-flex items-center gap-1 text-xs",
              listing.category === "FOR_SALE" ? "text-pink-400" : "text-emerald-400"
            )}>
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
  );

  // Non-owner view - simple link
  if (!isOwner) {
    return (
      <Link
        href={`/listing/${listing.slug}`}
        className="group block rounded-xl border border-zinc-800/50 bg-zinc-900/50 hover:border-orange-500/30 hover:bg-zinc-900/70 transition-all overflow-hidden"
      >
        {CardContent}
      </Link>
    );
  }

  // Owner view - with action menu
  return (
    <div className="group relative rounded-xl border border-zinc-800/50 bg-zinc-900/50 hover:border-orange-500/30 hover:bg-zinc-900/70 transition-all">
      <Link href={`/listing/${listing.slug}`} className="block overflow-hidden rounded-xl">
        {CardContent}
      </Link>

      {/* Owner Actions Menu */}
      <div className="absolute top-3 right-3" ref={menuRef}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className="p-2 rounded-lg bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700/80 transition-colors backdrop-blur-sm"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-zinc-700 bg-zinc-800 shadow-xl z-50">
            <div className="py-1">
              <Link
                href={`/listing/${listing.slug}`}
                className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700/50"
                onClick={() => setMenuOpen(false)}
              >
                <Eye className="h-4 w-4" />
                View Listing
              </Link>
              <Link
                href={`/my-listings/${listing.id}/edit`}
                className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700/50"
                onClick={() => setMenuOpen(false)}
              >
                <Edit className="h-4 w-4" />
                Edit
              </Link>
              <hr className="my-1 border-zinc-700" />
              {!showDeleteConfirm ? (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                  disabled={isDeleting}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              ) : (
                <div className="px-4 py-2 space-y-2">
                  <p className="text-xs text-zinc-400">Are you sure?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete();
                      }}
                      disabled={isDeleting}
                      className="flex-1 px-2 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                      ) : (
                        "Delete"
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowDeleteConfirm(false);
                      }}
                      disabled={isDeleting}
                      className="flex-1 px-2 py-1 text-xs font-medium text-zinc-300 bg-zinc-700 hover:bg-zinc-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
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
