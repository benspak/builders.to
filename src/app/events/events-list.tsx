"use client";

import { useState, useEffect, useCallback } from "react";
import { CalendarDays, MapPin, Video, Loader2 } from "lucide-react";
import { EventCard } from "@/components/events/event-card";
import { LocationFilter, useNearbyLocation } from "@/components/filters/location-filter";
import { cn } from "@/lib/utils";

type FilterTab = "upcoming" | "nearby" | "virtual" | "past";

interface Event {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string | null;
  timezone: string;
  isVirtual: boolean;
  virtualUrl: string | null;
  venue: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  maxAttendees: number | null;
  imageUrl: string | null;
  attendeeCount: number;
  userRsvpStatus: string | null;
  distanceKm?: number;
  organizer: {
    id: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
    slug: string | null;
  };
}

export function EventsList() {
  const [activeTab, setActiveTab] = useState<FilterTab>("upcoming");
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { nearbyLocation, setNearbyLocation, isNearbyActive } = useNearbyLocation();

  const tabs: { id: FilterTab; label: string; icon: React.ReactNode }[] = [
    { id: "upcoming", label: "Upcoming", icon: <CalendarDays className="h-4 w-4" /> },
    { id: "nearby", label: "Nearby", icon: <MapPin className="h-4 w-4" /> },
    { id: "virtual", label: "Virtual", icon: <Video className="h-4 w-4" /> },
    { id: "past", label: "Past", icon: <CalendarDays className="h-4 w-4" /> },
  ];

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = "/api/events?";

      if (activeTab === "upcoming") {
        url += "upcoming=true";
      } else if (activeTab === "virtual") {
        url += "upcoming=true&isVirtual=true";
      } else if (activeTab === "past") {
        url += "upcoming=false";
      } else if (activeTab === "nearby" && nearbyLocation) {
        url = `/api/events/nearby?latitude=${nearbyLocation.latitude}&longitude=${nearbyLocation.longitude}&radius=${nearbyLocation.radiusKm}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, nearbyLocation]);

  useEffect(() => {
    // Don't fetch nearby without location
    if (activeTab === "nearby" && !isNearbyActive) {
      setEvents([]);
      setIsLoading(false);
      return;
    }
    fetchEvents();
  }, [fetchEvents, activeTab, isNearbyActive]);

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
                ? "bg-orange-500/20 text-orange-400"
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
          defaultRadius={50}
        />
      )}

      {/* Events Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <CalendarDays className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
          <h3 className="text-lg font-medium text-zinc-300 mb-2">
            {activeTab === "nearby" && !isNearbyActive
              ? "Enable location to find nearby events"
              : "No events found"}
          </h3>
          <p className="text-sm text-zinc-500">
            {activeTab === "upcoming" &&
              "Be the first to create an event for the community!"}
            {activeTab === "nearby" &&
              (isNearbyActive
                ? "Try expanding your search radius"
                : "Click the location button above to get started")}
            {activeTab === "virtual" && "No virtual events scheduled yet"}
            {activeTab === "past" && "No past events to show"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
