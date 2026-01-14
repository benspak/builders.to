"use client";

import { useState, useEffect } from "react";
import { Coins, TrendingUp, TrendingDown, Target, Loader2 } from "lucide-react";

interface CoinBalanceProps {
  compact?: boolean;
}

interface CoinStats {
  coinBalance: number;
  lifetimeCoinsEarned: number;
  forecastAccuracy: number | null;
  totalForecasts: number;
  wonForecasts: number;
  pendingForecasts: number;
  activeStake: number;
}

export function CoinBalance({ compact = false }: CoinBalanceProps) {
  const [stats, setStats] = useState<CoinStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/forecasting/coins");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch coin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center ${compact ? "py-2" : "py-6"}`}
      >
        <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10">
        <Coins className="h-4 w-4 text-amber-400" />
        <span className="font-semibold text-amber-400">{stats.coinBalance}</span>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border p-5"
      style={{
        background: "var(--background-secondary)",
        borderColor: "var(--card-border)",
      }}
    >
      {/* Main Balance */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
            Coin Balance
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-amber-400">
              {stats.coinBalance}
            </span>
            <span className="text-sm" style={{ color: "var(--foreground-muted)" }}>
              coins
            </span>
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20">
          <Coins className="h-6 w-6 text-amber-400" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Active Stake */}
        <div
          className="p-3 rounded-lg"
          style={{ background: "var(--background)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-4 w-4 text-cyan-400" />
            <span
              className="text-xs"
              style={{ color: "var(--foreground-muted)" }}
            >
              Active Stake
            </span>
          </div>
          <p className="text-lg font-semibold text-cyan-400">
            {stats.activeStake}
          </p>
        </div>

        {/* Accuracy */}
        <div
          className="p-3 rounded-lg"
          style={{ background: "var(--background)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-4 w-4 text-green-400" />
            <span
              className="text-xs"
              style={{ color: "var(--foreground-muted)" }}
            >
              Accuracy
            </span>
          </div>
          <p className="text-lg font-semibold text-green-400">
            {stats.forecastAccuracy !== null
              ? `${stats.forecastAccuracy.toFixed(1)}%`
              : "N/A"}
          </p>
        </div>

        {/* Wins */}
        <div
          className="p-3 rounded-lg"
          style={{ background: "var(--background)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span
              className="text-xs"
              style={{ color: "var(--foreground-muted)" }}
            >
              Won
            </span>
          </div>
          <p className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
            {stats.wonForecasts}
          </p>
        </div>

        {/* Total */}
        <div
          className="p-3 rounded-lg"
          style={{ background: "var(--background)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-4 w-4 text-zinc-400" />
            <span
              className="text-xs"
              style={{ color: "var(--foreground-muted)" }}
            >
              Total
            </span>
          </div>
          <p className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
            {stats.totalForecasts}
          </p>
        </div>
      </div>

      {/* Pending Forecasts */}
      {stats.pendingForecasts > 0 && (
        <p
          className="text-sm text-center mt-4"
          style={{ color: "var(--foreground-muted)" }}
        >
          {stats.pendingForecasts} pending forecast
          {stats.pendingForecasts !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
