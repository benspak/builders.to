"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

interface ViewStats {
  monthly: number;
  month: string;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toLocaleString();
}

export function MonthlyViewsCounter() {
  const [stats, setStats] = useState<ViewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/site-views");
        if (response.ok) {
          const data = await response.json();
          setStats({ monthly: data.monthly, month: data.month });
        }
      } catch (error) {
        console.error("Failed to fetch site views:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-2 text-sm text-zinc-500">
        <div className="h-3.5 w-3.5 rounded bg-zinc-700 animate-pulse" />
        <span className="h-4 w-16 bg-zinc-700 rounded animate-pulse" />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2 py-2 text-sm text-zinc-400">
      <Eye className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
      <span>
        <span className="font-medium text-zinc-300 font-mono">
          {formatNumber(stats.monthly)}
        </span>
        <span className="ml-1">views this month</span>
      </span>
    </div>
  );
}
