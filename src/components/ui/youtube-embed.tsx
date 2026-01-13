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

/**
 * Video button for the update form
 */
interface VideoButtonProps {
  onClick: () => void;
  disabled?: boolean;
  hasVideo?: boolean;
}

export function VideoButton({ onClick, disabled, hasVideo }: VideoButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        hasVideo
          ? "text-red-400 bg-red-500/10 hover:bg-red-500/20"
          : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
      }`}
    >
      <Youtube className="h-4 w-4" />
      <span className="hidden sm:inline">Video</span>
    </button>
  );
}

/**
 * Video URL input modal/dialog
 */
interface VideoUrlInputProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
  initialUrl?: string;
}

export function VideoUrlInput({ isOpen, onClose, onSubmit, initialUrl = "" }: VideoUrlInputProps) {
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      onClose();
      return;
    }

    if (!isValidYouTubeUrl(url.trim())) {
      setError("Please enter a valid YouTube video URL (not a channel or playlist)");
      return;
    }

    onSubmit(url.trim());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600">
              <Youtube className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Add YouTube Video</h3>
              <p className="text-sm text-zinc-400">Paste a YouTube video or Shorts URL</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError(null);
                }}
                placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
              )}
              <p className="mt-2 text-xs text-zinc-500">
                Supports: YouTube videos, Shorts, and youtu.be links
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:from-red-400 hover:to-red-500 transition-all"
              >
                Add Video
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/**
 * Preview component for showing the selected video in the form
 */
interface VideoPreviewProps {
  url: string;
  onRemove: () => void;
}

export function VideoPreview({ url, onRemove }: VideoPreviewProps) {
  const { videoId, isShort } = useMemo(() => extractYouTubeVideoId(url), [url]);

  if (!videoId) return null;

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

  return (
    <div className="relative rounded-xl overflow-hidden border border-white/10 bg-zinc-800/30">
      <div className="flex items-center gap-3 p-3">
        <div className="relative w-24 h-14 rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailUrl}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Play className="h-6 w-6 text-white" fill="currentColor" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-red-400 text-sm font-medium">
            <Youtube className="h-4 w-4" />
            <span>{isShort ? "YouTube Short" : "YouTube Video"}</span>
          </div>
          <p className="text-xs text-zinc-500 truncate mt-0.5">{url}</p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-colors"
        >
          <span className="sr-only">Remove video</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
