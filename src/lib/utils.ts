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
