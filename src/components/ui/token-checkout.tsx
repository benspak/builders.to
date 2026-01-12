"use client";

import { useState, useEffect } from "react";
import { CreditCard, Coins, Loader2, Check, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ItemType = "ad" | "service" | "local-listing";

interface TokenCheckoutProps {
  itemId: string;
  itemType: ItemType;
  itemTitle: string;
  priceCents: number;
  tokenCost: number;
  className?: string;
  onSuccess?: () => void;
}

interface RedeemEligibility {
  canRedeem: boolean;
  cost: number;
  balance: number;
}

const apiPaths: Record<ItemType, { checkout: string; redeem: string }> = {
  ad: {
    checkout: "/api/ads",
    redeem: "/api/ads",
  },
  service: {
    checkout: "/api/services",
    redeem: "/api/services",
  },
  "local-listing": {
    checkout: "/api/local-listings",
    redeem: "/api/local-listings",
  },
};

export function TokenCheckout({
  itemId,
  itemType,
  itemTitle,
  priceCents,
  tokenCost,
  className,
  onSuccess,
}: TokenCheckoutProps) {
  const [eligibility, setEligibility] = useState<RedeemEligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "tokens">("stripe");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const paths = apiPaths[itemType];
  const priceDisplay = (priceCents / 100).toFixed(2);

  useEffect(() => {
    const checkEligibility = async () => {
      try {
        const response = await fetch(`${paths.redeem}/${itemId}/redeem`);
        if (response.ok) {
          const data = await response.json();
          setEligibility(data);
          // Default to tokens if user can redeem
          if (data.canRedeem) {
            setPaymentMethod("tokens");
          }
        }
      } catch (err) {
        console.error("Failed to check token eligibility:", err);
      } finally {
        setLoading(false);
      }
    };

    checkEligibility();
  }, [itemId, paths.redeem]);

  const handleStripeCheckout = async () => {
    setProcessing(true);
    setError(null);
    try {
      const res = await fetch(`${paths.checkout}/${itemId}/checkout`, { method: "POST" });
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

  const handleTokenRedeem = async () => {
    setProcessing(true);
    setError(null);
    try {
      const res = await fetch(`${paths.redeem}/${itemId}/redeem`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to redeem tokens");
      }

      setSuccess(true);
      onSuccess?.();

      // Refresh eligibility after successful redemption
      setEligibility((prev) => prev ? {
        ...prev,
        balance: data.newBalance,
        canRedeem: false,
      } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to redeem tokens");
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = () => {
    if (paymentMethod === "stripe") {
      handleStripeCheckout();
    } else {
      handleTokenRedeem();
    }
  };

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-4", className)}>
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--foreground-muted)" }} />
      </div>
    );
  }

  if (success) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/20",
          className
        )}
      >
        <Check className="h-5 w-5 text-green-400" />
        <span className="text-sm font-medium text-green-400">
          Successfully activated with tokens!
        </span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Payment Method Selection */}
      <div className="grid grid-cols-2 gap-3">
        {/* Stripe Option */}
        <button
          onClick={() => setPaymentMethod("stripe")}
          className={cn(
            "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
            paymentMethod === "stripe"
              ? "border-emerald-500 bg-emerald-500/10"
              : "border-transparent hover:bg-white/5"
          )}
          style={{
            background: paymentMethod !== "stripe" ? "var(--background-secondary)" : undefined,
            borderColor: paymentMethod !== "stripe" ? "var(--card-border)" : undefined
          }}
        >
          <CreditCard className={cn(
            "h-6 w-6",
            paymentMethod === "stripe" ? "text-emerald-400" : ""
          )} style={{ color: paymentMethod !== "stripe" ? "var(--foreground-muted)" : undefined }} />
          <div className="text-center">
            <p className="font-medium" style={{ color: "var(--foreground)" }}>
              Pay with Card
            </p>
            <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
              ${priceDisplay}
            </p>
          </div>
        </button>

        {/* Token Option */}
        <button
          onClick={() => eligibility?.canRedeem && setPaymentMethod("tokens")}
          disabled={!eligibility?.canRedeem}
          className={cn(
            "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
            paymentMethod === "tokens"
              ? "border-amber-500 bg-amber-500/10"
              : "border-transparent",
            !eligibility?.canRedeem && "opacity-60 cursor-not-allowed"
          )}
          style={{
            background: paymentMethod !== "tokens" ? "var(--background-secondary)" : undefined,
            borderColor: paymentMethod !== "tokens" ? "var(--card-border)" : undefined
          }}
        >
          <Coins className={cn(
            "h-6 w-6",
            paymentMethod === "tokens" ? "text-amber-400" : ""
          )} style={{ color: paymentMethod !== "tokens" ? "var(--foreground-muted)" : undefined }} />
          <div className="text-center">
            <p className="font-medium" style={{ color: "var(--foreground)" }}>
              Pay with Tokens
            </p>
            <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
              {tokenCost} tokens
            </p>
          </div>
        </button>
      </div>

      {/* Token Balance Info */}
      {eligibility && (
        <div
          className="flex items-center justify-between px-3 py-2 rounded-lg text-sm"
          style={{ background: "var(--background)" }}
        >
          <span style={{ color: "var(--foreground-muted)" }}>Your balance:</span>
          <div className="flex items-center gap-1.5">
            <Coins className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-semibold text-amber-400">{eligibility.balance}</span>
            {!eligibility.canRedeem && eligibility.balance < tokenCost && (
              <Link
                href="/referrals"
                className="ml-2 text-xs text-orange-400 hover:underline"
              >
                Earn more
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span className="text-sm text-red-400">{error}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handlePayment}
        disabled={processing}
        className={cn(
          "w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed",
          paymentMethod === "stripe"
            ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/20"
            : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/20"
        )}
      >
        {processing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : paymentMethod === "stripe" ? (
          <>
            <CreditCard className="h-4 w-4" />
            Pay ${priceDisplay}
          </>
        ) : (
          <>
            <Coins className="h-4 w-4" />
            Redeem {tokenCost} Tokens
          </>
        )}
      </button>

      {/* Info Text */}
      <p
        className="text-xs text-center"
        style={{ color: "var(--foreground-subtle)" }}
      >
        {paymentMethod === "stripe"
          ? "Secure payment via Stripe"
          : "Tokens will be deducted from your balance"}
      </p>
    </div>
  );
}
