"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Loader2 } from "lucide-react";

interface PurchaseButtonProps {
  serviceId: string;
  serviceTitle: string;
  priceInCents: number;
  sellerId: string;
  isLoggedIn: boolean;
  compact?: boolean;
}

export function PurchaseButton({
  serviceId,
  serviceTitle,
  priceInCents,
  sellerId,
  isLoggedIn,
  compact = false,
}: PurchaseButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const [requirements, setRequirements] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    if (!isLoggedIn) {
      router.push("/signin");
      return;
    }

    setShowRequirements(true);
  };

  const handleSubmitPurchase = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/services/${serviceId}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirements }),
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

  if (showRequirements) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Project Requirements
          </label>
          <textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="Describe what you need, your goals, timeline preferences, and any other details..."
            rows={4}
            className="w-full px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-none"
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
            onClick={() => setShowRequirements(false)}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-400 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmitPurchase}
            disabled={isLoading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-zinc-900 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                Continue to Payment
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
        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-900 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/20"
      >
        <ShoppingCart className="h-4 w-4" />
        Purchase
      </button>
    );
  }

  return (
    <button
      onClick={handlePurchase}
      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-900 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/20"
    >
      <ShoppingCart className="h-4 w-4" />
      Purchase Service
    </button>
  );
}
