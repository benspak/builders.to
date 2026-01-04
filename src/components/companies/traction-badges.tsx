"use client";

import { cn } from "@/lib/utils";
import {
  Users,
  DollarSign,
  UserCheck,
  TrendingUp,
  Sprout,
  Gem,
} from "lucide-react";

interface TractionBadgesProps {
  customerCount?: string | null;
  revenueRange?: string | null;
  userCount?: string | null;
  isBootstrapped?: boolean;
  isProfitable?: boolean;
  hasRaisedFunding?: boolean;
  fundingStage?: string | null;
  variant?: "full" | "compact";
  className?: string;
}

// Customer count labels
const customerLabels: Record<string, string> = {
  RANGE_0: "Pre-customers",
  RANGE_1_10: "1-10 customers",
  RANGE_11_50: "11-50 customers",
  RANGE_51_100: "51-100 customers",
  RANGE_101_500: "101-500 customers",
  RANGE_500_PLUS: "500+ customers",
};

const customerShortLabels: Record<string, string> = {
  RANGE_0: "Pre-customers",
  RANGE_1_10: "1-10",
  RANGE_11_50: "11-50",
  RANGE_51_100: "51-100",
  RANGE_101_500: "101-500",
  RANGE_500_PLUS: "500+",
};

// User count labels
const userLabels: Record<string, string> = {
  RANGE_0: "Pre-launch",
  RANGE_1_100: "1-100 users",
  RANGE_101_1K: "101-1K users",
  RANGE_1K_10K: "1K-10K users",
  RANGE_10K_100K: "10K-100K users",
  RANGE_100K_PLUS: "100K+ users",
};

const userShortLabels: Record<string, string> = {
  RANGE_0: "Pre-launch",
  RANGE_1_100: "1-100",
  RANGE_101_1K: "101-1K",
  RANGE_1K_10K: "1K-10K",
  RANGE_10K_100K: "10K-100K",
  RANGE_100K_PLUS: "100K+",
};

// Revenue labels
const revenueLabels: Record<string, string> = {
  RANGE_0: "Pre-revenue",
  RANGE_1_10K: "$1-$10K ARR",
  RANGE_10K_50K: "$10K-$50K ARR",
  RANGE_50K_100K: "$50K-$100K ARR",
  RANGE_100K_500K: "$100K-$500K ARR",
  RANGE_500K_1M: "$500K-$1M ARR",
  RANGE_1M_5M: "$1M-$5M ARR",
  RANGE_5M_PLUS: "$5M+ ARR",
};

const revenueShortLabels: Record<string, string> = {
  RANGE_0: "Pre-revenue",
  RANGE_1_10K: "$1-10K",
  RANGE_10K_50K: "$10-50K",
  RANGE_50K_100K: "$50-100K",
  RANGE_100K_500K: "$100-500K",
  RANGE_500K_1M: "$500K-1M",
  RANGE_1M_5M: "$1-5M",
  RANGE_5M_PLUS: "$5M+",
};

// Funding stage labels
const fundingLabels: Record<string, string> = {
  PRE_SEED: "Pre-seed",
  SEED: "Seed",
  SERIES_A: "Series A",
  SERIES_B: "Series B",
  SERIES_C_PLUS: "Series C+",
};

// Badge color coding based on traction level
function getRevenueColor(range: string): string {
  const colors: Record<string, string> = {
    RANGE_0: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    RANGE_1_10K: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    RANGE_10K_50K: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    RANGE_50K_100K: "bg-green-500/20 text-green-300 border-green-500/30",
    RANGE_100K_500K: "bg-green-500/20 text-green-300 border-green-500/30",
    RANGE_500K_1M: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    RANGE_1M_5M: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    RANGE_5M_PLUS: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  };
  return colors[range] || colors.RANGE_0;
}

function getCustomerColor(range: string): string {
  const colors: Record<string, string> = {
    RANGE_0: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    RANGE_1_10: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    RANGE_11_50: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    RANGE_51_100: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    RANGE_101_500: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    RANGE_500_PLUS: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  };
  return colors[range] || colors.RANGE_0;
}

function getUserColor(range: string): string {
  const colors: Record<string, string> = {
    RANGE_0: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    RANGE_1_100: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    RANGE_101_1K: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    RANGE_1K_10K: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    RANGE_10K_100K: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    RANGE_100K_PLUS: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30",
  };
  return colors[range] || colors.RANGE_0;
}

