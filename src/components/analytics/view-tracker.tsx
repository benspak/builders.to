"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Generate a simple anonymous visitor ID stored in sessionStorage
function getVisitorId(): string {
  if (typeof window === "undefined") return "";

  let visitorId = sessionStorage.getItem("visitor_id");
  if (!visitorId) {
    visitorId = `v_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem("visitor_id", visitorId);
  }
  return visitorId;
}

export function ViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't track API routes or static assets
    if (pathname.startsWith("/api") || pathname.includes(".")) {
      return;
    }

    // Small delay to ensure page is actually loaded
    const timer = setTimeout(() => {
      const visitorId = getVisitorId();

      fetch("/api/site-views", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: pathname,
          visitorId,
        }),
      }).catch((error) => {
        // Silently fail - analytics shouldn't break the site
        console.debug("View tracking failed:", error);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
