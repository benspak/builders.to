"use client";

import { useState } from "react";
import {
  Coins,
  CreditCard,
  Loader2,
  Check,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import {
  COIN_PURCHASE_PACKAGES,
  COIN_PURCHASE_DISCLAIMER,
} from "@/lib/coins";

interface CoinPurchaseProps {
  onPurchaseComplete?: () => void;
}

export function CoinPurchase({ onPurchaseComplete }: CoinPurchaseProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    setPurchasing(true);
    setPurchaseError(null);

    try {
      const response = await fetch("/api/forecasting/coins/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: selectedPackage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout");
      }

      // Redirect to Stripe checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : "Something went wrong");
      setPurchasing(false);
    }
  };

  const selectedPkg = COIN_PURCHASE_PACKAGES.find(p => p.id === selectedPackage);

  return (
    <div
      className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
          <CreditCard className="h-5 w-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">
            Buy Forecasting Coins
          </h2>
          <p className="text-sm text-zinc-400">
            Add coins to your balance instantly
          </p>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="flex items-start gap-3 p-3 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200/80">
          {COIN_PURCHASE_DISCLAIMER}
        </p>
      </div>

      {/* Package Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {COIN_PURCHASE_PACKAGES.map((pkg) => {
          const isSelected = selectedPackage === pkg.id;
          const pricePerCoin = (pkg.priceInCents / pkg.coins).toFixed(3);

          return (
            <button
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg.id)}
              className={`relative flex flex-col items-center p-4 rounded-xl border transition-all ${
                isSelected
                  ? "border-cyan-500/50 bg-cyan-500/10 ring-1 ring-cyan-500/30"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-[10px] font-bold text-white uppercase tracking-wide flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5" />
                  Best Value
                </div>
              )}

              <div className={`flex h-10 w-10 items-center justify-center rounded-xl mb-2 ${
                isSelected ? "bg-cyan-500/20" : "bg-zinc-800"
              }`}>
                <Coins className={`h-5 w-5 ${isSelected ? "text-cyan-400" : "text-zinc-400"}`} />
              </div>

              <span className="text-xl font-bold text-white">
                {pkg.coins.toLocaleString()}
              </span>
              <span className="text-xs text-zinc-400 mb-1">
                coins
              </span>

              <span className="text-lg font-semibold text-cyan-400">
                ${(pkg.priceInCents / 100).toFixed(0)}
              </span>

              <span className="text-[10px] text-zinc-500 mt-1">
                ${pricePerCoin}/coin
              </span>

              {isSelected && (
                <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {purchaseError && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {purchaseError}
        </div>
      )}

      <button
        onClick={handlePurchase}
        disabled={!selectedPackage || purchasing}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {purchasing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            {selectedPkg
              ? `Buy ${selectedPkg.coins.toLocaleString()} Coins for $${(selectedPkg.priceInCents / 100).toFixed(0)}`
              : "Select a package"
            }
          </>
        )}
      </button>
    </div>
  );
}
