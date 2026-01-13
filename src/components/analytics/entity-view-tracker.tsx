"use client";

import { useEffect } from "react";

type EntityType = "project" | "update" | "listing";

interface EntityViewTrackerProps {
  entityType: EntityType;
  entitySlug: string; // For projects and listings, use slug. For updates, use id.
}

function getVisitorId(): string {
  if (typeof window === "undefined") return "";

  let visitorId = sessionStorage.getItem("visitor_id");
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    sessionStorage.setItem("visitor_id", visitorId);
  }
  return visitorId;
}

const apiPaths: Record<EntityType, string> = {
  project: "/api/projects",
  update: "/api/updates",
  listing: "/api/local-listings",
};

export function EntityViewTracker({ entityType, entitySlug }: EntityViewTrackerProps) {
  useEffect(() => {
    // Small delay to ensure page is actually loaded
    const timer = setTimeout(() => {
      const visitorId = getVisitorId();
      const basePath = apiPaths[entityType];

      fetch(`${basePath}/${entitySlug}/views`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ visitorId }),
      }).catch((error) => {
        // Silently fail - analytics shouldn't break the site
        console.debug("View tracking failed:", error);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [entityType, entitySlug]);

  return null;
}

// Hook for tracking clicks
export function useClickTracker(entityType: EntityType, entitySlug: string) {
  const trackClick = (clickType?: string) => {
    const visitorId = getVisitorId();
    const basePath = apiPaths[entityType];

    fetch(`${basePath}/${entitySlug}/clicks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ visitorId, clickType }),
    }).catch((error) => {
      console.debug("Click tracking failed:", error);
    });
  };

  return { trackClick };
}
