"use client";

import { useState, useEffect } from "react";
import { TokenCheckout } from "@/components/ui/token-checkout";
import { AD_REDEMPTION_COST } from "@/lib/tokens";

interface CheckoutButtonProps {
  adId: string;
  adTitle?: string;
  onSuccess?: () => void;
}

export function CheckoutButton({ adId, adTitle, onSuccess }: CheckoutButtonProps) {
  const [priceCents, setPriceCents] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading || priceCents === null) {
    return (
      <div className="w-full h-10 bg-zinc-800 rounded-lg animate-pulse" />
    );
  }

  // Calculate token cost based on current price (10 tokens = $1)
  const tokenCost = Math.ceil(priceCents / 10);

  return (
    <TokenCheckout
      itemId={adId}
      itemType="ad"
      itemTitle={adTitle || "Advertisement"}
      priceCents={priceCents}
      tokenCost={tokenCost}
      onSuccess={onSuccess}
    />
  );
}
