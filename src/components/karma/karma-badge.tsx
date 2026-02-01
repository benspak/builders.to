"use client";

import { KarmaLevel } from "@prisma/client";
import { Crown, GraduationCap, Hammer, Sprout, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

interface KarmaBadgeProps {
  karma: number;
  level: KarmaLevel;
  size?: "sm" | "md" | "lg";
  showPoints?: boolean;
  className?: string;
}

const levelConfig: Record<
  KarmaLevel,
  {
    icon: typeof Crown;
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  NEWCOMER: {
    icon: Leaf,
    label: "Newcomer",
    color: "text-zinc-400",
    bgColor: "bg-zinc-800",
    borderColor: "border-zinc-700",
  },
  CONTRIBUTOR: {
    icon: Sprout,
    label: "Contributor",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  BUILDER: {
    icon: Hammer,
    label: "Builder",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
  },
  MENTOR: {
    icon: GraduationCap,
    label: "Mentor",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
  LEGEND: {
    icon: Crown,
    label: "Legend",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
};

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

export function KarmaBadge({
  karma,
  level,
  size = "md",
  showPoints = false,
  className,
}: KarmaBadgeProps) {
  const config = levelConfig[level];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        config.bgColor,
        config.borderColor,
        config.color,
        sizes.container,
        className
      )}
      title={`${config.label} - ${karma.toLocaleString()} karma`}
    >
      <Icon className={sizes.icon} />
      {showPoints ? (
        <span>{karma.toLocaleString()}</span>
      ) : (
        <span>{config.label}</span>
      )}
    </div>
  );
}

// Simple inline version showing just icon and points
export function KarmaPoints({
  karma,
  level,
  className,
}: {
  karma: number;
  level: KarmaLevel;
  className?: string;
}) {
  const config = levelConfig[level];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        config.color,
        className
      )}
      title={`${config.label} - ${karma.toLocaleString()} karma`}
    >
      <Icon className="h-3 w-3" />
      {karma.toLocaleString()}
    </span>
  );
}
