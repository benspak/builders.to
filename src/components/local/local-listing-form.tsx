"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { LocalListingCategory, CATEGORY_LABELS, LocalListing } from "./types";

interface LocalListingFormProps {
  initialData?: Partial<LocalListing>;
  userLocation?: {
    city: string | null;
    state: string | null;
    locationSlug: string | null;
    zipCode: string | null;
  };
  mode?: "create" | "edit";
}

const categories: { value: LocalListingCategory; label: string; description: string }[] = [
  { value: "COMMUNITY", label: "Community", description: "General community posts and announcements" },
  { value: "DISCUSSION", label: "Discussion", description: "Start a conversation or ask questions" },
  { value: "COWORKING_HOUSING", label: "Co-working / Housing", description: "Spaces, rooms, and housing" },
  { value: "FOR_SALE", label: "For Sale", description: "Items and products for sale" },
];

export function LocalListingForm({ initialData, userLocation, mode = "create" }: LocalListingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category || ("" as LocalListingCategory | ""),
    city: initialData?.city || userLocation?.city || "",
    state: initialData?.state || userLocation?.state || "",
    zipCode: initialData?.zipCode || userLocation?.zipCode || "",
    contactUrl: initialData?.contactUrl || "",
    images: initialData?.images || [],
  });

  const [useCustomLocation, setUseCustomLocation] = useState(
    !userLocation?.city ||
    (initialData?.city && initialData.city !== userLocation?.city)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        city: useCustomLocation ? formData.city.trim() : userLocation?.city,
        state: useCustomLocation ? formData.state.trim() : userLocation?.state,
        zipCode: formData.zipCode?.trim() || null,
        contactUrl: formData.contactUrl?.trim() || null,
        priceInCents: null,
        images: formData.images,
      };

      const url = mode === "edit"
        ? `/api/local-listings/${initialData?.id}`
        : "/api/local-listings";

      const method = mode === "edit" ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save listing");
      }

      const listing = await response.json();

      // Redirect to the listing or dashboard
      router.push(mode === "edit" ? `/listing/${listing.slug}` : "/my-listings");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-3">
          Category *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
              className={cn(
                "relative flex flex-col items-start rounded-xl border p-4 text-left transition-all",
                formData.category === cat.value
                  ? "border-orange-500/50 bg-orange-500/10"
                  : "border-zinc-700/50 bg-zinc-800/30 hover:bg-zinc-800/50 hover:border-zinc-600"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">{cat.label}</span>
              </div>
              <span className="text-xs text-zinc-500 mt-1">{cat.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-zinc-300 mb-2">
          Title *
        </label>
        <input
          id="title"
          type="text"
          required
          maxLength={100}
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="What are you posting?"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-2">
          Description *
        </label>
        <textarea
          id="description"
          required
          rows={6}
          maxLength={5000}
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Provide details about your listing..."
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
        />
        <p className="mt-1 text-xs text-zinc-500">
          {formData.description.length}/5000 characters
        </p>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Location *
        </label>

        {userLocation?.city && (
          <div className="mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!useCustomLocation}
                onChange={(e) => setUseCustomLocation(!e.target.checked)}
                className="rounded border-zinc-600 bg-zinc-800 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-zinc-400">
                Use my profile location: {userLocation.city}, {userLocation.state}
              </span>
            </label>
          </div>
        )}

        {(useCustomLocation || !userLocation?.city) && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                required={useCustomLocation}
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="City"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div>
              <input
                type="text"
                required={useCustomLocation}
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                placeholder="State"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>
        )}

        <div className="mt-3">
          <input
            type="text"
            value={formData.zipCode}
            onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
            placeholder="ZIP Code (optional)"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Contact URL */}
      <div>
        <label htmlFor="contactUrl" className="block text-sm font-medium text-zinc-300 mb-2">
          Website URL (optional)
        </label>
        <div className="relative">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            id="contactUrl"
            type="url"
            value={formData.contactUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, contactUrl: e.target.value }))}
            placeholder="https://example.com"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 pl-10 pr-4 py-3 text-white placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          Add a link to your website, portfolio, or relevant page
        </p>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
        <div className="text-sm text-zinc-500">
          <span>Free listings expire after 30 days</span>
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !formData.category || !formData.title || !formData.description}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-900 rounded-lg bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            <>
              {mode === "edit" ? "Save Changes" : "Post Listing"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
