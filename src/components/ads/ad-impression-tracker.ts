// Ad selection utilities
// Uses server-provided view counts for smart ad rotation

interface Advertisement {
  id: string;
  viewCount: number;
  [key: string]: unknown;
}

/**
 * Select the best ad for the user based on server-provided view counts
 * Prioritizes ads the user hasn't seen or has seen fewer times
 */
export function selectBestAd<T extends Advertisement>(ads: T[]): T | null {
  if (ads.length === 0) return null;
  if (ads.length === 1) return ads[0];

  // Sort ads by view count (ascending) - show least-seen ads first
  const sortedAds = [...ads].sort((a, b) => a.viewCount - b.viewCount);

  // Get all ads with the minimum view count
  const minCount = sortedAds[0].viewCount;
  const leastSeenAds = sortedAds.filter((ad) => ad.viewCount === minCount);

  // Randomly select from the least-seen ads for fairness
  return leastSeenAds[Math.floor(Math.random() * leastSeenAds.length)];
}
