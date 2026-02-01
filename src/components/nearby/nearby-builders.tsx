"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, User, Flame, Navigation, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NearbyUser {
  id: string;
  slug: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  image: string | null;
  headline: string | null;
  city: string | null;
  country: string | null;
  currentStreak: number;
  distanceKm: number;
  openToMeeting: boolean;
  lookingForCofounder: boolean;
}

interface NearbyBuildersProps {
  limit?: number;
  className?: string;
}

function getDisplayName(user: NearbyUser): string {
  if (user.displayName) return user.displayName;
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.name || "Builder";
}

function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`;
  }
  return `${Math.round(distanceKm)}km`;
}

export function NearbyBuilders({ limit = 5, className }: NearbyBuildersProps) {
  const [users, setUsers] = useState<NearbyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [hasLocation, setHasLocation] = useState(false);

  const fetchNearbyUsers = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `/api/users/nearby?latitude=${lat}&longitude=${lng}&radius=100&limit=${limit}`
      );
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching nearby users:", error);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const requestLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setHasLocation(true);
          setLocationError(null);
          fetchNearbyUsers(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError("Enable location to see nearby builders");
          setLoading(false);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
      );
    } else {
      setLocationError("Location not supported");
      setLoading(false);
    }
  }, [fetchNearbyUsers]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  if (loading) {
    return (
      <div className={cn("rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6", className)}>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Builders Nearby</h3>
        </div>
        <div className="space-y-3">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="h-10 w-10 rounded-lg bg-zinc-800" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-24 rounded bg-zinc-800" />
                <div className="h-2 w-32 rounded bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (locationError) {
    return (
      <div className={cn("rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6", className)}>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Builders Nearby</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-sm text-zinc-500 mb-3">{locationError}</p>
          <button
            onClick={requestLocation}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 text-xs hover:bg-blue-500/30 transition-colors mx-auto"
          >
            <Navigation className="h-3 w-3" />
            Enable Location
          </button>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className={cn("rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6", className)}>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Builders Nearby</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-sm text-zinc-500">No builders found nearby</p>
          <Link
            href="/discover"
            className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block"
          >
            Expand your search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6", className)}>
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-4 w-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-white">Builders Nearby</h3>
      </div>

      <div className="space-y-3">
        {users.map((user) => {
          const displayName = getDisplayName(user);
          const profileUrl = user.slug ? `/${user.slug}` : null;
          const location = user.city && user.country
            ? `${user.city}, ${user.country}`
            : user.city || user.country || null;

          return (
            <div
              key={user.id}
              className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-zinc-800/50 transition-colors group"
            >
              {/* Avatar */}
              <Link href={profileUrl || "#"} className="shrink-0">
                <div className="relative">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={displayName}
                      width={40}
                      height={40}
                      className="rounded-lg ring-1 ring-white/10 group-hover:ring-blue-500/30 transition-all object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}

                  {/* Streak badge */}
                  {user.currentStreak > 0 && (
                    <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 rounded-full bg-orange-500 px-1 py-0.5 text-[8px] font-bold text-white ring-2 ring-zinc-900">
                      <Flame className="h-2 w-2" />
                      {user.currentStreak}
                    </div>
                  )}
                </div>
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link href={profileUrl || "#"}>
                    <h4 className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                      {displayName}
                    </h4>
                  </Link>
                  <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-blue-500/20 text-blue-400">
                    {formatDistance(user.distanceKm)}
                  </span>
                </div>

                {location && (
                  <p className="text-xs text-zinc-500 truncate">{location}</p>
                )}

                {/* Intent badges */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.openToMeeting && (
                    <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-green-500/20 text-green-400">
                      Meetup
                    </span>
                  )}
                  {user.lookingForCofounder && (
                    <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-purple-500/20 text-purple-400">
                      Cofounder
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Link
        href="/discover"
        className="mt-4 block text-center text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        Discover more nearby
      </Link>
    </div>
  );
}
