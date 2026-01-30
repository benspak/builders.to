"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  Image as ImageIcon,
  Trash2,
} from "lucide-react";

interface EventData {
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
  isPublic: boolean;
  isOrganizer: boolean;
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  // Load event data
  useEffect(() => {
    async function loadEvent() {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) {
          if (response.status === 404) {
            router.push("/events");
            return;
          }
          throw new Error("Failed to load event");
        }

        const data: EventData = await response.json();

        // Check if user is organizer
        if (!data.isOrganizer) {
          router.push(`/events/${eventId}`);
          return;
        }

        // Populate form
        setTitle(data.title);
        setDescription(data.description);
        setStartsAt(formatDateTimeLocal(data.startsAt));
        setEndsAt(data.endsAt ? formatDateTimeLocal(data.endsAt) : "");
        setTimezone(data.timezone);
        setIsVirtual(data.isVirtual);
        setVirtualUrl(data.virtualUrl || "");
        setVenue(data.venue || "");
        setAddress(data.address || "");
        setCity(data.city || "");
        setState(data.state || "");
        setCountry(data.country || "");
        setMaxAttendees(data.maxAttendees ? String(data.maxAttendees) : "");
        setImageUrl(data.imageUrl || "");
        setIsPublic(data.isPublic);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load event");
      } finally {
        setIsLoading(false);
      }
    }

    loadEvent();
  }, [eventId, router]);

  function formatDateTimeLocal(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

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
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
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
        throw new Error(data.error || "Failed to update event");
      }

      router.push(`/events/${eventId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update event");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete event");
      }

      router.push("/events");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete event");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href={`/events/${eventId}`}
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to event
      </Link>

      <div className="card p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-pink-500/20">
              <CalendarDays className="h-5 w-5 text-orange-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Edit Event</h1>
          </div>
          <p className="text-zinc-400">Update your event details.</p>
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
                  min={startsAt}
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

              <div>
                <label
                  htmlFor="imageUrl"
                  className="flex items-center gap-2 text-sm text-zinc-400 mb-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  Cover Image URL
                </label>
                <input
                  id="imageUrl"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50 disabled:opacity-50"
                />
              </div>
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
              href={`/events/${eventId}`}
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
                  Saving...
                </>
              ) : (
                <>
                  <CalendarDays className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>

          {/* Delete Section */}
          <div className="pt-6 mt-6 border-t border-red-500/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-red-400">
                  Delete Event
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  This action cannot be undone. All RSVPs will be removed.
                </p>
              </div>
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Confirm Delete
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
