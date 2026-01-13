"use client";

import { useState, useEffect } from "react";
import { Eye, Users, TrendingUp, Calendar, Loader2, MousePointer, Percent } from "lucide-react";

interface AnalyticsData {
  totalViews: number;
  totalClicks: number;
  ctr: number;
  uniqueVisitors: number;
  todayViews: number;
  todayClicks: number;
  dailyViews: Array<{ date: string; views: number; clicks: number }>;
  adPeriod: {
    startDate: string | null;
    endDate: string | null;
  };
}

interface AdAnalyticsProps {
  adId: string;
}

export function AdAnalytics({ adId }: AdAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [adId]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/ads/${adId}/views`);
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to fetch analytics");
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const maxViews = Math.max(...data.dailyViews.map(d => d.views), 1);
  const maxClicks = Math.max(...data.dailyViews.map(d => d.clicks), 1);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Eye className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Total Views</p>
              <p className="text-xl font-bold text-white">{data.totalViews.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Unique Visitors</p>
              <p className="text-xl font-bold text-white">{data.uniqueVisitors.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <TrendingUp className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Today</p>
              <p className="text-xl font-bold text-white">{data.todayViews.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <MousePointer className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Total Clicks</p>
              <p className="text-xl font-bold text-white">{data.totalClicks.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10">
              <Percent className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">CTR</p>
              <p className="text-xl font-bold text-white">{data.ctr}%</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
              <MousePointer className="h-5 w-5 text-cyan-500" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Today Clicks</p>
              <p className="text-xl font-bold text-white">{data.todayClicks.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ad Period */}
      {data.adPeriod.startDate && data.adPeriod.endDate && (
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Calendar className="h-4 w-4" />
          <span>
            Running from {new Date(data.adPeriod.startDate).toLocaleDateString()} to {new Date(data.adPeriod.endDate).toLocaleDateString()}
          </span>
        </div>
      )}

      {/* Daily Views & Clicks Chart */}
      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white">Views & Clicks Over Time</h3>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-gradient-to-t from-emerald-500 to-teal-500" />
              <span className="text-zinc-400">Views</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-gradient-to-t from-purple-500 to-pink-500" />
              <span className="text-zinc-400">Clicks</span>
            </div>
          </div>
        </div>

        {data.dailyViews.length > 0 ? (
          <div className="space-y-2">
            {/* Dual bar chart */}
            <div className="flex items-end gap-1 h-32">
              {data.dailyViews.slice(-14).map((day, i) => {
                const viewHeight = maxViews > 0 ? (day.views / maxViews) * 100 : 0;
                const clickHeight = maxClicks > 0 ? (day.clicks / maxClicks) * 100 : 0;
                const dayCtr = day.views > 0 ? ((day.clicks / day.views) * 100).toFixed(1) : '0';
                return (
                  <div
                    key={i}
                    className="flex-1 group relative flex gap-0.5"
                  >
                    {/* Views bar */}
                    <div
                      className="flex-1 bg-gradient-to-t from-emerald-500 to-teal-500 rounded-t transition-all hover:from-emerald-400 hover:to-teal-400"
                      style={{ height: `${Math.max(viewHeight, day.views > 0 ? 4 : 0)}%` }}
                    />
                    {/* Clicks bar */}
                    <div
                      className="flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t transition-all hover:from-purple-400 hover:to-pink-400"
                      style={{ height: `${Math.max(clickHeight, day.clicks > 0 ? 4 : 0)}%` }}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5 text-xs bg-zinc-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                      <div className="text-zinc-500 mb-1">{new Date(day.date).toLocaleDateString()}</div>
                      <div className="flex items-center gap-1">
                        <span className="text-emerald-400 font-medium">{day.views}</span>
                        <span className="text-zinc-500">views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-purple-400 font-medium">{day.clicks}</span>
                        <span className="text-zinc-500">clicks</span>
                      </div>
                      <div className="flex items-center gap-1 border-t border-zinc-700 mt-1 pt-1">
                        <span className="text-rose-400 font-medium">{dayCtr}%</span>
                        <span className="text-zinc-500">CTR</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between text-xs text-zinc-500 pt-2">
              <span>
                {data.dailyViews.length > 0
                  ? new Date(data.dailyViews[Math.max(0, data.dailyViews.length - 14)].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                  : ''}
              </span>
              <span>
                {data.dailyViews.length > 0
                  ? new Date(data.dailyViews[data.dailyViews.length - 1].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                  : ''}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-zinc-500 text-sm">
            No data yet
          </div>
        )}
      </div>
    </div>
  );
}
