"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Rocket,
  User,
  PartyPopper,
  ExternalLink,
  Loader2
} from "lucide-react";
import { cn, formatRelativeTime, getStatusColor, getStatusLabel } from "@/lib/utils";
import { UserNameWithCompany } from "@/components/ui/user-name-with-company";

interface ProjectStatusChangeCardProps {
  event: {
    id: string;
    type: string;
    title: string; // Contains "OLD_STATUS → NEW_STATUS"
    description?: string | null; // Contains project title
    createdAt: Date | string;
    likesCount: number;
    hasLiked: boolean;
    projectId?: string | null;
    project?: {
      id: string;
      slug?: string | null;
      title: string;
      imageUrl?: string | null;
      status: string;
      user: {
        id: string;
        name?: string | null;
        displayName?: string | null;
        firstName?: string | null;
        lastName?: string | null;
        image?: string | null;
        slug?: string | null;
        companies?: {
          id: string;
          name: string;
          slug: string | null;
          logo: string | null;
        }[];
      };
    } | null;
  };
  currentUserId?: string;
}

export function ProjectStatusChangeCard({ event, currentUserId }: ProjectStatusChangeCardProps) {
  const [liked, setLiked] = useState(event.hasLiked);
  const [likesCount, setLikesCount] = useState(event.likesCount);
  const [loading, setLoading] = useState(false);

  const project = event.project;
  const user = project?.user;

  // Parse the status transition from title (format: "OLD_STATUS → NEW_STATUS")
  const [oldStatus, newStatus] = event.title.split(" → ");

  // Priority: displayName > firstName+lastName > name
  const displayName = user?.displayName
    || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null)
    || user?.name
    || "Builder";

  const projectUrl = project ? `/projects/${project.slug || project.id}` : null;
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

  if (!project) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
      {/* Status change header with gradient */}
      <div className="bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-cyan-500/10 px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 border border-violet-500/30">
            <Rocket className="h-5 w-5 text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-300">
              <span className="font-semibold text-white">Project Status Updated</span>
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
          {projectUrl && (
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
                    <Rocket className="h-8 w-8 text-zinc-600" />
                  </div>
                )}
              </div>
            </Link>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Project title */}
            {projectUrl ? (
              <Link href={projectUrl}>
                <h3 className="font-semibold text-white hover:text-orange-400 transition-colors truncate">
                  {project.title}
                </h3>
              </Link>
            ) : (
              <h3 className="font-semibold text-white truncate">
                {event.description || "Project"}
              </h3>
            )}

            {/* Status transition badges */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium border",
                  getStatusColor(oldStatus)
                )}
              >
                {getStatusLabel(oldStatus)}
              </span>
              <ArrowRight className="h-4 w-4 text-zinc-500" />
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium border",
                  getStatusColor(newStatus)
                )}
              >
                {getStatusLabel(newStatus)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          {/* Author */}
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            {userUrl ? (
              <Link href={userUrl} className="flex-shrink-0">
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
              </Link>
            ) : (
              <>
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
              </>
            )}
            <UserNameWithCompany
              name={displayName}
              slug={user?.slug}
              company={user?.companies?.[0]}
              linkToProfile={!!userUrl}
              className="text-zinc-400 hover:text-white"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Celebrate button */}
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
              <span>{likesCount}</span>
            </button>

            {/* View project */}
            {projectUrl && (
              <Link
                href={projectUrl}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">View</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
