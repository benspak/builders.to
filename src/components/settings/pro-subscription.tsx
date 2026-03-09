"use client";

import { useState, useEffect } from "react";
import {
  Crown,
  Loader2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  BadgeCheck,
  Rocket,
  Building2,
  MessageSquare,
  Users,
  Zap,
  Flame,
  Gem,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProBadge } from "@/components/ui/pro-badge";

type TierLabel = "FREE" | "PRO" | "PREMIUM" | "FOUNDERS_CIRCLE";

interface SubscriptionStatus {
  isActive: boolean;
  isPro: boolean;
  plan: "MONTHLY" | "YEARLY" | "LIFETIME" | null;
  tier: TierLabel;
  status: "INACTIVE" | "ACTIVE" | "PAST_DUE" | "CANCELLED";
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

interface LifetimeRemaining {
  sold: number;
  remaining: number;
  cap: number;
}

// Match /pricing page: four membership options for plan management
const MANAGEMENT_TIERS = [
  {
    id: "FREE" as const,
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Build in public. Start earning from day one.",
    icon: Crown,
    features: [
      "Post up to 3x per day to the feed",
      "Earn karma for community engagement",
      "Earn advertising credits for posting",
      "Access to public founder community content",
    ],
  },
  {
    id: "PRO" as const,
    name: "Pro",
    price: "$3.99",
    period: "/month",
    description: "Stay consistent and get your work seen.",
    icon: Zap,
    features: [
      "Post up to 20x per day to the feed",
      "50 monthly ad credits ($5 value)",
      "Access to the private Pro Slack",
      "Weekly sprint check-ins via Slack",
      "Everything in Free",
    ],
  },
  {
    id: "PREMIUM" as const,
    name: "Premium",
    price: "$19.99",
    period: "/month",
    description: "Accountability infrastructure for founders who ship.",
    icon: Flame,
    features: [
      "Daily accountability check-ins via chat",
      "Weekly Sit Rep meetings over Zoom",
      "100 monthly ad credits ($10 value)",
      "Priority feed visibility",
      "Everything in Pro",
    ],
  },
  {
    id: "FOUNDERS_CIRCLE" as const,
    name: "Founder's Circle",
    price: "$49.99",
    period: "/month",
    description: "Direct coaching access and a seat at the inner table.",
    icon: Gem,
    features: [
      "Monthly 1-on-1 coaching call (30 min)",
      "Unlimited daily posts to the feed",
      "250 monthly ad credits ($25 value)",
      "Private Founder's Circle channel",
      "Featured member spotlight",
      "Early access to platform features",
      "Everything in Premium",
    ],
  },
];

export function ProSubscription() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [changingPlan, setChangingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lifetimeRemaining, setLifetimeRemaining] = useState<LifetimeRemaining | null>(null);

