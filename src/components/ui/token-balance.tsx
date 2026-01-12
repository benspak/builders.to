"use client";

import { useState, useEffect } from "react";
import { Coins, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TokenBalanceProps {
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

interface TokenData {
  balance: number;
  dollarValue: number;
}

export function TokenBalance({
  className,
  showDetails = false,
  compact = false
}: TokenBalanceProps) {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch("/api/tokens");
        if (response.ok) {
          const data = await response.json();
          setTokenData(data);
        }
      } catch (error) {
        console.error("Failed to fetch token balance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  if (loading) {
    return (
      <div className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-lg animate-pulse",
        "bg-amber-500/10",
        className
      )}>
        <Coins className="h-3.5 w-3.5 text-amber-400" />
        <span className="text-xs font-medium text-amber-400">...</span>
      </div>
    );
  }

  if (!tokenData) {
    return null;
  }

  if (compact) {
    return (
      <Link
        href="/tokens"
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all",
          "bg-amber-500/10 hover:bg-amber-500/20",
          "border border-amber-500/20 hover:border-amber-500/40",
          className
        )}
        title={`${tokenData.balance} tokens ($${tokenData.dollarValue.toFixed(2)} value)`}
      >
        <Coins className="h-3.5 w-3.5 text-amber-400" />
        <span className="text-xs font-semibold text-amber-400">
          {tokenData.balance}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/tokens"
      className={cn(
        "group flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all",
        "bg-amber-500/10 hover:bg-amber-500/15",
        "border border-amber-500/20 hover:border-amber-500/40",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/20">
          <Coins className="h-3.5 w-3.5 text-amber-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-amber-400">
            {tokenData.balance} tokens
          </span>
          {showDetails && (
            <span className="text-xs text-amber-400/60">
              ${tokenData.dollarValue.toFixed(2)} value
            </span>
          )}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-amber-400/40 group-hover:text-amber-400/60 transition-colors" />
    </Link>
  );
}

/**
 * Inline token display for use in text
 */
export function TokenAmount({ amount, className }: { amount: number; className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-1.5 py-0.5 rounded",
      "bg-amber-500/10 text-amber-400",
      className
    )}>
      <Coins className="h-3 w-3" />
      <span className="text-xs font-semibold">{amount}</span>
    </span>
  );
}
