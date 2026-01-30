"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  PartyPopper,
  ExternalLink,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { FeedEventComments } from "./feed-event-comments";
import { UserNameWithCompany } from "@/components/ui/user-name-with-company";

interface EventCreatedCardProps {
  event: {
    id: string;
    type: string;
    title: string;
    description?: string | null;
    createdAt: Date | string;
    likesCount: number;
    hasLiked: boolean;
    commentsCount?: number;
    communityEvent?: {
      id: string;
      title: string;
      description: string;
      startsAt: Date | string;
      endsAt?: Date | string | null;
      timezone: string;
      isVirtual: boolean;
      venue?: string | null;
      city?: string | null;
      country?: string | null;
      organizer: {
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

export function EventCreatedCard({ event, currentUserId }: EventCreatedCardProps) {
  const [liked, setLiked] = useState(event.hasLiked);
  const [likesCount, setLikesCount] = useState(event.likesCount);
  const [loading, setLoading] = useState(false);

  const communityEvent = event.communityEvent;
  const user = communityEvent?.organizer;

  // Priority: displayName > firstName+lastName > name
  const displayName = user?.displayName
    || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null)
    || user?.name
    || "Builder";

  const eventUrl = communityEvent ? `/events/${communityEvent.id}` : null;
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

  if (!communityEvent) return null;

  const startDate = new Date(communityEvent.startsAt);
  
  const formatEventDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatEventTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const location = communityEvent.isVirtual
    ? "Virtual Event"
    : [communityEvent.venue, communityEvent.city, communityEvent.country]
        .filter(Boolean)
        .join(", ");

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
      {/* New event header with gradient */}
      <div className="bg-gradient-to-r from-orange-500/10 via-pink-500/10 to-purple-500/10 px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 border border-orange-500/30">
            <CalendarDays className="h-5 w-5 text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-300">
              <span className="font-semibold text-white">New Event Created</span>
            </p>
            <p className="text-xs text-zinc-500">
              {formatRelativeTime(event.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Event info */}
        <div className="space-y-3">
          {/* Date/Time and Type */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-orange-400 text-sm">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{formatEventDate(startDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatEventTime(startDate)}</span>
            </div>
            {communityEvent.isVirtual && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-medium text-violet-400 border border-violet-500/20">
                <Video className="h-3 w-3" />
                Virtual
              </span>
            )}
          </div>

          {/* Title */}
          {eventUrl ? (
            <Link href={eventUrl}>
              <h3 className="text-lg font-semibold text-white hover:text-orange-400 transition-colors">
                {communityEvent.title}
              </h3>
            </Link>
          ) : (
            <h3 className="text-lg font-semibold text-white">
              {communityEvent.title}
            </h3>
          )}

          {/* Location */}
          <div className="flex items-center gap-1.5 text-sm text-zinc-400">
            {communityEvent.isVirtual ? (
              <Video className="h-4 w-4 text-violet-400" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            <span>{location}</span>
          </div>

          {/* Description preview */}
          <p className="text-sm text-zinc-400 line-clamp-2">
            {communityEvent.description}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          {/* Organizer */}
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
          <div className="flex items-center gap-2">
            {/* Comments button */}
            <FeedEventComments
              feedEventId={event.id}
              currentUserId={currentUserId}
              initialCommentsCount={event.commentsCount ?? 0}
              accentColor="orange"
            >
              {/* Original content for modal */}
              <div className="space-y-3">
                {/* Date/Time */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-orange-400 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">{formatEventDate(startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatEventTime(startDate)}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-white">
                  {communityEvent.title}
                </h3>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                  {communityEvent.isVirtual ? (
                    <Video className="h-4 w-4 text-violet-400" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  <span>{location}</span>
                </div>

                {/* Description */}
                <p className="text-sm text-zinc-400">
                  {communityEvent.description}
                </p>
              </div>
            </FeedEventComments>

            {/* Celebrate button */}
            <button
              onClick={handleLike}
              disabled={!currentUserId || loading}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                liked
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                  : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800 hover:text-white hover:border-zinc-600",
                (!currentUserId || loading) && "opacity-50 cursor-not-allowed"
              )}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PartyPopper className={cn("h-4 w-4", liked && "text-orange-400")} />
              )}
              <span>{likesCount}</span>
            </button>

            {/* View event */}
            {eventUrl && (
              <Link
                href={eventUrl}
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
