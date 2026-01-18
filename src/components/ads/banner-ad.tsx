"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Megaphone } from "lucide-react";
import { selectBestAd, recordAdImpression } from "./ad-impression-tracker";

interface Advertisement {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  linkUrl: string;
  ctaText: string;
}

interface AdPricing {
  currentPriceFormatted: string;
  availableSlots: number;
  totalSlots: number;
  isSoldOut: boolean;
}

interface BannerAdProps {
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

export function BannerAd({ isAuthenticated = false }: BannerAdProps) {
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [pricing, setPricing] = useState<AdPricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [tracked, setTracked] = useState(false);
  const pathname = usePathname();

  // Re-fetch ads on route change to rotate ads per page view
  useEffect(() => {
    setTracked(false); // Reset tracking for new page view
    fetchActiveAd();
    fetchPricing();
  }, [pathname]);

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
      // Use cache: 'no-store' to bypass browser cache and get fresh ads
      const res = await fetch("/api/ads/active", { cache: "no-store" });
      if (res.ok) {
        const ads: Advertisement[] = await res.json();
        if (ads.length > 0) {
          // Select the best ad based on user's impression history
          // Prioritizes ads the user hasn't seen or has seen fewer times
          const selectedAd = selectBestAd(ads);
          if (selectedAd) {
            setAd(selectedAd);
            // Record this impression locally
            recordAdImpression(selectedAd.id);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch active ads:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPricing = async () => {
    try {
      const res = await fetch("/api/ads/pricing");
      if (res.ok) {
        const data = await res.json();
        setPricing(data);
      }
    } catch (error) {
      console.error("Failed to fetch ad pricing:", error);
    }
  };

  // Show placeholder if no active ads
  if (!loading && !ad) {
    const priceDisplay = pricing?.currentPriceFormatted || "$10";
    const isSoldOut = pricing?.isSoldOut ?? false;

    return (
      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <Megaphone className="h-6 w-6 text-emerald-500/60" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Megaphone className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">
                  Sponsored
                </span>
              </div>
              <h3 className="text-sm font-medium text-white">
                Your Ad Could Be Here
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                {isSoldOut
                  ? "All slots filled - join waitlist"
                  : `Reach thousands of builders for ${priceDisplay}/mo`
                }
              </p>
            </div>
          </div>
          {isAuthenticated ? (
            <Link
              href="/ads/new"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap"
            >
              <Megaphone className="h-4 w-4" />
              {isSoldOut ? "Join Waitlist" : `Create Ad — ${priceDisplay}/mo`}
            </Link>
          ) : (
            <Link
              href="/signin"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap"
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
          <div className="w-full sm:w-32 h-20 bg-zinc-800 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-16 bg-zinc-800 rounded" />
            <div className="h-5 w-3/4 bg-zinc-800 rounded" />
            <div className="h-4 w-full bg-zinc-800 rounded" />
          </div>
          <div className="h-10 w-28 bg-zinc-800 rounded-lg flex-shrink-0" />
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
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5">
        {/* Ad Image */}
        {ad!.imageUrl && (
          <div className="relative w-full sm:w-36 h-24 sm:h-20 rounded-lg overflow-hidden ring-1 ring-zinc-800/50 group-hover:ring-emerald-500/30 transition-all flex-shrink-0">
            <Image
              src={ad!.imageUrl}
              alt={ad!.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Megaphone className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">
              Sponsored
            </span>
          </div>
          <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
            {ad!.title}
          </h3>
          {ad!.description && (
            <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">
              {ad!.description}
            </p>
          )}
        </div>

        {/* CTA Button */}
        <span className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:from-emerald-600 group-hover:to-teal-600 transition-all whitespace-nowrap flex-shrink-0">
          {ad!.ctaText}
          <ExternalLink className="h-3.5 w-3.5" />
        </span>
      </div>
    </a>
  );
}
