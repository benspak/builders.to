"use client";

import { useState, useEffect } from "react";
import { Eye, MousePointer, TrendingUp } from "lucide-react";

interface ViewStats {
  views: number;
  clicks?: number;
  uniqueViewers?: number;
  ctr?: number;
}

type EntityType = "project" | "update" | "listing";

interface ViewStatsDisplayProps {
  entityType: EntityType;
  entitySlug: string;
  showCtr?: boolean;
  className?: string;
  compact?: boolean;
}

const apiPaths: Record<EntityType, string> = {
  project: "/api/projects",
  update: "/api/updates",
  listing: "/api/local-listings",
};

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function ViewStatsDisplay({
  entityType,
  entitySlug,
  showCtr = true,
  className = "",
  compact = false,
}: ViewStatsDisplayProps) {
  const [stats, setStats] = useState<ViewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const basePath = apiPaths[entityType];
        const response = await fetch(`${basePath}/${entitySlug}/views`);

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.debug("Failed to fetch view stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [entityType, entitySlug]);

  if (loading) {
    return (
      <div className={`flex items-center gap-3 text-gray-400 ${className}`}>
        <div className="animate-pulse flex items-center gap-1">
          <div className="h-4 w-4 bg-gray-600 rounded" />
          <div className="h-4 w-8 bg-gray-600 rounded" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-3 text-sm text-gray-400 ${className}`}>
        <span className="flex items-center gap-1" title="Views">
          <Eye className="h-3.5 w-3.5" />
          {formatNumber(stats.views)}
        </span>
        {showCtr && stats.clicks !== undefined && (
          <span className="flex items-center gap-1" title="Clicks">
            <MousePointer className="h-3.5 w-3.5" />
            {formatNumber(stats.clicks)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-4 text-sm ${className}`}>
      <div className="flex items-center gap-1.5 text-gray-400" title="Total Views">
        <Eye className="h-4 w-4" />
        <span>
          <span className="font-medium text-gray-200">{formatNumber(stats.views)}</span>
          <span className="ml-1">views</span>
        </span>
      </div>

      {showCtr && stats.clicks !== undefined && (
        <>
          <div className="flex items-center gap-1.5 text-gray-400" title="Total Clicks">
            <MousePointer className="h-4 w-4" />
            <span>
              <span className="font-medium text-gray-200">{formatNumber(stats.clicks)}</span>
              <span className="ml-1">clicks</span>
            </span>
          </div>

          {stats.ctr !== undefined && stats.views > 0 && (
            <div className="flex items-center gap-1.5 text-gray-400" title="Click-Through Rate">
              <TrendingUp className="h-4 w-4" />
              <span>
                <span className="font-medium text-gray-200">{stats.ctr}%</span>
                <span className="ml-1">CTR</span>
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Static version that doesn't require client-side fetching (for SSR)
interface StaticViewStatsProps {
  views: number;
  clicks?: number;
  showCtr?: boolean;
  className?: string;
  compact?: boolean;
}

export function StaticViewStats({
  views,
  clicks,
  showCtr = true,
  className = "",
  compact = false,
}: StaticViewStatsProps) {
  const ctr = views > 0 && clicks !== undefined ? (clicks / views) * 100 : 0;

  if (compact) {
    return (
      <div className={`flex items-center gap-3 text-sm text-gray-400 ${className}`}>
        <span className="flex items-center gap-1" title="Views">
          <Eye className="h-3.5 w-3.5" />
          {formatNumber(views)}
        </span>
        {showCtr && clicks !== undefined && (
          <span className="flex items-center gap-1" title="Clicks">
            <MousePointer className="h-3.5 w-3.5" />
            {formatNumber(clicks)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-4 text-sm ${className}`}>
      <div className="flex items-center gap-1.5 text-gray-400" title="Total Views">
        <Eye className="h-4 w-4" />
        <span>
          <span className="font-medium text-gray-200">{formatNumber(views)}</span>
          <span className="ml-1">views</span>
        </span>
      </div>

      {showCtr && clicks !== undefined && (
        <>
          <div className="flex items-center gap-1.5 text-gray-400" title="Total Clicks">
            <MousePointer className="h-4 w-4" />
            <span>
              <span className="font-medium text-gray-200">{formatNumber(clicks)}</span>
              <span className="ml-1">clicks</span>
            </span>
          </div>

          {views > 0 && (
            <div className="flex items-center gap-1.5 text-gray-400" title="Click-Through Rate">
              <TrendingUp className="h-4 w-4" />
              <span>
                <span className="font-medium text-gray-200">{Math.round(ctr * 10) / 10}%</span>
                <span className="ml-1">CTR</span>
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