export function TractionBadges({
  customerCount,
  revenueRange,
  userCount,
  isBootstrapped,
  isProfitable,
  hasRaisedFunding,
  fundingStage,
  variant = "full",
  className,
}: TractionBadgesProps) {
  const badges: Array<{
    icon: React.ReactNode;
    label: string;
    color: string;
    title: string;
  }> = [];

  // Revenue badge
  if (revenueRange) {
    const label = variant === "full" ? revenueLabels[revenueRange] : revenueShortLabels[revenueRange];
    if (label) {
      badges.push({
        icon: <DollarSign className="h-3.5 w-3.5" />,
        label,
        color: getRevenueColor(revenueRange),
        title: revenueLabels[revenueRange] || "Revenue",
      });
    }
  }

  // Customer badge
  if (customerCount) {
    const label = variant === "full" ? customerLabels[customerCount] : customerShortLabels[customerCount];
    if (label) {
      badges.push({
        icon: <UserCheck className="h-3.5 w-3.5" />,
        label,
        color: getCustomerColor(customerCount),
        title: customerLabels[customerCount] || "Customers",
      });
    }
  }

  // User badge
  if (userCount) {
    const label = variant === "full" ? userLabels[userCount] : userShortLabels[userCount];
    if (label) {
      badges.push({
        icon: <Users className="h-3.5 w-3.5" />,
        label,
        color: getUserColor(userCount),
        title: userLabels[userCount] || "Users",
      });
    }
  }

  // Profitable badge
  if (isProfitable) {
    badges.push({
      icon: <TrendingUp className="h-3.5 w-3.5" />,
      label: "Profitable",
      color: "bg-lime-500/20 text-lime-300 border-lime-500/30",
      title: "Profitable business",
    });
  }

  // Bootstrapped badge
  if (isBootstrapped) {
    badges.push({
      icon: <Sprout className="h-3.5 w-3.5" />,
      label: "Bootstrapped",
      color: "bg-green-500/20 text-green-300 border-green-500/30",
      title: "Self-funded / Bootstrapped",
    });
  }

  // Funding badge
  if (hasRaisedFunding && fundingStage) {
    badges.push({
      icon: <Gem className="h-3.5 w-3.5" />,
      label: fundingLabels[fundingStage] || fundingStage,
      color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      title: `Funded: ${fundingLabels[fundingStage] || fundingStage}`,
    });
  }

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {badges.map((badge, index) => (
        <span
          key={index}
          title={badge.title}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border",
            badge.color
          )}
        >
          {badge.icon}
          {badge.label}
        </span>
      ))}
    </div>
  );
}

// Minimal version for cards - shows icons only
export function TractionBadgesMinimal({
  customerCount,
  revenueRange,
  userCount,
  isProfitable,
  isBootstrapped,
  hasRaisedFunding,
  className,
}: TractionBadgesProps) {
  const badges: Array<{
    icon: React.ReactNode;
    color: string;
    title: string;
  }> = [];

  if (revenueRange && revenueRange !== "RANGE_0") {
    badges.push({
      icon: <DollarSign className="h-3.5 w-3.5" />,
      color: "text-emerald-400",
      title: revenueLabels[revenueRange] || "Revenue",
    });
  }

  if (customerCount && customerCount !== "RANGE_0") {
    badges.push({
      icon: <UserCheck className="h-3.5 w-3.5" />,
      color: "text-amber-400",
      title: customerLabels[customerCount] || "Customers",
    });
  }

  if (userCount && userCount !== "RANGE_0") {
    badges.push({
      icon: <Users className="h-3.5 w-3.5" />,
      color: "text-violet-400",
      title: userLabels[userCount] || "Users",
    });
  }

  if (isProfitable) {
    badges.push({
      icon: <TrendingUp className="h-3.5 w-3.5" />,
      color: "text-lime-400",
      title: "Profitable",
    });
  }

  if (isBootstrapped) {
    badges.push({
      icon: <Sprout className="h-3.5 w-3.5" />,
      color: "text-green-400",
      title: "Bootstrapped",
    });
  }

  if (hasRaisedFunding) {
    badges.push({
      icon: <Gem className="h-3.5 w-3.5" />,
      color: "text-indigo-400",
      title: "Funded",
    });
  }

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {badges.slice(0, 4).map((badge, index) => (
        <span key={index} title={badge.title} className={badge.color}>
          {badge.icon}
        </span>
      ))}
      {badges.length > 4 && (
        <span className="text-xs text-zinc-500">+{badges.length - 4}</span>
      )}
    </div>
  );
}
