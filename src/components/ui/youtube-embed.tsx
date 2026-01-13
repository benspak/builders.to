"use client";

import { useState, useMemo } from "react";
import { Play, Youtube, ExternalLink } from "lucide-react";
import { extractYouTubeVideoId as extractVideoId } from "@/lib/youtube";

// Re-export utilities for backward compatibility
export { extractYouTubeUrlFromText, extractAllYouTubeUrlsFromText, isValidYouTubeUrl } from "@/lib/youtube";

interface YouTubeEmbedProps {
  url: string;
  className?: string;
}

/**
 * Extracts YouTube video ID with additional isShort flag
 */
function extractYouTubeVideoId(url: string): { videoId: string | null; isShort: boolean } {
  if (!url) return { videoId: null, isShort: false };

  try {
    const urlObj = new URL(url);
    
    // Check for shorts
    const shortsMatch = urlObj.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch) {
      return { videoId: shortsMatch[1], isShort: true };
    }

    // Use the shared utility for regular video ID extraction
    const videoId = extractVideoId(url);
    return { videoId, isShort: false };
  } catch {
    return { videoId: null, isShort: false };
  }
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
