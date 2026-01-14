"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  TrendingUp,
  TrendingDown,
  Coins,
  ArrowLeft,
  Loader2,
  Building2,
  User,
  Target,
  Trophy,
  Clock,
  XCircle,
  ChevronDown,
} from "lucide-react";
import {
  getQuarterDisplayName,
  formatTokens,
  formatPercentage,
  BET_STATUS_CONFIG,
  DIRECTION_CONFIG,
} from "@/lib/betting";

interface TargetInfo {
  id: string;
  name: string;
  slug?: string | null;
  logo?: string | null;
  image?: string | null;
}

interface BetPeriod {
  quarter: string;
  status: string;
}

interface Bet {
  id: string;
  targetType: "COMPANY" | "USER";
  targetId: string;
  targetInfo: TargetInfo | null;
  direction: "LONG" | "SHORT";
  targetPercentage: number;
  stakeTokens: number;
  houseFeeTokens: number;
  netStakeTokens: number;
  status: "PENDING" | "WON" | "LOST" | "CANCELLED" | "VOID";
  winnings: number | null;
  actualPercentage: number | null;
  createdAt: string;
  resolvedAt: string | null;
  period: BetPeriod;
}

interface BetStats {
  totalBets: number;
  pendingBets: number;
  wonBets: number;
  lostBets: number;
  winRate: number;
  totalWinnings: number;
  totalStaked: number;
}

interface BetsData {
  bets: Bet[];
  nextCursor?: string;
  hasMore: boolean;
  stats: BetStats;
}

