"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trophy, User, Flame } from "lucide-react";
import { KarmaLevel } from "@prisma/client";
import { KarmaBadge } from "./karma-badge";

interface LeaderboardUser {
  id: string;
  slug: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  image: string | null;
  karma: number;
  karmaLevel: KarmaLevel;
  currentStreak: number;
}

interface KarmaLeaderboardProps {
  limit?: number;
}

function getDisplayName(user: LeaderboardUser): string {
  if (user.displayName) return user.displayName;
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.name || "Builder";
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

export function KarmaLeaderboard({ limit = 5 }: KarmaLeaderboardProps) {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch(`/api/karma/leaderboard?limit=${limit}`);
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [limit]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Top Builders</h3>
        </div>
        <div className="space-y-3">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="h-5 w-5 rounded-full bg-zinc-800" />
              <div className="h-8 w-8 rounded-lg bg-zinc-800" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-24 rounded bg-zinc-800" />
                <div className="h-2 w-16 rounded bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-white">Top Builders</h3>
      </div>

      <div className="space-y-2">
        {users.map((user, index) => {
          const displayName = getDisplayName(user);
          const profileUrl = user.slug ? `/${user.slug}` : null;
          const rank = index + 1;

          const content = (
            <div className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-zinc-800/50 transition-colors group">
              {/* Rank */}
              {getRankBadge(rank)}

              {/* Avatar */}
              <div className="relative shrink-0">
                {user.image ? (
                  <Image
                    src={user.image}
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
                {user.currentStreak > 0 && (
                  <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 rounded-full bg-orange-500 px-1 py-0.5 text-[8px] font-bold text-white ring-2 ring-zinc-900">
                    <Flame className="h-2 w-2" />
                    {user.currentStreak}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white truncate group-hover:text-amber-400 transition-colors">
                  {displayName}
                </h4>
                <KarmaBadge
                  karma={user.karma}
                  level={user.karmaLevel}
                  size="sm"
                  showPoints
                />
              </div>
            </div>
          );

          if (profileUrl) {
            return (
              <Link key={user.id} href={profileUrl}>
                {content}
              </Link>
            );
          }

          return <div key={user.id}>{content}</div>;
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