  // Fetch subscription status
  useEffect(() => {
    async function fetchData() {
      try {
        const statusRes = await fetch("/api/pro/subscribe");
        if (statusRes.ok) {
          const data = await statusRes.json();
          setStatus(data);
        }
      } catch (err) {
        console.error("Failed to fetch subscription data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Fetch lifetime remaining count (for countdown when not Pro)
  useEffect(() => {
    async function fetchLifetime() {
      try {
        const res = await fetch("/api/pro/lifetime/remaining");
        if (res.ok) {
          const data = await res.json();
          setLifetimeRemaining(data);
        }
      } catch (err) {
        console.error("Failed to fetch lifetime remaining:", err);
      }
    }

    fetchLifetime();
  }, []);

  const handleSubscribe = async (
    tier: "PRO" | "PREMIUM" | "FOUNDERS_CIRCLE",
    plan?: "MONTHLY" | "YEARLY"
  ) => {
    setSubscribing(true);
    setError(null);

    try {
      const response = await fetch("/api/pro/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          plan: tier === "PRO" ? (plan ?? "MONTHLY") : undefined,
        }),
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

  const handleLifetimeCheckout = async () => {
    setSubscribing(true);
    setError(null);

    try {
      const response = await fetch("/api/pro/lifetime/checkout", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start checkout");
      setSubscribing(false);
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

  const handleChangePlan = async (
    tier: "FREE" | "PRO" | "PREMIUM" | "FOUNDERS_CIRCLE",
    plan?: "MONTHLY" | "YEARLY"
  ) => {
    if (tier === "FREE") {
      if (
        !confirm(
          "Switch to Free? Your subscription will cancel at the end of your billing period. You'll keep benefits until then."
        )
        ) {
        return;
        }
    }
    setChangingPlan(tier);
    setError(null);
    try {
      const response = await fetch("/api/pro/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, ...(plan && { plan }) }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to change plan");
      }
      if (tier === "FREE") {
        setStatus((prev) =>
          prev ? { ...prev, cancelAtPeriodEnd: true } : null
        );
      } else {
        const res = await fetch("/api/pro/subscribe");
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change plan");
    } finally {
      setChangingPlan(null);
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
                    {status.plan === "LIFETIME"
                      ? "Lifetime Pro"
                      : status.tier === "FOUNDERS_CIRCLE"
                        ? status.plan === "YEARLY"
                          ? "Yearly Founder's Circle"
                          : "Founder's Circle"
                        : status.tier === "PREMIUM"
                          ? "Premium"
                          : status.plan === "YEARLY"
                            ? "Yearly Pro"
                            : "Pro"}
                  </p>
                </div>
                <div className="text-right">
                  {status.plan === "LIFETIME" ? (
                    <>
                      <p className="text-sm text-zinc-400">Expires</p>
                      <p className="text-lg font-semibold text-white">Never</p>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </div>

              {status.plan !== "LIFETIME" ? (
                <>
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
                  ) : null}
                  <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                    Choose your plan
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {MANAGEMENT_TIERS.map((tier) => {
                      const Icon = tier.icon;
                      const isCurrent =
                        tier.id !== "FREE" &&
                        status.tier === tier.id &&
                        !status.cancelAtPeriodEnd;
                      const isFree = tier.id === "FREE";
                      const isLoading = changingPlan === tier.id;
                      return (
                        <div
                          key={tier.id}
                          className={cn(
                            "rounded-2xl border overflow-hidden flex flex-col",
                            isCurrent
                              ? "border-amber-500/50 bg-gradient-to-b from-amber-500/10 to-transparent"
                              : "border-white/10 bg-zinc-900/50"
                          )}
                        >
                          <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div
                                className={cn(
                                  "flex h-10 w-10 items-center justify-center rounded-xl",
                                  isCurrent ? "bg-amber-500/20" : "bg-zinc-800"
                                )}
                              >
                                <Icon
                                  className={cn(
                                    "h-5 w-5",
                                    isCurrent ? "text-amber-400" : "text-zinc-400"
                                  )}
                                />
                              </div>
                              <h2 className="text-xl font-bold text-white">
                                {tier.name}
                              </h2>
                            </div>
                            <p className="text-zinc-400 text-sm mb-4">
                              {tier.description}
                            </p>
                            <div className="flex items-baseline gap-1 mb-6">
                              <span className="text-3xl font-bold text-white">
                                {tier.price}
                              </span>
                              <span className="text-zinc-500">{tier.period}</span>
                            </div>
                            <ul className="space-y-3">
                              {tier.features.map((feature) => (
                                <li
                                  key={feature}
                                  className="flex items-start gap-2 text-sm text-zinc-300"
                                >
                                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="mt-auto p-6 pt-0">
                            {isCurrent ? (
                              <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium bg-zinc-800 text-zinc-400 border border-white/10">
                                <BadgeCheck className="h-4 w-4" />
                                Current plan
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  isFree
                                    ? handleChangePlan("FREE")
                                    : handleChangePlan(
                                        tier.id,
                                        tier.id === "PRO"
                                          ? (status?.plan ?? "MONTHLY")
                                          : undefined
                                      )
                                }
                                disabled={!!changingPlan}
                                className={cn(
                                  "inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-medium transition-colors",
                                  isFree
                                    ? "bg-zinc-800 text-white hover:bg-zinc-700 border border-white/10"
                                    : "bg-amber-500 text-zinc-900 hover:bg-amber-400 disabled:opacity-50"
                                )}
                              >
                                {isLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : null}
                                {isFree
                                  ? "Switch to Free"
                                  : `Switch to ${tier.name}`}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : null}
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
                  <li className="flex items-center gap-3 text-zinc-300">
                    <BadgeCheck className="h-4 w-4 text-amber-400 flex-shrink-0" />
                    <span className="text-sm">Verified Pro badge on your profile</span>
                  </li>
                  <li className="flex items-center gap-3 text-zinc-300">
                    <Rocket className="h-4 w-4 text-amber-400 flex-shrink-0" />
                    <span className="text-sm">Create unlimited projects (free: 3)</span>
                  </li>
                  <li className="flex items-center gap-3 text-zinc-300">
                    <MessageSquare className="h-4 w-4 text-amber-400 flex-shrink-0" />
                    <span className="text-sm">Post updates to the builder feed</span>
                  </li>
                  <li className="flex items-center gap-3 text-zinc-300">
                    <Building2 className="h-4 w-4 text-amber-400 flex-shrink-0" />
                    <span className="text-sm">Add and manage company profiles</span>
                  </li>
                  <li className="flex items-center gap-3 text-zinc-300">
                    <Users className="h-4 w-4 text-amber-400 flex-shrink-0" />
                    <span className="text-sm">Slack Mastermind Group</span>
                  </li>
                </ul>
              </div>

              {/* Pricing - Founders Edition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Pro Monthly */}
                <button
                  onClick={() => handleSubscribe("PRO", "MONTHLY")}
                  disabled={subscribing}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all",
                    "bg-zinc-800/50 border-zinc-700/50",
                    "hover:border-amber-500/50 hover:bg-zinc-800",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <p className="text-lg font-semibold text-white">Pro</p>
                  <p className="text-2xl font-bold text-white mt-1">$3.99</p>
                  <p className="text-sm text-zinc-400">per month</p>
                  <p className="text-xs text-zinc-500 mt-2">20 posts/day · 50 ad credits/mo</p>
                  <div className="mt-3 flex items-center gap-2 text-amber-400 text-sm font-medium">
                    {subscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                    Subscribe
                  </div>
                </button>

                {/* Pro Yearly */}
                <button
                  onClick={() => handleSubscribe("PRO", "YEARLY")}
                  disabled={subscribing}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all relative",
                    "bg-gradient-to-br from-amber-500/10 to-orange-500/10",
                    "border-amber-500/30 hover:border-amber-500/50",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-amber-500 text-zinc-900 text-xs font-bold">
                    Save 17%
                  </span>
                  <p className="text-lg font-semibold text-white">Pro</p>
                  <p className="text-2xl font-bold text-white mt-1">$39.99</p>
                  <p className="text-sm text-zinc-400">per year</p>
                  <p className="text-xs text-zinc-500 mt-2">20 posts/day · 50 ad credits/mo</p>
                  <div className="mt-3 flex items-center gap-2 text-amber-400 text-sm font-medium">
                    {subscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                    Subscribe
                  </div>
                </button>

                {/* Premium */}
                <button
                  onClick={() => handleSubscribe("PREMIUM")}
                  disabled={subscribing}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all",
                    "bg-gradient-to-br from-orange-500/10 to-red-500/10",
                    "border-orange-500/30 hover:border-orange-500/50",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <p className="text-lg font-semibold text-white">Premium</p>
                  <p className="text-2xl font-bold text-white mt-1">$19.99</p>
                  <p className="text-sm text-zinc-400">per month</p>
                  <p className="text-xs text-zinc-500 mt-2">100 ad credits · Zoom · Priority feed</p>
                  <div className="mt-3 flex items-center gap-2 text-orange-400 text-sm font-medium">
                    {subscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                    Subscribe
                  </div>
                </button>

                {/* Founder's Circle */}
                <button
                  onClick={() => handleSubscribe("FOUNDERS_CIRCLE")}
                  disabled={subscribing}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all relative",
                    "bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10",
                    "border-violet-500/30 hover:border-violet-500/50",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <p className="text-lg font-semibold text-white">Founder's Circle</p>
                  <p className="text-2xl font-bold text-white mt-1">$49.99</p>
                  <p className="text-sm text-zinc-400">per month</p>
                  <p className="text-xs text-zinc-500 mt-2">Unlimited posts · 250 credits · 1-on-1</p>
                  <div className="mt-3 flex items-center gap-2 text-violet-400 text-sm font-medium">
                    {subscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                    Subscribe
                  </div>
                </button>
              </div>

              {/* Lifetime */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <button
                  onClick={handleLifetimeCheckout}
                  disabled={subscribing || (lifetimeRemaining?.remaining ?? 1) <= 0}
                  className={cn(
                    "w-full sm:w-auto p-4 rounded-xl border text-left transition-all relative",
                    "bg-zinc-800/50 border-violet-500/30 hover:border-violet-500/50",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {lifetimeRemaining && lifetimeRemaining.remaining > 0 && (
                    <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-violet-500 text-white text-xs font-bold">
                      {lifetimeRemaining.remaining} left
                    </span>
                  )}
                  <p className="text-lg font-semibold text-white">Lifetime Pro</p>
                  <p className="text-2xl font-bold text-white mt-1">$500</p>
                  <p className="text-sm text-zinc-400">one-time · Pro forever</p>
                  <div className="mt-3 inline-flex items-center gap-2 text-violet-400 text-sm font-medium">
                    {subscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                    Get Lifetime
                  </div>
                </button>
              </div>
              <p className="mt-3 text-sm text-zinc-500">
                Lifetime is limited to {lifetimeRemaining?.cap ?? 100} members. Active members can switch between Free, Pro, Premium, and Founder's Circle from the plan selector above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
