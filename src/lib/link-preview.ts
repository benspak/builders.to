/**
 * Link Preview utilities for builders.to and external URLs
 * Extracts and validates links for rich preview display
 */

/**
 * Regex to match builders.to URLs in text
 * Matches:
 * - https://builders.to/path
 * - https://www.builders.to/path
 * - http variants of the above
 * Does NOT match the root URL without a path (just https://builders.to)
 */
const BUILDERS_TO_URL_REGEX = /https?:\/\/(?:www\.)?builders\.to(\/[^\s<>"\])]*)(?:\?[^\s<>"\])]*)?/gi;

/**
 * Regex to match Product Hunt URLs
 * Matches:
 * - https://producthunt.com/posts/product-name
 * - https://www.producthunt.com/posts/product-name
 * - https://producthunt.com/products/product-name
 */
const PRODUCTHUNT_URL_REGEX = /https?:\/\/(?:www\.)?producthunt\.com\/(posts|products)\/[^\s<>"\])]+/gi;

/**
 * Regex to match Reddit URLs
 * Matches:
 * - https://reddit.com/r/subreddit/comments/id/title
 * - https://www.reddit.com/r/subreddit
 * - https://old.reddit.com/r/subreddit
 * - https://reddit.com/user/username
 */
const REDDIT_URL_REGEX = /https?:\/\/(?:www\.|old\.)?reddit\.com\/(?:r\/[^\s<>"\])]+|user\/[^\s<>"\])]+|comments\/[^\s<>"\])]+)/gi;

/**
 * Regex to match X (Twitter) URLs
 * Matches:
 * - https://x.com/username/status/id
 * - https://twitter.com/username/status/id
 * - https://x.com/username
 * - https://twitter.com/username
 */
const X_TWITTER_URL_REGEX = /https?:\/\/(?:www\.)?(?:x|twitter)\.com\/[a-zA-Z0-9_]+(?:\/status\/\d+)?(?:\?[^\s<>"\])]*)?/gi;

/**
 * Types of pages we can preview
 */
export type LinkPreviewType =
  | "profile"       // /{slug}
  | "update"        // /{slug}/updates/{id}
  | "project"       // /projects/{slug}
  | "company"       // /companies/{slug}
  | "listing"       // /listing/{slug}
  | "local"         // /local/{location} or /{location}/{company}
  | "producthunt"   // External: Product Hunt
  | "reddit"        // External: Reddit
  | "x"             // External: X/Twitter
  | "unknown";

/**
 * External URL sources we support
 */
export type ExternalSource = "producthunt" | "reddit" | "x";

export interface ParsedBuildersToUrl {
  url: string;
  type: LinkPreviewType;
  path: string;
  slug?: string;
  id?: string;
  location?: string;
}

/**
 * Extracts the first builders.to URL from text content
 */
export function extractBuildersToUrlFromText(text: string): string | null {
  if (!text) return null;

  // Reset regex index
  const regex = new RegExp(BUILDERS_TO_URL_REGEX.source, "gi");
  const match = regex.exec(text);

  if (match) {
    return match[0];
  }

  return null;
}

/**
 * Extracts all builders.to URLs from text content
 */
export function extractAllBuildersToUrlsFromText(text: string): string[] {
  if (!text) return [];

  const regex = new RegExp(BUILDERS_TO_URL_REGEX.source, "gi");
  const matches: string[] = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    matches.push(match[0]);
  }

  return matches;
}

/**
 * Validates if a URL is a builders.to URL
 */
export function isBuildersToUrl(url: string): boolean {
  if (!url) return false;

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace("www.", "");
    return hostname === "builders.to";
  } catch {
    return false;
  }
}

/**
 * Parses a builders.to URL and extracts type and identifiers
 */
export function parseBuildersToUrl(url: string): ParsedBuildersToUrl | null {
  if (!isBuildersToUrl(url)) return null;

  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const segments = path.split("/").filter(Boolean);

    // Root URL - no preview needed
    if (segments.length === 0) {
      return null;
    }

    // /projects/{slug}
    if (segments[0] === "projects" && segments.length >= 2) {
      return {
        url,
        type: "project",
        path,
        slug: segments[1],
      };
    }

    // /companies/{slug}
    if (segments[0] === "companies" && segments.length >= 2) {
      return {
        url,
        type: "company",
        path,
        slug: segments[1],
      };
    }

    // /listing/{slug}
    if (segments[0] === "listing" && segments.length >= 2) {
      return {
        url,
        type: "listing",
        path,
        slug: segments[1],
      };
    }

    // /local/{location}
    if (segments[0] === "local" && segments.length >= 2) {
      return {
        url,
        type: "local",
        path,
        location: segments[1],
      };
    }

    // /{slug}/updates/{id} - Update page
    if (segments.length >= 3 && segments[1] === "updates") {
      return {
        url,
        type: "update",
        path,
        slug: segments[0],
        id: segments[2],
      };
    }

    // Skip known non-previewable pages
    const skipPages = [
      "signin",
      "signout",
      "settings",
      "onboarding",
      "how-to",
      "growth-hacks",
      "pricing",
      "privacy",
      "terms",
      "api",
      "map",
      "feed",
      "leaderboard",
      "referral",
    ];

    if (skipPages.includes(segments[0])) {
      return null;
    }

    // /{slug} - Profile or location page (single segment)
    if (segments.length === 1) {
      return {
        url,
        type: "profile",
        path,
        slug: segments[0],
      };
    }

    // /{location}/{company} - Local company page (two segments, not an update)
    if (segments.length === 2 && segments[1] !== "updates") {
      return {
        url,
        type: "local",
        path,
        location: segments[0],
        slug: segments[1],
      };
    }

    return {
      url,
      type: "unknown",
      path,
    };
  } catch {
    return null;
  }
}

