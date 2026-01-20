"use client";

import { useState, useEffect } from "react";
import { CreditCard, Loader2, AlertCircle } from "lucide-react";

interface CheckoutButtonProps {
  adId: string;
  adTitle?: string;
  onSuccess?: () => void;
}

export function CheckoutButton({ adId, adTitle, onSuccess }: CheckoutButtonProps) {
  const [priceCents, setPriceCents] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPricing() {
      try {
        const res = await fetch("/api/ads/pricing");
        if (res.ok) {
          const data = await res.json();
          setPriceCents(data.currentPriceCents);
        }
      } catch (error) {
        console.error("Failed to fetch pricing:", error);
        // Fallback to a default price if fetch fails
        setPriceCents(1000); // $10 fallback
      } finally {
        setLoading(false);
      }
    }
    fetchPricing();
  }, []);

  const handleCheckout = async () => {
    setProcessing(true);
    setError(null);
    try {
      const res = await fetch(`/api/ads/${adId}/checkout`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create checkout");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start checkout");
      setProcessing(false);
    }
  };

  if (loading || priceCents === null) {
    return (
      <div className="w-full h-10 bg-zinc-800 rounded-lg animate-pulse" />
    );
  }

  const priceDisplay = (priceCents / 100).toFixed(2);

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span className="text-sm text-red-400">{error}</span>
        </div>
      )}

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={processing}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/20"
      >
        {processing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            Pay ${priceDisplay}
          </>
        )}
      </button>

      {/* Info Text */}
      <p
        className="text-xs text-center"
        style={{ color: "var(--foreground-subtle)" }}
      >
        Secure payment via Stripe
      </p>
    </div>
  );
}
