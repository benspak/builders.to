"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  MessageSquare,
  Heart,
  Rocket,
  Building2,
  MapPin,
  Briefcase,
  ShoppingBag,
  Users,
  ExternalLink,
  ArrowUpCircle,
} from "lucide-react";
import {
  extractBuildersToUrlFromText,
  extractAllPreviewableUrlsFromText,
  isBuildersToUrl,
  isExternalPreviewUrl,
  getExternalSource,
  LinkPreviewData,
  LinkPreviewType,
} from "@/lib/link-preview";
import { cn, formatRelativeTime } from "@/lib/utils";

// Re-export utilities for use in other components
export { extractBuildersToUrlFromText, extractAllPreviewableUrlsFromText };

interface LinkPreviewProps {
  url: string;
  className?: string;
}

// Product Hunt icon
const ProductHuntIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.604 8.4h-3.405V12h3.405c.996 0 1.805-.809 1.805-1.8s-.809-1.8-1.805-1.8zM12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm1.604 14.4h-3.405V18H7.801V6h5.804c2.319 0 4.2 1.881 4.2 4.2 0 2.319-1.881 4.2-4.2 4.2z" />
  </svg>
);

// Reddit icon
const RedditIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);

// X/Twitter icon
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Icons for different content types
const TypeIcons: Record<LinkPreviewType, React.ElementType> = {
  profile: User,
  update: MessageSquare,
  project: Rocket,
  company: Building2,
  service: Briefcase,
  listing: ShoppingBag,
  local: MapPin,
  producthunt: ProductHuntIcon,
  reddit: RedditIcon,
  x: XIcon,
  unknown: ExternalLink,
};

// Labels for different content types
const TypeLabels: Record<LinkPreviewType, string> = {
  profile: "Profile",
  update: "Update",
  project: "Project",
  company: "Company",
  service: "Service",
  listing: "Listing",
  local: "Local",
  producthunt: "Product Hunt",
  reddit: "Reddit",
  x: "X",
  unknown: "Link",
};

// Brand colors for external sources
const SourceColors: Record<string, { bg: string; text: string; border: string }> = {
  producthunt: {
    bg: "from-orange-600/20 to-orange-500/20",
    text: "text-orange-400",
    border: "hover:border-orange-500/30",
  },
  reddit: {
    bg: "from-orange-600/20 to-red-500/20",
    text: "text-orange-500",
    border: "hover:border-orange-500/30",
  },
  x: {
    bg: "from-zinc-600/20 to-zinc-500/20",
    text: "text-zinc-300",
    border: "hover:border-zinc-500/30",
  },
};

// Simple in-memory cache for preview data
const previewCache = new Map<string, LinkPreviewData>();

