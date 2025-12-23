"use client";

import { useEffect, useState } from "react";
import { Eye, TrendingUp, Calendar } from "lucide-react";

interface ViewStats {
  monthly: number;
  yearly: number;
  total: number;
  month: string;
  year: number;
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

export function SiteViewsCounter() {
  const [stats, setStats] = useState<ViewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/site-views");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
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
      <div className="rounded-xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm px-4 py-3 animate-pulse">
        <div className="flex items-center justify-center gap-6">
          <div className="h-4 w-24 bg-zinc-700 rounded" />
          <div className="h-4 w-24 bg-zinc-700 rounded" />
          <div className="h-4 w-24 bg-zinc-700 rounded" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm px-4 py-3">
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm">
        {/* Monthly Views */}
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-orange-400" />
          <span className="text-zinc-400">{stats.month}:</span>
          <span className="font-semibold text-white font-mono">
            {formatNumber(stats.monthly)}
          </span>
        </div>

        <div className="hidden sm:block w-px h-4 bg-zinc-700" />

        {/* Yearly Views */}
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-zinc-400">{stats.year}:</span>
          <span className="font-semibold text-white font-mono">
            {formatNumber(stats.yearly)}
          </span>
        </div>

        <div className="hidden sm:block w-px h-4 bg-zinc-700" />

        {/* Total Views */}
        <div className="flex items-center gap-2">
          <Eye className="h-3.5 w-3.5 text-zinc-400" />
          <span className="text-zinc-400">All time:</span>
          <span className="font-semibold text-white font-mono">
            {formatNumber(stats.total)}
          </span>
        </div>
      </div>
    </div>
  );
}
