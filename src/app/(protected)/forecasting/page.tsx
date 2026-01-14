"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  TrendingUp,
  Loader2,
  ArrowLeft,
  Trophy,
  RefreshCw,
  Check,
} from "lucide-react";
import { CoinBalance } from "@/components/forecasting/CoinBalance";
import { ForecastTargetCard } from "@/components/forecasting/ForecastTargetCard";
import { MyForecasts } from "@/components/forecasting/MyForecasts";
import { CoinPurchase } from "@/components/forecasting/CoinPurchase";

interface ForecastTarget {
  id: string;
  userId: string;
  founder: {
    id: string;
    name: string | null;
    image: string | null;
    slug: string | null;
    headline: string | null;
  };
  currentMrr: number | null;
  lastMrrUpdate: string | null;
  minForecastCoins: number;
  maxForecastCoins: number;
  totalForecasts: number;
  userForecast: {
    position: string;
    coinsStaked: number;
  } | null;
}

export default function ForecastingPage() {
  const searchParams = useSearchParams();
  const [targets, setTargets] = useState<ForecastTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState<"explore" | "my-forecasts">("explore");
  const [sortBy, setSortBy] = useState<"mrr" | "forecasts" | "newest">("mrr");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [purchasedCoins, setPurchasedCoins] = useState<number | null>(null);

  // Check for purchase success in URL params
  useEffect(() => {
    const purchaseStatus = searchParams.get("purchase");
    const coins = searchParams.get("coins");

    if (purchaseStatus === "success" && coins) {
      setPurchasedCoins(parseInt(coins, 10));
      setShowSuccessToast(true);
      // Remove the query params from URL
      window.history.replaceState({}, "", "/forecasting");
      // Hide toast after 5 seconds
      setTimeout(() => setShowSuccessToast(false), 5000);
    }
  }, [searchParams]);

  const fetchTargets = async () => {
    try {
      const response = await fetch(
        `/api/forecasting/targets?sortBy=${sortBy}&limit=20`
      );
      if (response.ok) {
        const data = await response.json();
        setTargets(data.targets);
      }
    } catch (err) {
      console.error("Failed to fetch targets:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTargets();
  }, [sortBy]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTargets();
  };

  return (
    <div className="py-8">
      {/* Success Toast */}
      {showSuccessToast && purchasedCoins && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 shadow-lg backdrop-blur-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500">
              <Check className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-cyan-400">Purchase Successful!</p>
              <p className="text-sm text-zinc-400">+{purchasedCoins.toLocaleString()} coins added to your balance</p>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 text-sm mb-4 transition-colors"
            style={{ color: "var(--foreground-muted)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to feed
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: "var(--foreground)" }}
              >
                Earnings Forecasting
              </h1>
              <p style={{ color: "var(--foreground-muted)" }}>
                Predict founder earnings and earn reputation coins
              </p>
            </div>

            <Link
              href="/forecasting/leaderboard"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 hover:from-amber-500/30 hover:to-orange-500/30 transition-all"
            >
              <Trophy className="h-4 w-4" />
              Leaderboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Coin Balance */}
            <CoinBalance />

            {/* Quick Info */}
            <div
              className="rounded-xl border p-5"
              style={{
                background: "var(--background-secondary)",
                borderColor: "var(--card-border)",
              }}
            >
              <h3
                className="font-semibold mb-3"
                style={{ color: "var(--foreground)" }}
              >
                How it works
              </h3>
              <ul
                className="text-sm space-y-2"
                style={{ color: "var(--foreground-muted)" }}
              >
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">1.</span>
                  Choose a founder and go LONG or SHORT
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">2.</span>
                  Stake coins on your prediction
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">3.</span>
                  Wait 24 hours for earnings to be verified
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">4.</span>
                  Win 2x your stake if you&apos;re right!
                </li>
              </ul>
            </div>

            {/* Buy Coins */}
            <CoinPurchase />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView("explore")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    view === "explore"
                      ? "bg-cyan-500/20 text-cyan-400"
                      : "text-zinc-400 hover:text-zinc-300"
                  }`}
                >
                  Explore
                </button>
                <button
                  onClick={() => setView("my-forecasts")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    view === "my-forecasts"
                      ? "bg-cyan-500/20 text-cyan-400"
                      : "text-zinc-400 hover:text-zinc-300"
                  }`}
                >
                  My Forecasts
                </button>
              </div>

              {view === "explore" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                    />
                  </button>
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as "mrr" | "forecasts" | "newest")
                    }
                    className="px-3 py-2 rounded-lg text-sm border"
                    style={{
                      background: "var(--background-secondary)",
                      borderColor: "var(--card-border)",
                      color: "var(--foreground)",
                    }}
                  >
                    <option value="mrr">Highest Earnings</option>
                    <option value="forecasts">Most Forecasts</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
              )}
            </div>

            {/* Content */}
            {view === "explore" ? (
              loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                </div>
              ) : targets.length === 0 ? (
                <div
                  className="text-center py-12"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    No founders available yet
                  </p>
                  <p className="text-sm">
                    Founders need to connect Stripe and enable forecasting to appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {targets.map((target) => (
                    <ForecastTargetCard
                      key={target.id}
                      target={target}
                      onForecastPlaced={handleRefresh}
                    />
                  ))}
                </div>
              )
            ) : (
              <MyForecasts />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
