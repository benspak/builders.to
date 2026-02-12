"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Crown,
  Loader2,
  ExternalLink,
  BadgeCheck,
  Rocket,
  Building2,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ProFeature = "projects" | "companies" | "updates";

interface ProUpgradePromptProps {
  feature: ProFeature;
  variant?: "banner" | "full-page";
  isAuthenticated: boolean;
  className?: string;
  /** For the "updates" feature: whether the free user has already posted today */
  hasPostedToday?: boolean;
  /** For the "projects" feature: how many projects the user currently has */
  projectCount?: number;
}

const featureConfig: Record<
  ProFeature,
  {
    icon: typeof Rocket;
    title: string;
    description: string;
    benefit: string;
  }
> = {
  projects: {
    icon: Rocket,
    title: "Share Unlimited Projects",
    description: "Free accounts can list up to 3 projects. Upgrade to Pro for unlimited projects.",
    benefit: "Create and share unlimited projects",
  },
  companies: {
    icon: Building2,
    title: "Add Your Company",
    description: "Create company profiles to showcase your team and products.",
    benefit: "Add and manage company profiles",
  },
  updates: {
    icon: MessageSquare,
    title: "Post More Updates",
    description: "Free members get 1 post per day. Upgrade to Pro for up to 20 posts per day!",
    benefit: "Post up to 20 updates per day",
  },
};

export function ProUpgradePrompt({
  feature,
  variant = "banner",
  isAuthenticated,
  className,
  hasPostedToday,
  projectCount,
}: ProUpgradePromptProps) {
  const [subscribing, setSubscribing] = useState(false);
  const config = featureConfig[feature];
  const Icon = config.icon;

  const handleSubscribe = async (plan: "MONTHLY" | "YEARLY") => {
    setSubscribing(true);

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
      console.error("Failed to subscribe:", err);
      setSubscribing(false);
    }
  };

  // Banner variant - compact inline display
  if (variant === "banner") {
    // Show contextual messaging based on feature
    let bannerTitle = "Pro membership required";
    let bannerSubtitle = config.benefit;

    if (feature === "updates") {
      bannerTitle = hasPostedToday
        ? "Want to post more today?"
        : "You can post 1 update per day";
      bannerSubtitle = "Upgrade to Pro for up to 20 posts per day";
    } else if (feature === "projects" && projectCount !== undefined) {
      bannerTitle = `You've reached the free limit (${projectCount}/3 projects)`;
      bannerSubtitle = "Upgrade to Pro to list unlimited projects";
    }

    return (
      <div
        className={cn(
          "rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4",
          className
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25 shrink-0">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {bannerTitle}
              </p>
              <p className="text-xs text-zinc-400">{bannerSubtitle}</p>
            </div>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSubscribe("MONTHLY")}
                disabled={subscribing}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  "bg-zinc-800 border border-zinc-700 text-zinc-300",
                  "hover:border-amber-500/50 hover:text-white",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {subscribing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "$3.99/mo"
                )}
              </button>
              <button
                onClick={() => handleSubscribe("YEARLY")}
                disabled={subscribing}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  "bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-900",
                  "hover:from-amber-400 hover:to-orange-400",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {subscribing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "$39.99/yr"
                )}
              </button>
            </div>
          ) : (
            <Link
              href={`/signin?callbackUrl=/settings`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-900 text-sm font-medium hover:from-amber-400 hover:to-orange-400 transition-all"
            >
              Sign in to upgrade
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Full-page variant - for creation pages
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-white/5 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
            <Crown className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Upgrade to Pro</h2>
            <p className="text-zinc-400">{config.description}</p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {/* Feature highlight */}
        <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-zinc-800/50 border border-white/5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
            <Icon className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p className="font-semibold text-white">{config.title}</p>
            <p className="text-sm text-zinc-400">
              {feature === "projects" && projectCount !== undefined
                ? `You've used ${projectCount} of 3 free project slots. Upgrade to list unlimited projects.`
                : config.benefit}
            </p>
          </div>
        </div>

        {/* Benefits list */}
        <div className="space-y-3 mb-8">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            Pro Benefits Include
          </h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-zinc-300">
              <BadgeCheck className="h-5 w-5 text-amber-400 flex-shrink-0" />
              <span>Verified Pro badge on your profile</span>
            </li>
            <li className="flex items-center gap-3 text-zinc-300">
              <Rocket className="h-5 w-5 text-amber-400 flex-shrink-0" />
              <span>Create unlimited projects (free: 3)</span>
            </li>
            <li className="flex items-center gap-3 text-zinc-300">
              <Building2 className="h-5 w-5 text-amber-400 flex-shrink-0" />
              <span>Add and manage company profiles</span>
            </li>
            <li className="flex items-center gap-3 text-zinc-300">
              <MessageSquare className="h-5 w-5 text-amber-400 flex-shrink-0" />
              <span>Post up to 20 updates per day (free: 1/day)</span>
            </li>
          </ul>
        </div>

        {isAuthenticated ? (
          <>
            {/* Pricing buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Monthly */}
              <button
                onClick={() => handleSubscribe("MONTHLY")}
                disabled={subscribing}
                className={cn(
                  "p-5 rounded-xl border text-left transition-all",
                  "bg-zinc-800/50 border-zinc-700/50",
                  "hover:border-amber-500/50 hover:bg-zinc-800",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <p className="text-2xl font-bold text-white">$3.99</p>
                <p className="text-sm text-zinc-400">per month</p>
                <div className="mt-4 flex items-center gap-2 text-amber-400 text-sm font-medium">
                  {subscribing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                  Subscribe Monthly
                </div>
              </button>

              {/* Yearly */}
              <button
                onClick={() => handleSubscribe("YEARLY")}
                disabled={subscribing}
                className={cn(
                  "p-5 rounded-xl border text-left transition-all relative",
                  "bg-gradient-to-br from-amber-500/10 to-orange-500/10",
                  "border-amber-500/30",
                  "hover:border-amber-500/50",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <span className="absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full bg-amber-500 text-zinc-900 text-xs font-bold">
                  Save 17%
                </span>
                <p className="text-2xl font-bold text-white">$39.99</p>
                <p className="text-sm text-zinc-400">per year</p>
                <div className="mt-4 flex items-center gap-2 text-amber-400 text-sm font-medium">
                  {subscribing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                  Subscribe Yearly
                </div>
              </button>
            </div>

            <p className="mt-4 text-center text-sm text-zinc-500">
              Secure payment via Stripe. Cancel anytime.
            </p>
          </>
        ) : (
          <div className="text-center">
            <Link
              href={`/signin?callbackUrl=/settings`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-900 font-semibold hover:from-amber-400 hover:to-orange-400 transition-all"
            >
              Sign in to upgrade to Pro
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="mt-3 text-sm text-zinc-500">
              Already have an account?{" "}
              <Link href="/signin" className="text-amber-400 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
