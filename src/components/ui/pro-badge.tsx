"use client";

import { BadgeCheck, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProBadgeProps {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

/**
 * Pro Badge component - displays verified Pro member status
 */
export function ProBadge({ size = "md", showLabel = false, className }: ProBadgeProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const labelSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  if (showLabel) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5",
          "bg-gradient-to-r from-amber-500/20 to-orange-500/20",
          "border border-amber-500/30",
          "text-amber-400 font-medium",
          labelSizeClasses[size],
          className
        )}
        title="Verified Pro Member"
      >
        <BadgeCheck className={cn(sizeClasses[size], "flex-shrink-0")} />
        <span>Pro</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        "text-amber-400",
        className
      )}
      title="Verified Pro Member"
    >
      <BadgeCheck className={cn(sizeClasses[size], "drop-shadow-[0_0_3px_rgba(251,191,36,0.5)]")} />
    </span>
  );
}

/**
 * Pro Crown Badge - alternative style with crown icon
 */
export function ProCrownBadge({ size = "md", className }: Omit<ProBadgeProps, "showLabel">) {
  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        "text-amber-400",
        className
      )}
      title="Verified Pro Member"
    >
      <Crown className={cn(sizeClasses[size], "drop-shadow-[0_0_3px_rgba(251,191,36,0.5)]")} />
    </span>
  );
}

/**
 * Pro Badge with tooltip on hover
 */
export function ProBadgeWithTooltip({ size = "md", className }: Omit<ProBadgeProps, "showLabel">) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <span className="relative group">
      <span
        className={cn(
          "inline-flex items-center justify-center cursor-help",
          "text-amber-400 transition-transform hover:scale-110",
          className
        )}
      >
        <BadgeCheck
          className={cn(
            sizeClasses[size],
            "drop-shadow-[0_0_3px_rgba(251,191,36,0.5)]"
          )}
        />
      </span>
      {/* Tooltip */}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-lg">
        Verified Pro Member
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
      </span>
    </span>
  );
}
