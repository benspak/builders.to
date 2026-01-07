"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  DollarSign,
  Edit,
  MoreHorizontal,
  Trash2,
  Eye,
  Pause,
  Play,
  ShoppingBag,
  Rocket
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { ServiceCategory, ServiceListingStatus } from "@prisma/client";

interface PortfolioProject {
  project: {
    id: string;
    title: string;
    slug: string | null;
    imageUrl: string | null;
  };
}

interface ServiceListing {
  id: string;
  slug: string | null;
  title: string;
  description: string;
  category: ServiceCategory;
  priceInCents: number;
  deliveryDays: number;
  status: ServiceListingStatus;
  activatedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  portfolioProjects?: PortfolioProject[];
  _count?: {
    orders: number;
  };
}

interface ServiceCardProps {
  listing: ServiceListing;
  isOwner?: boolean;
}

const categoryLabels: Record<ServiceCategory, string> = {
  MVP_BUILD: "MVP Build",
  DESIGN: "Design",
  MARKETING: "Marketing",
  AI_INTEGRATION: "AI Integration",
  DEVOPS: "DevOps",
  AUDIT: "Audit",
  OTHER: "Other",
};

const categoryColors: Record<ServiceCategory, string> = {
  MVP_BUILD: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  DESIGN: "bg-pink-500/10 text-pink-400 border-pink-500/30",
  MARKETING: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  AI_INTEGRATION: "bg-violet-500/10 text-violet-400 border-violet-500/30",
  DEVOPS: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  AUDIT: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  OTHER: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
};

const statusLabels: Record<ServiceListingStatus, string> = {
  DRAFT: "Draft",
  PENDING_PAYMENT: "Pending Payment",
  ACTIVE: "Active",
  EXPIRED: "Expired",
  PAUSED: "Paused",
};

const statusColors: Record<ServiceListingStatus, string> = {
  DRAFT: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
  PENDING_PAYMENT: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  EXPIRED: "bg-red-500/10 text-red-400 border-red-500/30",
  PAUSED: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
};

export function ServiceCard({ listing, isOwner = false }: ServiceCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const daysUntilExpiry = listing.expiresAt
    ? Math.ceil(
        (new Date(listing.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 overflow-hidden hover:border-amber-500/30 transition-colors">
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
                  categoryColors[listing.category]
                )}
              >
                {categoryLabels[listing.category]}
              </span>
              {isOwner && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
                    statusColors[listing.status]
                  )}
                >
                  {statusLabels[listing.status]}
                </span>
              )}
            </div>

            {/* Title */}
            <Link
              href={`/services/${listing.slug || listing.id}`}
              className="block group"
            >
              <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                {listing.title}
              </h3>
            </Link>

            {/* Description */}
            <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
              {listing.description}
            </p>

            {/* Portfolio Preview */}
            {listing.portfolioProjects && listing.portfolioProjects.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <Rocket className="h-3.5 w-3.5 text-zinc-500" />
                <div className="flex -space-x-2">
                  {listing.portfolioProjects.slice(0, 3).map((pp) => (
                    <div
                      key={pp.project.id}
                      className="h-6 w-6 rounded-md border-2 border-zinc-900 bg-zinc-800 overflow-hidden"
                      title={pp.project.title}
                    >
                      {pp.project.imageUrl ? (
                        <Image
                          src={pp.project.imageUrl}
                          alt={pp.project.title}
                          width={24}
                          height={24}
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[8px] text-zinc-500">
                          {pp.project.title.charAt(0)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-zinc-500">
                  {listing.portfolioProjects.length} project{listing.portfolioProjects.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}

            {/* Price and Delivery */}
            <div className="mt-3 flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <DollarSign className="h-4 w-4" />
                {formatPrice(listing.priceInCents)}
              </span>
              <span className="flex items-center gap-1.5 text-zinc-500">
                <Clock className="h-4 w-4" />
                {listing.deliveryDays} day{listing.deliveryDays !== 1 ? "s" : ""} delivery
              </span>
              {isOwner && listing._count && (
                <span className="flex items-center gap-1.5 text-zinc-500">
                  <ShoppingBag className="h-4 w-4" />
                  {listing._count.orders} order{listing._count.orders !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Expiry Warning */}
            {isOwner && listing.status === "ACTIVE" && daysUntilExpiry !== null && daysUntilExpiry <= 7 && (
              <div className="mt-3 text-xs text-amber-400">
                ⚠️ Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          {/* Actions Menu (Owner only) */}
          {isOwner && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-zinc-700 bg-zinc-800 shadow-xl z-10">
                  <div className="py-1">
                    <Link
                      href={`/services/${listing.slug || listing.id}`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700/50"
                    >
                      <Eye className="h-4 w-4" />
                      View Listing
                    </Link>
                    <Link
                      href={`/services/${listing.id}/edit`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700/50"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Link>
                    {listing.status === "ACTIVE" && (
                      <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700/50">
                        <Pause className="h-4 w-4" />
                        Pause Listing
                      </button>
                    )}
                    {listing.status === "PAUSED" && (
                      <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700/50">
                        <Play className="h-4 w-4" />
                        Reactivate
                      </button>
                    )}
                    <hr className="my-1 border-zinc-700" />
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Bar (Owner - for draft/pending) */}
      {isOwner && (listing.status === "DRAFT" || listing.status === "PENDING_PAYMENT") && (
        <div className="px-4 py-3 border-t border-zinc-800/50 bg-zinc-900/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              {listing.status === "DRAFT"
                ? "Complete your listing to publish"
                : "Pay $5 listing fee to activate"}
            </span>
            {listing.status === "PENDING_PAYMENT" && (
              <Link
                href={`/services/${listing.id}/checkout`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-900 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 transition-all"
              >
                <DollarSign className="h-3 w-3" />
                Pay & Activate
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
