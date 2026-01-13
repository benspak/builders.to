"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Gift,
  Flame,
  Star,
  Megaphone,
  ShoppingBag,
  MapPin,
  Users,
  Settings,
  ArrowLeft,
  ChevronRight,
  Loader2,
  CreditCard,
  Check,
  Sparkles
} from "lucide-react";
import {
  TOKENS_PER_DOLLAR,
  WELCOME_BONUS_TOKENS,
  REFERRAL_REWARD_TOKENS,
  ENGAGEMENT_BONUS_TOKENS,
  STREAK_MILESTONES,
  AD_REDEMPTION_COST,
  SERVICE_REDEMPTION_COST,
  LOCAL_LISTING_REDEMPTION_COST,
  TOKEN_PURCHASE_PACKAGES,
} from "@/lib/tokens";

interface TokenData {
  balance: number;
  dollarValue: number;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface TransactionHistoryResponse {
  transactions: Transaction[];
  nextCursor?: string;
  hasMore: boolean;
}

const transactionTypeConfig: Record<string, {
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  label: string;
}> = {
  WELCOME_BONUS: {
    icon: Gift,
    colorClass: "text-green-400",
    bgClass: "bg-green-500/20",
    label: "Welcome Bonus",
  },
  REFERRAL_REWARD: {
    icon: Users,
    colorClass: "text-purple-400",
    bgClass: "bg-purple-500/20",
    label: "Referral Reward",
  },
  STREAK_BONUS: {
    icon: Flame,
    colorClass: "text-orange-400",
    bgClass: "bg-orange-500/20",
    label: "Streak Bonus",
  },
  ENGAGEMENT_BONUS: {
    icon: Star,
    colorClass: "text-amber-400",
    bgClass: "bg-amber-500/20",
    label: "Engagement Bonus",
  },
  AD_REDEMPTION: {
    icon: Megaphone,
    colorClass: "text-blue-400",
    bgClass: "bg-blue-500/20",
    label: "Ad Unlocked",
  },
  SERVICE_REDEMPTION: {
    icon: ShoppingBag,
    colorClass: "text-cyan-400",
    bgClass: "bg-cyan-500/20",
    label: "Service Unlocked",
  },
  LOCAL_LISTING_REDEMPTION: {
    icon: MapPin,
    colorClass: "text-emerald-400",
    bgClass: "bg-emerald-500/20",
    label: "Listing Unlocked",
  },
  GIFT_SENT: {
    icon: Gift,
    colorClass: "text-pink-400",
    bgClass: "bg-pink-500/20",
    label: "Gift Sent",
  },
  GIFT_RECEIVED: {
    icon: Gift,
    colorClass: "text-pink-400",
    bgClass: "bg-pink-500/20",
    label: "Gift Received",
  },
  GIFT_PURCHASED: {
    icon: Gift,
    colorClass: "text-pink-400",
    bgClass: "bg-pink-500/20",
    label: "Tokens Purchased",
  },
  ADMIN_ADJUSTMENT: {
    icon: Settings,
    colorClass: "text-zinc-400",
    bgClass: "bg-zinc-500/20",
    label: "Admin Adjustment",
  },
};

export default function TokensPage() {
  const searchParams = useSearchParams();
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [purchasedTokens, setPurchasedTokens] = useState<number | null>(null);

  // Check for success parameter in URL
  useEffect(() => {
    const purchaseStatus = searchParams.get("purchase");
    const tokens = searchParams.get("tokens");

    if (purchaseStatus === "success" && tokens) {
      setPurchasedTokens(parseInt(tokens, 10));
      setShowSuccessToast(true);
      // Remove the query params from URL
      window.history.replaceState({}, "", "/tokens");
      // Hide toast after 5 seconds
      setTimeout(() => setShowSuccessToast(false), 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch balance
        const balanceResponse = await fetch("/api/tokens");
        if (balanceResponse.ok) {
          const data = await balanceResponse.json();
          setTokenData(data);
        }

        // Fetch initial transactions
        const historyResponse = await fetch("/api/tokens/history?limit=20");
        if (historyResponse.ok) {
          const data: TransactionHistoryResponse = await historyResponse.json();
          setTransactions(data.transactions);
          setNextCursor(data.nextCursor);
          setHasMore(data.hasMore);
        }
      } catch (error) {
        console.error("Failed to fetch token data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;

    setLoadingMore(true);
    try {
      const response = await fetch(`/api/tokens/history?limit=20&cursor=${nextCursor}`);
      if (response.ok) {
        const data: TransactionHistoryResponse = await response.json();
        setTransactions((prev) => [...prev, ...data.transactions]);
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error("Failed to load more transactions:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    setPurchasing(true);
    setPurchaseError(null);

    try {
      const response = await fetch("/api/tokens/purchase", {
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

  const getTransactionConfig = (type: string) => {
    return transactionTypeConfig[type] || {
      icon: Coins,
      colorClass: "text-zinc-400",
      bgClass: "bg-zinc-500/20",
      label: type,
    };
  };

  return (
    <div className="py-8">
      {/* Success Toast */}
      {showSuccessToast && purchasedTokens && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 shadow-lg backdrop-blur-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
              <Check className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-green-400">Purchase Successful!</p>
              <p className="text-sm text-zinc-400">+{purchasedTokens} tokens added to your balance</p>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 text-sm mb-4 transition-colors"
              style={{ color: "var(--foreground-muted)" }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to settings
            </Link>

            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
              Tokens
            </h1>
            <p style={{ color: "var(--foreground-muted)" }}>
              Earn tokens and use them to unlock premium features for free
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Balance Card */}
              <div
                className="rounded-xl border p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10"
                style={{ borderColor: "var(--card-border)" }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                      Current Balance
                    </p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-4xl font-bold text-amber-400">
                        {tokenData?.balance ?? 0}
                      </span>
                      <span className="text-lg" style={{ color: "var(--foreground-muted)" }}>
                        tokens
                      </span>
                    </div>
                    <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>
                      ≈ ${tokenData?.dollarValue?.toFixed(2) ?? "0.00"} value
                    </p>
                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/20">
                    <Coins className="h-7 w-7 text-amber-400" />
                  </div>
                </div>
              </div>

              {/* Buy Tokens Section */}
              <div
                className="rounded-xl border p-6"
                style={{
                  background: "var(--background-secondary)",
                  borderColor: "var(--card-border)"
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                    <CreditCard className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                      Buy Tokens
                    </h2>
                    <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                      Instantly add tokens to your balance
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  {TOKEN_PURCHASE_PACKAGES.map((pkg) => {
                    const isSelected = selectedPackage === pkg.id;
                    const savings = pkg.id === "pro" ? "10% off" : null;

                    return (
                      <button
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg.id)}
                        className={`relative flex flex-col items-center p-4 rounded-xl border transition-all ${
                          isSelected
                            ? "border-amber-500/50 bg-amber-500/10 ring-1 ring-amber-500/30"
                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                        }`}
                      >
                        {pkg.popular && (
                          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[10px] font-bold text-zinc-900 uppercase tracking-wide flex items-center gap-1">
                            <Sparkles className="h-2.5 w-2.5" />
                            Popular
                          </div>
                        )}

                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl mb-3 ${
                          isSelected ? "bg-amber-500/20" : "bg-zinc-800"
                        }`}>
                          <Coins className={`h-6 w-6 ${isSelected ? "text-amber-400" : "text-zinc-400"}`} />
                        </div>

                        <span className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                          {pkg.tokens}
                        </span>
                        <span className="text-sm mb-2" style={{ color: "var(--foreground-muted)" }}>
                          tokens
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-amber-400">
                            ${(pkg.priceInCents / 100).toFixed(0)}
                          </span>
                          {savings && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-500/20 text-green-400">
                              {savings}
                            </span>
                          )}
                        </div>

                        <p className="text-xs mt-1 text-center" style={{ color: "var(--foreground-muted)" }}>
                          {pkg.description}
                        </p>

                        {isSelected && (
                          <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500">
                            <Check className="h-3 w-3 text-zinc-900" />
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
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-900 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {purchasing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      {selectedPackage
                        ? `Buy ${TOKEN_PURCHASE_PACKAGES.find(p => p.id === selectedPackage)?.tokens} Tokens`
                        : "Select a package"
                      }
                    </>
                  )}
                </button>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/referrals"
                  className="flex items-center justify-between p-4 rounded-xl border transition-all hover:bg-white/5"
                  style={{
                    background: "var(--background-secondary)",
                    borderColor: "var(--card-border)"
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                      <Users className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: "var(--foreground)" }}>
                        Invite Friends
                      </p>
                      <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                        Earn {REFERRAL_REWARD_TOKENS} tokens per referral
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5" style={{ color: "var(--foreground-muted)" }} />
                </Link>

                <Link
                  href="/ads"
                  className="flex items-center justify-between p-4 rounded-xl border transition-all hover:bg-white/5"
                  style={{
                    background: "var(--background-secondary)",
                    borderColor: "var(--card-border)"
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                      <Megaphone className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: "var(--foreground)" }}>
                        Promote Your Project
                      </p>
                      <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                        Unlock ads for {AD_REDEMPTION_COST} tokens
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5" style={{ color: "var(--foreground-muted)" }} />
                </Link>
              </div>

              {/* How to Earn */}
              <div
                className="rounded-xl border p-6"
                style={{
                  background: "var(--background-secondary)",
                  borderColor: "var(--card-border)"
                }}
              >
                <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--foreground)" }}>
                  How to Earn Tokens
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20 shrink-0">
                      <Gift className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: "var(--foreground)" }}>
                        Sign Up Bonus
                      </p>
                      <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                        +{WELCOME_BONUS_TOKENS} tokens for new members
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 shrink-0">
                      <Users className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: "var(--foreground)" }}>
                        Refer Friends
                      </p>
                      <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                        +{REFERRAL_REWARD_TOKENS} tokens per signup
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 shrink-0">
                      <Star className="h-4 w-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: "var(--foreground)" }}>
                        Daily Updates
                      </p>
                      <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                        +{ENGAGEMENT_BONUS_TOKENS} token per day
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20 shrink-0">
                      <Flame className="h-4 w-4 text-orange-400" />
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: "var(--foreground)" }}>
                        Streak Milestones
                      </p>
                      <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                        +{STREAK_MILESTONES[7]}/{STREAK_MILESTONES[30]}/{STREAK_MILESTONES[100]} at 7/30/100 days
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div
                className="rounded-xl border"
                style={{
                  background: "var(--background-secondary)",
                  borderColor: "var(--card-border)"
                }}
              >
                <div className="px-6 py-4 border-b" style={{ borderColor: "var(--card-border)" }}>
                  <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                    Transaction History
                  </h2>
                </div>

                {transactions.length === 0 ? (
                  <div className="px-6 py-12 text-center" style={{ color: "var(--foreground-muted)" }}>
                    <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No transactions yet</p>
                    <p className="text-sm mt-1">
                      Start earning tokens by posting updates or referring friends!
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="divide-y" style={{ borderColor: "var(--card-border)" }}>
                      {transactions.map((tx) => {
                        const config = getTransactionConfig(tx.type);
                        const IconComponent = config.icon;
                        const isEarning = tx.amount > 0;

                        return (
                          <div
                            key={tx.id}
                            className="flex items-center gap-4 px-6 py-4"
                          >
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${config.bgClass}`}>
                              <IconComponent className={`h-5 w-5 ${config.colorClass}`} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p
                                className="font-medium"
                                style={{ color: "var(--foreground)" }}
                              >
                                {config.label}
                              </p>
                              <p
                                className="text-sm truncate"
                                style={{ color: "var(--foreground-muted)" }}
                              >
                                {tx.description || new Date(tx.createdAt).toLocaleDateString()}
                              </p>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {isEarning ? (
                                <TrendingUp className="h-4 w-4 text-green-400" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-400" />
                              )}
                              <span className={`font-semibold ${isEarning ? "text-green-400" : "text-red-400"}`}>
                                {isEarning ? "+" : ""}{tx.amount}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {hasMore && (
                      <div className="px-6 py-4 border-t" style={{ borderColor: "var(--card-border)" }}>
                        <button
                          onClick={loadMore}
                          disabled={loadingMore}
                          className="w-full py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          style={{
                            background: "var(--background)",
                            color: "var(--foreground-muted)"
                          }}
                        >
                          {loadingMore ? (
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                          ) : (
                            "Load more"
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
  );
}
