"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Coins, Loader2, AlertCircle, ExternalLink } from "lucide-react";

const TOKENS_PER_DOLLAR = 10;

function centsToTokens(cents: number): number {
  return Math.round((cents / 100) * TOKENS_PER_DOLLAR);
}

interface OrderWithTokensProps {
  serviceId: string;
  priceInCents: number;
  serviceTitle: string;
  sellerName: string;
  sellerSlug: string | null;
}

export function OrderWithTokens({
  serviceId,
  priceInCents,
  serviceTitle,
  sellerName,
  sellerSlug,
}: OrderWithTokensProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [requirements, setRequirements] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const costTokens = centsToTokens(priceInCents);

  useEffect(() => {
    fetch("/api/tokens/balance")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setBalance(data?.balance ?? 0);
      })
      .catch(() => setBalance(0))
      .finally(() => setLoading(false));
  }, []);

  const canAfford = balance !== null && balance >= costTokens;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          requirements: requirements.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create order");
        setSubmitting(false);
        return;
      }
      window.location.href = `/orders/${data.orderId}`;
    } catch {
      setError("Failed to create order");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="card p-8 text-center">
        <div className="h-10 w-full max-w-xs mx-auto rounded-lg bg-zinc-800 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="card p-8">
      <div className="flex items-center gap-2 mb-4">
        <Coins className="h-5 w-5 text-amber-400" />
        <h3 className="text-lg font-semibold text-white">Order with tokens</h3>
      </div>
      <p className="text-sm text-zinc-400 mb-4">
        Pay {costTokens} tokens to request this service. Your balance: <strong className="text-white">{balance} tokens</strong>
        {!canAfford && (
          <span className="text-amber-400 ml-1">(need {costTokens - (balance ?? 0)} more)</span>
        )}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-zinc-300 mb-1">
            Your requirements (optional)
          </label>
          <textarea
            id="requirements"
            rows={3}
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="Describe what you need..."
            className="w-full rounded-lg border border-zinc-600 bg-zinc-800/50 px-3 py-2 text-sm text-white placeholder:text-zinc-500 resize-none"
            disabled={submitting}
          />
        </div>
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={submitting || !canAfford}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Coins className="h-4 w-4" />
            )}
            Order with {costTokens} tokens
          </button>
          {sellerSlug && (
            <Link
              href={`/${sellerSlug}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-600 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
            >
              View profile & contact
              <ExternalLink className="h-4 w-4" />
            </Link>
          )}
        </div>
      </form>
      <p className="text-xs text-zinc-500 mt-3">
        10 tokens = $1. Earn tokens by posting, referrals, streaks, and Pro.
      </p>
    </div>
  );
}
