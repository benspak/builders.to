"use client";

import { useState, useEffect } from "react";
import { Coins, Loader2, AlertCircle } from "lucide-react";

interface CheckoutButtonProps {
  adId: string;
  adTitle?: string;
  onSuccess?: () => void;
}

export function CheckoutButton({ adId, onSuccess }: CheckoutButtonProps) {
  const [costTokens, setCostTokens] = useState<number | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [pricingRes, balanceRes] = await Promise.all([
          fetch("/api/ads/pricing"),
          fetch("/api/tokens/balance"),
        ]);
        if (pricingRes.ok) {
          const data = await pricingRes.json();
          setCostTokens(data.costInTokens ?? 50);
        }
        if (balanceRes.ok) {
          const data = await balanceRes.json();
          setBalance(data.balance ?? 0);
        }
      } catch (err) {
        console.error("Failed to fetch pricing/balance:", err);
        setCostTokens(50);
        setBalance(0);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleActivate = async () => {
    setProcessing(true);
    setError(null);
    try {
      const res = await fetch(`/api/ads/${adId}/activate-with-tokens`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to activate ad");
      }

      onSuccess?.();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to activate");
      setProcessing(false);
    }
  };

  if (loading || costTokens === null || balance === null) {
    return (
      <div className="w-full h-10 bg-zinc-800 rounded-lg animate-pulse" />
    );
  }

  const canAfford = balance >= costTokens;

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <span className="text-sm text-red-400">{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-sm text-zinc-400">
          Your balance: <strong className="text-white">{balance} tokens</strong>
          {!canAfford && (
            <span className="text-amber-400 ml-2">
              (need {costTokens - balance} more)
            </span>
          )}
        </p>
        <button
          onClick={handleActivate}
          disabled={processing || !canAfford}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/20"
        >
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Activating...
            </>
          ) : (
            <>
              <Coins className="h-4 w-4" />
              Activate with {costTokens} tokens
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-center text-zinc-500">
        Pay with tokens (10 tokens = $1). Earn tokens by posting, referrals, streaks, and Pro.
      </p>
    </div>
  );
}
