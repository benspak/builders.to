"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  Loader2,
  AlertCircle,
  Clock,
  TrendingUp,
  Wallet,
  ExternalLink,
  CheckCircle,
  XCircle,
  Info,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RewardInfo {
  id: string;
  type: "BASE_POST" | "ENGAGEMENT_BONUS";
  amount: number;
  status: "PENDING" | "PROCESSING" | "PAID" | "FAILED" | "CANCELLED";
  createdAt: string;
  dailyUpdateId: string;
}

interface EarningsData {
  earnings: {
    pendingAmount: number;
    lifetimeEarnings: number;
    earnedToday: boolean;
    lastPayoutAt: string | null;
    isPaused: boolean;
    isFlagged: boolean;
  };
  settings: {
    baseRewardCents: number;
    maxBonusCents: number;
    minCharCount: number;
    maxPostsPerDay: number;
    minPayoutCents: number;
  };
  recentRewards: RewardInfo[];
  totalRewards: number;
  eligibility: {
    canEarnToday: boolean;
    reason?: string;
  };
}

interface PayoutInfo {
  id: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "PAID" | "FAILED" | "CANCELLED";
  createdAt: string;
  completedAt: string | null;
  stripeTransferId: string | null;
}

interface StripeConnectStatus {
  hasStripeConnect: boolean;
  isOnboarded: boolean;
}

