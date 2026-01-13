"use client";

import { useState, useMemo } from "react";
import { Play, Youtube, ExternalLink } from "lucide-react";

interface YouTubeEmbedProps {
  url: string;
  className?: string;
}

/**
 * Extracts YouTube video ID from various URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://youtube.com/v/VIDEO_ID
 */
function extractYouTubeVideoId(url: string): { videoId: string | null; isShort: boolean } {
  if (!url) return { videoId: null, isShort: false };

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace("www.", "");

    // Check for shorts
    const shortsMatch = urlObj.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch) {
      return { videoId: shortsMatch[1], isShort: true };
    }

    // Standard youtube.com watch URL
    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      // /watch?v=VIDEO_ID
      const videoId = urlObj.searchParams.get("v");
      if (videoId && videoId.length === 11) {
        return { videoId, isShort: false };
      }

      // /embed/VIDEO_ID or /v/VIDEO_ID
      const embedMatch = urlObj.pathname.match(/^\/(embed|v)\/([a-zA-Z0-9_-]{11})/);
      if (embedMatch) {
        return { videoId: embedMatch[2], isShort: false };
      }
    }

    // youtu.be short URL
    if (hostname === "youtu.be") {
      const videoId = urlObj.pathname.slice(1).split("?")[0];
      if (videoId && videoId.length === 11) {
        return { videoId, isShort: false };
      }
    }

    return { videoId: null, isShort: false };
  } catch {
    return { videoId: null, isShort: false };
  }
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
    const { videoId } = extractYouTubeVideoId(url);
    return videoId !== null;
  } catch {
    return false;
  }
}

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

export function YouTubeEmbed({ url, className = "" }: YouTubeEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  const { videoId, isShort } = useMemo(() => extractYouTubeVideoId(url), [url]);

  if (!videoId) {
    return null;
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const fallbackThumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

  if (isPlaying) {
    return (
      <div className={`relative bg-black rounded-xl overflow-hidden ${className}`}>
        <div className={`relative ${isShort ? "aspect-[9/16] max-h-[500px] mx-auto" : "aspect-video"}`}>
          <iframe
            src={embedUrl}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      <div
        className={`relative bg-zinc-900 rounded-xl overflow-hidden cursor-pointer ${
          isShort ? "aspect-[9/16] max-h-[500px] mx-auto" : "aspect-video"
        }`}
        onClick={() => setIsPlaying(true)}
      >
        {/* Thumbnail */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hasError ? fallbackThumbnailUrl : thumbnailUrl}
          alt="Video thumbnail"
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 shadow-lg shadow-red-500/30 group-hover:scale-110 group-hover:shadow-red-500/50 transition-all">
            <Play className="h-7 w-7 text-white ml-1" fill="currentColor" />
          </div>
        </div>

        {/* YouTube badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/70 backdrop-blur-sm">
          <Youtube className="h-4 w-4 text-red-500" />
          <span className="text-xs font-medium text-white">
            {isShort ? "YouTube Short" : "YouTube"}
          </span>
        </div>

        {/* External link */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/70 backdrop-blur-sm text-zinc-300 hover:text-white hover:bg-black/90 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="text-xs">Open</span>
        </a>
      </div>
    </div>
  );
}
