"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  UserPlus,
  User,
  MapPin,
  PartyPopper,
  Loader2
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";

interface UserJoinedCardProps {
  event: {
    id: string;
    type: string;
    title: string;
    description?: string | null;
    createdAt: Date | string;
    likesCount: number;
    hasLiked: boolean;
    user: {
      id: string;
      name?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      image?: string | null;
      slug?: string | null;
      headline?: string | null;
      city?: string | null;
      state?: string | null;
    };
  };
  currentUserId?: string;
}

export function UserJoinedCard({ event, currentUserId }: UserJoinedCardProps) {
  const [liked, setLiked] = useState(event.hasLiked);
  const [likesCount, setLikesCount] = useState(event.likesCount);
  const [loading, setLoading] = useState(false);

  const user = event.user;

  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.name || "New Builder";

  const userUrl = user?.slug ? `/${user.slug}` : null;

  // Format location string
  const location = user?.city && user?.state
    ? `${user.city}, ${user.state}`
    : user?.city || user?.state || null;

  const handleLike = async () => {
    if (!currentUserId || loading) return;

    setLoading(true);

    // Optimistic update
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);

    try {
      const response = await fetch(`/api/feed-events/${event.id}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        // Revert on error
        setLiked(liked);
        setLikesCount(likesCount);
      }
    } catch {
      // Revert on error
      setLiked(liked);
      setLikesCount(likesCount);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
      {/* Welcome header with gradient */}
      <div className="bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 border border-violet-500/30">
            <UserPlus className="h-5 w-5 text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-300">
              <span className="font-semibold text-white">New Builder Joined</span>
            </p>
            <p className="text-xs text-zinc-500">
              {formatRelativeTime(event.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* User info */}
        <div className="flex items-start gap-4">
          {/* User avatar */}
          {userUrl ? (
            <Link href={userUrl} className="flex-shrink-0">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={displayName}
                  width={64}
                  height={64}
                  className="rounded-xl ring-2 ring-white/10 hover:ring-violet-500/30 transition-all"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500">
                  <User className="h-8 w-8 text-white" />
                </div>
              )}
            </Link>
          ) : (
            <div className="flex-shrink-0">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={displayName}
                  width={64}
                  height={64}
                  className="rounded-xl ring-2 ring-white/10"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500">
                  <User className="h-8 w-8 text-white" />
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* User name */}
            {userUrl ? (
              <Link href={userUrl}>
                <h3 className="font-semibold text-lg text-white hover:text-violet-400 transition-colors">
                  {displayName}
                </h3>
              </Link>
            ) : (
              <h3 className="font-semibold text-lg text-white">{displayName}</h3>
            )}

            {/* Headline */}
            {user.headline && (
              <p className="mt-1 text-sm text-zinc-400 line-clamp-2">
                {user.headline}
              </p>
            )}

            {/* Location badge */}
            {location && (
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1.5 text-sm font-medium text-violet-300 border border-violet-500/20">
                  <MapPin className="h-3.5 w-3.5" />
                  {location}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          {/* View profile link */}
          {userUrl && (
            <Link
              href={userUrl}
              className="text-sm text-zinc-500 hover:text-violet-400 transition-colors"
            >
              View profile →
            </Link>
          )}
          {!userUrl && <div />}

          {/* Welcome button */}
          <button
            onClick={handleLike}
            disabled={!currentUserId || loading}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              liked
                ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800 hover:text-white hover:border-zinc-600",
              (!currentUserId || loading) && "opacity-50 cursor-not-allowed"
            )}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PartyPopper className={cn("h-4 w-4", liked && "text-violet-400")} />
            )}
            <span>{likesCount > 0 ? likesCount : "Welcome!"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
