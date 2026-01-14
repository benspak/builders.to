"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Building2,
  User,
  Coins,
  ChevronRight,
  Loader2,
  Calendar,
  Target,
  ArrowLeft,
} from "lucide-react";
import {
  getQuarterDisplayName,
  getTimeUntilBettingCloses,
  parseQuarter,
  DIRECTION_CONFIG,
} from "@/lib/betting";

interface BettingPeriod {
  id: string;
  quarter: string;
  startsAt: string;
  endsAt: string;
  bettingClosesAt: string;
  status: string;
  isCurrent: boolean;
}

interface CompanyTarget {
  id: string;
  name: string;
  slug: string | null;
  logo: string | null;
  category: string;
  revenueRange: string | null;
  projectCount: number;
  targetType: "COMPANY";
}

interface UserTarget {
  id: string;
  name: string | null;
  slug: string | null;
  image: string | null;
  companyCount: number;
  targetType: "USER";
}

interface BettingData {
  periods: BettingPeriod[];
  companies: CompanyTarget[];
  users: UserTarget[];
  userBets: Record<string, string[]>;
}

export default function BettingPage() {
  const [data, setData] = useState<BettingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"companies" | "founders">("companies");
  const [selectedPeriod, setSelectedPeriod] = useState<BettingPeriod | null>(null);
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number } | null>(null);

  useEffect(() => {
    fetchBettingData();
  }, []);

  useEffect(() => {
    if (!selectedPeriod) return;

    const updateCountdown = () => {
      const quarter = parseQuarter(selectedPeriod.quarter);
      const time = getTimeUntilBettingCloses(quarter);
      setCountdown(time.total > 0 ? time : null);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const fetchBettingData = async () => {
    try {
      const response = await fetch("/api/betting");
      if (response.ok) {
        const result = await response.json();
        setData(result);
        // Select the first open period by default
        const openPeriod = result.periods.find(
          (p: BettingPeriod) => p.status === "OPEN" || p.status === "UPCOMING"
        );
        if (openPeriod) {
          setSelectedPeriod(openPeriod);
        }
      }
    } catch (error) {
      console.error("Failed to fetch betting data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatRevenue = (range: string | null) => {
    if (!range) return "Pre-revenue";
    const labels: Record<string, string> = {
      RANGE_0: "Pre-revenue",
      RANGE_1_10K: "$1-10K",
      RANGE_10K_50K: "$10-50K",
      RANGE_50K_100K: "$50-100K",
      RANGE_100K_500K: "$100-500K",
      RANGE_500K_1M: "$500K-1M",
      RANGE_1M_5M: "$1-5M",
      RANGE_5M_PLUS: "$5M+",
    };
    return labels[range] || range;
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
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
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

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                MRR Betting
              </h1>
              <p style={{ color: "var(--foreground-muted)" }}>
                Bet on company and founder MRR growth for the quarter
              </p>
            </div>

            <Link
              href="/betting/my-bets"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
            >
              <Target className="h-4 w-4" />
              My Bets
            </Link>
          </div>
        </div>

        {/* Period Selector */}
        <div
          className="rounded-xl border p-6 mb-6"
          style={{
            background: "var(--background-secondary)",
            borderColor: "var(--card-border)",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
              <Calendar className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-semibold" style={{ color: "var(--foreground)" }}>
                Select Betting Period
              </h2>
              <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                Choose which quarter to bet on
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data?.periods.map((period) => {
              const isSelected = selectedPeriod?.id === period.id;
              const isOpen = period.status === "OPEN" || period.status === "UPCOMING";

              return (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period)}
                  disabled={!isOpen}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    isSelected
                      ? "border-emerald-500/50 bg-emerald-500/10 ring-1 ring-emerald-500/30"
                      : isOpen
                      ? "border-white/10 bg-white/5 hover:border-white/20"
                      : "border-white/5 bg-white/[0.02] opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="text-left">
                    <p className="font-medium" style={{ color: "var(--foreground)" }}>
                      {getQuarterDisplayName(period.quarter)}
                    </p>
                    <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                      {period.isCurrent ? "Current Quarter" : "Next Quarter"}
                    </p>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      isOpen
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-zinc-500/20 text-zinc-400"
                    }`}
                  >
                    {isOpen ? "Open" : period.status}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Countdown */}
          {countdown && selectedPeriod && (
            <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: "var(--foreground-muted)" }}>
              <Clock className="h-4 w-4" />
              <span>
                Betting closes in{" "}
                <span className="font-medium text-emerald-400">
                  {countdown.days}d {countdown.hours}h {countdown.minutes}m
                </span>
              </span>
            </div>
          )}
        </div>

        {/* How it Works */}
        <div
          className="rounded-xl border p-6 mb-6"
          style={{
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(20, 184, 166, 0.05))",
            borderColor: "var(--card-border)",
          }}
        >
          <h3 className="font-semibold mb-3" style={{ color: "var(--foreground)" }}>
            How It Works
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0">
                1
              </div>
              <div>
                <p className="font-medium" style={{ color: "var(--foreground)" }}>
                  Pick a Target
                </p>
                <p style={{ color: "var(--foreground-muted)" }}>
                  Choose a company or founder
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0">
                2
              </div>
              <div>
                <p className="font-medium" style={{ color: "var(--foreground)" }}>
                  Set Your Bet
                </p>
                <p style={{ color: "var(--foreground-muted)" }}>
                  Go long or short on MRR growth %
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0">
                3
              </div>
              <div>
                <p className="font-medium" style={{ color: "var(--foreground)" }}>
                  Win Tokens
                </p>
                <p style={{ color: "var(--foreground-muted)" }}>
                  5% house fee, rest goes to winners
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("companies")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "companies"
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-white/5 text-zinc-400 hover:bg-white/10"
            }`}
          >
            <Building2 className="h-4 w-4" />
            Companies ({data?.companies.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("founders")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "founders"
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-white/5 text-zinc-400 hover:bg-white/10"
            }`}
          >
            <User className="h-4 w-4" />
            Founders ({data?.users.length || 0})
          </button>
        </div>

        {/* Targets List */}
        <div className="space-y-3">
          {activeTab === "companies" && (
            <>
              {data?.companies.length === 0 ? (
                <div
                  className="rounded-xl border p-12 text-center"
                  style={{
                    background: "var(--background-secondary)",
                    borderColor: "var(--card-border)",
                  }}
                >
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="font-medium" style={{ color: "var(--foreground)" }}>
                    No companies available
                  </p>
                  <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>
                    Companies need to connect Stripe and enable betting
                  </p>
                </div>
              ) : (
                data?.companies.map((company) => (
                  <Link
                    key={company.id}
                    href={`/betting/place?type=COMPANY&id=${company.id}&period=${selectedPeriod?.id || ""}`}
                    className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:bg-white/5"
                    style={{
                      background: "var(--background-secondary)",
                      borderColor: "var(--card-border)",
                    }}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 shrink-0">
                      {company.logo ? (
                        <Image
                          src={company.logo}
                          alt={company.name}
                          width={48}
                          height={48}
                          className="rounded-xl"
                        />
                      ) : (
                        <Building2 className="h-6 w-6 text-emerald-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" style={{ color: "var(--foreground)" }}>
                        {company.name}
                      </p>
                      <div className="flex items-center gap-3 text-sm" style={{ color: "var(--foreground-muted)" }}>
                        <span>{company.category.replace("_", "/")}</span>
                        <span>•</span>
                        <span>{formatRevenue(company.revenueRange)} ARR</span>
                        <span>•</span>
                        <span>{company.projectCount} projects</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex gap-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${DIRECTION_CONFIG.LONG.bgColor} ${DIRECTION_CONFIG.LONG.color}`}
                        >
                          <TrendingUp className="h-3 w-3" />
                          Long
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${DIRECTION_CONFIG.SHORT.bgColor} ${DIRECTION_CONFIG.SHORT.color}`}
                        >
                          <TrendingDown className="h-3 w-3" />
                          Short
                        </span>
                      </div>
                      <ChevronRight className="h-5 w-5" style={{ color: "var(--foreground-muted)" }} />
                    </div>
                  </Link>
                ))
              )}
            </>
          )}

          {activeTab === "founders" && (
            <>
              {data?.users.length === 0 ? (
                <div
                  className="rounded-xl border p-12 text-center"
                  style={{
                    background: "var(--background-secondary)",
                    borderColor: "var(--card-border)",
                  }}
                >
                  <User className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="font-medium" style={{ color: "var(--foreground)" }}>
                    No founders available
                  </p>
                  <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>
                    Founders need to enable betting in their settings
                  </p>
                </div>
              ) : (
                data?.users.map((user) => (
                  <Link
                    key={user.id}
                    href={`/betting/place?type=USER&id=${user.id}&period=${selectedPeriod?.id || ""}`}
                    className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:bg-white/5"
                    style={{
                      background: "var(--background-secondary)",
                      borderColor: "var(--card-border)",
                    }}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 shrink-0 overflow-hidden">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name || "User"}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      ) : (
                        <User className="h-6 w-6 text-purple-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" style={{ color: "var(--foreground)" }}>
                        {user.name || "Anonymous Builder"}
                      </p>
                      <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                        {user.companyCount} {user.companyCount === 1 ? "company" : "companies"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex gap-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${DIRECTION_CONFIG.LONG.bgColor} ${DIRECTION_CONFIG.LONG.color}`}
                        >
                          <TrendingUp className="h-3 w-3" />
                          Long
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${DIRECTION_CONFIG.SHORT.bgColor} ${DIRECTION_CONFIG.SHORT.color}`}
                        >
                          <TrendingDown className="h-3 w-3" />
                          Short
                        </span>
                      </div>
                      <ChevronRight className="h-5 w-5" style={{ color: "var(--foreground-muted)" }} />
                    </div>
                  </Link>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