export function LinkPreview({ url, className = "" }: LinkPreviewProps) {
  const [preview, setPreview] = useState<LinkPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine if this is an internal or external URL
  const isInternal = useMemo(() => isBuildersToUrl(url), [url]);
  const isExternal = useMemo(() => isExternalPreviewUrl(url), [url]);
  const externalSource = useMemo(() => getExternalSource(url), [url]);

  // Extract the path from URL for internal navigation
  const internalPath = useMemo(() => {
    if (!isInternal) return null;
    try {
      const urlObj = new URL(url);
      return urlObj.pathname + urlObj.search;
    } catch {
      return null;
    }
  }, [url, isInternal]);

  useEffect(() => {
    let cancelled = false;

    async function fetchPreview() {
      // Check cache first
      const cached = previewCache.get(url);
      if (cached) {
        setPreview(cached);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Use different API endpoints for internal vs external URLs
        const apiEndpoint = isInternal
          ? `/api/link-preview?url=${encodeURIComponent(url)}`
          : `/api/link-preview-external?url=${encodeURIComponent(url)}`;

        const response = await fetch(apiEndpoint);

        if (!response.ok) {
          throw new Error("Failed to fetch preview");
        }

        const data: LinkPreviewData = await response.json();

        if (!cancelled) {
          // Cache the result
          previewCache.set(url, data);
          setPreview(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Could not load preview");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    if (isInternal || isExternal) {
      fetchPreview();
    } else {
      setIsLoading(false);
      setError("URL not supported");
    }

    return () => {
      cancelled = true;
    };
  }, [url, isInternal, isExternal]);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn(
        "rounded-xl border border-white/10 bg-zinc-800/50 p-4 animate-pulse",
        className
      )}>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-zinc-700" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-zinc-700" />
            <div className="h-3 w-1/2 rounded bg-zinc-700" />
          </div>
        </div>
      </div>
    );
  }

  // Error state - just show the URL as a link
  if (error || !preview) {
    // Get hostname for display
    let hostname = "Link";
    try {
      hostname = new URL(url).hostname.replace("www.", "");
    } catch {
      // ignore
    }

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "block rounded-xl border border-white/10 bg-zinc-800/50 p-4 hover:border-orange-500/30 hover:bg-zinc-800/70 transition-all",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
            <ExternalLink className="h-5 w-5 text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-300 truncate">{url}</p>
            <p className="text-xs text-zinc-500">{hostname}</p>
          </div>
        </div>
      </a>
    );
  }

  const TypeIcon = TypeIcons[preview.type] || ExternalLink;
  const typeLabel = TypeLabels[preview.type] || "Link";
  const colors = externalSource ? SourceColors[externalSource] : null;

  // External links open in new tab, internal links use Next.js routing
  const LinkWrapper = isInternal && internalPath
    ? ({ children, ...props }: { children: React.ReactNode; className?: string; onClick?: (e: React.MouseEvent) => void }) => (
        <Link href={internalPath} {...props}>{children}</Link>
      )
    : ({ children, ...props }: { children: React.ReactNode; className?: string; onClick?: (e: React.MouseEvent) => void }) => (
        <a href={url} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
      );

  return (
    <LinkWrapper
      className={cn(
        "block rounded-xl border border-white/10 bg-zinc-800/50 overflow-hidden hover:bg-zinc-800/70 transition-all group",
        colors?.border || "hover:border-orange-500/30",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Image if available */}
      {preview.image && (
        <div className="relative aspect-[2/1] max-h-40 bg-zinc-900 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.image}
            alt={preview.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Type badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm">
            <TypeIcon className={cn("h-3.5 w-3.5", colors?.text || "text-orange-400")} />
            <span className="text-xs font-medium text-zinc-200">{typeLabel}</span>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Title and type badge (if no image) */}
        <div className="flex items-start gap-3">
          {!preview.image && (
            <div className={cn(
              "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br",
              colors?.bg || "from-orange-500/20 to-pink-500/20"
            )}>
              <TypeIcon className={cn("h-6 w-6", colors?.text || "text-orange-400")} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              "font-semibold text-white truncate transition-colors",
              colors?.text ? `group-hover:${colors.text}` : "group-hover:text-orange-400"
            )}>
              {preview.title}
            </h4>
            {preview.description && (
              <p className="text-sm text-zinc-400 line-clamp-2 mt-1">
                {preview.description}
              </p>
            )}
          </div>
        </div>

        {/* Author and stats */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          {/* Author */}
          {preview.author && (
            <div className="flex items-center gap-2">
              {preview.author.image ? (
                <Image
                  src={preview.author.image}
                  alt={preview.author.name}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              ) : (
                <div className="h-5 w-5 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                  <User className="h-3 w-3 text-white" />
                </div>
              )}
              <span className="text-xs text-zinc-400">
                {externalSource === "x" ? `@${preview.author.name}` : preview.author.name}
              </span>
            </div>
          )}

          {/* Stats */}
          {preview.stats && (
            <div className="flex items-center gap-3">
              {preview.stats.upvotes !== undefined && preview.stats.upvotes > 0 && (
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                  <ArrowUpCircle className="h-3.5 w-3.5" />
                  <span>{preview.stats.upvotes}</span>
                </div>
              )}
              {preview.stats.likes !== undefined && preview.stats.likes > 0 && (
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                  <Heart className="h-3.5 w-3.5" />
                  <span>{preview.stats.likes}</span>
                </div>
              )}
              {preview.stats.comments !== undefined && preview.stats.comments > 0 && (
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{preview.stats.comments}</span>
                </div>
              )}
              {preview.stats.followers !== undefined && preview.stats.followers > 0 && (
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                  <Users className="h-3.5 w-3.5" />
                  <span>{preview.stats.followers}</span>
                </div>
              )}
              {preview.stats.projects !== undefined && preview.stats.projects > 0 && (
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                  <Rocket className="h-3.5 w-3.5" />
                  <span>{preview.stats.projects}</span>
                </div>
              )}
            </div>
          )}

          {/* Meta info */}
          {!preview.author && !preview.stats && preview.meta && (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              {preview.meta.subreddit && (
                <span className="flex items-center gap-1">
                  r/{preview.meta.subreddit}
                </span>
              )}
              {preview.meta.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {preview.meta.location}
                </span>
              )}
              {preview.meta.createdAt && (
                <span>{formatRelativeTime(preview.meta.createdAt)}</span>
              )}
            </div>
          )}
        </div>

        {/* Site branding */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            {isInternal ? (
              <>
                <div className="h-4 w-4 rounded bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <Rocket className="h-2.5 w-2.5 text-white" />
                </div>
                <span>builders.to</span>
              </>
            ) : preview.favicon ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview.favicon}
                  alt=""
                  className="h-4 w-4 rounded"
                />
                <span>{preview.siteName || typeLabel}</span>
              </>
            ) : (
              <>
                <TypeIcon className={cn("h-4 w-4", colors?.text || "text-zinc-400")} />
                <span>{preview.siteName || typeLabel}</span>
              </>
            )}
          </div>
          {preview.meta?.location && preview.author && (
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {preview.meta.location}
            </span>
          )}
          {preview.meta?.subreddit && preview.author && (
            <span className="text-xs text-zinc-500">
              r/{preview.meta.subreddit}
            </span>
          )}
        </div>
      </div>
    </LinkWrapper>
  );
}

/**
 * Component that auto-detects and renders link previews from text content
 * Supports builders.to, Product Hunt, Reddit, and X/Twitter URLs
 */
interface AutoLinkPreviewProps {
  content: string;
  className?: string;
  maxPreviews?: number;
}

export function AutoLinkPreview({ content, className = "", maxPreviews = 1 }: AutoLinkPreviewProps) {
  const urls = useMemo(() => {
    const allUrls = extractAllPreviewableUrlsFromText(content);
    return allUrls.slice(0, maxPreviews);
  }, [content, maxPreviews]);

  if (urls.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {urls.map((url, index) => (
        <LinkPreview key={`${url}-${index}`} url={url} />
      ))}
    </div>
  );
}
