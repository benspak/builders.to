"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ImageIcon, DollarSign, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { LocalListingCategory, CATEGORY_LABELS, LocalListing } from "./types";
import { GalleryUpload } from "@/components/ui/image-upload";

interface LocalListingFormProps {
  initialData?: Partial<LocalListing>;
  userLocation?: {
    city: string | null;
    state: string | null;
    locationSlug: string | null;
    zipCode: string | null;
  };
  userHasStripeConnect?: boolean;
  mode?: "create" | "edit";
}

const categories: { value: LocalListingCategory; label: string; description: string; requiresPayment?: boolean }[] = [
  { value: "COMMUNITY", label: "Community", description: "General community posts and announcements" },
  { value: "DISCUSSION", label: "Discussion", description: "Start a conversation or ask questions" },
  { value: "COWORKING_HOUSING", label: "Co-working / Housing", description: "Spaces, rooms, and housing" },
  { value: "FOR_SALE", label: "For Sale", description: "Items and products for sale", requiresPayment: true },
];

export function LocalListingForm({ initialData, userLocation, userHasStripeConnect = false, mode = "create" }: LocalListingFormProps) {
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
    priceInCents: initialData?.priceInCents || null as number | null,
    images: initialData?.images || [],
  });

  const isForSale = formData.category === "FOR_SALE";

  const [useCustomLocation, setUseCustomLocation] = useState(
    !userLocation?.city ||
    (initialData?.city && initialData.city !== userLocation?.city)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate FOR_SALE listings require Stripe Connect
    if (isForSale && !userHasStripeConnect) {
      setError("You must set up Stripe Connect to sell items. Go to Settings > Payments to set up.");
      setIsSubmitting(false);
      return;
    }

    // Validate price for FOR_SALE
    if (isForSale && (!formData.priceInCents || formData.priceInCents < 100)) {
      setError("Please set a price of at least $1.00 for your item.");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        city: useCustomLocation ? formData.city.trim() : userLocation?.city,
        state: useCustomLocation ? formData.state.trim() : userLocation?.state,
        zipCode: formData.zipCode?.trim() || null,
        priceInCents: isForSale ? formData.priceInCents : null,
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

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          <span className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Photos (optional)
          </span>
        </label>
        <GalleryUpload
          images={formData.images}
          onChange={(images) => setFormData(prev => ({ ...prev, images }))}
          maxImages={5}
          uploadType="listings"
        />
        <p className="mt-2 text-xs text-zinc-500">
          Add up to 5 photos to help showcase your listing. The first image will be used as the cover.
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

      {/* Price field for FOR_SALE */}
      {isForSale && (
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-zinc-300 mb-2">
            Price *
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              id="price"
              type="number"
              min="1"
              step="0.01"
              required={isForSale}
              value={formData.priceInCents ? (formData.priceInCents / 100).toFixed(2) : ""}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setFormData(prev => ({
                  ...prev,
                  priceInCents: isNaN(value) ? null : Math.round(value * 100)
                }));
              }}
              placeholder="0.00"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 pl-10 pr-4 py-3 text-white placeholder:text-zinc-500 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Set your selling price. Buyers will pay through secure checkout.
          </p>

          {/* Stripe Connect requirement warning */}
          {!userHasStripeConnect && (
            <div className="mt-3 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-amber-400 font-medium">Payment setup required</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    To receive payments, you need to connect a Stripe account.{" "}
                    <a href="/settings" className="text-amber-400 hover:text-amber-300 underline">
                      Set up payments →
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
        <div className="text-sm text-zinc-500">
          {isForSale ? (
            <span>Paid listings expire after 90 days</span>
          ) : (
            <span>Free listings expire after 30 days</span>
          )}
        </div>
        <button
          type="submit"
          disabled={
            isSubmitting ||
            !formData.category ||
            !formData.title ||
            !formData.description ||
            (isForSale && (!formData.priceInCents || formData.priceInCents < 100 || !userHasStripeConnect))
          }
          className={cn(
            "inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-900 rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed",
            isForSale
              ? "bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 shadow-pink-500/20"
              : "bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 shadow-orange-500/20"
          )}
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
