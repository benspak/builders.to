"use client";

import Link from "next/link";
import {
  TrendingUp,
  Coins,
  Target,
  ChevronRight,
} from "lucide-react";

interface ProfileForecastStatsProps {
  coinBalance: number;
  forecastAccuracy: number | null;
  totalForecasts: number;
  wonForecasts: number;
  isOwnProfile?: boolean;
}

export function ProfileForecastStats({
  coinBalance,
  forecastAccuracy,
  totalForecasts,
  wonForecasts,
  isOwnProfile = false,
}: ProfileForecastStatsProps) {
  // Only show if user has any forecasting activity
  if (totalForecasts === 0 && coinBalance === 100) {
    return null;
  }

  return (
    <div
      className="rounded-xl border p-4"
      style={{
        background: "var(--background-secondary)",
        borderColor: "var(--card-border)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-cyan-400" />
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Forecasting
          </h3>
        </div>
        {isOwnProfile && (
          <Link
            href="/forecasting"
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            View All
            <ChevronRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Coin Balance */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Coins className="h-4 w-4 text-amber-400" />
            <span className="text-lg font-bold text-amber-400">
              {coinBalance}
            </span>
          </div>
          <p
            className="text-xs"
            style={{ color: "var(--foreground-muted)" }}
          >
            Coins
          </p>
        </div>

        {/* Accuracy */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Target className="h-4 w-4 text-green-400" />
            <span
              className={`text-lg font-bold ${
                forecastAccuracy !== null && forecastAccuracy >= 60
                  ? "text-green-400"
                  : forecastAccuracy !== null && forecastAccuracy >= 50
                  ? "text-amber-400"
                  : "text-zinc-400"
              }`}
            >
              {forecastAccuracy !== null ? `${forecastAccuracy.toFixed(0)}%` : "N/A"}
            </span>
          </div>
          <p
            className="text-xs"
            style={{ color: "var(--foreground-muted)" }}
          >
            Accuracy
          </p>
        </div>

        {/* Win/Loss */}
        <div className="text-center">
          <div className="text-lg font-bold mb-1">
            <span className="text-green-400">{wonForecasts}</span>
            <span style={{ color: "var(--foreground-muted)" }}>/</span>
            <span className="text-red-400">{totalForecasts - wonForecasts}</span>
          </div>
          <p
            className="text-xs"
            style={{ color: "var(--foreground-muted)" }}
          >
            W/L
          </p>
        </div>
      </div>
    </div>
  );
}
