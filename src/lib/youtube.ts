/**
 * YouTube URL extraction utilities
 * These are pure functions that can be used in both server and client components
 */

/**
 * Regex to match YouTube URLs in text
 * Matches:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://youtube.com/shorts/VIDEO_ID
 * - http variants of the above
 */
const YOUTUBE_URL_REGEX = /https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&][^\s]*)?/gi;

/**
 * Extracts the first YouTube video URL from text content
 */
export function extractYouTubeUrlFromText(text: string): string | null {
  if (!text) return null;

  const match = text.match(YOUTUBE_URL_REGEX);
  if (match && match.length > 0) {
    // Return the first matched URL
    return match[0];
  }

  return null;
}

/**
 * Extracts all YouTube video URLs from text content
 */
export function extractAllYouTubeUrlsFromText(text: string): string[] {
  if (!text) return [];

  const matches = text.match(YOUTUBE_URL_REGEX);
  return matches || [];
}

/**
 * Validates if a URL is a valid YouTube video URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  if (!url) return false;

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace("www.", "");

    // Check if it's a YouTube domain
    const isYouTubeDomain = ["youtube.com", "m.youtube.com", "youtu.be"].includes(hostname);
    if (!isYouTubeDomain) return false;

    // Channel URLs are not embeddable videos
    if (urlObj.pathname.startsWith("/@") || urlObj.pathname.startsWith("/channel/") || urlObj.pathname.startsWith("/c/")) {
      return false;
    }

    // Check if we can extract a video ID
    const videoId = extractYouTubeVideoId(url);
    return videoId !== null;
  } catch {
    return false;
  }
}

/**
 * Extracts YouTube video ID from various URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://youtube.com/v/VIDEO_ID
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace("www.", "");

    // Check for shorts
    const shortsMatch = urlObj.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch) {
      return shortsMatch[1];
    }

    // Standard youtube.com watch URL
    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      // /watch?v=VIDEO_ID
      const videoId = urlObj.searchParams.get("v");
      if (videoId && videoId.length === 11) {
        return videoId;
      }

      // /embed/VIDEO_ID or /v/VIDEO_ID
      const embedMatch = urlObj.pathname.match(/^\/(embed|v)\/([a-zA-Z0-9_-]{11})/);
      if (embedMatch) {
        return embedMatch[2];
      }
    }

    // youtu.be short URL
    if (hostname === "youtu.be") {
      const videoId = urlObj.pathname.slice(1).split("?")[0];
      if (videoId && videoId.length === 11) {
        return videoId;
      }
    }

    return null;
  } catch {
    return null;
  }
}
