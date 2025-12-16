import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y ago`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "IDEA":
      return "bg-violet-500/20 text-violet-300 border-violet-500/30";
    case "BUILDING":
      return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    case "BETA":
      return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
    case "LAUNCHED":
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    default:
      return "bg-zinc-500/20 text-zinc-300 border-zinc-500/30";
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "IDEA":
      return "💡 Idea";
    case "BUILDING":
      return "🔨 Building";
    case "BETA":
      return "🧪 Beta";
    case "LAUNCHED":
      return "🚀 Launched";
    default:
      return status;
  }
}
