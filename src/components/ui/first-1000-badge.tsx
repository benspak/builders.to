"use client";

import { Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface First1000BadgeProps {
  size?: "sm" | "md" | "lg";
  signupRank?: number;
  className?: string;
}

const sizeConfig = {
  sm: {
    container: "px-1.5 py-0.5 text-[10px] gap-0.5",
    icon: "h-2.5 w-2.5",
  },
  md: {
    container: "px-2 py-1 text-xs gap-1",
    icon: "h-3 w-3",
  },
  lg: {
    container: "px-3 py-1.5 text-sm gap-1.5",
    icon: "h-4 w-4",
  },
};

/**
 * Badge for users who were among the first 1000 to sign up.
 */
export function First1000Badge({
  size = "md",
  signupRank,
  className,
}: First1000BadgeProps) {
  const sizes = sizeConfig[size];
  const title = signupRank
    ? `First 1000 Builders — #${signupRank}`
    : "First 1000 Builders";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        "bg-amber-500/10 border-amber-500/30 text-amber-400",
        sizes.container,
        className
      )}
      title={title}
    >
      <Award className={cn(sizes.icon, "flex-shrink-0")} />
      <span>First 1000</span>
    </span>
  );
}
