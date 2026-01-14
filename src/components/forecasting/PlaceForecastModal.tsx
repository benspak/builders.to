"use client";

import { useState, useEffect } from "react";
import {
  X,
  TrendingUp,
  TrendingDown,
  Coins,
  DollarSign,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";

interface PlaceForecastModalProps {
  target: {
    id: string;
    company: {
      name: string;
    };
    currentMrr: number | null;
    minForecastCoins: number;
    maxForecastCoins: number;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export function PlaceForecastModal({
  target,
  onClose,
  onSuccess,
}: PlaceForecastModalProps) {
  const [position, setPosition] = useState<"LONG" | "SHORT">("LONG");
  const [targetMrr, setTargetMrr] = useState<string>("");
  const [coinsStaked, setCoinsStaked] = useState<number>(target.minForecastCoins);
  const [userCoins, setUserCoins] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [fetchingCoins, setFetchingCoins] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch user's coin balance
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await fetch("/api/forecasting/coins");
        if (response.ok) {
          const data = await response.json();
          setUserCoins(data.coinBalance);
        }
      } catch (err) {
        console.error("Failed to fetch coins:", err);
      } finally {
        setFetchingCoins(false);
      }
    };
    fetchCoins();
  }, []);

  // Initialize target MRR based on current MRR
  useEffect(() => {
    if (target.currentMrr) {
      // Default to current MRR
      setTargetMrr((target.currentMrr / 100).toString());
    }
  }, [target.currentMrr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const targetMrrCents = Math.round(parseFloat(targetMrr) * 100);

    if (isNaN(targetMrrCents) || targetMrrCents < 0) {
      setError("Please enter a valid MRR target");
      return;
    }

    if (coinsStaked < target.minForecastCoins) {
      setError(`Minimum stake is ${target.minForecastCoins} coins`);
      return;
    }

    if (coinsStaked > target.maxForecastCoins) {
      setError(`Maximum stake is ${target.maxForecastCoins} coins`);
      return;
    }

    if (coinsStaked > userCoins) {
      setError("Insufficient coin balance");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/forecasting/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetId: target.id,
          position,
          targetMrr: targetMrrCents,
          coinsStaked,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to place forecast");
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place forecast");
    } finally {
      setLoading(false);
    }
  };

  const formatMrr = (mrr: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(mrr / 100);
  };

  const quarterEndDate = new Date();
  quarterEndDate.setDate(quarterEndDate.getDate() + 1);

  const potentialWin = coinsStaked * 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl border p-6"
        style={{
          background: "var(--background-secondary)",
          borderColor: "var(--card-border)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/5 transition-colors"
          style={{ color: "var(--foreground-muted)" }}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2
            className="text-xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            Place Forecast
          </h2>
          <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
            Predict {target.company.name}&apos;s MRR in 24 hours
          </p>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: "var(--foreground)" }}
            >
              Forecast Placed!
            </h3>
            <p style={{ color: "var(--foreground-muted)" }}>
              Good luck! Results in 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current MRR */}
            {target.currentMrr && (
              <div
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: "var(--background)" }}
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <span
                    className="text-sm"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    Current MRR
                  </span>
                </div>
                <span className="font-bold text-green-400">
                  {formatMrr(target.currentMrr)}
                </span>
              </div>
            )}

            {/* Position Selection */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--foreground)" }}
              >
                Your Position
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPosition("LONG")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                    position === "LONG"
                      ? "bg-green-500 text-white"
                      : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                  }`}
                >
                  <TrendingUp className="h-5 w-5" />
                  LONG
                </button>
                <button
                  type="button"
                  onClick={() => setPosition("SHORT")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                    position === "SHORT"
                      ? "bg-red-500 text-white"
                      : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  }`}
                >
                  <TrendingDown className="h-5 w-5" />
                  SHORT
                </button>
              </div>
              <p
                className="text-xs mt-2"
                style={{ color: "var(--foreground-muted)" }}
              >
                {position === "LONG"
                  ? "You win if MRR reaches or exceeds your target"
                  : "You win if MRR is below your target"}
              </p>
            </div>

            {/* Target MRR */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--foreground)" }}
              >
                Target MRR (in 24 hours)
              </label>
              <div className="relative">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-lg"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  $
                </span>
                <input
                  type="number"
                  value={targetMrr}
                  onChange={(e) => setTargetMrr(e.target.value)}
                  placeholder="10000"
                  min="0"
                  step="1"
                  className="w-full pl-8 pr-4 py-3 rounded-xl text-lg border"
                  style={{
                    background: "var(--background)",
                    borderColor: "var(--card-border)",
                    color: "var(--foreground)",
                  }}
                />
              </div>
            </div>

            {/* Coins to Stake */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  Coins to Stake
                </label>
                <div
                  className="flex items-center gap-1 text-sm"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  <Coins className="h-4 w-4 text-amber-400" />
                  {fetchingCoins ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <span>{userCoins} available</span>
                  )}
                </div>
              </div>
              <input
                type="range"
                value={coinsStaked}
                onChange={(e) => setCoinsStaked(parseInt(e.target.value))}
                min={target.minForecastCoins}
                max={Math.min(target.maxForecastCoins, userCoins)}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex items-center justify-between mt-2 text-sm">
                <span style={{ color: "var(--foreground-muted)" }}>
                  {target.minForecastCoins}
                </span>
                <span className="text-lg font-bold text-amber-400">
                  {coinsStaked} coins
                </span>
                <span style={{ color: "var(--foreground-muted)" }}>
                  {Math.min(target.maxForecastCoins, userCoins)}
                </span>
              </div>
            </div>

            {/* Potential Win */}
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: "var(--background)" }}
            >
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4" style={{ color: "var(--foreground-muted)" }} />
                <span
                  className="text-sm"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Potential win (2x)
                </span>
              </div>
              <span className="font-bold text-cyan-400">
                {potentialWin} coins
              </span>
            </div>

            {/* Resolution Date */}
            <div
              className="flex items-center gap-2 text-sm"
              style={{ color: "var(--foreground-muted)" }}
            >
              <Calendar className="h-4 w-4" />
              <span>
                Resolves on{" "}
                {quarterEndDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || fetchingCoins || coinsStaked > userCoins}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Placing Forecast...
                </>
              ) : (
                <>
                  {position === "LONG" ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  Place {position} Forecast
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
