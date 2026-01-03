import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a URL-friendly slug from a title string
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Generates a unique slug by appending a random suffix if needed
 */
export function generateUniqueSlug(title: string): string {
  const baseSlug = generateSlug(title);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${baseSlug}-${randomSuffix}`;
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
    case "PAUSED":
      return "bg-zinc-500/20 text-zinc-300 border-zinc-500/30";
    case "ACQUIRED":
      return "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30";
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
    case "PAUSED":
      return "⏸️ Paused";
    case "ACQUIRED":
      return "🏆 Acquired";
    default:
      return status;
  }
}

// Milestone helpers
export function getMilestoneLabel(type: string): string {
  const labels: Record<string, string> = {
    V1_SHIPPED: "🎯 v1 Shipped",
    FIRST_USER: "👤 First User",
    FIRST_CUSTOMER: "💰 First Customer",
    MRR_1K: "📈 $1k MRR",
    MRR_10K: "🚀 $10k MRR",
    PROFITABLE: "💵 Profitable",
    TEAM_HIRE: "👥 First Hire",
    FUNDING: "💼 Funding Received",
    PIVOT: "🔄 Major Pivot",
    CUSTOM: "⭐ Milestone",
  };
  return labels[type] || type;
}

export function getMilestoneColor(type: string): string {
  const colors: Record<string, string> = {
    V1_SHIPPED: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    FIRST_USER: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    FIRST_CUSTOMER: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    MRR_1K: "bg-green-500/20 text-green-300 border-green-500/30",
    MRR_10K: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    PROFITABLE: "bg-lime-500/20 text-lime-300 border-lime-500/30",
    TEAM_HIRE: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    FUNDING: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    PIVOT: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    CUSTOM: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  };
  return colors[type] || colors.CUSTOM;
}

export function getMilestoneIcon(type: string): string {
  const icons: Record<string, string> = {
    V1_SHIPPED: "🎯",
    FIRST_USER: "👤",
    FIRST_CUSTOMER: "💰",
    MRR_1K: "📈",
    MRR_10K: "🚀",
    PROFITABLE: "💵",
    TEAM_HIRE: "👥",
    FUNDING: "💼",
    PIVOT: "🔄",
    CUSTOM: "⭐",
  };
  return icons[type] || "⭐";
}

// Company Category helpers
export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    SAAS: "SaaS",
    AGENCY: "Agency",
    FINTECH: "Fintech",
    ECOMMERCE: "E-commerce",
    HEALTHTECH: "Healthtech",
    EDTECH: "Edtech",
    AI_ML: "AI / ML",
    DEVTOOLS: "Dev Tools",
    MEDIA: "Media",
    MARKETPLACE: "Marketplace",
    OTHER: "Other",
  };
  return labels[category] || category;
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    SAAS: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    AGENCY: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    FINTECH: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    ECOMMERCE: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    HEALTHTECH: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    EDTECH: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    AI_ML: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    DEVTOOLS: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    MEDIA: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    MARKETPLACE: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    OTHER: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  };
  return colors[category] || colors.OTHER;
}

// Company Size helpers
export function getSizeLabel(size: string | null): string {
  if (!size) return "Unknown";
  const labels: Record<string, string> = {
    SIZE_1_10: "1-10 employees",
    SIZE_11_50: "11-50 employees",
    SIZE_51_200: "51-200 employees",
    SIZE_201_500: "201-500 employees",
    SIZE_500_PLUS: "500+ employees",
  };
  return labels[size] || size;
}

export function getSizeShortLabel(size: string | null): string {
  if (!size) return "N/A";
  const labels: Record<string, string> = {
    SIZE_1_10: "1-10",
    SIZE_11_50: "11-50",
    SIZE_51_200: "51-200",
    SIZE_201_500: "201-500",
    SIZE_500_PLUS: "500+",
  };
  return labels[size] || size;
}

// ==========================================
// User Mention Utilities
// ==========================================

/**
 * Regex to match @mentions in text.
 * Matches @username where username is alphanumeric with hyphens/underscores.
 * The username must start with a letter or number.
 */
export const MENTION_REGEX = /@([a-zA-Z0-9][a-zA-Z0-9_-]*)/g;

/**
 * Extracts all @mentions from a text string.
 * Returns an array of unique slugs (without the @ symbol).
 */
export function extractMentions(text: string): string[] {
  const slugs = new Set<string>();
  const regex = new RegExp(MENTION_REGEX.source, "g");
  let match;

  while ((match = regex.exec(text)) !== null) {
    slugs.add(match[1].toLowerCase());
  }

  return Array.from(slugs);
}

/**
 * Checks if a string contains any @mentions.
 */
export function hasMentions(text: string): boolean {
  return MENTION_REGEX.test(text);
}

// Domains that serve HTML pages instead of direct images
const INVALID_IMAGE_DOMAINS = [
  "drive.google.com",
  "docs.google.com",
  "dropbox.com",
  "www.dropbox.com",
  "onedrive.live.com",
  "1drv.ms",
  "icloud.com",
  "box.com",
  "app.box.com",
];

/**
 * Validates that an image URL is a direct image link, not a sharing page.
 * Returns an error message if invalid, or null if valid.
 */
export function validateImageUrl(url: string | null | undefined): string | null {
  if (!url || url === "") {
    return null; // Empty URLs are allowed (optional field)
  }

  // Allow internal upload paths
  if (url.startsWith("/api/files/") || url.startsWith("/uploads/")) {
    return null;
  }

  try {
    const parsed = new URL(url);

    // Check for known problematic domains
    const hostname = parsed.hostname.toLowerCase();
    for (const domain of INVALID_IMAGE_DOMAINS) {
      if (hostname === domain || hostname.endsWith(`.${domain}`)) {
        return `Please use a direct image URL. ${hostname} sharing links are not supported. Upload the image directly or use a direct image hosting service.`;
      }
    }

    // Must be http or https
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "Image URL must use HTTP or HTTPS protocol.";
    }

    return null;
  } catch {
    return "Invalid image URL format.";
  }
}
