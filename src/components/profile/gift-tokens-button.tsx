"use client";

import { useState } from "react";
import { Gift, Coins, Store, Megaphone, Loader2, X, Check } from "lucide-react";
import { GIFT_PACKAGES } from "@/lib/tokens";

interface GiftTokensButtonProps {
  recipientId: string;
  recipientName: string;
  currentUserId?: string;
}

export function GiftTokensButton({
  recipientId,
  recipientName,
  currentUserId,
}: GiftTokensButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Don't show if not logged in or viewing own profile
  if (!currentUserId || currentUserId === recipientId) {
    return null;
  }

  const handleGift = async () => {
    if (!selectedPackage) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tokens/gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId,
          packageId: selectedPackage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create gift checkout");
      }

      // Redirect to Stripe checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  const getPackageIcon = (id: string) => {
    switch (id) {
      case "service_listing":
        return Store;
      case "ad_month":
        return Megaphone;
      default:
        return Coins;
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 px-4 py-2 text-sm font-medium text-amber-400 hover:from-amber-500/30 hover:to-orange-500/30 hover:border-amber-500/50 transition-all"
      >
        <Gift className="h-4 w-4" />
        Gift Tokens
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal content */}
          <div className="relative w-full max-w-md mx-4 rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
                  <Gift className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Gift Tokens</h2>
                  <p className="text-sm text-zinc-400">to {recipientName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="h-5 w-5 text-zinc-400" />
              </button>
            </div>

            {/* Package selection */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-zinc-400">
                Choose a token package to gift. Tokens help builders unlock features like service listings and ads.
              </p>

              <div className="space-y-3">
                {GIFT_PACKAGES.map((pkg) => {
                  const Icon = getPackageIcon(pkg.id);
                  const isSelected = selectedPackage === pkg.id;

                  return (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        isSelected
                          ? "border-amber-500/50 bg-amber-500/10"
                          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                      }`}
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                          isSelected ? "bg-amber-500/20" : "bg-zinc-800"
                        }`}
                      >
                        <Icon
                          className={`h-6 w-6 ${
                            isSelected ? "text-amber-400" : "text-zinc-400"
                          }`}
                        />
                      </div>

                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">
                            {pkg.tokens} Tokens
                          </span>
                          <span className="text-amber-400 font-medium">
                            ${(pkg.priceInCents / 100).toFixed(0)}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400">{pkg.description}</p>
                      </div>

                      {isSelected && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500">
                          <Check className="h-4 w-4 text-zinc-900" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGift}
                disabled={!selectedPackage || loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-900 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Gift className="h-4 w-4" />
                    Gift Tokens
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
