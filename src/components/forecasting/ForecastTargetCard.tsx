"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Building2,
  ChevronRight,
} from "lucide-react";
import { PlaceForecastModal } from "./PlaceForecastModal";

interface ForecastTargetCardProps {
  target: {
    id: string;
    companyId: string;
    company: {
      id: string;
      name: string;
      slug: string | null;
      logo: string | null;
      category: string;
      about: string | null;
      user: {
        id: string;
        name: string | null;
        image: string | null;
        slug: string | null;
      };
    };
    currentMrr: number | null;
    lastMrrUpdate: string | null;
    minForecastCoins: number;
    maxForecastCoins: number;
    totalForecasts: number;
    userForecast: {
      position: string;
      coinsStaked: number;
    } | null;
  };
  onForecastPlaced?: () => void;
}

export function ForecastTargetCard({
  target,
  onForecastPlaced,
}: ForecastTargetCardProps) {
  const [showModal, setShowModal] = useState(false);

  const formatMrr = (mrr: number) => {
    if (mrr >= 100000) {
      return `$${(mrr / 100000).toFixed(0)}k`;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(mrr / 100);
  };

  const handleForecastSuccess = () => {
    setShowModal(false);
    onForecastPlaced?.();
  };

  return (
    <>
      <div
        className="rounded-xl border p-4 transition-all hover:border-cyan-500/30"
        style={{
          background: "var(--background-secondary)",
          borderColor: "var(--card-border)",
        }}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
            {target.company.logo ? (
              <Image
                src={target.company.logo}
                alt={target.company.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Building2 className="h-6 w-6 text-zinc-500" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Link
              href={
                target.company.slug
                  ? `/companies/${target.company.slug}`
                  : "#"
              }
              className="font-semibold hover:text-cyan-400 transition-colors truncate block"
              style={{ color: "var(--foreground)" }}
            >
              {target.company.name}
            </Link>
            <p
              className="text-sm truncate"
              style={{ color: "var(--foreground-muted)" }}
            >
              {target.company.category.replace("_", " ")}
            </p>
          </div>
        </div>

        {/* MRR Display */}
        <div
          className="flex items-center justify-between p-3 rounded-lg mb-4"
          style={{ background: "var(--background)" }}
        >
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-400" />
            <span
              className="text-sm"
              style={{ color: "var(--foreground-muted)" }}
            >
              Current MRR
            </span>
          </div>
          <span className="text-lg font-bold text-green-400">
            {target.currentMrr ? formatMrr(target.currentMrr) : "N/A"}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" style={{ color: "var(--foreground-muted)" }} />
            <span style={{ color: "var(--foreground-muted)" }}>
              {target.totalForecasts} forecasts
            </span>
          </div>
          {target.userForecast && (
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                target.userForecast.position === "LONG"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {target.userForecast.position === "LONG" ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {target.userForecast.position} ({target.userForecast.coinsStaked} coins)
            </div>
          )}
        </div>

        {/* Actions */}
        {target.userForecast ? (
          <Link
            href={`/forecasting?target=${target.id}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-colors"
            style={{
              borderColor: "var(--card-border)",
              color: "var(--foreground-muted)",
            }}
          >
            View Forecast
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
            >
              <TrendingUp className="h-4 w-4" />
              Long
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              <TrendingDown className="h-4 w-4" />
              Short
            </button>
          </div>
        )}
      </div>

      {/* Place Forecast Modal */}
      {showModal && (
        <PlaceForecastModal
          target={target}
          onClose={() => setShowModal(false)}
          onSuccess={handleForecastSuccess}
        />
      )}
    </>
  );
}
