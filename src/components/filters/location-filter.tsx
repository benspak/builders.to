"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, Navigation, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationFilterProps {
  /** Called when location or radius changes */
  onChange: (location: {
    latitude: number;
    longitude: number;
    radiusKm: number;
    displayName?: string;
  } | null) => void;
  /** Default radius in km */
  defaultRadius?: number;
  /** Available radius options */
  radiusOptions?: number[];
  /** Placeholder text */
  placeholder?: string;
  /** Optional class name */
  className?: string;
  /** Show the radius selector */
  showRadiusSelector?: boolean;
}

const DEFAULT_RADIUS_OPTIONS = [5, 10, 25, 50, 100, 250];

export function LocationFilter({
  onChange,
  defaultRadius = 50,
  radiusOptions = DEFAULT_RADIUS_OPTIONS,
  placeholder = "Find nearby...",
  className,
  showRadiusSelector = true,
}: LocationFilterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    displayName?: string;
  } | null>(null);
  const [radiusKm, setRadiusKm] = useState(defaultRadius);
  const [showRadiusDropdown, setShowRadiusDropdown] = useState(false);

  // Notify parent when location or radius changes
  useEffect(() => {
    if (location) {
      onChange({
        ...location,
        radiusKm,
      });
    } else {
      onChange(null);
    }
  }, [location, radiusKm, onChange]);

  // Request user's location
  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Try to reverse geocode for display name
        let displayName = "Your location";
        try {
          // Use a simple reverse geocoding approach
          // In production, you might want to use a proper geocoding service
          const response = await fetch(
            `/api/map?lat=${latitude}&lon=${longitude}`
          );
          if (response.ok) {
            const data = await response.json();
            if (data.city) {
              displayName = data.city;
              if (data.country) {
                displayName += `, ${data.country}`;
              }
            }
          }
        } catch {
          // Fallback to coordinates if geocoding fails
          console.log("Geocoding failed, using coordinates");
        }

        setLocation({
          latitude,
          longitude,
          displayName,
        });
        setIsLoading(false);
      },
      (error) => {
        setIsLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError("Location access denied. Please enable location services.");
            break;
          case error.POSITION_UNAVAILABLE:
            setError("Location unavailable. Please try again.");
            break;
          case error.TIMEOUT:
            setError("Location request timed out. Please try again.");
            break;
          default:
            setError("Failed to get location. Please try again.");
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  }, []);

  // Clear location
  const clearLocation = () => {
    setLocation(null);
    setError(null);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        {/* Location button */}
        {!location ? (
          <button
            onClick={requestLocation}
            disabled={isLoading}
            className={cn(
              "flex items-center gap-2 rounded-lg border border-white/10 bg-zinc-800/50 px-4 py-2 text-sm transition-colors",
              isLoading
                ? "opacity-50 cursor-wait"
                : "hover:border-orange-500/30 hover:bg-zinc-800"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
            ) : (
              <Navigation className="h-4 w-4 text-orange-400" />
            )}
            <span className="text-zinc-300">{placeholder}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm">
            <MapPin className="h-4 w-4 text-orange-400" />
            <span className="text-orange-300">{location.displayName}</span>
            <button
              onClick={clearLocation}
              className="ml-1 p-0.5 rounded hover:bg-orange-500/20 text-orange-400 hover:text-orange-300 transition-colors"
              title="Clear location"
            >
              <span className="text-lg leading-none">&times;</span>
            </button>
          </div>
        )}

        {/* Radius selector */}
        {showRadiusSelector && location && (
          <div className="relative">
            <button
              onClick={() => setShowRadiusDropdown(!showRadiusDropdown)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-300 hover:border-white/20 transition-colors"
            >
              <span>{radiusKm} km</span>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                showRadiusDropdown && "rotate-180"
              )} />
            </button>

            {showRadiusDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowRadiusDropdown(false)}
                />
                <div className="absolute top-full right-0 mt-1 z-20 w-28 rounded-lg border border-white/10 bg-zinc-900 shadow-xl p-1">
                  {radiusOptions.map((radius) => (
                    <button
                      key={radius}
                      onClick={() => {
                        setRadiusKm(radius);
                        setShowRadiusDropdown(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-1.5 rounded text-sm transition-colors",
                        radius === radiusKm
                          ? "bg-orange-500/20 text-orange-300"
                          : "text-zinc-300 hover:bg-white/5"
                      )}
                    >
                      {radius} km
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}

/**
 * Hook for managing nearby location state
 */
export function useNearbyLocation(defaultRadius: number = 50) {
  const [nearbyLocation, setNearbyLocation] = useState<{
    latitude: number;
    longitude: number;
    radiusKm: number;
    displayName?: string;
  } | null>(null);

  const handleLocationChange = useCallback(
    (location: typeof nearbyLocation) => {
      setNearbyLocation(location);
    },
    []
  );

  return {
    nearbyLocation,
    setNearbyLocation: handleLocationChange,
    isNearbyActive: nearbyLocation !== null,
    clearNearby: () => setNearbyLocation(null),
  };
}
