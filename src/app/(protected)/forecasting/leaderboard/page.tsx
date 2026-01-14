"use client";

import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import { Leaderboard } from "@/components/forecasting/Leaderboard";

export default function LeaderboardPage() {
  return (
    <div className="py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/forecasting"
            className="inline-flex items-center gap-2 text-sm mb-4 transition-colors"
            style={{ color: "var(--foreground-muted)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to forecasting
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
              <Trophy className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: "var(--foreground)" }}
              >
                Forecasting Leaderboard
              </h1>
              <p style={{ color: "var(--foreground-muted)" }}>
                Top forecasters ranked by accuracy and coins earned
              </p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div
          className="rounded-xl border p-4 mb-6"
          style={{
            background: "var(--background-secondary)",
            borderColor: "var(--card-border)",
          }}
        >
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm"
            style={{ color: "var(--foreground-muted)" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-green-400">Accuracy</span>
              <span>= Win rate percentage</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400">Coins</span>
              <span>= Current balance</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400">W/L</span>
              <span>= Wins / Losses</span>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <Leaderboard />
      </div>
    </div>
  );
}
