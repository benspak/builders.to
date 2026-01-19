"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface ProfileViewTrackerProps {
  userId: string;
}

// Generate a stable visitor ID for anonymous users (stored in localStorage)
function getVisitorId(): string {
  if (typeof window === "undefined") return "";

  const storageKey = "builders_visitor_id";
  let visitorId = localStorage.getItem(storageKey);

  if (!visitorId) {
    // Generate a random visitor ID
    visitorId = `v_${Math.random().toString(36).substring(2, 15)}${Date.now().toString(36)}`;
    localStorage.setItem(storageKey, visitorId);
  }

  return visitorId;
}

export function ProfileViewTracker({ userId }: ProfileViewTrackerProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    async function trackView() {
      try {
        const visitorId = getVisitorId();
        // Check if there's a referrer profile (from "people also viewed" clicks)
        const referrerUserId = searchParams.get("ref");

        await fetch(`/api/users/${userId}/views`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            visitorId,
            referrerUserId: referrerUserId || undefined,
          }),
        });
      } catch (error) {
        // Silently fail - view tracking should not affect user experience
        console.error("Error tracking profile view:", error);
      }
    }

    // Small delay to ensure the page has loaded
    const timeoutId = setTimeout(trackView, 500);
    return () => clearTimeout(timeoutId);
  }, [userId, searchParams]);

  // This component doesn't render anything
  return null;
}
