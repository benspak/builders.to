"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, User, Flame, MapPin, UserPlus, Loader2 } from "lucide-react";
import { BuildingCategory } from "@prisma/client";
import { cn } from "@/lib/utils";

interface SimilarUser {
  id: string;
  slug: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  image: string | null;
  headline: string | null;
  city: string | null;
  country: string | null;
  techStack: string[];
  buildingCategory: BuildingCategory | null;
  karma: number;
  currentStreak: number;
  similarityScore: number;
  matchReasons: string[];
}

interface BuildingSimilarProps {
  limit?: number;
  className?: string;
}

function getDisplayName(user: SimilarUser): string {
  if (user.displayName) return user.displayName;
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.name || "Builder";
}

export function BuildingSimilar({ limit = 5, className }: BuildingSimilarProps) {
  const [users, setUsers] = useState<SimilarUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [loadingFollow, setLoadingFollow] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSimilarUsers() {
      try {
        const response = await fetch(`/api/users/similar?limit=${limit}`);
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
        }
      } catch (error) {
        console.error("Error fetching similar users:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSimilarUsers();
  }, [limit]);

  const handleFollow = async (userId: string) => {
    setLoadingFollow(userId);
    try {
      const response = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isFollowing) {
          setFollowingIds((prev) => new Set([...prev, userId]));
        } else {
          setFollowingIds((prev) => {
            const next = new Set(prev);
            next.delete(userId);
            return next;
          });
        }
      }
    } catch (error) {
      console.error("Error following user:", error);
    } finally {
      setLoadingFollow(null);
    }
  };

  if (loading) {
    return (
      <div className={cn("rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6", className)}>
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Building Similar</h3>
        </div>
        <div className="space-y-3">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="h-10 w-10 rounded-lg bg-zinc-800" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-24 rounded bg-zinc-800" />
                <div className="h-2 w-32 rounded bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className={cn("rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6", className)}>
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Building Similar</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-sm text-zinc-500">No similar builders found yet</p>
          <Link
            href="/settings/profile"
            className="text-xs text-cyan-400 hover:text-cyan-300 mt-1 inline-block"
          >
            Add your tech stack to find matches
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-4 w-4 text-cyan-400" />
        <h3 className="text-sm font-semibold text-white">Building Similar</h3>
      </div>

      <div className="space-y-3">
        {users.map((user) => {
          const displayName = getDisplayName(user);
          const profileUrl = user.slug ? `/${user.slug}` : null;
          const location = user.city && user.country
            ? `${user.city}, ${user.country}`
            : user.city || user.country || null;
          const isFollowing = followingIds.has(user.id);

          return (
            <div
              key={user.id}
              className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-zinc-800/50 transition-colors group"
            >
              {/* Avatar */}
              <Link href={profileUrl || "#"} className="shrink-0">
                <div className="relative">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={displayName}
                      width={40}
                      height={40}
                      className="rounded-lg ring-1 ring-white/10 group-hover:ring-cyan-500/30 transition-all object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500">
                      <User className="h-5 w-5 text-white" />
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
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link href={profileUrl || "#"} className="block min-w-0">
                  <h4 className="text-sm font-medium text-white truncate group-hover:text-cyan-400 transition-colors">
                    {displayName}
                  </h4>
                </Link>

                {/* Match reasons */}
                {user.matchReasons.length > 0 && (
                  <p className="text-xs text-zinc-400 truncate mt-0.5">
                    {user.matchReasons[0]}
                  </p>
                )}

                {/* Location */}
                {location && (
                  <span className="flex items-center gap-1 text-[10px] text-zinc-600 mt-0.5">
                    <MapPin className="h-2.5 w-2.5" />
                    {location}
                  </span>
                )}
              </div>

              {/* Right side: match badge + follow button */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-cyan-500/20 text-cyan-400 whitespace-nowrap">
                  {user.similarityScore}% match
                </span>
                <button
                  onClick={() => handleFollow(user.id)}
                  disabled={loadingFollow === user.id}
                  className={cn(
                    "shrink-0 p-1.5 rounded-lg transition-colors",
                    isFollowing
                      ? "bg-cyan-500/20 text-cyan-400"
                      : "bg-zinc-800 text-zinc-400 hover:bg-cyan-500/20 hover:text-cyan-400"
                  )}
                  title={isFollowing ? "Following" : "Follow"}
                >
                  {loadingFollow === user.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className={cn("h-4 w-4", isFollowing && "fill-current")} />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Link
        href="/discover"
        className="mt-4 block text-center text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        Discover more builders
      </Link>
    </div>
  );
}
