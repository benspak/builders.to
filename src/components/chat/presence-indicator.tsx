"use client";

import { cn } from "@/lib/utils";

interface PresenceIndicatorProps {
  status: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3 w-3",
};

const colorMap: Record<string, string> = {
  ONLINE: "bg-green-500",
  AWAY: "bg-yellow-500",
  DND: "bg-red-500",
  OFFLINE: "bg-zinc-500",
};

export function PresenceIndicator({ status, className, size = "md" }: PresenceIndicatorProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full ring-2 ring-zinc-950",
        sizeMap[size],
        colorMap[status] || colorMap.OFFLINE,
        className
      )}
      title={status.charAt(0) + status.slice(1).toLowerCase()}
    />
  );
}
