"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Coffee,
  Loader2,
  MapPin,
  Clock,
  Users,
  Building2,
  BookOpen,
  HelpCircle,
} from "lucide-react";

const VENUE_TYPES = [
  { value: "CAFE", label: "Cafe", icon: Coffee },
  { value: "COWORKING_SPACE", label: "Coworking Space", icon: Building2 },
  { value: "LIBRARY", label: "Library", icon: BookOpen },
  { value: "OTHER", label: "Other", icon: HelpCircle },
] as const;

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
  isHost: boolean;
}

export default function EditCoworkingSessionPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  // Form state
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueType, setVenueType] = useState<string>("CAFE");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [maxBuddies, setMaxBuddies] = useState("3");
  const [description, setDescription] = useState("");

  // Fetch session data
  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch(`/api/coworking/sessions/${sessionId}`);

        if (response.status === 404) {
          setNotFound(true);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch session");
        }

        const data: CoworkingSession = await response.json();

        if (!data.isHost) {
          setUnauthorized(true);
          return;
        }

        // Populate form with existing data
        const sessionDate = new Date(data.date);
        setDate(sessionDate.toISOString().split("T")[0]);
        setStartTime(data.startTime);
        setEndTime(data.endTime || "");
        setVenueName(data.venueName);
        setVenueType(data.venueType);
        setAddress(data.address || "");
        setCity(data.city);
        setState(data.state || "");
        setCountry(data.country);
        setMaxBuddies(String(data.maxBuddies));
        setDescription(data.description || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load session");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSession();
  }, [sessionId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!date) {
      setError("Date is required");
      return;
    }

    if (!startTime) {
      setError("Start time is required");
      return;
    }

    if (!venueName.trim()) {
      setError("Venue name is required");
      return;
    }

    if (!city.trim()) {
      setError("City is required");
      return;
    }

    if (!country.trim()) {
      setError("Country is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/coworking/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          startTime,
          endTime: endTime || null,
          venueName: venueName.trim(),
          venueType,
          address: address.trim() || null,
          city: city.trim(),
          state: state.trim() || null,
          country: country.trim(),
          maxBuddies: parseInt(maxBuddies) || 1,
          description: description.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update session");
      }

      router.push("/coworking");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update session");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Get today's date for min attribute
  const today = new Date().toISOString().split("T")[0];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/coworking"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to coworking
        </Link>

        <div className="card p-8 text-center">
          <Coffee className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
          <h2 className="text-xl font-bold text-white mb-2">Session Not Found</h2>
          <p className="text-zinc-400">
            This coworking session may have been deleted or doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/coworking"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to coworking
        </Link>

        <div className="card p-8 text-center">
          <Coffee className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
          <h2 className="text-xl font-bold text-white mb-2">Not Authorized</h2>
          <p className="text-zinc-400">
            Only the host can edit this session.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/coworking"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to coworking
      </Link>

      <div className="card p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
              <Coffee className="h-5 w-5 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Edit Session</h1>
          </div>
          <p className="text-zinc-400">
            Update the details for your coworking session.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date & Time Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <Clock className="h-4 w-4" />
              When
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-sm text-zinc-400 mb-2"
              >
                Date *
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startTime"
                  className="block text-sm text-zinc-400 mb-2"
                >
                  Start Time *
                </label>
                <input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 disabled:opacity-50"
                />
              </div>

              <div>
                <label
                  htmlFor="endTime"
                  className="block text-sm text-zinc-400 mb-2"
                >
                  End Time (optional)
                </label>
                <input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  min={startTime}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Venue Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <MapPin className="h-4 w-4" />
              Where
            </div>

            <div>
              <label
                htmlFor="venueName"
                className="block text-sm text-zinc-400 mb-2"
              >
                Venue Name *
              </label>
              <input
                id="venueName"
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="e.g., Blue Bottle Coffee"
                disabled={isSubmitting}
                className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Venue Type *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {VENUE_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setVenueType(type.value)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-medium transition-colors ${
                        venueType === type.value
                          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                          : "border-white/10 bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm text-zinc-400 mb-2"
              >
                Address (optional)
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main Street"
                disabled={isSubmitting}
                className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm text-zinc-400 mb-2"
                >
                  City *
                </label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="San Francisco"
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 disabled:opacity-50"
                />
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="block text-sm text-zinc-400 mb-2"
                >
                  State
                </label>
                <input
                  id="state"
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="CA"
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 disabled:opacity-50"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label
                  htmlFor="country"
                  className="block text-sm text-zinc-400 mb-2"
                >
                  Country *
                </label>
                <input
                  id="country"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="USA"
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div>
              <label
                htmlFor="maxBuddies"
                className="flex items-center gap-2 text-sm text-zinc-400 mb-2"
              >
                <Users className="h-4 w-4" />
                How many buddies can join?
              </label>
              <select
                id="maxBuddies"
                value={maxBuddies}
                onChange={(e) => setMaxBuddies(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 disabled:opacity-50"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "buddy" : "buddies"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm text-zinc-400 mb-2"
              >
                Notes (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Any details about the spot, what you'll be working on, or who you'd like to meet..."
                rows={3}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 disabled:opacity-50 resize-y min-h-[80px]"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Link
              href="/coworking"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:from-emerald-400 hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Coffee className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
