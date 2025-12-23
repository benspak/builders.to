"use client";

import { useEffect, useState } from "react";
import { Eye, TrendingUp, Calendar, BarChart3 } from "lucide-react";

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
      <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-5 bg-zinc-700 rounded" />
          <div className="h-5 w-24 bg-zinc-700 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-zinc-800 rounded-xl" />
          <div className="h-20 bg-zinc-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 bg-gradient-to-r from-cyan-500/10 to-transparent">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-cyan-400" />
          <h3 className="font-semibold text-white">Site Views</h3>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Monthly Views */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 group-hover:border-orange-500/30 transition-colors">
              <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                <Calendar className="h-4 w-4" />
                <span>{stats.month}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white font-mono">
                  {formatNumber(stats.monthly)}
                </span>
                <span className="text-xs text-zinc-500">views</span>
              </div>
            </div>
          </div>

          {/* Yearly Views */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 group-hover:border-cyan-500/30 transition-colors">
              <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                <TrendingUp className="h-4 w-4" />
                <span>{stats.year}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white font-mono">
                  {formatNumber(stats.yearly)}
                </span>
                <span className="text-xs text-zinc-500">views</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Views Footer */}
        <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <Eye className="h-4 w-4" />
            <span>All time</span>
          </div>
          <span className="text-lg font-semibold text-zinc-300 font-mono">
            {formatNumber(stats.total)}
          </span>
        </div>
      </div>
    </div>
  );
}
