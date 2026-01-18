// Ad impression tracking utilities
// Tracks how many times a user has seen each ad to enable smart rotation

const STORAGE_KEY = "ad_impressions";
const MAX_IMPRESSIONS_BEFORE_ROTATE = 5; // Show a different ad after this many views
const IMPRESSION_RESET_HOURS = 24; // Reset impression counts after this many hours

interface AdImpressions {
  [adId: string]: {
    count: number;
    lastSeen: number; // timestamp
  };
}

interface ImpressionData {
  impressions: AdImpressions;
  lastReset: number;
}

/**
 * Get the current impression data from localStorage
 */
function getImpressionData(): ImpressionData {
  if (typeof window === "undefined") {
    return { impressions: {}, lastReset: Date.now() };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: ImpressionData = JSON.parse(stored);

      // Check if we need to reset (after 24 hours)
      const hoursSinceReset = (Date.now() - data.lastReset) / (1000 * 60 * 60);
      if (hoursSinceReset >= IMPRESSION_RESET_HOURS) {
        // Reset all impressions
        const freshData: ImpressionData = { impressions: {}, lastReset: Date.now() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(freshData));
        return freshData;
      }

      return data;
    }
  } catch (error) {
    console.error("Failed to parse ad impressions:", error);
  }

  const initialData: ImpressionData = { impressions: {}, lastReset: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  return initialData;
}

/**
 * Save impression data to localStorage
 */
function saveImpressionData(data: ImpressionData): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save ad impressions:", error);
  }
}

/**
 * Record an impression for an ad
 */
export function recordAdImpression(adId: string): number {
  const data = getImpressionData();

  const existing = data.impressions[adId];
  const newCount = existing ? existing.count + 1 : 1;

  data.impressions[adId] = {
    count: newCount,
    lastSeen: Date.now(),
  };

  saveImpressionData(data);
  return newCount;
}

/**
 * Get the impression count for an ad
 */
export function getAdImpressionCount(adId: string): number {
  const data = getImpressionData();
  return data.impressions[adId]?.count || 0;
}

/**
 * Check if an ad has been seen too many times
 */
export function hasSeenTooManyTimes(adId: string): boolean {
  return getAdImpressionCount(adId) >= MAX_IMPRESSIONS_BEFORE_ROTATE;
}

interface Advertisement {
  id: string;
  [key: string]: unknown;
}

/**
 * Select the best ad for the user based on impression history
 * Prioritizes ads the user hasn't seen or has seen fewer times
 */
export function selectBestAd<T extends Advertisement>(ads: T[]): T | null {
  if (ads.length === 0) return null;
  if (ads.length === 1) return ads[0];

  const data = getImpressionData();

  // Sort ads by impression count (ascending) - show least-seen ads first
  const sortedAds = [...ads].sort((a, b) => {
    const countA = data.impressions[a.id]?.count || 0;
    const countB = data.impressions[b.id]?.count || 0;
    return countA - countB;
  });

  // Get all ads with the minimum impression count
  const minCount = data.impressions[sortedAds[0].id]?.count || 0;
  const leastSeenAds = sortedAds.filter(ad => {
    const count = data.impressions[ad.id]?.count || 0;
    return count === minCount;
  });

  // Randomly select from the least-seen ads for fairness
  return leastSeenAds[Math.floor(Math.random() * leastSeenAds.length)];
}

/**
 * Get ads that haven't exceeded the impression limit
 * Falls back to all ads if all have exceeded the limit
 */
export function getEligibleAds<T extends Advertisement>(ads: T[]): T[] {
  if (ads.length === 0) return [];

  const eligible = ads.filter(ad => !hasSeenTooManyTimes(ad.id));

  // If all ads have been seen too many times, return all of them
  // (we still need to show something)
  if (eligible.length === 0) return ads;

  return eligible;
}
