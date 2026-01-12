"use client";

import { TokenCheckout } from "@/components/ui/token-checkout";
import { AD_REDEMPTION_COST } from "@/lib/tokens";
import { SIDEBAR_AD_PRICE_CENTS } from "@/lib/stripe";

interface CheckoutButtonProps {
  adId: string;
  adTitle?: string;
  onSuccess?: () => void;
}

export function CheckoutButton({ adId, adTitle, onSuccess }: CheckoutButtonProps) {
  return (
    <TokenCheckout
      itemId={adId}
      itemType="ad"
      itemTitle={adTitle || "Advertisement"}
      priceCents={SIDEBAR_AD_PRICE_CENTS}
      tokenCost={AD_REDEMPTION_COST}
      onSuccess={onSuccess}
    />
  );
}