export function EarningsDashboard() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [payouts, setPayouts] = useState<PayoutInfo[]>([]);
  const [connectStatus, setConnectStatus] = useState<StripeConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestingPayout, setRequestingPayout] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch earnings data
  useEffect(() => {
    async function fetchData() {
      try {
        const [earningsRes, payoutsRes, connectRes] = await Promise.all([
          fetch("/api/rewards"),
          fetch("/api/rewards/payouts?limit=5"),
          fetch("/api/stripe-connect/onboard"),
        ]);

        if (earningsRes.ok) {
          const earningsData = await earningsRes.json();
          setData(earningsData);
        }

        if (payoutsRes.ok) {
          const payoutsData = await payoutsRes.json();
          setPayouts(payoutsData.payouts || []);
        }

        if (connectRes.ok) {
          const connectData = await connectRes.json();
          setConnectStatus({
            hasStripeConnect: !!connectData.accountId,
            isOnboarded: connectData.isOnboarded || false,
          });
        }
      } catch (err) {
        console.error("Failed to fetch earnings data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleRequestPayout = async () => {
    setRequestingPayout(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/rewards/payouts", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to request payout");
      }

      setSuccessMessage(result.message);

      // Refresh data
      const [earningsRes, payoutsRes] = await Promise.all([
        fetch("/api/rewards"),
        fetch("/api/rewards/payouts?limit=5"),
      ]);

      if (earningsRes.ok) {
        setData(await earningsRes.json());
      }
      if (payoutsRes.ok) {
        const payoutsData = await payoutsRes.json();
        setPayouts(payoutsData.payouts || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request payout");
    } finally {
      setRequestingPayout(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
        </div>
      </div>
    );
  }

  // Show setup prompt if Stripe Connect not configured
  if (!connectStatus?.hasStripeConnect || !connectStatus?.isOnboarded) {
    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-b border-white/5 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg shadow-emerald-500/25">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Creator Rewards</h2>
              <p className="text-zinc-400 text-sm">
                Earn money for posting on Builders.to
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="p-4 rounded-xl bg-zinc-800/50 border border-white/5 mb-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-zinc-300 mb-2">
                  Pro members can earn <strong className="text-white">$0.05-$0.07</strong> per qualifying post.
                </p>
                <p className="text-sm text-zinc-400">
                  To start earning, you need to set up Stripe Connect to receive payouts.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/api/stripe-connect/onboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-400 transition-colors"
          >
            <Wallet className="h-4 w-4" />
            Set Up Payouts
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const pendingAmount = data?.earnings.pendingAmount ?? 0;
  const lifetimeEarnings = data?.earnings.lifetimeEarnings ?? 0;
  const minPayoutCents = data?.settings.minPayoutCents ?? 500;
  const canRequestPayout = pendingAmount >= minPayoutCents;

  return (
    <div className="space-y-6">
      {/* Main Earnings Card */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-b border-white/5 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg shadow-emerald-500/25">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Creator Rewards</h2>
              <p className="text-zinc-400 text-sm">
                {data?.eligibility.canEarnToday
                  ? "You can earn from posting today!"
                  : data?.eligibility.reason || "Keep posting to earn"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-sm text-emerald-400">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              {successMessage}
            </div>
          )}

          {/* Paused/Flagged Warning */}
          {data?.earnings.isPaused && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-sm text-amber-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              Your rewards are currently paused. Please contact support.
            </div>
          )}

          {data?.earnings.isFlagged && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              Your account is under review. Rewards are temporarily suspended.
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Pending Balance */}
            <div className="p-4 rounded-xl bg-zinc-800/50 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-zinc-400">Pending Balance</span>
              </div>
              <p className="text-2xl font-bold text-white">
                ${(pendingAmount / 100).toFixed(2)}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Min payout: ${(minPayoutCents / 100).toFixed(2)}
              </p>
            </div>

            {/* Lifetime Earnings */}
            <div className="p-4 rounded-xl bg-zinc-800/50 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                <span className="text-sm text-zinc-400">Lifetime Earnings</span>
              </div>
              <p className="text-2xl font-bold text-white">
                ${(lifetimeEarnings / 100).toFixed(2)}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Total earned all-time
              </p>
            </div>
          </div>

          {/* Payout Button */}
          {canRequestPayout && !data?.earnings.isPaused && !data?.earnings.isFlagged && (
            <button
              onClick={handleRequestPayout}
              disabled={requestingPayout}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl",
                "bg-gradient-to-r from-emerald-500 to-cyan-500",
                "text-white font-medium",
                "hover:from-emerald-400 hover:to-cyan-400",
                "transition-all",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {requestingPayout ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <DollarSign className="h-5 w-5" />
                  Request Payout (${(pendingAmount / 100).toFixed(2)})
                </>
              )}
            </button>
          )}

          {!canRequestPayout && pendingAmount > 0 && (
            <div className="text-center text-sm text-zinc-500">
              Earn ${((minPayoutCents - pendingAmount) / 100).toFixed(2)} more to request a payout
            </div>
          )}

          {/* How it Works */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              How Rewards Work
            </h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  Earn <strong className="text-white">$0.05</strong> for each qualifying post
                  ({data?.settings.minCharCount}+ characters, unique content)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  Bonus <strong className="text-white">up to $0.02</strong> based on engagement
                  (likes on your post)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  Maximum <strong className="text-white">1 rewarded post per day</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  Automatic payout at <strong className="text-white">${(minPayoutCents / 100).toFixed(2)}</strong> balance
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {(data?.recentRewards.length ?? 0) > 0 && (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Rewards</h3>
          <div className="space-y-3">
            {data?.recentRewards.map((reward) => (
              <div
                key={reward.id}
                className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center",
                      reward.type === "BASE_POST"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-cyan-500/20 text-cyan-400"
                    )}
                  >
                    {reward.type === "BASE_POST" ? (
                      <DollarSign className="h-4 w-4" />
                    ) : (
                      <TrendingUp className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-white">
                      {reward.type === "BASE_POST" ? "Post Reward" : "Engagement Bonus"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(reward.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    +${(reward.amount / 100).toFixed(2)}
                  </p>
                  <p
                    className={cn(
                      "text-xs",
                      reward.status === "PAID"
                        ? "text-emerald-400"
                        : reward.status === "PENDING"
                          ? "text-amber-400"
                          : "text-zinc-500"
                    )}
                  >
                    {reward.status.toLowerCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {(data?.totalRewards ?? 0) > 10 && (
            <Link
              href="/settings/rewards/history"
              className="mt-4 inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              View all rewards
              <ExternalLink className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}

      {/* Recent Payouts */}
      {payouts.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Payout History</h3>
          <div className="space-y-3">
            {payouts.map((payout) => (
              <div
                key={payout.id}
                className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center",
                      payout.status === "PAID"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : payout.status === "FAILED"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-amber-500/20 text-amber-400"
                    )}
                  >
                    {payout.status === "PAID" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : payout.status === "FAILED" ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-white">Payout</p>
                    <p className="text-xs text-zinc-500">
                      {new Date(payout.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    ${(payout.amount / 100).toFixed(2)}
                  </p>
                  <p
                    className={cn(
                      "text-xs",
                      payout.status === "PAID"
                        ? "text-emerald-400"
                        : payout.status === "FAILED"
                          ? "text-red-400"
                          : "text-amber-400"
                    )}
                  >
                    {payout.status.toLowerCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
