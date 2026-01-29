"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  User,
  Check,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistance } from "@/lib/geo";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    startsAt: string | Date;
    endsAt?: string | Date | null;
    timezone: string;
    isVirtual: boolean;
    virtualUrl?: string | null;
    venue?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    maxAttendees?: number | null;
    imageUrl?: string | null;
    attendeeCount: number;
    userRsvpStatus?: string | null;
    distanceKm?: number;
    organizer: {
      id: string;
      name?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      image?: string | null;
      slug?: string | null;
    };
  };
  /** Show compact card */
  compact?: boolean;
}

export function EventCard({ event, compact = false }: EventCardProps) {
  const startDate = new Date(event.startsAt);
  const endDate = event.endsAt ? new Date(event.endsAt) : null;

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

  const organizerName =
    event.organizer.firstName && event.organizer.lastName
      ? `${event.organizer.firstName} ${event.organizer.lastName}`
      : event.organizer.name || "Anonymous";

  const location = event.isVirtual
    ? "Virtual Event"
    : [event.venue, event.city, event.country].filter(Boolean).join(", ");

  const isPast = startDate < new Date();
  const isGoing = event.userRsvpStatus === "GOING";
  const isInterested = event.userRsvpStatus === "INTERESTED";

  return (
    <Link href={`/events/${event.id}`}>
      <div
        className={cn(
          "group relative rounded-xl border border-white/5 bg-zinc-900/30 overflow-hidden transition-all hover:border-white/10 hover:bg-zinc-900/50",
          isPast && "opacity-60"
        )}
      >
        {/* Event Image */}
        {event.imageUrl && !compact && (
          <div className="relative h-40 w-full">
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover"
            />
            {event.isVirtual && (
              <div className="absolute top-2 right-2 flex items-center gap-1.5 rounded-full bg-violet-500/90 px-2.5 py-1 text-xs font-medium text-white">
                <Video className="h-3 w-3" />
                Virtual
              </div>
            )}
          </div>
        )}

        <div className="p-4">
          {/* Date & RSVP Status */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-orange-400 text-sm">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{formatEventDate(startDate)}</span>
              <span className="text-zinc-500">·</span>
              <Clock className="h-3.5 w-3.5 text-zinc-500" />
              <span className="text-zinc-400">{formatEventTime(startDate)}</span>
            </div>
            {isGoing && (
              <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <Check className="h-3 w-3" />
                Going
              </span>
            )}
            {isInterested && (
              <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                <Star className="h-3 w-3" />
                Interested
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            className={cn(
              "font-semibold text-white group-hover:text-orange-400 transition-colors line-clamp-2",
              compact ? "text-base" : "text-lg"
            )}
          >
            {event.title}
          </h3>

          {/* Location */}
          <div className="mt-2 flex items-center gap-1.5 text-sm text-zinc-400">
            {event.isVirtual ? (
              <Video className="h-4 w-4 text-violet-400" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            <span className="truncate">{location}</span>
            {event.distanceKm !== undefined && !event.isVirtual && (
              <span className="text-orange-400 ml-1">
                ({formatDistance(event.distanceKm)})
              </span>
            )}
          </div>

          {/* Description preview */}
          {!compact && (
            <p className="mt-2 text-sm text-zinc-500 line-clamp-2">
              {event.description}
            </p>
          )}

          {/* Footer: Organizer & Attendees */}
          <div className="mt-3 flex items-center justify-between">
            {/* Organizer */}
            <div className="flex items-center gap-2">
              {event.organizer.image ? (
                <Image
                  src={event.organizer.image}
                  alt={organizerName}
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-full"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-700">
                  <User className="h-3 w-3 text-zinc-400" />
                </div>
              )}
              <span className="text-xs text-zinc-500">
                by{" "}
                <span className="text-zinc-300">
                  {event.organizer.slug ? (
                    <Link
                      href={`/${event.organizer.slug}`}
                      className="hover:text-orange-400 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {organizerName}
                    </Link>
                  ) : (
                    organizerName
                  )}
                </span>
              </span>
            </div>

            {/* Attendee count */}
            <div className="flex items-center gap-1.5 text-sm text-zinc-500">
              <Users className="h-4 w-4" />
              <span>{event.attendeeCount}</span>
              {event.maxAttendees && (
                <span className="text-zinc-600">/ {event.maxAttendees}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
