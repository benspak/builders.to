"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle,
  Loader2,
  User,
  Flame,
  Zap,
  Smile,
  Meh,
  Frown,
} from "lucide-react";
import { CheckInMood } from "@prisma/client";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface CheckInUser {
  id: string;
  slug: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  image: string | null;
  currentStreak: number;
}

interface PublicCheckIn {
  id: string;
  userId: string;
  note: string | null;
  mood: CheckInMood | null;
  createdAt: string;
  user: CheckInUser;
}

function getDisplayName(user: CheckInUser): string {
  if (user.displayName) return user.displayName;
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.name || "Builder";
}

function getMoodIcon(mood: CheckInMood | null) {
  switch (mood) {
    case "CRUSHING_IT":
      return { icon: Zap, label: "Crushing it", color: "text-amber-400", bg: "bg-amber-500/10" };
    case "GOOD":
      return { icon: Smile, label: "Good", color: "text-green-400", bg: "bg-green-500/10" };
    case "OKAY":
      return { icon: Meh, label: "Okay", color: "text-blue-400", bg: "bg-blue-500/10" };
    case "STRUGGLING":
      return { icon: Frown, label: "Struggling", color: "text-red-400", bg: "bg-red-500/10" };
    default:
      return null;
  }
}

export function RecentCheckInsFeed() {
  const [checkIns, setCheckIns] = useState<PublicCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchCheckIns = useCallback(async () => {
    try {
      const response = await fetch("/api/accountability/recent-checkins?limit=30");
      if (response.ok) {
        const data = await response.json();
        setCheckIns(data.checkIns);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Error fetching recent check-ins:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCheckIns();
  }, [fetchCheckIns]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (checkIns.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-zinc-600" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">
          No check-ins yet
        </h3>
        <p className="text-zinc-500">
          Be the first to check in with your accountability partner!
        </p>
      </div>
    );
  }

  // Group check-ins by date
  const groupedByDate = checkIns.reduce<Record<string, PublicCheckIn[]>>(
    (groups, checkIn) => {
      const date = new Date(checkIn.createdAt);
      const dateKey = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(checkIn);
      return groups;
    },
    {}
  );

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const yesterday = new Date(
    Date.now() - 86400000
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  function getDateLabel(dateKey: string): string {
    if (dateKey === today) return "Today";
    if (dateKey === yesterday) return "Yesterday";
    return dateKey;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Recent Check-ins
        </h2>
        <span className="text-sm text-zinc-500">
          {total} total check-in{total !== 1 ? "s" : ""}
        </span>
      </div>

      {Object.entries(groupedByDate).map(([dateKey, dateCheckIns]) => (
        <div key={dateKey}>
          <h3 className="text-sm font-medium text-zinc-500 mb-3">
            {getDateLabel(dateKey)}
          </h3>
          <div className="space-y-3">
            {dateCheckIns.map((checkIn) => {
              const moodInfo = getMoodIcon(checkIn.mood);
              const MoodIcon = moodInfo?.icon;
              const displayName = getDisplayName(checkIn.user);
              const profileHref = checkIn.user.slug
                ? `/${checkIn.user.slug}`
                : "#";

              return (
                <div
                  key={checkIn.id}
                  className="flex items-start gap-3 p-4 rounded-xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-colors"
                >
                  {/* Avatar */}
                  <Link href={profileHref} className="shrink-0">
                    <div className="relative">
                      {checkIn.user.image ? (
                        <Image
                          src={checkIn.user.image}
                          alt={displayName}
                          width={40}
                          height={40}
                          className="rounded-lg ring-1 ring-white/10"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      )}
                      {checkIn.user.currentStreak > 0 && (
                        <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 rounded-full bg-orange-500 px-1 py-0.5 text-[8px] font-bold text-white ring-2 ring-zinc-900">
                          <Flame className="h-2 w-2" />
                          {checkIn.user.currentStreak}
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={profileHref}
                        className="text-sm font-medium text-white hover:text-green-400 transition-colors"
                      >
                        {displayName}
                      </Link>
                      <span className="text-xs text-zinc-600">checked in</span>
                      {moodInfo && MoodIcon && (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
                            moodInfo.bg,
                            moodInfo.color
                          )}
                        >
                          <MoodIcon className="h-3 w-3" />
                          {moodInfo.label}
                        </span>
                      )}
                    </div>

                    {checkIn.note && (
                      <p className="mt-1 text-sm text-zinc-400 line-clamp-2">
                        {checkIn.note}
                      </p>
                    )}

                    <span className="mt-1 block text-xs text-zinc-600">
                      {formatDistanceToNow(new Date(checkIn.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  {/* Check-in indicator */}
                  <div className="shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
