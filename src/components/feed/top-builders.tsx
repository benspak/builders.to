import Link from "next/link";
import Image from "next/image";
import { Trophy, User, Flame, Rocket } from "lucide-react";

interface TopBuilder {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  slug: string | null;
  headline: string | null;
  currentStreak: number;
  longestStreak: number;
  launchedProjects: number;
  coLaunchedProjects: number;
  totalProjects: number;
  rankingScore: number;
}

interface TopBuildersProps {
  builders: TopBuilder[];
}

function getDisplayName(builder: TopBuilder): string {
  if (builder.firstName && builder.lastName) {
    return `${builder.firstName} ${builder.lastName}`;
  }
  return builder.name || "Builder";
}

function getRankBadge(rank: number) {
  if (rank === 1) {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black">
        1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-400 text-[10px] font-bold text-black">
        2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-700 text-[10px] font-bold text-white">
        3
      </span>
    );
  }
  return (
    <span className="flex h-5 w-5 items-center justify-center text-xs text-zinc-500">
      {rank}
    </span>
  );
}

export function TopBuilders({ builders }: TopBuildersProps) {
  if (builders.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-white">Top Builders</h3>
      </div>

      <div className="space-y-2">
        {builders.map((builder, index) => {
          const displayName = getDisplayName(builder);
          const profileUrl = builder.slug ? `/${builder.slug}` : null;
          const rank = index + 1;

          const content = (
            <div className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-zinc-800/50 transition-colors group">
              {/* Rank */}
              {getRankBadge(rank)}

              {/* Avatar */}
              <div className="relative shrink-0">
                {builder.image ? (
                  <Image
                    src={builder.image}
                    alt={displayName}
                    width={32}
                    height={32}
                    className="rounded-lg ring-1 ring-white/10 group-hover:ring-amber-500/30 transition-all object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}

                {/* Streak badge */}
                {builder.currentStreak > 0 && (
                  <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 rounded-full bg-orange-500 px-1 py-0.5 text-[8px] font-bold text-white ring-2 ring-zinc-900">
                    <Flame className="h-2 w-2" />
                    {builder.currentStreak}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white truncate group-hover:text-amber-400 transition-colors">
                  {displayName}
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                  <span className="flex items-center gap-0.5">
                    <Rocket className="h-2.5 w-2.5 text-green-500" />
                    {builder.launchedProjects} launched
                  </span>
                  {builder.coLaunchedProjects > 0 && (
                    <span>+{builder.coLaunchedProjects} co-built</span>
                  )}
                </div>
              </div>
            </div>
          );

          if (profileUrl) {
            return (
              <Link key={builder.id} href={profileUrl}>
                {content}
              </Link>
            );
          }

          return <div key={builder.id}>{content}</div>;
        })}
      </div>

      <Link
        href="/leaderboard"
        className="mt-4 block text-center text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        View full leaderboard
      </Link>
    </div>
  );
}
