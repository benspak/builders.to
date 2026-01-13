"use client";

import { useState, useEffect } from "react";
import { Gift, Coins, Store, Megaphone, Loader2, X, Check, Wallet, CreditCard } from "lucide-react";
import { GIFT_PACKAGES } from "@/lib/tokens";

interface GiftTokensButtonProps {
  recipientId: string;
  recipientName: string;
  currentUserId?: string;
}

type GiftMethod = "own_tokens" | "purchase";

export function GiftTokensButton({
  recipientId,
  recipientName,
  currentUserId,
}: GiftTokensButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [giftMethod, setGiftMethod] = useState<GiftMethod>("own_tokens");
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);

  // Don't show if not logged in or viewing own profile
  if (!currentUserId || currentUserId === recipientId) {
    return null;
  }

  // Fetch user's token balance when modal opens
  useEffect(() => {
    if (isOpen && giftMethod === "own_tokens") {
      setLoadingBalance(true);
      fetch("/api/tokens")
        .then((res) => res.json())
        .then((data) => {
          setUserBalance(data.balance ?? 0);
        })
        .catch((err) => {
          console.error("Failed to fetch balance:", err);
        })
        .finally(() => {
          setLoadingBalance(false);
        });
    }
  }, [isOpen, giftMethod]);

  const handleGiftFromBalance = async () => {
    const amount = parseInt(customAmount, 10);
    if (!amount || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (amount > userBalance) {
      setError("You don't have enough tokens");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tokens/gift/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId,
          amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to gift tokens");
      }

      setSuccess(true);
      setUserBalance(data.newBalance);

      // Close modal after showing success for a moment
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setCustomAmount("");
        // Reload page to show updated state
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  const handlePurchaseGift = async () => {
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

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
    setSuccess(false);
    setCustomAmount("");
    setSelectedPackage(null);
    setLoading(false);
  };

  const quickAmounts = [5, 10, 25, 50];

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
            onClick={handleClose}
          />

          {/* Modal content */}
          <div className="relative w-full max-w-md mx-4 rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl max-h-[90vh] overflow-y-auto">
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
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="h-5 w-5 text-zinc-400" />
              </button>
            </div>

            {/* Success state */}
            {success ? (
              <div className="p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 mx-auto mb-4">
                  <Check className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Gift Sent!</h3>
                <p className="text-zinc-400">
                  You successfully gifted {customAmount} tokens to {recipientName}
                </p>
              </div>
            ) : (
              <>
                {/* Gift method tabs */}
                <div className="flex border-b border-white/10">
                  <button
                    onClick={() => setGiftMethod("own_tokens")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                      giftMethod === "own_tokens"
                        ? "text-amber-400 border-b-2 border-amber-500 bg-amber-500/5"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Wallet className="h-4 w-4" />
                    From My Tokens
                  </button>
                  <button
                    onClick={() => setGiftMethod("purchase")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                      giftMethod === "purchase"
                        ? "text-amber-400 border-b-2 border-amber-500 bg-amber-500/5"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    Purchase to Gift
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {giftMethod === "own_tokens" ? (
                    <>
                      {/* Balance display */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-white/5">
                        <span className="text-sm text-zinc-400">Your Balance</span>
                        {loadingBalance ? (
                          <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                        ) : (
                          <span className="flex items-center gap-1 font-semibold text-amber-400">
                            <Coins className="h-4 w-4" />
                            {userBalance} tokens
                          </span>
                        )}
                      </div>

                      {userBalance === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-zinc-400 mb-4">
                            You don&apos;t have any tokens to gift yet.
                          </p>
                          <button
                            onClick={() => setGiftMethod("purchase")}
                            className="text-amber-400 hover:text-amber-300 text-sm font-medium"
                          >
                            Purchase tokens to gift instead →
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-zinc-400">
                            Gift tokens from your balance - it&apos;s free! They&apos;ll be notified instantly.
                          </p>

                          {/* Quick amounts */}
                          <div className="grid grid-cols-4 gap-2">
                            {quickAmounts.map((amount) => (
                              <button
                                key={amount}
                                onClick={() => setCustomAmount(amount.toString())}
                                disabled={amount > userBalance}
                                className={`p-2 rounded-lg text-sm font-medium transition-all ${
                                  customAmount === amount.toString()
                                    ? "bg-amber-500/20 border-amber-500/50 text-amber-400 border"
                                    : amount > userBalance
                                    ? "bg-zinc-800/50 border-white/5 text-zinc-600 border cursor-not-allowed"
                                    : "bg-zinc-800 border-white/10 text-zinc-300 border hover:border-white/20"
                                }`}
                              >
                                {amount}
                              </button>
                            ))}
                          </div>

                          {/* Custom amount input */}
                          <div>
                            <label className="text-sm text-zinc-400 mb-2 block">
                              Or enter custom amount
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                min="1"
                                max={userBalance}
                                value={customAmount}
                                onChange={(e) => setCustomAmount(e.target.value)}
                                placeholder="Enter amount"
                                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-white/10 text-white placeholder-zinc-500 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all"
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                                tokens
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-zinc-400">
                        Purchase a token package to gift. The recipient will be notified instantly.
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
                    </>
                  )}

                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                      {error}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>

                  {giftMethod === "own_tokens" ? (
                    <button
                      onClick={handleGiftFromBalance}
                      disabled={!customAmount || parseInt(customAmount) <= 0 || parseInt(customAmount) > userBalance || loading || userBalance === 0}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-900 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Gift className="h-4 w-4" />
                          Gift {customAmount || 0} Tokens
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handlePurchaseGift}
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
                          <CreditCard className="h-4 w-4" />
                          Purchase & Gift
                        </>
                      )}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
