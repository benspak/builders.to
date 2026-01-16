"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Loader2 } from "lucide-react";

interface ListingPurchaseButtonProps {
  listingId: string;
  listingTitle: string;
  priceInCents: number;
  sellerId: string;
  isLoggedIn: boolean;
  compact?: boolean;
}

export function ListingPurchaseButton({
  listingId,
  listingTitle,
  priceInCents,
  sellerId,
  isLoggedIn,
  compact = false,
}: ListingPurchaseButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    if (!isLoggedIn) {
      router.push("/signin");
      return;
    }

    setShowNotes(true);
  };

  const handleSubmitPurchase = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/local-listings/${listingId}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start purchase");
      }

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  const formattedPrice = (priceInCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  if (showNotes) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Message to Seller (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any questions, shipping preferences, or other details..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 resize-none"
          />
          <p className="mt-1 text-xs text-zinc-500">
            This will be shared with the seller when you place the order
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowNotes(false)}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-400 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmitPurchase}
            disabled={isLoading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-zinc-900 rounded-lg bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                Pay {formattedPrice}
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <button
        onClick={handlePurchase}
        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-900 rounded-lg bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 transition-all shadow-lg shadow-pink-500/20"
      >
        <ShoppingCart className="h-4 w-4" />
        Buy Now {formattedPrice}
      </button>
    );
  }

  return (
    <button
      onClick={handlePurchase}
      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-900 rounded-lg bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 transition-all shadow-lg shadow-pink-500/20"
    >
      <ShoppingCart className="h-4 w-4" />
      Buy Now - {formattedPrice}
    </button>
  );
}
