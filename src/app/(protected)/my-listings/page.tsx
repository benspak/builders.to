"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Plus, Loader2, LayoutList, CheckCircle, Clock, AlertCircle, Ban } from "lucide-react";
import { LocalListingCard } from "@/components/local/local-listing-card";
import { LocalListing, LocalListingStatus, STATUS_LABELS } from "@/components/local/types";
import { cn } from "@/lib/utils";

const statusTabs: { value: LocalListingStatus | "ALL"; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "ALL", label: "All", icon: LayoutList },
  { value: "ACTIVE", label: "Active", icon: CheckCircle },
  { value: "DRAFT", label: "Draft", icon: Clock },
  { value: "PENDING_PAYMENT", label: "Pending", icon: AlertCircle },
  { value: "EXPIRED", label: "Expired", icon: Ban },
];

export default function MyListingsPage() {
  const [listings, setListings] = useState<LocalListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<LocalListingStatus | "ALL">("ALL");

  useEffect(() => {
    async function fetchListings() {
      setIsLoading(true);
      try {
        const url = selectedStatus === "ALL"
          ? "/api/local-listings?mine=true"
          : `/api/local-listings?mine=true&status=${selectedStatus}`;

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setListings(data.listings);
        }
      } catch (error) {
        console.error("Failed to fetch listings:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchListings();
  }, [selectedStatus]);

  const counts = {
    ALL: listings.length,
    ACTIVE: listings.filter(l => l.status === "ACTIVE").length,
    DRAFT: listings.filter(l => l.status === "DRAFT").length,
    PENDING_PAYMENT: listings.filter(l => l.status === "PENDING_PAYMENT").length,
    EXPIRED: listings.filter(l => l.status === "EXPIRED").length,
  };

  const filteredListings = selectedStatus === "ALL"
    ? listings
    : listings.filter(l => l.status === selectedStatus);

  return (
    <div className="relative min-h-screen bg-zinc-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg shadow-emerald-500/25">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">My Local Listings</h1>
              <p className="text-zinc-400 text-sm">
                Manage your classified listings
              </p>
            </div>
          </div>
          <Link
            href="/my-listings/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-zinc-900 rounded-lg bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/20"
          >
            <Plus className="h-4 w-4" />
            New Listing
          </Link>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {statusTabs.map((tab) => {
            const Icon = tab.icon;
            const count = counts[tab.value];
            const isActive = selectedStatus === tab.value;

            return (
              <button
                key={tab.value}
                onClick={() => setSelectedStatus(tab.value)}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors",
                  isActive
                    ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
                    : "bg-zinc-800/50 text-zinc-400 border-zinc-700/50 hover:bg-zinc-800 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {count > 0 && (
                  <span className={cn(
                    "px-1.5 py-0.5 text-xs rounded-full",
                    isActive ? "bg-orange-500/30" : "bg-zinc-700"
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <MapPin className="h-8 w-8 text-emerald-500/60" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              {selectedStatus === "ALL" ? "No listings yet" : `No ${STATUS_LABELS[selectedStatus as LocalListingStatus].toLowerCase()} listings`}
            </h3>
            <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
              {selectedStatus === "ALL"
                ? "Create your first listing to connect with your local community."
                : "You don't have any listings with this status."}
            </p>
            {selectedStatus === "ALL" && (
              <Link
                href="/my-listings/new"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-900 rounded-lg bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/20"
              >
                <Plus className="h-4 w-4" />
                Create Your First Listing
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredListings.map((listing) => (
              <LocalListingCard
                key={listing.id}
                listing={listing}
                showStatus={true}
                isOwner={true}
                onDeleted={() => {
                  setListings(prev => prev.filter(l => l.id !== listing.id));
                }}
              />
            ))}
          </div>
        )}

        {/* Info Card */}
        <div className="mt-8 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 shrink-0">
              <MapPin className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-emerald-400 mb-1">
                Listing Categories
              </h3>
              <p className="text-xs text-zinc-400">
                <strong>Services</strong> listings cost $1 and last 90 days. All other categories (Community, Discussion, Co-working/Housing, For Sale) are free and last 30 days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