export default function MyBetsPage() {
  const [data, setData] = useState<BetsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    fetchBets();
  }, [statusFilter]);

  const fetchBets = async (cursor?: string) => {
    if (cursor) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      let url = "/api/betting/my-bets?limit=20";
      if (statusFilter) url += `&status=${statusFilter}`;
      if (cursor) url += `&cursor=${cursor}`;

      const response = await fetch(url);
      if (response.ok) {
        const result = await response.json();
        if (cursor && data) {
          setData({
            ...result,
            bets: [...data.bets, ...result.bets],
          });
        } else {
          setData(result);
        }
      }
    } catch (error) {
      console.error("Failed to fetch bets:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const getStatusIcon = (status: Bet["status"]) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "WON":
        return <Trophy className="h-4 w-4" />;
      case "LOST":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/betting"
            className="inline-flex items-center gap-2 text-sm mb-4 transition-colors"
            style={{ color: "var(--foreground-muted)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to betting
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                My Bets
              </h1>
              <p style={{ color: "var(--foreground-muted)" }}>
                Track your MRR bets and winnings
              </p>
            </div>

            <Link
              href="/betting"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-emerald-500 text-zinc-900 hover:bg-emerald-400"
            >
              <Target className="h-4 w-4" />
              Place Bet
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {data?.stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div
              className="rounded-xl border p-4"
              style={{
                background: "var(--background-secondary)",
                borderColor: "var(--card-border)",
              }}
            >
              <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                Total Bets
              </p>
              <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                {data.stats.totalBets}
              </p>
            </div>

            <div
              className="rounded-xl border p-4"
              style={{
                background: "var(--background-secondary)",
                borderColor: "var(--card-border)",
              }}
            >
              <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                Win Rate
              </p>
              <p className="text-2xl font-bold text-emerald-400">
                {data.stats.winRate}%
              </p>
            </div>

            <div
              className="rounded-xl border p-4"
              style={{
                background: "var(--background-secondary)",
                borderColor: "var(--card-border)",
              }}
            >
              <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                Total Staked
              </p>
              <p className="text-2xl font-bold text-amber-400">
                {formatTokens(data.stats.totalStaked)}
              </p>
            </div>

            <div
              className="rounded-xl border p-4"
              style={{
                background: "var(--background-secondary)",
                borderColor: "var(--card-border)",
              }}
            >
              <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                Total Winnings
              </p>
              <p className="text-2xl font-bold text-green-400">
                {formatTokens(data.stats.totalWinnings)}
              </p>
            </div>
          </div>
        )}

        {/* Status Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { value: "", label: "All" },
            { value: "PENDING", label: "Pending" },
            { value: "WON", label: "Won" },
            { value: "LOST", label: "Lost" },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === filter.value
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-white/5 text-zinc-400 hover:bg-white/10"
              }`}
            >
              {filter.label}
              {filter.value === "" && data?.stats?.totalBets
                ? ` (${data.stats.totalBets})`
                : filter.value === "PENDING" && data?.stats?.pendingBets
                ? ` (${data.stats.pendingBets})`
                : filter.value === "WON" && data?.stats?.wonBets
                ? ` (${data.stats.wonBets})`
                : filter.value === "LOST" && data?.stats?.lostBets
                ? ` (${data.stats.lostBets})`
                : ""}
            </button>
          ))}
        </div>

        {/* Bets List */}
        <div className="space-y-3">
          {data?.bets.length === 0 ? (
            <div
              className="rounded-xl border p-12 text-center"
              style={{
                background: "var(--background-secondary)",
                borderColor: "var(--card-border)",
              }}
            >
              <Target className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium" style={{ color: "var(--foreground)" }}>
                No bets yet
              </p>
              <p className="text-sm mt-1 mb-4" style={{ color: "var(--foreground-muted)" }}>
                Place your first bet on a company or founder&apos;s MRR growth
              </p>
              <Link
                href="/betting"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-zinc-900 font-medium hover:bg-emerald-400 transition-colors"
              >
                <Target className="h-4 w-4" />
                Browse Targets
              </Link>
            </div>
          ) : (
            data?.bets.map((bet) => {
              const statusConfig = BET_STATUS_CONFIG[bet.status];
              const directionConfig = DIRECTION_CONFIG[bet.direction];

              return (
                <div
                  key={bet.id}
                  className="rounded-xl border p-4 transition-all hover:bg-white/[0.02]"
                  style={{
                    background: "var(--background-secondary)",
                    borderColor: "var(--card-border)",
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Target Icon */}
                    <div
                      className={`flex h-12 w-12 items-center justify-center shrink-0 ${
                        bet.targetType === "COMPANY"
                          ? "rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20"
                          : "rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20"
                      }`}
                    >
                      {bet.targetInfo?.logo || bet.targetInfo?.image ? (
                        <Image
                          src={bet.targetInfo.logo || bet.targetInfo.image || ""}
                          alt={bet.targetInfo.name}
                          width={48}
                          height={48}
                          className={bet.targetType === "COMPANY" ? "rounded-xl" : "rounded-full"}
                        />
                      ) : bet.targetType === "COMPANY" ? (
                        <Building2 className="h-6 w-6 text-emerald-400" />
                      ) : (
                        <User className="h-6 w-6 text-purple-400" />
                      )}
                    </div>

                    {/* Bet Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate" style={{ color: "var(--foreground)" }}>
                          {bet.targetInfo?.name || "Unknown Target"}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${directionConfig.bgColor} ${directionConfig.color}`}
                        >
                          {bet.direction === "LONG" ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {bet.direction}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-sm" style={{ color: "var(--foreground-muted)" }}>
                        <span>Target: {formatPercentage(bet.targetPercentage)}</span>
                        <span>•</span>
                        <span>{getQuarterDisplayName(bet.period.quarter)}</span>
                        {bet.actualPercentage !== null && (
                          <>
                            <span>•</span>
                            <span className={bet.status === "WON" ? "text-green-400" : bet.status === "LOST" ? "text-red-400" : ""}>
                              Actual: {formatPercentage(bet.actualPercentage)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Stake & Status */}
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 justify-end mb-1">
                        <Coins className="h-4 w-4 text-amber-400" />
                        <span className="font-medium" style={{ color: "var(--foreground)" }}>
                          {formatTokens(bet.stakeTokens)}
                        </span>
                      </div>

                      <div
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
                      >
                        {getStatusIcon(bet.status)}
                        {statusConfig.label}
                      </div>

                      {bet.winnings !== null && bet.winnings > 0 && (
                        <p className="text-sm text-green-400 mt-1">
                          +{formatTokens(bet.winnings)} won
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Load More */}
        {data?.hasMore && (
          <div className="mt-6 text-center">
            <button
              onClick={() => fetchBets(data.nextCursor)}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-white/5 hover:bg-white/10"
              style={{ color: "var(--foreground-muted)" }}
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Load More
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
