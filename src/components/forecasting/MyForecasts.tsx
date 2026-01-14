"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Building2,
  DollarSign,
  Coins,
  ChevronDown,
} from "lucide-react";

interface Forecast {
  id: string;
  position: "LONG" | "SHORT";
  targetMrr: number;
  coinsStaked: number;
  quarterStart: string;
  quarterEnd: string;
  status: "PENDING" | "WON" | "LOST" | "CANCELLED";
  resolvedAt: string | null;
  actualMrr: number | null;
  coinsPayout: number | null;
  createdAt: string;
  company: {
    id: string;
    name: string;
    slug: string | null;
    logo: string | null;
    category: string;
  };
  currentMrr: number | null;
  daysRemaining: number | null;
}

interface MyForecastsProps {
  initialStatus?: "all" | "pending" | "resolved";
}

export function MyForecasts({ initialStatus = "all" }: MyForecastsProps) {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [status, setStatus] = useState(initialStatus);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchForecasts = async (cursor?: string) => {
    try {
      const isInitial = !cursor;
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      const params = new URLSearchParams({
        status: status === "all" ? "" : status,
        limit: "10",
        ...(cursor && { cursor }),
      });

      const response = await fetch(`/api/forecasting/my-forecasts?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (isInitial) {
          setForecasts(data.forecasts);
        } else {
          setForecasts((prev) => [...prev, ...data.forecasts]);
        }
        setNextCursor(data.nextCursor || null);
      }
    } catch (err) {
      console.error("Failed to fetch forecasts:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchForecasts();
  }, [status]);

  const formatMrr = (mrr: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(mrr / 100);
  };

  const getStatusBadge = (forecast: Forecast) => {
    switch (forecast.status) {
      case "PENDING":
        return (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
            <Clock className="h-3 w-3" />
            {forecast.daysRemaining}d left
          </div>
        );
      case "WON":
        return (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
            <CheckCircle className="h-3 w-3" />
            Won
          </div>
        );
      case "LOST":
        return (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
            <XCircle className="h-3 w-3" />
            Lost
          </div>
        );
      case "CANCELLED":
        return (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-500/20 text-zinc-400 text-xs font-medium">
            Cancelled
          </div>
        );
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        {(["all", "pending", "resolved"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              status === s
                ? "bg-cyan-500/20 text-cyan-400"
                : "text-zinc-400 hover:text-zinc-300"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Forecasts List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
        </div>
      ) : forecasts.length === 0 ? (
        <div
          className="text-center py-12"
          style={{ color: "var(--foreground-muted)" }}
        >
          <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No forecasts yet</p>
          <p className="text-sm mt-1">
            Start forecasting on company MRR to see your predictions here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {forecasts.map((forecast) => (
            <div
              key={forecast.id}
              className="rounded-xl border p-4"
              style={{
                background: "var(--background-secondary)",
                borderColor: "var(--card-border)",
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                    {forecast.company.logo ? (
                      <Image
                        src={forecast.company.logo}
                        alt={forecast.company.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Building2 className="h-5 w-5 text-zinc-500" />
                      </div>
                    )}
                  </div>
                  <div>
                    <Link
                      href={
                        forecast.company.slug
                          ? `/companies/${forecast.company.slug}`
                          : "#"
                      }
                      className="font-semibold hover:text-cyan-400 transition-colors"
                      style={{ color: "var(--foreground)" }}
                    >
                      {forecast.company.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`flex items-center gap-1 text-xs font-medium ${
                          forecast.position === "LONG"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {forecast.position === "LONG" ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {forecast.position}
                      </span>
                    </div>
                  </div>
                </div>
                {getStatusBadge(forecast)}
              </div>

              {/* Details */}
              <div
                className="grid grid-cols-3 gap-3 p-3 rounded-lg"
                style={{ background: "var(--background)" }}
              >
                <div>
                  <p
                    className="text-xs mb-1"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    Target MRR
                  </p>
                  <p className="font-semibold" style={{ color: "var(--foreground)" }}>
                    {formatMrr(forecast.targetMrr)}
                  </p>
                </div>
                <div>
                  <p
                    className="text-xs mb-1"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    {forecast.status === "PENDING" ? "Current MRR" : "Actual MRR"}
                  </p>
                  <p className="font-semibold text-green-400">
                    {forecast.status === "PENDING"
                      ? forecast.currentMrr
                        ? formatMrr(forecast.currentMrr)
                        : "N/A"
                      : forecast.actualMrr
                      ? formatMrr(forecast.actualMrr)
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p
                    className="text-xs mb-1"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    {forecast.status === "PENDING" ? "Staked" : "Result"}
                  </p>
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4 text-amber-400" />
                    {forecast.status === "PENDING" ? (
                      <span className="font-semibold text-amber-400">
                        {forecast.coinsStaked}
                      </span>
                    ) : forecast.status === "WON" ? (
                      <span className="font-semibold text-green-400">
                        +{forecast.coinsPayout || 0}
                      </span>
                    ) : (
                      <span className="font-semibold text-red-400">
                        -{forecast.coinsStaked}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Load More */}
          {nextCursor && (
            <button
              onClick={() => fetchForecasts(nextCursor)}
              disabled={loadingMore}
              className="w-full py-3 rounded-lg text-sm font-medium border transition-colors"
              style={{
                borderColor: "var(--card-border)",
                color: "var(--foreground-muted)",
              }}
            >
              {loadingMore ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                <span className="flex items-center justify-center gap-1">
                  Load More
                  <ChevronDown className="h-4 w-4" />
                </span>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
