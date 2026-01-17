"use client";

import dynamic from "next/dynamic";

// Dynamic import to prevent SSR issues with Leaflet
export const BuildersMapClient = dynamic(
  () => import("@/components/map/builders-map").then((mod) => mod.BuildersMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[600px] bg-zinc-900/50 rounded-2xl border border-zinc-800">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent mx-auto mb-4" />
          <p className="text-zinc-400">Loading map...</p>
        </div>
      </div>
    ),
  }
);
