"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Info,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  calculateHouseFee,
  calculateNetStake,
  validateBet,
  getQuarterDisplayName,
  formatTokens,
  formatPercentage,
  PERCENTAGE_PRESETS,
  MIN_BET_TOKENS,
  MAX_BET_TOKENS,
  HOUSE_FEE_PERCENTAGE,
  DIRECTION_CONFIG,
} from "@/lib/betting";

interface TargetInfo {
  id: string;
  name: string;
  slug?: string | null;
  logo?: string | null;
  image?: string | null;
  category?: string;
  revenueRange?: string | null;
  targetType: "COMPANY" | "USER";
  bettingEnabled?: boolean;
  stripeConnected?: boolean;
}

interface Period {
  id: string;
  quarter: string;
  startsAt: string;
  endsAt: string;
  status: string;
  isOpen: boolean;
}

interface TargetData {
  target: TargetInfo;
  isOwner: boolean;
  periods: Period[];
  stats: {
    totalBets: number;
    totalStaked: number;
    activeBets: number;
  };
}

function PlaceBetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetType = searchParams.get("type") as "COMPANY" | "USER" || "COMPANY";
  const targetId = searchParams.get("id");
  const periodId = searchParams.get("period");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [targetData, setTargetData] = useState<TargetData | null>(null);
  const [tokenBalance, setTokenBalance] = useState(0);

  const [direction, setDirection] = useState<"LONG" | "SHORT">("LONG");
  const [targetPercentage, setTargetPercentage] = useState(10);
  const [stakeTokens, setStakeTokens] = useState(100);
  const [customPercentage, setCustomPercentage] = useState("");

  useEffect(() => {
    if (targetId) {
      fetchTargetData();
      fetchBalance();
    }
  }, [targetId, targetType]);

  const fetchTargetData = async () => {
    try {
      const response = await fetch(`/api/betting/target/${targetId}?type=${targetType}`);
      if (response.ok) {
        const data = await response.json();
        setTargetData(data);
      } else {
        setError("Failed to load target information");
      }
    } catch {
      setError("Failed to load target information");
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await fetch("/api/tokens");
      if (response.ok) {
        const data = await response.json();
        setTokenBalance(data.balance);
      }
    } catch {
      console.error("Failed to fetch balance");
    }
  };

  const houseFee = calculateHouseFee(stakeTokens);
  const netStake = calculateNetStake(stakeTokens);
  const validation = validateBet({
    stakeTokens,
    targetPercentage,
    userBalance: tokenBalance,
  });

  const handlePercentagePreset = (preset: number) => {
    setTargetPercentage(preset);
    setCustomPercentage("");
  };

  const handleCustomPercentage = (value: string) => {
    setCustomPercentage(value);
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setTargetPercentage(num);
    }
  };

  const handleSubmit = async () => {
    if (!validation.valid || !targetData || !periodId) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/betting/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          periodId,
          direction,
          targetPercentage,
          stakeTokens,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to place bet");
      }

      setSuccess(true);
      setTokenBalance(data.newBalance);

      // Redirect after success
      setTimeout(() => {
        router.push("/betting/my-bets");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place bet");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!targetData || !targetId) {
    return (
      <div className="py-8">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
            Target Not Found
          </h2>
          <p className="mb-4" style={{ color: "var(--foreground-muted)" }}>
            The betting target could not be found.
          </p>
          <Link
            href="/betting"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-zinc-900 font-medium hover:bg-emerald-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Betting
          </Link>
        </div>
      </div>
    );
  }

  const selectedPeriod = targetData.periods.find((p) => p.id === periodId) || targetData.periods[0];

  if (success) {
    return (
      <div className="py-8">
        <div className="mx-auto max-w-2xl px-4">
          <div
            className="rounded-xl border p-8 text-center"
            style={{
              background: "var(--background-secondary)",
              borderColor: "var(--card-border)",
            }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 mx-auto mb-4">
              <Check className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
              Bet Placed Successfully!
            </h2>
            <p className="mb-4" style={{ color: "var(--foreground-muted)" }}>
              {direction === "LONG" ? "Going long" : "Going short"} on{" "}
              {formatPercentage(targetPercentage)} MRR growth
            </p>
            <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
              Redirecting to your bets...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/betting"
            className="inline-flex items-center gap-2 text-sm mb-4 transition-colors"
            style={{ color: "var(--foreground-muted)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to targets
          </Link>

          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Place a Bet
          </h1>
        </div>

        {/* Target Info */}
        <div
          className="rounded-xl border p-4 mb-6"
          style={{
            background: "var(--background-secondary)",
            borderColor: "var(--card-border)",
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-xl shrink-0 ${
                targetType === "COMPANY"
                  ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20"
                  : "bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full"
              }`}
            >
              {targetData.target.logo || targetData.target.image ? (
                <Image
                  src={targetData.target.logo || targetData.target.image || ""}
                  alt={targetData.target.name}
                  width={56}
                  height={56}
                  className={targetType === "COMPANY" ? "rounded-xl" : "rounded-full"}
                />
              ) : targetType === "COMPANY" ? (
                <Building2 className="h-7 w-7 text-emerald-400" />
              ) : (
                <User className="h-7 w-7 text-purple-400" />
              )}
            </div>

            <div className="flex-1">
              <p className="font-semibold text-lg" style={{ color: "var(--foreground)" }}>
                {targetData.target.name}
              </p>
              <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                {targetType === "COMPANY" ? "Company" : "Founder"} • {getQuarterDisplayName(selectedPeriod.quarter)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                Active bets
              </p>
              <p className="font-semibold text-emerald-400">
                {targetData.stats.activeBets}
              </p>
            </div>
          </div>
        </div>

        {/* Direction Selector */}
        <div
          className="rounded-xl border p-6 mb-6"
          style={{
            background: "var(--background-secondary)",
            borderColor: "var(--card-border)",
          }}
        >
          <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>
            Bet Direction
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setDirection("LONG")}
              className={`flex flex-col items-center p-4 rounded-xl border transition-all ${
                direction === "LONG"
                  ? "border-green-500/50 bg-green-500/10 ring-1 ring-green-500/30"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <TrendingUp className={`h-8 w-8 mb-2 ${direction === "LONG" ? "text-green-400" : "text-zinc-400"}`} />
              <span className="font-medium" style={{ color: "var(--foreground)" }}>
                Long
              </span>
              <span className="text-xs text-center mt-1" style={{ color: "var(--foreground-muted)" }}>
                MRR grows ≥ target %
              </span>
            </button>

            <button
              onClick={() => setDirection("SHORT")}
              className={`flex flex-col items-center p-4 rounded-xl border transition-all ${
                direction === "SHORT"
                  ? "border-red-500/50 bg-red-500/10 ring-1 ring-red-500/30"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <TrendingDown className={`h-8 w-8 mb-2 ${direction === "SHORT" ? "text-red-400" : "text-zinc-400"}`} />
              <span className="font-medium" style={{ color: "var(--foreground)" }}>
                Short
              </span>
              <span className="text-xs text-center mt-1" style={{ color: "var(--foreground-muted)" }}>
                MRR grows &lt; target %
              </span>
            </button>
          </div>
        </div>

        {/* Target Percentage */}
        <div
          className="rounded-xl border p-6 mb-6"
          style={{
            background: "var(--background-secondary)",
            borderColor: "var(--card-border)",
          }}
        >
          <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>
            Target Growth %
          </h3>

          <div className="flex flex-wrap gap-2 mb-4">
            {PERCENTAGE_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => handlePercentagePreset(preset)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  targetPercentage === preset && !customPercentage
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-white/5 text-zinc-400 hover:bg-white/10"
                }`}
              >
                {formatPercentage(preset)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm" style={{ color: "var(--foreground-muted)" }}>
              Custom:
            </label>
            <div className="relative flex-1">
              <input
                type="number"
                value={customPercentage}
                onChange={(e) => handleCustomPercentage(e.target.value)}
                placeholder="Enter %"
                className="w-full px-4 py-2 rounded-lg border bg-transparent text-right pr-8"
                style={{
                  borderColor: "var(--card-border)",
                  color: "var(--foreground)",
                }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--foreground-muted)" }}>
                %
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-white/5 flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "var(--foreground-muted)" }} />
            <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
              {direction === "LONG" ? (
                <>
                  You win if MRR grows by <span className="text-emerald-400 font-medium">{formatPercentage(targetPercentage)}</span> or more
                </>
              ) : (
                <>
                  You win if MRR grows by less than <span className="text-red-400 font-medium">{formatPercentage(targetPercentage)}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Stake Amount */}
        <div
          className="rounded-xl border p-6 mb-6"
          style={{
            background: "var(--background-secondary)",
            borderColor: "var(--card-border)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: "var(--foreground)" }}>
              Stake Amount
            </h3>
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground-muted)" }}>
              <Coins className="h-4 w-4 text-amber-400" />
              Balance: {formatTokens(tokenBalance)}
            </div>
          </div>

          <div className="relative mb-4">
            <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-400" />
            <input
              type="number"
              value={stakeTokens}
              onChange={(e) => setStakeTokens(Math.max(0, parseInt(e.target.value) || 0))}
              min={MIN_BET_TOKENS}
              max={Math.min(MAX_BET_TOKENS, tokenBalance)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border bg-transparent text-lg font-medium"
              style={{
                borderColor: "var(--card-border)",
                color: "var(--foreground)",
              }}
            />
          </div>

          <div className="flex gap-2 mb-4">
            {[100, 250, 500, 1000].map((amount) => (
              <button
                key={amount}
                onClick={() => setStakeTokens(Math.min(amount, tokenBalance))}
                disabled={amount > tokenBalance}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: "var(--foreground-muted)" }}
              >
                {amount}
              </button>
            ))}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between" style={{ color: "var(--foreground-muted)" }}>
              <span>House Fee ({HOUSE_FEE_PERCENTAGE * 100}%)</span>
              <span className="text-amber-400">-{formatTokens(houseFee)}</span>
            </div>
            <div className="flex justify-between font-medium" style={{ color: "var(--foreground)" }}>
              <span>Net Stake</span>
              <span className="text-emerald-400">{formatTokens(netStake)}</span>
            </div>
          </div>
        </div>

        {/* Error */}
        {(error || !validation.valid) && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <p className="text-sm text-red-400">
              {error || validation.error}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!validation.valid || submitting || !periodId}
          className="w-full py-4 rounded-xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: validation.valid
              ? direction === "LONG"
                ? "linear-gradient(135deg, #10b981, #14b8a6)"
                : "linear-gradient(135deg, #ef4444, #f97316)"
              : "var(--background-secondary)",
            color: validation.valid ? "#0a0a0a" : "var(--foreground-muted)",
          }}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Placing Bet...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {direction === "LONG" ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              Place {direction} Bet • {formatTokens(stakeTokens)} Tokens
            </span>
          )}
        </button>

        <p className="text-center text-xs mt-4" style={{ color: "var(--foreground-muted)" }}>
          Bets are final and cannot be cancelled. Winners share the pool at quarter end.
        </p>
      </div>
    </div>
  );
}

export default function PlaceBetPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    }>
      <PlaceBetContent />
    </Suspense>
  );
}
