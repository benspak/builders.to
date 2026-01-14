"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MessageCircle,
  User,
  Heart,
  Loader2
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { FeedEventComments } from "./feed-event-comments";
import { UserNameWithCompany } from "@/components/ui/user-name-with-company";

interface StatusUpdateCardProps {
  event: {
    id: string;
    type: string;
    title: string;
    createdAt: Date | string;
    likesCount: number;
    hasLiked: boolean;
    commentsCount?: number;
    user: {
      id: string;
      name?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      image?: string | null;
      slug?: string | null;
      headline?: string | null;
      companies?: {
        id: string;
        name: string;
        slug: string | null;
        logo: string | null;
      }[];
    };
  };
  currentUserId?: string;
}

export function StatusUpdateCard({ event, currentUserId }: StatusUpdateCardProps) {
  const [liked, setLiked] = useState(event.hasLiked);
  const [likesCount, setLikesCount] = useState(event.likesCount);
  const [loading, setLoading] = useState(false);

  const user = event.user;

  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.name || "Builder";

  const userUrl = user?.slug ? `/${user.slug}` : null;

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

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
      {/* Status header with gradient */}
      <div className="bg-gradient-to-r from-orange-500/10 via-cyan-500/10 to-violet-500/10 px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 border border-orange-500/30">
            <MessageCircle className="h-5 w-5 text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-300">
              <span className="font-semibold text-white">Status Update</span>
            </p>
            <p className="text-xs text-zinc-500">
              {formatRelativeTime(event.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* User and status */}
        <div className="flex items-start gap-4">
          {/* User avatar */}
          {userUrl ? (
            <Link href={userUrl} className="flex-shrink-0">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={displayName}
                  width={48}
                  height={48}
                  className="rounded-xl ring-2 ring-white/10 hover:ring-orange-500/30 transition-all"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-500">
                  <User className="h-6 w-6 text-white" />
                </div>
              )}
            </Link>
          ) : (
            <div className="flex-shrink-0">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={displayName}
                  width={48}
                  height={48}
                  className="rounded-xl ring-2 ring-white/10"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-500">
                  <User className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* User name and headline */}
            <h3 className="font-semibold">
              <UserNameWithCompany
                name={displayName}
                slug={user?.slug}
                company={user?.companies?.[0]}
                linkToProfile={!!userUrl}
                className="text-white hover:text-orange-400"
              />
            </h3>
            {user?.headline && (
              <p className="text-xs text-zinc-500 truncate">{user.headline}</p>
            )}

            {/* Status message */}
            <div className="mt-3 p-4 rounded-xl bg-gradient-to-r from-orange-500/5 to-cyan-500/5 border border-orange-500/20">
              <p className="text-zinc-200 text-base leading-relaxed">
                {event.title}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          {/* View profile link */}
          {userUrl && (
            <Link
              href={userUrl}
              className="text-sm text-zinc-500 hover:text-orange-400 transition-colors"
            >
              View profile →
            </Link>
          )}
          {!userUrl && <div />}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Comments button */}
            <FeedEventComments
              feedEventId={event.id}
              currentUserId={currentUserId}
              initialCommentsCount={event.commentsCount ?? 0}
              accentColor="orange"
            >
              {/* Original content for modal */}
              <div className="flex items-start gap-4">
                {/* User avatar */}
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={displayName}
                    width={48}
                    height={48}
                    className="rounded-xl ring-2 ring-white/10"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-500">
                    <User className="h-6 w-6 text-white" />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white">{displayName}</h3>
                  {user?.headline && (
                    <p className="text-xs text-zinc-500 truncate">{user.headline}</p>
                  )}

                  {/* Status message */}
                  <div className="mt-3 p-4 rounded-xl bg-gradient-to-r from-orange-500/5 to-cyan-500/5 border border-orange-500/20">
                    <p className="text-zinc-200 text-base leading-relaxed">
                      {event.title}
                    </p>
                  </div>
                </div>
              </div>
            </FeedEventComments>

            {/* Like button */}
            <button
              onClick={handleLike}
              disabled={!currentUserId || loading}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                liked
                  ? "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                  : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800 hover:text-white hover:border-zinc-600",
                (!currentUserId || loading) && "opacity-50 cursor-not-allowed"
              )}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className={cn("h-4 w-4", liked && "fill-current")} />
              )}
              <span>{likesCount}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
