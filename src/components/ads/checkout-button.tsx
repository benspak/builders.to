"use client";

import { TokenCheckout } from "@/components/ui/token-checkout";
import { AD_REDEMPTION_COST } from "@/lib/tokens";
import { SIDEBAR_AD_PRICE_CENTS, AD_SURCHARGE_CENTS } from "@/lib/stripe";

interface CheckoutButtonProps {
  adId: string;
  adTitle?: string;
  hasSurcharge?: boolean;
  onSuccess?: () => void;
}

export function CheckoutButton({ adId, adTitle, hasSurcharge = false, onSuccess }: CheckoutButtonProps) {
  const totalPrice = hasSurcharge
    ? SIDEBAR_AD_PRICE_CENTS + AD_SURCHARGE_CENTS
    : SIDEBAR_AD_PRICE_CENTS;

  return (
    <TokenCheckout
      itemId={adId}
      itemType="ad"
      itemTitle={hasSurcharge ? `${adTitle || "Advertisement"} (+ surcharge)` : (adTitle || "Advertisement")}
      priceCents={totalPrice}
      tokenCost={AD_REDEMPTION_COST}
      onSuccess={onSuccess}
    />
  );
}
