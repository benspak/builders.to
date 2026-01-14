"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Building2,
  User,
  Loader2,
  AlertCircle,
  ExternalLink,
  Check,
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  bettingEnabled: boolean;
  stripeConnected: boolean;
}

interface BettingSettingsData {
  userBettingEnabled: boolean;
  userStripeConnected: boolean;
  companies: Company[];
}

export function BettingSettings() {
  const [data, setData] = useState<BettingSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/betting/settings");
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch {
      console.error("Failed to fetch betting settings");
    } finally {
      setLoading(false);
    }
  };

  const toggleBetting = async (targetType: "USER" | "COMPANY", targetId?: string) => {
    if (!data) return;

    const key = targetType === "USER" ? "user" : targetId || "";
    setUpdating(key);
    setError(null);

    try {
      const currentValue = targetType === "USER"
        ? data.userBettingEnabled
        : data.companies.find((c) => c.id === targetId)?.bettingEnabled || false;

      const response = await fetch("/api/betting/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          bettingEnabled: !currentValue,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update settings");
      }

      // Update local state
      if (targetType === "USER") {
        setData({ ...data, userBettingEnabled: !currentValue });
      } else if (targetId) {
        setData({
          ...data,
          companies: data.companies.map((c) =>
            c.id === targetId ? { ...c, bettingEnabled: !currentValue } : c
          ),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div
        className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6 sm:p-8"
    >
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
        <TrendingUp className="h-5 w-5 text-emerald-500" />
        <div>
          <h2 className="text-lg font-semibold text-white">MRR Betting</h2>
          <p className="text-sm text-zinc-400">
            Allow others to bet on your MRR growth
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Founder Betting Toggle */}
      <div className="space-y-4">
        <div
          className="flex items-center justify-between p-4 rounded-xl"
          style={{ background: "rgba(255, 255, 255, 0.03)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
              <User className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="font-medium text-white">Your MRR</p>
              <p className="text-sm text-zinc-400">
                {data?.userStripeConnected || (data?.companies.some(c => c.stripeConnected))
                  ? "Allow bets on your portfolio MRR"
                  : "Connect Stripe to enable"}
              </p>
            </div>
          </div>

          <button
            onClick={() => toggleBetting("USER")}
            disabled={updating === "user" || (!data?.userStripeConnected && !data?.companies.some(c => c.stripeConnected))}
            className={`relative w-14 h-8 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              data?.userBettingEnabled
                ? "bg-emerald-500"
                : "bg-zinc-700"
            }`}
          >
            {updating === "user" ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              </div>
            ) : (
              <div
                className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                  data?.userBettingEnabled ? "translate-x-7" : "translate-x-1"
                }`}
              />
            )}
          </button>
        </div>

        {/* Company Betting Toggles */}
        {data?.companies && data.companies.length > 0 && (
          <>
            <div className="pt-4 border-t border-white/5">
              <p className="text-sm font-medium text-zinc-400 mb-3">Your Companies</p>
            </div>

            {data.companies.map((company) => (
              <div
                key={company.id}
                className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: "rgba(255, 255, 255, 0.03)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                    <Building2 className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{company.name}</p>
                    <p className="text-sm text-zinc-400">
                      {company.stripeConnected ? (
                        company.bettingEnabled ? (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <Check className="h-3 w-3" />
                            Betting enabled
                          </span>
                        ) : (
                          "Betting disabled"
                        )
                      ) : (
                        "Connect Stripe to enable"
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleBetting("COMPANY", company.id)}
                  disabled={updating === company.id || !company.stripeConnected}
                  className={`relative w-14 h-8 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    company.bettingEnabled
                      ? "bg-emerald-500"
                      : "bg-zinc-700"
                  }`}
                >
                  {updating === company.id ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    </div>
                  ) : (
                    <div
                      className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                        company.bettingEnabled ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  )}
                </button>
              </div>
            ))}
          </>
        )}

        {/* Info Box */}
        <div
          className="mt-6 p-4 rounded-xl"
          style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(20, 184, 166, 0.05))" }}
        >
          <p className="text-sm text-zinc-300 mb-2">
            <strong>How it works:</strong> When enabled, other users can bet tokens on whether your MRR will grow by a certain percentage each quarter. You don&apos;t win or lose anything - it&apos;s purely prediction-based.
          </p>
          <Link
            href="/betting"
            className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Explore betting markets
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
