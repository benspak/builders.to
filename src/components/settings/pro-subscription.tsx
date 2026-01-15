"use client";

import { useState, useEffect } from "react";
import {
  Crown,
  Check,
  Loader2,
  AlertCircle,
  ExternalLink,
  Globe,
  Trash2,
  RefreshCw,
  BadgeCheck,
  Coins,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProBadge } from "@/components/ui/pro-badge";

interface SubscriptionStatus {
  isActive: boolean;
  isPro: boolean;
  plan: "MONTHLY" | "YEARLY" | null;
  status: "INACTIVE" | "ACTIVE" | "PAST_DUE" | "CANCELLED";
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

interface CustomDomain {
  id: string;
  domain: string;
  verified: boolean;
  verifiedAt: string | null;
  createdAt: string;
}

export function ProSubscription() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Domain management state
  const [newDomain, setNewDomain] = useState("");
  const [addingDomain, setAddingDomain] = useState(false);
  const [verifyingDomain, setVerifyingDomain] = useState<string | null>(null);
  const [deletingDomain, setDeletingDomain] = useState<string | null>(null);
  const [domainError, setDomainError] = useState<string | null>(null);

  // Fetch subscription status and domains
  useEffect(() => {
    async function fetchData() {
      try {
        const [statusRes, domainsRes] = await Promise.all([
          fetch("/api/pro/subscribe"),
          fetch("/api/pro/domains"),
        ]);

        if (statusRes.ok) {
          const data = await statusRes.json();
          setStatus(data);
        }

        if (domainsRes.ok) {
          const data = await domainsRes.json();
          setDomains(data.domains || []);
        }
      } catch (err) {
        console.error("Failed to fetch subscription data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleSubscribe = async (plan: "MONTHLY" | "YEARLY") => {
    setSubscribing(true);
    setError(null);

    try {
      const response = await fetch("/api/pro/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to subscribe");
      setSubscribing(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You'll keep Pro benefits until the end of your billing period.")) {
      return;
    }

    setCancelling(true);
    setError(null);

    try {
      const response = await fetch("/api/pro/cancel", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel subscription");
      }

      setStatus((prev) =>
        prev ? { ...prev, cancelAtPeriodEnd: true } : null
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel");
    } finally {
      setCancelling(false);
    }
  };

  const handleReactivate = async () => {
    setReactivating(true);
    setError(null);

    try {
      const response = await fetch("/api/pro/cancel", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reactivate subscription");
      }

      setStatus((prev) =>
        prev ? { ...prev, cancelAtPeriodEnd: false } : null
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reactivate");
    } finally {
      setReactivating(false);
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    setAddingDomain(true);
    setDomainError(null);

    try {
      const response = await fetch("/api/pro/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: newDomain.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add domain");
      }

      setDomains((prev) => [data.domain, ...prev]);
      setNewDomain("");
    } catch (err) {
      setDomainError(err instanceof Error ? err.message : "Failed to add domain");
    } finally {
      setAddingDomain(false);
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    setVerifyingDomain(domainId);
    setDomainError(null);

    try {
      const response = await fetch(`/api/pro/domains/${domainId}/verify`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.verified) {
        setDomains((prev) =>
          prev.map((d) =>
            d.id === domainId
              ? { ...d, verified: true, verifiedAt: new Date().toISOString() }
              : d
          )
        );
      } else {
        setDomainError(data.message || "Domain verification failed");
      }
    } catch (err) {
      setDomainError(err instanceof Error ? err.message : "Failed to verify domain");
    } finally {
      setVerifyingDomain(null);
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    if (!confirm("Are you sure you want to remove this domain?")) {
      return;
    }

    setDeletingDomain(domainId);

    try {
      const response = await fetch(`/api/pro/domains/${domainId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete domain");
      }

      setDomains((prev) => prev.filter((d) => d.id !== domainId));
    } catch (err) {
      setDomainError(err instanceof Error ? err.message : "Failed to delete domain");
    } finally {
      setDeletingDomain(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
        </div>
      </div>
    );
  }

  const isActive = status?.isActive;
  const periodEnd = status?.currentPeriodEnd
    ? new Date(status.currentPeriodEnd)
    : null;

  return (
    <div className="space-y-6">
      {/* Main Pro Card */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-white/5 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Builders Pro
                {isActive && <ProBadge size="sm" />}
              </h2>
              <p className="text-zinc-400 text-sm">
                {isActive
                  ? "You're a verified Pro member"
                  : "Unlock premium features"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {isActive ? (
            // Active subscription view
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 border border-white/5">
                <div>
                  <p className="text-sm text-zinc-400">Current Plan</p>
                  <p className="text-lg font-semibold text-white">
                    {status.plan === "YEARLY" ? "Yearly" : "Monthly"} Pro
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-400">
                    {status.cancelAtPeriodEnd ? "Expires" : "Renews"}
                  </p>
                  <p className="text-lg font-semibold text-white">
                    {periodEnd?.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {status.cancelAtPeriodEnd ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <p className="text-sm text-amber-400 mb-3">
                    Your subscription is set to cancel. You'll lose Pro benefits after{" "}
                    {periodEnd?.toLocaleDateString()}.
                  </p>
                  <button
                    onClick={handleReactivate}
                    disabled={reactivating}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-zinc-900 font-medium hover:bg-amber-400 transition-colors disabled:opacity-50"
                  >
                    {reactivating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Keep My Subscription
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {cancelling ? "Cancelling..." : "Cancel subscription"}
                </button>
              )}
            </div>
          ) : (
            // Not subscribed - show plans
            <div className="space-y-4">
              {/* Benefits */}
              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                  Pro Benefits
                </h3>
                <ul className="space-y-2">
                  {[
                    { icon: BadgeCheck, text: "Verified Pro badge on your profile" },
                    { icon: Coins, text: "50 tokens per month for ads" },
                    { icon: Globe, text: "Custom domain mapping" },
                  ].map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-3 text-zinc-300">
                      <Icon className="h-4 w-4 text-amber-400 flex-shrink-0" />
                      <span className="text-sm">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                {/* Monthly */}
                <button
                  onClick={() => handleSubscribe("MONTHLY")}
                  disabled={subscribing}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all",
                    "bg-zinc-800/50 border-zinc-700/50",
                    "hover:border-amber-500/50 hover:bg-zinc-800",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <p className="text-2xl font-bold text-white">$3.99</p>
                  <p className="text-sm text-zinc-400">per month</p>
                  <div className="mt-3 flex items-center gap-2 text-amber-400 text-sm font-medium">
                    {subscribing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                    Subscribe
                  </div>
                </button>

                {/* Yearly */}
                <button
                  onClick={() => handleSubscribe("YEARLY")}
                  disabled={subscribing}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all relative",
                    "bg-gradient-to-br from-amber-500/10 to-orange-500/10",
                    "border-amber-500/30",
                    "hover:border-amber-500/50",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-amber-500 text-zinc-900 text-xs font-bold">
                    Save 17%
                  </span>
                  <p className="text-2xl font-bold text-white">$39.99</p>
                  <p className="text-sm text-zinc-400">per year</p>
                  <div className="mt-3 flex items-center gap-2 text-amber-400 text-sm font-medium">
                    {subscribing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                    Subscribe
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Domains Section (Pro only) */}
      {isActive && (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="h-5 w-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Custom Domains</h3>
          </div>

          {domainError && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {domainError}
            </div>
          )}

          {/* Add domain form */}
          <form onSubmit={handleAddDomain} className="mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="portfolio.yourdomain.com"
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-white placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                />
              </div>
              <button
                type="submit"
                disabled={addingDomain || !newDomain.trim()}
                className="px-4 py-2 rounded-lg bg-amber-500 text-zinc-900 font-medium hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingDomain ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Add"
                )}
              </button>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              Add a CNAME record pointing to <code className="text-amber-400">builders.to</code>
            </p>
          </form>

          {/* Domain list */}
          {domains.length > 0 ? (
            <div className="space-y-3">
              {domains.map((domain) => (
                <div
                  key={domain.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg",
                        domain.verified
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-zinc-700/50 text-zinc-400"
                      )}
                    >
                      {domain.verified ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Globe className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {domain.domain}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {domain.verified
                          ? "Verified"
                          : "Pending verification"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!domain.verified && (
                      <button
                        onClick={() => handleVerifyDomain(domain.id)}
                        disabled={verifyingDomain === domain.id}
                        className="px-3 py-1.5 rounded-lg bg-zinc-700/50 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors disabled:opacity-50"
                      >
                        {verifyingDomain === domain.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Verify"
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteDomain(domain.id)}
                      disabled={deletingDomain === domain.id}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      {deletingDomain === domain.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 text-center py-4">
              No custom domains configured
            </p>
          )}
        </div>
      )}
    </div>
  );
}
