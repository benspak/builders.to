"use client";

import Image from "next/image";
import Link from "next/link";
import { User, ExternalLink } from "lucide-react";

// Social icons as SVG
const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const TwitchIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
  </svg>
);

interface StreamerCardProps {
  streamer: {
    id: string;
    name: string | null;
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
    slug: string | null;
    headline: string | null;
    youtubeUrl: string | null;
    twitchUrl: string | null;
    featuredVideoUrl: string | null;
    _count: {
      projects: number;
    };
  };
}

export function StreamerCard({ streamer }: StreamerCardProps) {
  // Priority: displayName > firstName+lastName > name
  const displayName = streamer.displayName
    || (streamer.firstName && streamer.lastName ? `${streamer.firstName} ${streamer.lastName}` : null)
    || streamer.name
    || "Builder";

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-5 hover:border-purple-500/30 transition-all group">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Link href={`/${streamer.slug || streamer.id}`} className="shrink-0">
          {streamer.image ? (
            <Image
              src={streamer.image}
              alt={displayName}
              width={56}
              height={56}
              className="rounded-xl object-cover ring-2 ring-zinc-800 group-hover:ring-purple-500/30 transition-all"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 ring-2 ring-zinc-800 group-hover:ring-purple-500/30 transition-all">
              <User className="h-7 w-7 text-white" />
            </div>
          )}
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/${streamer.slug || streamer.id}`}
            className="font-semibold text-white hover:text-purple-400 transition-colors line-clamp-1"
          >
            {displayName}
          </Link>
          {streamer.headline && (
            <p className="text-sm text-zinc-400 line-clamp-2 mt-0.5">
              {streamer.headline}
            </p>
          )}
          <div className="text-xs text-zinc-500 mt-1">
            {streamer._count.projects} project{streamer._count.projects !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Channel Links */}
      <div className="flex flex-wrap gap-2 mt-4">
        {streamer.youtubeUrl && (
          <a
            href={streamer.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <YouTubeIcon className="h-3.5 w-3.5" />
            YouTube
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
        {streamer.twitchUrl && (
          <a
            href={streamer.twitchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 text-xs font-medium text-purple-400 hover:bg-purple-500/20 transition-colors"
          >
            <TwitchIcon className="h-3.5 w-3.5" />
            Twitch
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Featured Video Thumbnail */}
      {streamer.featuredVideoUrl && (
        <div className="mt-4">
          {(() => {
            const url = streamer.featuredVideoUrl;
            const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);

            if (youtubeMatch) {
              return (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative aspect-video rounded-lg overflow-hidden bg-zinc-800 group/thumb"
                >
                  <Image
                    src={`https://img.youtube.com/vi/${youtubeMatch[1]}/mqdefault.jpg`}
                    alt="Featured video"
                    fill
                    unoptimized
                    className="object-cover group-hover/thumb:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover/thumb:bg-black/40 transition-colors">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/90 group-hover/thumb:bg-red-600 transition-colors">
                      <svg className="h-5 w-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 text-xs text-white">
                    Featured Video
                  </div>
                </a>
              );
            }

            return (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-purple-500/30 transition-all"
              >
                <p className="text-xs text-zinc-500">Featured Content</p>
                <p className="text-sm text-purple-400 truncate mt-0.5">{url}</p>
              </a>
            );
          })()}
        </div>
      )}
    </div>
  );
}
