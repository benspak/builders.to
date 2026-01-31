"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  PartyPopper,
  ExternalLink,
  Loader2,
  Users,
  Coffee,
  Building2,
  BookOpen,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { FeedEventComments } from "./feed-event-comments";
import { UserNameWithCompany } from "@/components/ui/user-name-with-company";

const venueIcons = {
  CAFE: Coffee,
  COWORKING_SPACE: Building2,
  LIBRARY: BookOpen,
  OTHER: MapPin,
};

const venueLabels = {
  CAFE: "Cafe",
  COWORKING_SPACE: "Coworking Space",
  LIBRARY: "Library",
  OTHER: "Other",
};

interface CoworkingSessionCreatedCardProps {
  event: {
    id: string;
    type: string;
    title: string;
    description?: string | null;
    createdAt: Date | string;
    likesCount: number;
    hasLiked: boolean;
    commentsCount?: number;
    coworkingSession?: {
      id: string;
      date: Date | string;
      startTime: string;
      endTime: string | null;
      venueName: string;
      venueType: "CAFE" | "COWORKING_SPACE" | "LIBRARY" | "OTHER";
      address: string | null;
      city: string;
      state: string | null;
      country: string;
      maxBuddies: number;
      description: string | null;
      host: {
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
      _count?: {
        buddies: number;
      };
    } | null;
  };
  currentUserId?: string;
}

export function CoworkingSessionCreatedCard({ event, currentUserId }: CoworkingSessionCreatedCardProps) {
  const [liked, setLiked] = useState(event.hasLiked);
  const [likesCount, setLikesCount] = useState(event.likesCount);
  const [loading, setLoading] = useState(false);

  const session = event.coworkingSession;
  const user = session?.host;

  // Priority: displayName > firstName+lastName > name
  const displayName = user?.displayName
    || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null)
    || user?.name
    || "Builder";

  const userUrl = user?.slug ? `/${user.slug}` : null;

  const VenueIcon = session ? venueIcons[session.venueType] : Coffee;
  const venueLabel = session ? venueLabels[session.venueType] : "Venue";

  const sessionDate = session ? new Date(session.date) : null;
  const spotsRemaining = session ? session.maxBuddies - (session._count?.buddies || 0) : 0;

  const formatSessionDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

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

  if (!session) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
      {/* New coworking session header with gradient */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30">
            <Coffee className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-300">
              <span className="font-semibold text-white">New Coworking Session</span>
            </p>
            <p className="text-xs text-zinc-500">
              {formatRelativeTime(event.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Session info */}
        <div className="space-y-3">
          {/* Date, Time, and Location */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {sessionDate && (
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Calendar className="h-3.5 w-3.5" />
                {formatSessionDate(sessionDate)}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-zinc-400">
              <Clock className="h-3.5 w-3.5" />
              {session.startTime}
              {session.endTime && ` - ${session.endTime}`}
            </span>
          </div>

          {/* Venue */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 shrink-0">
              <VenueIcon className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{session.venueName}</h3>
              <p className="text-sm text-zinc-400">
                {venueLabel}
                {session.address && ` · ${session.address}`}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-sm text-zinc-400">
            <MapPin className="h-4 w-4" />
            <span>
              {session.city}
              {session.state && `, ${session.state}`}, {session.country}
            </span>
          </div>

          {/* Description */}
          {session.description && (
            <p className="text-sm text-zinc-400 line-clamp-2">
              {session.description}
            </p>
          )}

          {/* Spots */}
          <div className="flex items-center gap-1.5 text-sm">
            <Users className="h-4 w-4 text-zinc-500" />
            {spotsRemaining <= 0 ? (
              <span className="text-red-400">Full</span>
            ) : (
              <span className="text-emerald-400">
                {spotsRemaining} spot{spotsRemaining !== 1 && "s"} available
              </span>
            )}
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
            <span className="text-xs">Hosted by</span>
            <UserNameWithCompany
              name={displayName}
              slug={user?.slug}
              company={user?.companies?.[0]}
              linkToProfile={!!userUrl}
              className="text-zinc-400 hover:text-white"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Comments button */}
            <FeedEventComments
              feedEventId={event.id}
              currentUserId={currentUserId}
              initialCommentsCount={event.commentsCount ?? 0}
              accentColor="emerald"
            >
              {/* Original content for modal */}
              <div className="space-y-3">
                {/* Date, Time */}
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {sessionDate && (
                    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatSessionDate(sessionDate)}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-zinc-400">
                    <Clock className="h-3.5 w-3.5" />
                    {session.startTime}
                    {session.endTime && ` - ${session.endTime}`}
                  </span>
                </div>

                {/* Venue */}
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 shrink-0">
                    <VenueIcon className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{session.venueName}</h3>
                    <p className="text-sm text-zinc-400">
                      {venueLabel}
                      {session.address && ` · ${session.address}`}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {session.city}
                    {session.state && `, ${session.state}`}, {session.country}
                  </span>
                </div>

                {/* Description */}
                {session.description && (
                  <p className="text-sm text-zinc-400">
                    {session.description}
                  </p>
                )}
              </div>
            </FeedEventComments>

            {/* Celebrate button */}
            <button
              onClick={handleLike}
              disabled={!currentUserId || loading}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                liked
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800 hover:text-white hover:border-zinc-600",
                (!currentUserId || loading) && "opacity-50 cursor-not-allowed"
              )}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PartyPopper className={cn("h-4 w-4", liked && "text-emerald-400")} />
              )}
              <span>{likesCount}</span>
            </button>

            {/* View session link */}
            <Link
              href="/coworking"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Join</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
