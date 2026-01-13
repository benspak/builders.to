"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Trophy,
  User,
  PartyPopper,
  ExternalLink,
  Loader2
} from "lucide-react";
import { cn, formatRelativeTime, getMilestoneColor, getMilestoneLabel, getStatusColor, getStatusLabel } from "@/lib/utils";
import { FeedEventComments } from "./feed-event-comments";

interface MilestoneEventCardProps {
  event: {
    id: string;
    type: string;
    title: string;
    description?: string | null;
    createdAt: Date | string;
    likesCount: number;
    hasLiked: boolean;
    commentsCount?: number;
    milestone?: {
      id: string;
      type: string;
      title?: string | null;
      achievedAt: Date | string;
      project: {
        id: string;
        slug?: string | null;
        title: string;
        imageUrl?: string | null;
        status: string;
        user: {
          id: string;
          name?: string | null;
          firstName?: string | null;
          lastName?: string | null;
          image?: string | null;
          slug?: string | null;
        };
      };
    } | null;
  };
  currentUserId?: string;
}

export function MilestoneEventCard({ event, currentUserId }: MilestoneEventCardProps) {
  const [liked, setLiked] = useState(event.hasLiked);
  const [likesCount, setLikesCount] = useState(event.likesCount);
  const [loading, setLoading] = useState(false);

  const milestone = event.milestone;
  const project = milestone?.project;
  const user = project?.user;

  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.name || "Builder";

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

  if (!milestone || !project) return null;

  const projectUrl = `/projects/${project.slug || project.id}`;
  const userUrl = user?.slug ? `/${user.slug}` : null;

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
      {/* Milestone header with gradient */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-pink-500/10 px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30">
            <Trophy className="h-5 w-5 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-300">
              <span className="font-semibold text-white">Milestone Achieved!</span>
            </p>
            <p className="text-xs text-zinc-500">
              {formatRelativeTime(event.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Project info */}
        <div className="flex gap-4">
          {/* Project thumbnail */}
          <Link href={projectUrl} className="flex-shrink-0">
            <div className="relative h-20 w-28 rounded-xl overflow-hidden bg-zinc-800 border border-white/10 group">
              {project.imageUrl ? (
                <Image
                  src={project.imageUrl}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Trophy className="h-8 w-8 text-zinc-600" />
                </div>
              )}
            </div>
          </Link>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Project title */}
            <Link href={projectUrl}>
              <h3 className="font-semibold text-white hover:text-orange-400 transition-colors truncate">
                {project.title}
              </h3>
            </Link>

            {/* Milestone badge */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium border",
                  getMilestoneColor(milestone.type)
                )}
              >
                {getMilestoneLabel(milestone.type)}
              </span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
                  getStatusColor(project.status)
                )}
              >
                {getStatusLabel(project.status)}
              </span>
            </div>

            {/* Description if any */}
            {event.description && (
              <p className="mt-3 text-sm text-zinc-400 line-clamp-2">
                {event.description}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          {/* Author */}
          {userUrl ? (
            <Link
              href={userUrl}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={displayName}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-700">
                  <User className="h-3 w-3 text-zinc-400" />
                </div>
              )}
              <span>{displayName}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={displayName}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-700">
                  <User className="h-3 w-3 text-zinc-400" />
                </div>
              )}
              <span>{displayName}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Comments button */}
            <FeedEventComments
              feedEventId={event.id}
              currentUserId={currentUserId}
              initialCommentsCount={event.commentsCount ?? 0}
              accentColor="amber"
            >
              {/* Original content for modal */}
              <div className="flex gap-4">
                {/* Project thumbnail */}
                <div className="relative h-20 w-28 rounded-xl overflow-hidden bg-zinc-800 border border-white/10 flex-shrink-0">
                  {project.imageUrl ? (
                    <Image
                      src={project.imageUrl}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Trophy className="h-8 w-8 text-zinc-600" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">
                    {project.title}
                  </h3>

                  {/* Milestone badge */}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium border",
                        getMilestoneColor(milestone.type)
                      )}
                    >
                      {getMilestoneLabel(milestone.type)}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
                        getStatusColor(project.status)
                      )}
                    >
                      {getStatusLabel(project.status)}
                    </span>
                  </div>

                  {/* Description if any */}
                  {event.description && (
                    <p className="mt-3 text-sm text-zinc-400">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            </FeedEventComments>

            {/* Celebrate button */}
            <button
              onClick={handleLike}
              disabled={!currentUserId || loading}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                liked
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800 hover:text-white hover:border-zinc-600",
                (!currentUserId || loading) && "opacity-50 cursor-not-allowed"
              )}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PartyPopper className={cn("h-4 w-4", liked && "text-amber-400")} />
              )}
              <span>{likesCount}</span>
              <span className="hidden sm:inline">{liked ? "Celebrated!" : "Celebrate"}</span>
            </button>

            {/* View project */}
            <Link
              href={projectUrl}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">View</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
