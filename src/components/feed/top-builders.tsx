"use client";

import Link from "next/link";
import Image from "next/image";
import { Trophy, User, Rocket, Users, Coins } from "lucide-react";

interface TopBuilder {
  id: string;
  name: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  slug: string | null;
  headline: string | null;
  totalProjects: number;
  lifetimeTokensEarned: number;
  launchedProjects: number;
  coLaunchedProjects: number;
  rankingScore: number;
  _count: {
    projects: number;
    coBuilderOn: number;
  };
}

interface TopBuildersProps {
  builders: TopBuilder[];
}

export function TopBuilders({ builders }: TopBuildersProps) {
  if (builders.length === 0) {
    return null;
  }

  const getDisplayName = (builder: TopBuilder) => {
    // Priority: displayName > firstName+lastName > name
    if (builder.displayName) return builder.displayName;
    if (builder.firstName && builder.lastName) {
      return `${builder.firstName} ${builder.lastName}`;
    }
    return builder.name || "Anonymous Builder";
  };

  const getRankStyles = (index: number) => {
    switch (index) {
      case 0:
        return {
          badge: "bg-gradient-to-r from-amber-400 to-yellow-500 text-black",
          glow: "shadow-amber-500/30",
          icon: "🥇",
        };
      case 1:
        return {
          badge: "bg-gradient-to-r from-slate-300 to-zinc-400 text-black",
          glow: "shadow-slate-400/20",
          icon: "🥈",
        };
      case 2:
        return {
          badge: "bg-gradient-to-r from-amber-600 to-orange-700 text-white",
          glow: "shadow-orange-600/20",
          icon: "🥉",
        };
      default:
        return {
          badge: "bg-zinc-700/50 text-zinc-400",
          glow: "",
          icon: `#${index + 1}`,
        };
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-zinc-800/50 bg-zinc-900/80">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
          <Trophy className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Top Builders</h3>
          <p className="text-[10px] text-zinc-500">Launches, collabs & engagement</p>
        </div>
      </div>

      {/* Builders List */}
      <div className="divide-y divide-zinc-800/30">
        {builders.map((builder, index) => {
          const styles = getRankStyles(index);
          const profileUrl = builder.slug ? `/${builder.slug}` : null;

          const content = (
            <>
              {/* Rank Badge */}
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold shrink-0 ${styles.badge} ${styles.glow} shadow-sm`}
              >
                {index < 3 ? styles.icon : index + 1}
              </div>

              {/* Avatar */}
              <div className="relative shrink-0">
                {builder.image ? (
                  <Image
                    src={builder.image}
                    alt={getDisplayName(builder)}
                    width={32}
                    height={32}
                    className="rounded-full ring-2 ring-zinc-800 group-hover:ring-zinc-700 transition-all"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 ring-2 ring-zinc-700">
                    <User className="h-4 w-4 text-zinc-500" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-200 truncate group-hover:text-white transition-colors">
                  {getDisplayName(builder)}
                </p>
                {builder.headline && (
                  <p className="text-[11px] text-zinc-500 truncate">
                    {builder.headline}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-1.5 shrink-0" title={`${builder.launchedProjects} launched, ${builder.coLaunchedProjects} co-launched, ${builder.lifetimeTokensEarned} tokens`}>
                {/* Launched Projects */}
                <div className="flex items-center gap-0.5">
                  <Rocket className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-400">
                    {builder.launchedProjects}
                  </span>
                </div>
                {/* Co-launched Projects */}
                {builder.coLaunchedProjects > 0 && (
                  <div className="flex items-center gap-0.5 pl-1 border-l border-zinc-700">
                    <Users className="h-2.5 w-2.5 text-violet-400" />
                    <span className="text-[10px] text-violet-400">
                      {builder.coLaunchedProjects}
                    </span>
                  </div>
                )}
                {/* Lifetime Tokens */}
                {builder.lifetimeTokensEarned > 0 && (
                  <div className="flex items-center gap-0.5 pl-1 border-l border-zinc-700">
                    <Coins className="h-2.5 w-2.5 text-amber-400" />
                    <span className="text-[10px] text-amber-400">
                      {builder.lifetimeTokensEarned}
                    </span>
                  </div>
                )}
              </div>
            </>
          );

          return profileUrl ? (
            <Link
              key={builder.id}
              href={profileUrl}
              className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/30 transition-colors group"
            >
              {content}
            </Link>
          ) : (
            <div
              key={builder.id}
              className="flex items-center gap-3 px-4 py-3"
            >
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
