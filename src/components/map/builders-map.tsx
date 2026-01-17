"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { Loader2, Users, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface MapUser {
  id: string;
  latitude: number;
  longitude: number;
  city: string | null;
  country: string | null;
}

interface MapData {
  users: MapUser[];
  count: number;
}

// Component to handle map resize on load
function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    // Small delay to ensure container is rendered
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);

  return null;
}

export function BuildersMap() {
  const [data, setData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMapData() {
      try {
        const response = await fetch("/api/map");
        if (!response.ok) {
          throw new Error("Failed to fetch map data");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchMapData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-zinc-900/50 rounded-2xl border border-zinc-800">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-zinc-400">Loading builder locations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-zinc-900/50 rounded-2xl border border-zinc-800">
        <div className="text-center">
          <MapPin className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.users.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-zinc-900/50 rounded-2xl border border-zinc-800">
        <div className="text-center">
          <Users className="h-8 w-8 text-zinc-500 mx-auto mb-4" />
          <p className="text-zinc-400">No builder locations to display yet.</p>
          <p className="text-zinc-500 text-sm mt-2">
            Add your city to your profile to appear on the map!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Stats overlay */}
      <div className="absolute top-4 right-4 z-[1000] bg-zinc-900/90 backdrop-blur-sm rounded-xl px-4 py-3 border border-zinc-700">
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-orange-500" />
          <span className="text-white font-semibold">{data.count.toLocaleString()}</span>
          <span className="text-zinc-400">builders on the map</span>
        </div>
      </div>

      {/* Map container */}
      <div className="rounded-2xl overflow-hidden border border-zinc-800 shadow-xl">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          minZoom={2}
          maxZoom={12}
          style={{ height: "600px", width: "100%" }}
          className="bg-zinc-900"
          worldCopyJump={true}
        >
          <MapResizeHandler />

          {/* Dark map tiles from CartoDB */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* User markers */}
          {data.users.map((user) => (
            <CircleMarker
              key={user.id}
              center={[user.latitude, user.longitude]}
              radius={6}
              pathOptions={{
                fillColor: "#f97316", // Orange-500
                fillOpacity: 0.8,
                color: "#fed7aa", // Orange-200
                weight: 2,
                opacity: 0.9,
              }}
            >
              <Popup className="builder-popup">
                <div className="text-center py-1">
                  <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                    <MapPin className="h-3 w-3" />
                    <span className="font-medium text-sm">Builder</span>
                  </div>
                  {(user.city || user.country) && (
                    <p className="text-xs text-zinc-600">
                      {[user.city, user.country].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Privacy notice */}
      <p className="text-center text-xs text-zinc-500 mt-4">
        Locations are approximated within a 10-mile radius for privacy.
        Add your city to your profile to appear on the map.
      </p>
    </div>
  );
}