/**
 * Link preview data structure returned by the API
 */
export interface LinkPreviewData {
  url: string;
  type: LinkPreviewType;
  title: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
  author?: {
    name: string;
    image?: string;
    slug?: string;
  };
  stats?: {
    likes?: number;
    comments?: number;
    followers?: number;
    projects?: number;
    upvotes?: number;
  };
  meta?: {
    location?: string;
    category?: string;
    status?: string;
    createdAt?: string;
    subreddit?: string;
  };
}

// ============================================
// External URL utilities
// ============================================

/**
 * Checks if a URL is from Product Hunt
 */
export function isProductHuntUrl(url: string): boolean {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace("www.", "");
    return hostname === "producthunt.com";
  } catch {
    return false;
  }
}

/**
 * Checks if a URL is from Reddit
 */
export function isRedditUrl(url: string): boolean {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace("www.", "").replace("old.", "");
    return hostname === "reddit.com";
  } catch {
    return false;
  }
}

/**
 * Checks if a URL is from X (Twitter)
 */
export function isXTwitterUrl(url: string): boolean {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace("www.", "");
    return hostname === "x.com" || hostname === "twitter.com";
  } catch {
    return false;
  }
}

/**
 * Checks if a URL is from any supported external source
 */
export function isExternalPreviewUrl(url: string): boolean {
  return isProductHuntUrl(url) || isRedditUrl(url) || isXTwitterUrl(url);
}

/**
 * Gets the external source type for a URL
 */
export function getExternalSource(url: string): ExternalSource | null {
  if (isProductHuntUrl(url)) return "producthunt";
  if (isRedditUrl(url)) return "reddit";
  if (isXTwitterUrl(url)) return "x";
  return null;
}

/**
 * Checks if a URL is previewable (either builders.to or supported external)
 */
export function isPreviewableUrl(url: string): boolean {
  return isBuildersToUrl(url) || isExternalPreviewUrl(url);
}

/**
 * Extracts the first Product Hunt URL from text
 */
export function extractProductHuntUrlFromText(text: string): string | null {
  if (!text) return null;
  const regex = new RegExp(PRODUCTHUNT_URL_REGEX.source, "gi");
  const match = regex.exec(text);
  return match ? match[0] : null;
}

/**
 * Extracts the first Reddit URL from text
 */
export function extractRedditUrlFromText(text: string): string | null {
  if (!text) return null;
  const regex = new RegExp(REDDIT_URL_REGEX.source, "gi");
  const match = regex.exec(text);
  return match ? match[0] : null;
}

/**
 * Extracts the first X/Twitter URL from text
 */
export function extractXTwitterUrlFromText(text: string): string | null {
  if (!text) return null;
  const regex = new RegExp(X_TWITTER_URL_REGEX.source, "gi");
  const match = regex.exec(text);
  return match ? match[0] : null;
}

/**
 * Extracts the first previewable URL from text (builders.to or external)
 */
export function extractPreviewableUrlFromText(text: string): string | null {
  if (!text) return null;

  // Try builders.to first (internal links have priority)
  const buildersToUrl = extractBuildersToUrlFromText(text);
  if (buildersToUrl) return buildersToUrl;

  // Try external sources
  const productHuntUrl = extractProductHuntUrlFromText(text);
  if (productHuntUrl) return productHuntUrl;

  const redditUrl = extractRedditUrlFromText(text);
  if (redditUrl) return redditUrl;

  const xUrl = extractXTwitterUrlFromText(text);
  if (xUrl) return xUrl;

  return null;
}

/**
 * Extracts all previewable URLs from text
 */
export function extractAllPreviewableUrlsFromText(text: string): string[] {
  if (!text) return [];

  const urls: string[] = [];

  // Builders.to URLs
  urls.push(...extractAllBuildersToUrlsFromText(text));

  // Product Hunt URLs
  const phRegex = new RegExp(PRODUCTHUNT_URL_REGEX.source, "gi");
  let match;
  while ((match = phRegex.exec(text)) !== null) {
    urls.push(match[0]);
  }

  // Reddit URLs
  const redditRegex = new RegExp(REDDIT_URL_REGEX.source, "gi");
  while ((match = redditRegex.exec(text)) !== null) {
    urls.push(match[0]);
  }

  // X/Twitter URLs
  const xRegex = new RegExp(X_TWITTER_URL_REGEX.source, "gi");
  while ((match = xRegex.exec(text)) !== null) {
    urls.push(match[0]);
  }

  // Remove duplicates while preserving order
  return [...new Set(urls)];
}
