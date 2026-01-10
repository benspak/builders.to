import { Suspense } from "react";
import Link from "next/link";
import { Loader2, Video, Users, ExternalLink, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StreamerCard } from "@/components/streamers";

export const metadata = {
  title: "Streamers - Builders.to",
  description: "Discover builders who stream and create video content on YouTube and Twitch",
};

// Force dynamic rendering since this page requires database access
export const dynamic = "force-dynamic";

// Social icons
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

type FilterType = "all" | "youtube" | "twitch";

interface StreamersPageProps {
  searchParams: Promise<{ filter?: string }>;
}

async function StreamersContent({ filter }: { filter: FilterType }) {
  // Build where clause based on filter
  const whereClause = (() => {
    switch (filter) {
      case "youtube":
        return { youtubeUrl: { not: null } };
      case "twitch":
        return { twitchUrl: { not: null } };
      default:
        return {
          OR: [
            { youtubeUrl: { not: null } },
            { twitchUrl: { not: null } },
          ],
        };
    }
  })();

  const streamers = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      displayName: true,
      firstName: true,
      lastName: true,
      image: true,
      slug: true,
      headline: true,
      youtubeUrl: true,
      twitchUrl: true,
      featuredVideoUrl: true,
      _count: {
        select: {
          projects: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (streamers.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-zinc-800/50 mb-4">
          <Video className="h-8 w-8 text-zinc-600" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No streamers found</h3>
        <p className="text-zinc-400 text-sm max-w-md mx-auto">
          {filter === "youtube" && "No builders with YouTube channels yet."}
          {filter === "twitch" && "No builders with Twitch channels yet."}
          {filter === "all" && "No builders with streaming channels yet."}
        </p>
        <p className="text-zinc-500 text-sm mt-4">
          Add your YouTube or Twitch URL in your{" "}
          <Link href="/settings" className="text-purple-400 hover:text-purple-300 transition-colors">
            profile settings
          </Link>{" "}
          to appear here!
        </p>
      </div>
    );
  }

  // Count streamers by platform
  const youtubeCount = streamers.filter(s => s.youtubeUrl).length;
  const twitchCount = streamers.filter(s => s.twitchUrl).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="flex flex-wrap gap-4 pb-2">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Users className="h-4 w-4" />
          <span>{streamers.length} streamer{streamers.length !== 1 ? "s" : ""}</span>
        </div>
        {youtubeCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-red-400">
            <YouTubeIcon className="h-4 w-4" />
            <span>{youtubeCount} YouTube</span>
          </div>
        )}
        {twitchCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-purple-400">
            <TwitchIcon className="h-4 w-4" />
            <span>{twitchCount} Twitch</span>
          </div>
        )}
      </div>

      {/* Streamers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {streamers.map((streamer) => (
          <StreamerCard key={streamer.id} streamer={streamer} />
        ))}
      </div>
    </div>
  );
}

export default async function StreamersPage({ searchParams }: StreamersPageProps) {
  const params = await searchParams;
  const filter = (params.filter as FilterType) || "all";

  return (
    <div className="relative min-h-screen" style={{ background: "var(--background)" }}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-red-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-red-600 shadow-lg shadow-purple-500/25">
              <Video className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Streamers</h1>
              <p className="text-zinc-400 text-sm">
                Builders who create video content
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
            <Link
              href="/streamers"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === "all"
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-700/50"
              }`}
            >
              All
            </Link>
            <Link
              href="/streamers?filter=youtube"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === "youtube"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
              }`}
            >
              <YouTubeIcon className="h-4 w-4" />
              YouTube
            </Link>
            <Link
              href="/streamers?filter=twitch"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === "twitch"
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                  : "text-zinc-400 hover:text-purple-400 hover:bg-purple-500/10"
              }`}
            >
              <TwitchIcon className="h-4 w-4" />
              Twitch
            </Link>
          </div>
        </div>

        {/* Featured Twitch Category */}
        <a
          href="https://www.twitch.tv/directory/collection/software-game-development-streams"
          target="_blank"
          rel="noopener noreferrer"
          className="group mb-8 block relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-900/40 via-zinc-900/80 to-zinc-900/90 p-6 hover:border-purple-500/50 transition-all duration-300"
        >
          {/* Animated background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl group-hover:bg-purple-500/30 transition-all duration-500" />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Icon */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow">
              <TwitchIcon className="h-7 w-7 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium">
                  <Sparkles className="h-3 w-3" />
                  Featured Category
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-200 transition-colors">
                Software & Game Development Streams
              </h3>
              <p className="text-zinc-400 text-sm">
                Watch live coding, game dev, and software engineering streams on Twitch. Learn from builders in real-time!
              </p>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-medium group-hover:bg-purple-500/30 group-hover:text-white transition-all shrink-0">
              Watch Now
              <ExternalLink className="h-4 w-4" />
            </div>
          </div>
        </a>

        {/* Content */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          }
        >
          <StreamersContent filter={filter} />
        </Suspense>

        {/* CTA */}
        <div className="mt-12 text-center">
          <div className="inline-block p-6 rounded-2xl border border-zinc-800/50 bg-zinc-900/50">
            <h3 className="text-lg font-semibold text-white mb-2">Are you a content creator?</h3>
            <p className="text-zinc-400 text-sm mb-4 max-w-md">
              Add your YouTube or Twitch channel to your profile to be featured here and connect with other builder-creators.
            </p>
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-red-500 text-white font-medium text-sm hover:from-purple-600 hover:to-red-600 transition-all"
            >
              Add Your Channels
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
