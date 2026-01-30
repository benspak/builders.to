"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Loader2,
  MapPin,
  Video,
  Globe,
  Clock,
  Users,
} from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

export default function NewEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [isVirtual, setIsVirtual] = useState(false);
  const [virtualUrl, setVirtualUrl] = useState("");
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    if (!startsAt) {
      setError("Start date/time is required");
      return;
    }

    if (!isVirtual && !city.trim()) {
      setError("City is required for in-person events");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          startsAt,
          endsAt: endsAt || null,
          timezone,
          isVirtual,
          virtualUrl: virtualUrl.trim() || null,
          venue: venue.trim() || null,
          address: address.trim() || null,
          city: city.trim() || null,
          state: state.trim() || null,
          country: country.trim() || null,
          maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
          imageUrl: imageUrl.trim() || null,
          isPublic,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create event");
      }

      const event = await response.json();
      router.push(`/events/${event.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Get current datetime in local format for min attribute
  const now = new Date();
  const minDateTime = now.toISOString().slice(0, 16);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/events"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to events
      </Link>

      <div className="card p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-pink-500/20">
              <CalendarDays className="h-5 w-5 text-orange-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Create Event</h1>
          </div>
          <p className="text-zinc-400">
            Organize a meetup or gathering for the builder community.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-zinc-300 mb-2"
            >
              Event Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Builders Meetup - January"
              disabled={isSubmitting}
              className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50 disabled:opacity-50"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-zinc-300 mb-2"
            >
              Description *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this event about? What can attendees expect?"
              rows={4}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50 disabled:opacity-50 resize-y min-h-[100px]"
            />
          </div>

          {/* Date/Time Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <Clock className="h-4 w-4" />
              Date & Time
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startsAt"
                  className="block text-sm text-zinc-400 mb-2"
                >
                  Starts *
                </label>
                <input
                  id="startsAt"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  min={minDateTime}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-white focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50 disabled:opacity-50"
                />
              </div>

              <div>
                <label
                  htmlFor="endsAt"
                  className="block text-sm text-zinc-400 mb-2"
                >
                  Ends (optional)
                </label>
                <input
                  id="endsAt"
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  min={startsAt || minDateTime}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-white focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="timezone"
                className="block text-sm text-zinc-400 mb-2"
              >
                Timezone
              </label>
              <select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-white focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50 disabled:opacity-50"
              >
                {Intl.supportedValuesOf("timeZone").map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Event Type Toggle */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <MapPin className="h-4 w-4" />
              Event Type
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsVirtual(false)}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                  !isVirtual
                    ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                    : "border-white/10 bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                <MapPin className="h-4 w-4" />
                In-Person
              </button>
              <button
                type="button"
                onClick={() => setIsVirtual(true)}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                  isVirtual
                    ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                    : "border-white/10 bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                <Video className="h-4 w-4" />
                Virtual
              </button>
            </div>
          </div>

          {/* Location Fields (for in-person) */}
          {!isVirtual && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="venue"
                  className="block text-sm text-zinc-400 mb-2"
                >
                  Venue Name
                </label>
                <input
                  id="venue"
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g., The Hub Coworking Space"
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50 disabled:opacity-50"
                />
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-sm text-zinc-400 mb-2"
                >
                  Address
                </label>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main Street"
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50 disabled:opacity-50"
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
                    className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50 disabled:opacity-50"
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
                    className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50 disabled:opacity-50"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label
                    htmlFor="country"
                    className="block text-sm text-zinc-400 mb-2"
                  >
                    Country
                  </label>
                  <input
                    id="country"
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="USA"
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Virtual URL (for virtual events) */}
          {isVirtual && (
            <div>
              <label
                htmlFor="virtualUrl"
                className="block text-sm text-zinc-400 mb-2"
              >
                Meeting Link
              </label>
              <input
                id="virtualUrl"
                type="url"
                value={virtualUrl}
                onChange={(e) => setVirtualUrl(e.target.value)}
                placeholder="https://zoom.us/j/..."
                disabled={isSubmitting}
                className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50 disabled:opacity-50"
              />
              <p className="mt-1 text-xs text-zinc-500">
                You can add or update this later
              </p>
            </div>
          )}

          {/* Additional Options */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="maxAttendees"
                  className="flex items-center gap-2 text-sm text-zinc-400 mb-2"
                >
                  <Users className="h-4 w-4" />
                  Max Attendees
                </label>
                <input
                  id="maxAttendees"
                  type="number"
                  min="1"
                  value={maxAttendees}
                  onChange={(e) => setMaxAttendees(e.target.value)}
                  placeholder="Unlimited"
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50 disabled:opacity-50"
                />
              </div>

            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Cover Image
              </label>
              <ImageUpload
                value={imageUrl}
                onChange={setImageUrl}
                uploadType="events"
                aspectRatio="video"
                disabled={isSubmitting}
                placeholder="Upload a cover image for your event"
              />
            </div>

            {/* Public/Private Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-zinc-800/30">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-zinc-400" />
                <div>
                  <div className="text-sm font-medium text-white">
                    Public Event
                  </div>
                  <div className="text-xs text-zinc-500">
                    Anyone can discover and RSVP to this event
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isPublic ? "bg-orange-500" : "bg-zinc-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isPublic ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
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
              href="/events"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:from-orange-400 hover:to-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CalendarDays className="h-4 w-4" />
                  Create Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
