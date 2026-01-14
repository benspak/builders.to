"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Trophy,
  Target,
  Coins,
  Loader2,
  Medal,
  User,
} from "lucide-react";

interface LeaderboardUser {
  id: string;
  name: string | null;
  image: string | null;
  slug: string | null;
  coinBalance: number;
  lifetimeCoinsEarned: number;
  forecastAccuracy: number | null;
  totalForecasts: number;
  wonForecasts: number;
}

interface LeaderboardProps {
  initialSortBy?: "accuracy" | "coins" | "total";
  limit?: number;
}

export function Leaderboard({
  initialSortBy = "accuracy",
  limit = 50,
}: LeaderboardProps) {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState(initialSortBy);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/forecasting/leaderboard?sortBy=${sortBy}&limit=${limit}`
        );
        if (response.ok) {
          const data = await response.json();
          setUsers(data.leaderboard);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [sortBy, limit]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500">
          <Trophy className="h-4 w-4 text-zinc-900" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-zinc-300 to-zinc-400">
          <Medal className="h-4 w-4 text-zinc-900" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-amber-700">
          <Medal className="h-4 w-4 text-zinc-900" />
        </div>
      );
    }
    return (
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
        style={{
          background: "var(--background)",
          color: "var(--foreground-muted)",
        }}
      >
        {rank}
      </div>
    );
  };

  return (
    <div>
      {/* Sort Options */}
      <div className="flex items-center gap-2 mb-4">
        {(["accuracy", "coins", "total"] as const).map((option) => (
          <button
            key={option}
            onClick={() => setSortBy(option)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              sortBy === option
                ? "bg-amber-500/20 text-amber-400"
                : "text-zinc-400 hover:text-zinc-300"
            }`}
          >
            {option === "accuracy" && "Best Accuracy"}
            {option === "coins" && "Most Coins"}
            {option === "total" && "Most Forecasts"}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : users.length === 0 ? (
        <div
          className="text-center py-12"
          style={{ color: "var(--foreground-muted)" }}
        >
          <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No forecasters yet</p>
          <p className="text-sm mt-1">Be the first to place a forecast!</p>
        </div>
      ) : (
        <div
          className="rounded-xl border overflow-hidden"
          style={{
            background: "var(--background-secondary)",
            borderColor: "var(--card-border)",
          }}
        >
          {/* Header */}
          <div
            className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium border-b"
            style={{
              borderColor: "var(--card-border)",
              color: "var(--foreground-muted)",
            }}
          >
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-5">Forecaster</div>
            <div className="col-span-2 text-center">Accuracy</div>
            <div className="col-span-2 text-center">W/L</div>
            <div className="col-span-2 text-center">Coins</div>
          </div>

          {/* Rows */}
          {users.map((user, index) => (
            <div
              key={user.id}
              className={`grid grid-cols-12 gap-4 px-4 py-3 items-center ${
                index < users.length - 1 ? "border-b" : ""
              }`}
              style={{ borderColor: "var(--card-border)" }}
            >
              {/* Rank */}
              <div className="col-span-1 flex justify-center">
                {getRankBadge(index + 1)}
              </div>

              {/* User */}
              <div className="col-span-5 flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "User"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <User className="h-5 w-5 text-zinc-500" />
                    </div>
                  )}
                </div>
                <div>
                  <Link
                    href={user.slug ? `/${user.slug}` : "#"}
                    className="font-semibold hover:text-cyan-400 transition-colors truncate block"
                    style={{ color: "var(--foreground)" }}
                  >
                    {user.name || "Anonymous"}
                  </Link>
                  <p
                    className="text-xs"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    {user.totalForecasts} forecasts
                  </p>
                </div>
              </div>

              {/* Accuracy */}
              <div className="col-span-2 text-center">
                <span
                  className={`font-bold ${
                    user.forecastAccuracy !== null && user.forecastAccuracy >= 60
                      ? "text-green-400"
                      : user.forecastAccuracy !== null && user.forecastAccuracy >= 50
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}
                >
                  {user.forecastAccuracy !== null
                    ? `${user.forecastAccuracy.toFixed(1)}%`
                    : "N/A"}
                </span>
              </div>

              {/* W/L */}
              <div className="col-span-2 text-center">
                <span className="text-green-400">{user.wonForecasts}</span>
                <span style={{ color: "var(--foreground-muted)" }}>/</span>
                <span className="text-red-400">
                  {user.totalForecasts - user.wonForecasts}
                </span>
              </div>

              {/* Coins */}
              <div className="col-span-2 flex items-center justify-center gap-1">
                <Coins className="h-4 w-4 text-amber-400" />
                <span className="font-bold text-amber-400">
                  {user.coinBalance}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
