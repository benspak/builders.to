"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, MapPin, Video, Users, User } from "lucide-react";

interface UpcomingEvent {
  id: string;
  title: string;
  startsAt: string | Date;
  isVirtual: boolean;
  city?: string | null;
  country?: string | null;
  venue?: string | null;
  attendeeCount: number;
  organizer: {
    id: string;
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    image?: string | null;
    slug?: string | null;
  };
}

interface UpcomingEventsProps {
  events: UpcomingEvent[];
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  if (events.length === 0) {
    return null;
  }

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

  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800/50 bg-gradient-to-r from-orange-500/10 to-transparent">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20">
            <Calendar className="h-4 w-4 text-orange-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Upcoming Events</h3>
            <p className="text-xs text-zinc-500">Meetups & gatherings</p>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="divide-y divide-zinc-800/30">
        {events.map((event) => {
          const startDate = new Date(event.startsAt);
          const organizerName =
            event.organizer.firstName && event.organizer.lastName
              ? `${event.organizer.firstName} ${event.organizer.lastName}`
              : event.organizer.name || "Anonymous";

          const location = event.isVirtual
            ? "Virtual"
            : [event.city, event.country].filter(Boolean).join(", ") || "TBA";

          return (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="block px-4 py-3 hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-start gap-3">
                {/* Date Badge */}
                <div className="flex flex-col items-center justify-center h-10 w-10 flex-shrink-0 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <span className="text-[10px] font-medium text-orange-400 uppercase leading-none">
                    {startDate.toLocaleDateString("en-US", { month: "short" })}
                  </span>
                  <span className="text-sm font-bold text-white leading-tight">
                    {startDate.getDate()}
                  </span>
                </div>

                {/* Event Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white truncate group-hover:text-orange-400 transition-colors">
                    {event.title}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-zinc-400 mt-0.5">
                    <Clock className="h-3 w-3" />
                    <span>{formatEventTime(startDate)}</span>
                  </div>

                  {/* Meta */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                    <span className="flex items-center gap-0.5 text-zinc-500">
                      {event.isVirtual ? (
                        <Video className="h-3 w-3 text-violet-400" />
                      ) : (
                        <MapPin className="h-3 w-3" />
                      )}
                      <span className="truncate">{location}</span>
                    </span>

                    <span className="flex items-center gap-0.5 text-zinc-500">
                      <Users className="h-3 w-3" />
                      {event.attendeeCount}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* View All Link */}
      <Link
        href="/events"
        className="block px-4 py-2.5 text-center text-sm font-medium text-orange-400 hover:text-orange-300 hover:bg-white/5 border-t border-zinc-800/50 transition-colors"
      >
        View all events →
      </Link>
    </div>
  );
}
