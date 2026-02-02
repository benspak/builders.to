import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trophy, User, Flame, Crown, Hammer, GraduationCap, Sprout, Loader2, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { KarmaLevel } from "@prisma/client";

export const metadata = {
  title: "Top Builders Leaderboard | Builders.to",
  description: "See the top builders in the community ranked by karma points, contributions, and engagement.",
};

export const dynamic = "force-dynamic";

interface LeaderboardUser {
  id: string;
  slug: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  image: string | null;
  headline: string | null;
  karma: number;
  karmaLevel: KarmaLevel;
  currentStreak: number;
  longestStreak: number;
  _count: {
    projects: number;
    dailyUpdates: number;
  };
}

function getDisplayName(user: LeaderboardUser): string {
  if (user.displayName) return user.displayName;
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.name || "Builder";
}

function getKarmaLevelIcon(level: KarmaLevel) {
  switch (level) {
    case "LEGEND":
      return <Crown className="h-4 w-4 text-amber-400" />;
    case "MENTOR":
      return <GraduationCap className="h-4 w-4 text-purple-400" />;
    case "BUILDER":
      return <Hammer className="h-4 w-4 text-emerald-400" />;
    case "CONTRIBUTOR":
      return <Sprout className="h-4 w-4 text-blue-400" />;
    default:
      return <Sprout className="h-4 w-4 text-zinc-400" />;
  }
}

function getKarmaLevelColor(level: KarmaLevel) {
  switch (level) {
    case "LEGEND":
      return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    case "MENTOR":
      return "text-purple-400 bg-purple-500/10 border-purple-500/30";
    case "BUILDER":
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    case "CONTRIBUTOR":
      return "text-blue-400 bg-blue-500/10 border-blue-500/30";
    default:
      return "text-zinc-400 bg-zinc-500/10 border-zinc-500/30";
  }
}

function getRankStyles(rank: number) {
  if (rank === 1) {
    return {
      badge: "bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-amber-500/30",
      ring: "ring-amber-500/50",
      glow: "shadow-lg shadow-amber-500/20",
    };
  }
  if (rank === 2) {
    return {
      badge: "bg-gradient-to-r from-slate-300 to-zinc-400 text-black shadow-slate-400/20",
      ring: "ring-slate-400/50",
      glow: "shadow-lg shadow-slate-400/10",
    };
  }
  if (rank === 3) {
    return {
      badge: "bg-gradient-to-r from-amber-600 to-orange-700 text-white shadow-orange-600/20",
      ring: "ring-amber-600/50",
      glow: "shadow-lg shadow-orange-600/10",
    };
  }
  return {
    badge: "bg-zinc-700/50 text-zinc-400",
    ring: "ring-zinc-700/50",
    glow: "",
  };
}

