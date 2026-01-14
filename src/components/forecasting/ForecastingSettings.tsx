"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Loader2,
  Link as LinkIcon,
  Unlink,
  DollarSign,
  Settings,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

interface ForecastingSettingsProps {
  companyId: string;
  companyName: string;
}

interface SettingsData {
  id: string;
  isActive: boolean;
  minForecastCoins: number;
  maxForecastCoins: number;
  hasStripeConnection: boolean;
  stripeConnectedAt: string | null;
  currentMrr: number | null;
  lastMrrUpdate: string | null;
}

export function ForecastingSettings({
  companyId,
  companyName,
}: ForecastingSettingsProps) {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, [companyId]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/forecasting/settings?companyId=${companyId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<SettingsData>) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch("/api/forecasting/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, ...updates }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update settings");
      }

      const data = await response.json();
      setSettings(data);
      setSuccess("Settings updated successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const connectStripe = async () => {
    try {
      setConnecting(true);
      setError(null);

      const response = await fetch("/api/forecasting/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to initiate Stripe connection");
      }

      const data = await response.json();
      window.location.href = data.url;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect to Stripe"
      );
      setConnecting(false);
    }
  };

  const disconnectStripe = async () => {
    if (
      !confirm(
        "Are you sure you want to disconnect Stripe? This will disable forecasting for your company."
      )
    ) {
      return;
    }

    try {
      setDisconnecting(true);
      setError(null);

      const response = await fetch("/api/forecasting/stripe/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to disconnect Stripe");
      }

      await fetchSettings();
      setSuccess("Stripe disconnected successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to disconnect Stripe"
      );
    } finally {
      setDisconnecting(false);
    }
  };

  const formatMrr = (mrr: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(mrr / 100);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border p-6"
      style={{
        background: "var(--background-secondary)",
        borderColor: "var(--card-border)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
          <TrendingUp className="h-5 w-5 text-cyan-400" />
        </div>
        <div>
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Forecasting Settings
          </h2>
          <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
            Allow users to forecast your company&apos;s MRR
          </p>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
          <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
          <p className="text-sm text-green-400">{success}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Stripe Connection */}
        <div className="space-y-3">
          <h3
            className="text-sm font-medium flex items-center gap-2"
            style={{ color: "var(--foreground)" }}
          >
            <LinkIcon className="h-4 w-4" />
            Stripe Connection
          </h3>

          {settings?.hasStripeConnection ? (
            <div
              className="p-4 rounded-lg border"
              style={{ borderColor: "var(--card-border)" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p
                      className="font-medium"
                      style={{ color: "var(--foreground)" }}
                    >
                      Stripe Connected
                    </p>
                    {settings.stripeConnectedAt && (
                      <p
                        className="text-sm"
                        style={{ color: "var(--foreground-muted)" }}
                      >
                        Connected {formatDate(settings.stripeConnectedAt)}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={disconnectStripe}
                  disabled={disconnecting}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                >
                  {disconnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Unlink className="h-4 w-4" />
                  )}
                  Disconnect
                </button>
              </div>

              {/* Current MRR Display */}
              {settings.currentMrr !== null && (
                <div
                  className="mt-4 p-3 rounded-lg"
                  style={{ background: "var(--background)" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-400" />
                      <span
                        className="text-sm"
                        style={{ color: "var(--foreground-muted)" }}
                      >
                        Current MRR
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-lg font-bold text-green-400"
                      >
                        {formatMrr(settings.currentMrr)}
                      </span>
                      {settings.lastMrrUpdate && (
                        <span
                          className="text-xs"
                          style={{ color: "var(--foreground-muted)" }}
                        >
                          (updated {formatDate(settings.lastMrrUpdate)})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              className="p-4 rounded-lg border border-dashed"
              style={{ borderColor: "var(--card-border)" }}
            >
              <div className="text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 mx-auto mb-3">
                  <LinkIcon className="h-6 w-6 text-zinc-400" />
                </div>
                <h4
                  className="font-medium mb-1"
                  style={{ color: "var(--foreground)" }}
                >
                  Connect Stripe
                </h4>
                <p
                  className="text-sm mb-4"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Connect your Stripe account to enable MRR forecasting
                </p>
                <button
                  onClick={connectStripe}
                  disabled={connecting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 transition-all disabled:opacity-50"
                >
                  {connecting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-4 w-4" />
                      Connect Stripe
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Forecasting Toggle */}
        {settings?.hasStripeConnection && (
          <>
            <div className="space-y-3">
              <h3
                className="text-sm font-medium flex items-center gap-2"
                style={{ color: "var(--foreground)" }}
              >
                <Settings className="h-4 w-4" />
                Enable Forecasting
              </h3>

              <div
                className="flex items-center justify-between p-4 rounded-lg border"
                style={{ borderColor: "var(--card-border)" }}
              >
                <div>
                  <p
                    className="font-medium"
                    style={{ color: "var(--foreground)" }}
                  >
                    Allow forecasting on {companyName}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    Users can stake coins to predict your MRR
                  </p>
                </div>
                <button
                  onClick={() => updateSettings({ isActive: !settings.isActive })}
                  disabled={saving}
                  className="flex items-center gap-2 transition-colors"
                >
                  {settings.isActive ? (
                    <ToggleRight className="h-8 w-8 text-cyan-400" />
                  ) : (
                    <ToggleLeft className="h-8 w-8 text-zinc-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Coin Limits */}
            {settings.isActive && (
              <div className="space-y-3">
                <h3
                  className="text-sm font-medium flex items-center gap-2"
                  style={{ color: "var(--foreground)" }}
                >
                  <RefreshCw className="h-4 w-4" />
                  Forecast Limits
                </h3>

                <div
                  className="grid grid-cols-2 gap-4 p-4 rounded-lg border"
                  style={{ borderColor: "var(--card-border)" }}
                >
                  <div>
                    <label
                      className="block text-sm mb-1"
                      style={{ color: "var(--foreground-muted)" }}
                    >
                      Min Coins per Forecast
                    </label>
                    <input
                      type="number"
                      value={settings.minForecastCoins}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          minForecastCoins: parseInt(e.target.value) || 10,
                        })
                      }
                      onBlur={() =>
                        updateSettings({
                          minForecastCoins: settings.minForecastCoins,
                        })
                      }
                      min={1}
                      max={settings.maxForecastCoins}
                      className="w-full px-3 py-2 rounded-lg text-sm border"
                      style={{
                        background: "var(--background)",
                        borderColor: "var(--card-border)",
                        color: "var(--foreground)",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm mb-1"
                      style={{ color: "var(--foreground-muted)" }}
                    >
                      Max Coins per Forecast
                    </label>
                    <input
                      type="number"
                      value={settings.maxForecastCoins}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          maxForecastCoins: parseInt(e.target.value) || 100,
                        })
                      }
                      onBlur={() =>
                        updateSettings({
                          maxForecastCoins: settings.maxForecastCoins,
                        })
                      }
                      min={settings.minForecastCoins}
                      max={1000}
                      className="w-full px-3 py-2 rounded-lg text-sm border"
                      style={{
                        background: "var(--background)",
                        borderColor: "var(--card-border)",
                        color: "var(--foreground)",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Info Box */}
        <div
          className="p-4 rounded-lg"
          style={{ background: "var(--background)" }}
        >
          <h4
            className="text-sm font-medium mb-2"
            style={{ color: "var(--foreground)" }}
          >
            How it works
          </h4>
          <ul
            className="text-sm space-y-1"
            style={{ color: "var(--foreground-muted)" }}
          >
            <li>• Users stake reputation coins on your company&apos;s MRR performance</li>
            <li>• They can go LONG (MRR will increase) or SHORT (MRR will decrease)</li>
            <li>• MRR is verified automatically via Stripe (read-only access)</li>
            <li>• Winners receive 2x their staked coins after 24 hours</li>
            <li>• Coins are non-transferable and have no monetary value</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
