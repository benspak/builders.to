"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Coffee,
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  Building2,
  BookOpen,
} from "lucide-react";

const venueIcons = {
  CAFE: Coffee,
  COWORKING_SPACE: Building2,
  LIBRARY: BookOpen,
  OTHER: MapPin,
};

interface CoworkingSession {
  id: string;
  date: string | Date;
  startTime: string;
  endTime: string | null;
  venueName: string;
  venueType: "CAFE" | "COWORKING_SPACE" | "LIBRARY" | "OTHER";
  city: string;
  state: string | null;
  country: string;
  spotsRemaining: number;
  host: {
    id: string;
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    image?: string | null;
    slug?: string | null;
  };
}

interface OpenCoworkingSessionsProps {
  sessions: CoworkingSession[];
}

export function OpenCoworkingSessions({ sessions }: OpenCoworkingSessionsProps) {
  if (sessions.length === 0) {
    return null;
  }

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

  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800/50 bg-gradient-to-r from-emerald-500/10 to-transparent">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
            <Coffee className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Coworking Sessions</h3>
            <p className="text-xs text-zinc-500">Find a buddy to work with</p>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="divide-y divide-zinc-800/30">
        {sessions.map((session) => {
          const sessionDate = new Date(session.date);
          const VenueIcon = venueIcons[session.venueType];
          const hostName =
            session.host.firstName && session.host.lastName
              ? `${session.host.firstName} ${session.host.lastName}`
              : session.host.name || "Builder";

          return (
            <Link
              key={session.id}
              href="/coworking"
              className="block px-4 py-3 hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-start gap-3">
                {/* Date Badge */}
                <div className="flex flex-col items-center justify-center h-10 w-10 flex-shrink-0 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] font-medium text-emerald-400 uppercase leading-none">
                    {sessionDate.toLocaleDateString("en-US", { month: "short" })}
                  </span>
                  <span className="text-sm font-bold text-white leading-tight">
                    {sessionDate.getDate()}
                  </span>
                </div>

                {/* Session Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white truncate group-hover:text-emerald-400 transition-colors">
                    {session.venueName}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-zinc-400 mt-0.5">
                    <Clock className="h-3 w-3" />
                    <span>{session.startTime}</span>
                    {session.endTime && <span> - {session.endTime}</span>}
                  </div>

                  {/* Meta */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                    <span className="flex items-center gap-0.5 text-zinc-500">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">
                        {session.city}
                        {session.state && `, ${session.state}`}
                      </span>
                    </span>

                    <span
                      className={`flex items-center gap-0.5 ${
                        session.spotsRemaining > 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      <Users className="h-3 w-3" />
                      {session.spotsRemaining > 0
                        ? `${session.spotsRemaining} spot${session.spotsRemaining !== 1 ? "s" : ""}`
                        : "Full"}
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
        href="/coworking"
        className="block px-4 py-2.5 text-center text-sm font-medium text-emerald-400 hover:text-emerald-300 hover:bg-white/5 border-t border-zinc-800/50 transition-colors"
      >
        Find coworking buddies →
      </Link>
    </div>
  );
}