async function LeaderboardContent() {
  const [session, users, total] = await Promise.all([
    auth(),
    prisma.user.findMany({
      where: { karma: { gt: 0 } },
      orderBy: { karma: "desc" },
      take: 50,
      select: {
        id: true,
        slug: true,
        displayName: true,
        firstName: true,
        lastName: true,
        name: true,
        image: true,
        headline: true,
        karma: true,
        karmaLevel: true,
        currentStreak: true,
        longestStreak: true,
        _count: {
          select: {
            projects: true,
            dailyUpdates: true,
          },
        },
      },
    }),
    prisma.user.count({ where: { karma: { gt: 0 } } }),
  ]);

  // Find current user's rank if logged in
  let currentUserRank: number | null = null;
  if (session?.user?.id) {
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { karma: true },
    });
    if (currentUser && currentUser.karma > 0) {
      const usersAbove = await prisma.user.count({
        where: { karma: { gt: currentUser.karma } },
      });
      currentUserRank = usersAbove + 1;
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4 text-center">
          <p className="text-2xl font-bold text-white">{total.toLocaleString()}</p>
          <p className="text-xs text-zinc-500">Total Builders</p>
        </div>
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">
            {users[0]?.karma.toLocaleString() || 0}
          </p>
          <p className="text-xs text-zinc-500">Highest Karma</p>
        </div>
        {currentUserRank && (
          <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 text-center col-span-2 sm:col-span-2">
            <p className="text-2xl font-bold text-orange-400">#{currentUserRank}</p>
            <p className="text-xs text-zinc-400">Your Rank</p>
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-4 sm:px-6 py-3 border-b border-zinc-800/50 bg-zinc-900/80 text-xs font-medium text-zinc-500">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-5 sm:col-span-4">Builder</div>
          <div className="col-span-3 sm:col-span-2 text-center">Level</div>
          <div className="col-span-3 sm:col-span-2 text-right">Karma</div>
          <div className="hidden sm:block col-span-3 text-right">Stats</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-zinc-800/30">
          {users.map((user, index) => {
            const rank = index + 1;
            const styles = getRankStyles(rank);
            const displayName = getDisplayName(user);
            const profileUrl = user.slug ? `/${user.slug}` : null;
            const isCurrentUser = session?.user?.id === user.id;

            const content = (
              <div
                className={`grid grid-cols-12 gap-4 px-4 sm:px-6 py-4 transition-colors group ${
                  isCurrentUser
                    ? "bg-orange-500/5 hover:bg-orange-500/10"
                    : "hover:bg-zinc-800/30"
                }`}
              >
                {/* Rank */}
                <div className="col-span-1 flex items-center justify-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${styles.badge} ${styles.glow}`}
                  >
                    {rank <= 3 ? (rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉") : rank}
                  </div>
                </div>

                {/* Builder Info */}
                <div className="col-span-5 sm:col-span-4 flex items-center gap-3 min-w-0">
                  <div className={`relative shrink-0 ${styles.glow}`}>
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={displayName}
                        width={40}
                        height={40}
                        className={`rounded-full ring-2 ${styles.ring} group-hover:ring-orange-500/50 transition-all object-cover`}
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                    {/* Streak badge */}
                    {user.currentStreak > 0 && (
                      <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white ring-2 ring-zinc-900">
                        <Flame className="h-2.5 w-2.5" />
                        {user.currentStreak}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-orange-400 transition-colors">
                      {displayName}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-orange-400">(You)</span>
                      )}
                    </p>
                    {user.headline && (
                      <p className="text-xs text-zinc-500 truncate">{user.headline}</p>
                    )}
                  </div>
                </div>

                {/* Level */}
                <div className="col-span-3 sm:col-span-2 flex items-center justify-center">
                  <div
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${getKarmaLevelColor(
                      user.karmaLevel
                    )}`}
                  >
                    {getKarmaLevelIcon(user.karmaLevel)}
                    <span className="hidden sm:inline">{user.karmaLevel}</span>
                  </div>
                </div>

                {/* Karma */}
                <div className="col-span-3 sm:col-span-2 flex items-center justify-end">
                  <span className="text-lg font-bold text-white">
                    {user.karma.toLocaleString()}
                  </span>
                </div>

                {/* Stats (desktop only) */}
                <div className="hidden sm:flex col-span-3 items-center justify-end gap-4 text-xs text-zinc-500">
                  <div className="text-right">
                    <p className="font-medium text-zinc-300">{user._count.projects}</p>
                    <p>Projects</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-zinc-300">{user._count.dailyUpdates}</p>
                    <p>Updates</p>
                  </div>
                  {user.longestStreak > 0 && (
                    <div className="text-right">
                      <p className="font-medium text-orange-400">{user.longestStreak}</p>
                      <p>Best Streak</p>
                    </div>
                  )}
                </div>
              </div>
            );

            return profileUrl ? (
              <Link key={user.id} href={profileUrl}>
                {content}
              </Link>
            ) : (
              <div key={user.id}>{content}</div>
            );
          })}
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">No builders on the leaderboard yet.</p>
            <p className="text-sm text-zinc-500 mt-1">
              Start contributing to earn karma and climb the ranks!
            </p>
          </div>
        )}
      </div>

      {/* How Karma Works */}
      <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">How Karma Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <h3 className="font-medium text-zinc-300">Earning Karma</h3>
            <ul className="space-y-1 text-zinc-500">
              <li>+25 Launch a project</li>
              <li>+10 Comment marked as helpful</li>
              <li>+5 Post a daily update</li>
              <li>+5 Project upvoted</li>
              <li>+3 Post a comment</li>
              <li>+2 Update liked</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-zinc-300">Streak Bonuses</h3>
            <ul className="space-y-1 text-zinc-500">
              <li>+10 7-day streak</li>
              <li>+25 30-day streak</li>
              <li>+50 100-day streak</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-zinc-300">Karma Levels</h3>
            <ul className="space-y-1 text-zinc-500">
              <li>0+ Newcomer</li>
              <li>100+ Contributor</li>
              <li>500+ Builder</li>
              <li>2,000+ Mentor</li>
              <li>5,000+ Legend</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <div className="relative min-h-screen" style={{ background: "var(--background)" }}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/feed"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Feed
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
            <Trophy className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Top Builders</h1>
            <p className="text-zinc-400">
              Community leaderboard ranked by karma and contributions
            </p>
          </div>
        </div>

        {/* Content */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          }
        >
          <LeaderboardContent />
        </Suspense>
      </div>
    </div>
  );
}
