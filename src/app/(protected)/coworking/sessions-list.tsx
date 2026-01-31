"use client";

import { useState, useEffect, useCallback } from "react";
import { Coffee, MapPin, Calendar, Loader2 } from "lucide-react";
import { SessionCard } from "@/components/coworking/session-card";
import { LocationFilter, useNearbyLocation } from "@/components/filters/location-filter";
import { cn } from "@/lib/utils";

type FilterTab = "upcoming" | "nearby" | "my-sessions";

interface CoworkingSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string | null;
  venueName: string;
  venueType: "CAFE" | "COWORKING_SPACE" | "LIBRARY" | "OTHER";
  address: string | null;
  city: string;
  state: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  maxBuddies: number;
  description: string | null;
  acceptedCount: number;
  spotsRemaining: number;
  userBuddyStatus: string | null;
  isHost: boolean;
  distance?: number;
  host: {
    id: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
    slug: string | null;
    headline?: string | null;
  };
  buddies: {
    status: string;
    user: {
      id: string;
      name: string | null;
      firstName: string | null;
      lastName: string | null;
      image: string | null;
      slug: string | null;
    };
  }[];
}

export function SessionsList() {
  const [activeTab, setActiveTab] = useState<FilterTab>("upcoming");
  const [sessions, setSessions] = useState<CoworkingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { nearbyLocation, setNearbyLocation, isNearbyActive } = useNearbyLocation(25);

  const tabs: { id: FilterTab; label: string; icon: React.ReactNode }[] = [
    { id: "upcoming", label: "Upcoming", icon: <Calendar className="h-4 w-4" /> },
    { id: "nearby", label: "Nearby", icon: <MapPin className="h-4 w-4" /> },
    { id: "my-sessions", label: "My Sessions", icon: <Coffee className="h-4 w-4" /> },
  ];

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = "/api/coworking/sessions?";

      if (activeTab === "upcoming") {
        url += "limit=20";
      } else if (activeTab === "nearby" && nearbyLocation) {
        url += `latitude=${nearbyLocation.latitude}&longitude=${nearbyLocation.longitude}&radius=${nearbyLocation.radiusKm}`;
      } else if (activeTab === "my-sessions") {
        // This would need a filter for host or accepted buddy
        url += "limit=20";
      }

      const response = await fetch(url);
      const data = await response.json();

      let filteredSessions = data.sessions || [];

      // For "my-sessions", filter client-side
      if (activeTab === "my-sessions") {
        filteredSessions = filteredSessions.filter(
          (s: CoworkingSession) =>
            s.isHost || s.userBuddyStatus === "ACCEPTED" || s.userBuddyStatus === "PENDING"
        );
      }

      setSessions(filteredSessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, nearbyLocation]);

  useEffect(() => {
    // Don't fetch nearby without location
    if (activeTab === "nearby" && !isNearbyActive) {
      setSessions([]);
      setIsLoading(false);
      return;
    }
    fetchSessions();
  }, [fetchSessions, activeTab, isNearbyActive]);

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Nearby Location Filter */}
      {activeTab === "nearby" && (
        <LocationFilter
          onChange={setNearbyLocation}
          placeholder="Use my location"
          defaultRadius={25}
          radiusOptions={[5, 10, 25, 50]}
        />
      )}

      {/* Sessions List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12">
          <Coffee className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
          <h3 className="text-lg font-medium text-zinc-300 mb-2">
            {activeTab === "nearby" && !isNearbyActive
              ? "Enable location to find nearby sessions"
              : activeTab === "my-sessions"
              ? "No sessions yet"
              : "No sessions found"}
          </h3>
          <p className="text-sm text-zinc-500">
            {activeTab === "upcoming" &&
              "Be the first to host a coworking session!"}
            {activeTab === "nearby" &&
              (isNearbyActive
                ? "Try expanding your search radius or host your own session"
                : "Click the location button above to find sessions near you")}
            {activeTab === "my-sessions" &&
              "Host a session or join one to see it here"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onDelete={() => {
                setSessions((prev) => prev.filter((s) => s.id !== session.id));
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
