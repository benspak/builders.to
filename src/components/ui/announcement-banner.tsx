"use client";

import { useState, useEffect } from "react";
import { X, RefreshCw } from "lucide-react";
import Link from "next/link";

const BANNER_DISMISSED_KEY = "announcement_banner_dismissed_v2";

export function AnnouncementBanner() {
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to prevent flash

  useEffect(() => {
    // Check localStorage on mount
    const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY);
    setIsDismissed(dismissed === "true");
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(BANNER_DISMISSED_KEY, "true");
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div className="relative bg-gradient-to-r from-sky-500 to-blue-600 text-white">
      <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-3 text-sm">
          <RefreshCw className="h-4 w-4 flex-shrink-0" />
          <p className="text-center font-medium">
            <span className="hidden sm:inline">
              X/Twitter cross-posting updated! Please{" "}
              <Link href="/settings/platforms" className="underline hover:no-underline font-semibold">
                reconnect your X account
              </Link>{" "}
              to continue posting.
            </span>
            <span className="sm:hidden">
              <Link href="/settings/platforms" className="underline hover:no-underline font-semibold">
                Reconnect X account
              </Link>{" "}
              to continue posting.
            </span>
          </p>
          <button
            onClick={handleDismiss}
            className="ml-2 flex-shrink-0 rounded-md p-1 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
