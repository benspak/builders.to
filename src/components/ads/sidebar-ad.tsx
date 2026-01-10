"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Megaphone } from "lucide-react";

interface Advertisement {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  linkUrl: string;
  ctaText: string;
}

interface SidebarAdProps {
  isAuthenticated?: boolean;
}

// Get or create a visitor ID for tracking
function getVisitorId(): string {
  if (typeof window === "undefined") return "";

  let visitorId = localStorage.getItem("ad_visitor_id");
  if (!visitorId) {
    visitorId = `v_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem("ad_visitor_id", visitorId);
  }
  return visitorId;
}

export function SidebarAd({ isAuthenticated = false }: SidebarAdProps) {
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(true);
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    fetchActiveAd();
  }, []);

  const trackView = useCallback(async (adId: string) => {
    if (tracked) return;

    try {
      const visitorId = getVisitorId();
      await fetch("/api/ads/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId, visitorId }),
      });
      setTracked(true);
    } catch (error) {
      console.error("Failed to track ad view:", error);
    }
  }, [tracked]);

  useEffect(() => {
    if (ad && !tracked) {
      trackView(ad.id);
    }
  }, [ad, tracked, trackView]);

  const fetchActiveAd = async () => {
    try {
      const res = await fetch("/api/ads/active");
      if (res.ok) {
        const ads: Advertisement[] = await res.json();
        if (ads.length > 0) {
          // Randomly select one ad if multiple exist
          const randomAd = ads[Math.floor(Math.random() * ads.length)];
          setAd(randomAd);
        }
      }
    } catch (error) {
      console.error("Failed to fetch active ads:", error);
    } finally {
      setLoading(false);
    }
  };

  // Show placeholder if no active ads
  if (!loading && !ad) {
    return (
      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/50 bg-zinc-900/80">
          <Megaphone className="h-4 w-4 text-emerald-500" />
          <span className="text-xs font-medium text-zinc-400">Sponsored</span>
        </div>
        <div className="p-5 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Megaphone className="h-6 w-6 text-emerald-500/60" />
          </div>
          <h3 className="text-sm font-medium text-white mb-1">Advertise Here</h3>
          <p className="text-xs text-zinc-500 mb-4">
            Reach thousands of builders for just $5/mo
          </p>
          {isAuthenticated ? (
            <Link
              href="/ads/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Megaphone className="h-4 w-4" />
              Create Ad — $5/mo
            </Link>
          ) : (
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20"
            >
              Sign in to Advertise
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 overflow-hidden animate-pulse">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/50">
          <div className="h-4 w-4 bg-zinc-800 rounded" />
          <div className="h-3 w-16 bg-zinc-800 rounded" />
        </div>
        <div className="p-5">
          <div className="w-full h-32 bg-zinc-800 rounded-lg mb-4" />
          <div className="h-5 w-3/4 bg-zinc-800 rounded mb-2" />
          <div className="h-4 w-full bg-zinc-800 rounded mb-4" />
          <div className="h-9 w-full bg-zinc-800 rounded-lg" />
        </div>
      </div>
    );
  }

  // Display active ad
  return (
    <a
      href={ad!.linkUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group block rounded-xl border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm overflow-hidden hover:border-emerald-500/30 transition-all hover:shadow-lg hover:shadow-emerald-500/5"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/50 bg-zinc-900/80">
        <div className="flex items-center gap-2">
          <Megaphone className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Sponsored</span>
        </div>
        <ExternalLink className="h-3 w-3 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Ad Image */}
        {ad!.imageUrl && (
          <div className="relative w-full h-32 rounded-lg overflow-hidden mb-3 ring-1 ring-zinc-800/50 group-hover:ring-emerald-500/30 transition-all">
            <Image
              src={ad!.imageUrl}
              alt={ad!.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        {/* Title */}
        <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 mb-1">
          {ad!.title}
        </h3>

        {/* Description */}
        {ad!.description && (
          <p className="text-xs text-zinc-400 line-clamp-2 mb-3">
            {ad!.description}
          </p>
        )}

        {/* CTA Button */}
        <span className="inline-flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:from-emerald-600 group-hover:to-teal-600 transition-all">
          {ad!.ctaText}
          <ExternalLink className="h-3.5 w-3.5" />
        </span>
      </div>
    </a>
  );
}
