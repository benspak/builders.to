"use client";

import { useState } from "react";
import { Gift, X, Loader2, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

interface GiftTokensButtonProps {
  recipientUserId: string;
  recipientName: string;
  profileSlug: string | null;
  className?: string;
}

export function GiftTokensButton({
  recipientUserId,
  recipientName,
  profileSlug,
  className,
}: GiftTokensButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  const openModal = () => {
    setError(null);
    setAmount("");
    setIsOpen(true);
    fetch("/api/tokens/balance")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => data && setBalance(data.balance ?? 0))
      .catch(() => setBalance(0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(amount, 10);
    if (!Number.isInteger(num) || num < 1) {
      setError("Enter a positive number of tokens");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tokens/gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientUserId, amount: num }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send gift");
        setLoading(false);
        return;
      }
      const slug = profileSlug || recipientUserId;
      window.location.href = `/${slug}?gift=success&tokens=${num}`;
    } catch {
      setError("Failed to send gift");
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/20 transition-all backdrop-blur-sm",
          className
        )}
      >
        <Gift className="h-4 w-4" />
        Gift tokens
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => !loading && setIsOpen(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Gift className="h-5 w-5 text-amber-400" />
                Gift tokens
              </h3>
              <button
                type="button"
                onClick={() => !loading && setIsOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-zinc-400 mb-4">
              Send tokens to <span className="text-white">{recipientName}</span>. They can use them for ads, services, or gift others.
            </p>
            {balance !== null && (
              <p className="text-xs text-zinc-500 mb-3">
                Your balance: <strong className="text-zinc-300">{balance} tokens</strong>
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="gift-amount" className="block text-sm font-medium text-zinc-300 mb-1">
                  Amount
                </label>
                <input
                  id="gift-amount"
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="e.g. 10"
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-white placeholder:text-zinc-500"
                  disabled={loading}
                />
              </div>
              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => !loading && setIsOpen(false)}
                  className="flex-1 rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !amount.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Coins className="h-4 w-4" />
                  )}
                  Send
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}
