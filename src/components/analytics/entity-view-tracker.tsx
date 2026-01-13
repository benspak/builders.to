"use client";

import { useEffect } from "react";

type EntityType = "project" | "update" | "listing";

interface EntityViewTrackerProps {
  entityType: EntityType;
  entityId: string; // For projects use slug, for updates and listings use id
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

export function EntityViewTracker({ entityType, entityId }: EntityViewTrackerProps) {
  useEffect(() => {
    // Small delay to ensure page is actually loaded
    const timer = setTimeout(() => {
      const visitorId = getVisitorId();
      const basePath = apiPaths[entityType];

      fetch(`${basePath}/${entityId}/views`, {
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
  }, [entityType, entityId]);

  return null;
}

// Hook for tracking clicks
export function useClickTracker(entityType: EntityType, entityId: string) {
  const trackClick = (clickType?: string) => {
    const visitorId = getVisitorId();
    const basePath = apiPaths[entityType];

    fetch(`${basePath}/${entityId}/clicks`, {
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
