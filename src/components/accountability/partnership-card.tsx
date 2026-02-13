"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Flame,
  Calendar,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { PartnershipStatus, CheckInFrequency, CheckInMood } from "@prisma/client";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { CheckInCard } from "./check-in-card";

interface Partner {
  id: string;
  slug: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  image: string | null;
  currentStreak: number;
}

interface Partnership {
  id: string;
  status: PartnershipStatus;
  checkInFrequency: CheckInFrequency;
  goal: string | null;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  requester: Partner;
  partner: Partner;
  _count: {
    checkIns: number;
  };
  recentCheckIns?: {
    id: string;
    userId: string;
    note: string | null;
    mood: CheckInMood | null;
    createdAt: string;
  }[];
}

interface PartnershipCardProps {
  partnership: Partnership;
  currentUserId: string;
  onAccept?: () => void;
  onDecline?: () => void;
  onEnd?: () => void;
  className?: string;
}

function getDisplayName(user: Partner): string {
  if (user.displayName) return user.displayName;
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.name || "Builder";
}

function getFrequencyLabel(frequency: CheckInFrequency): string {
  switch (frequency) {
    case "DAILY":
      return "Daily check-ins";
    case "WEEKDAYS":
      return "Weekday check-ins";
    case "WEEKLY":
      return "Weekly check-ins";
  }
}

function getMoodEmoji(mood: CheckInMood | null): string {
  switch (mood) {
    case "CRUSHING_IT":
      return "🔥";
    case "GOOD":
      return "😊";
    case "OKAY":
      return "😐";
    case "STRUGGLING":
      return "😰";
    default:
      return "";
  }
}

export function PartnershipCard({
  partnership,
  currentUserId,
  onAccept,
  onDecline,
  onEnd,
  className,
}: PartnershipCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  // Determine who the partner is (the other person)
  const isRequester = partnership.requester.id === currentUserId;
  const partner = isRequester ? partnership.partner : partnership.requester;
  const partnerName = getDisplayName(partner);

  // Check today's check-ins
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayCheckIns =
    partnership.recentCheckIns?.filter((c) => {
      const checkInDate = new Date(c.createdAt);
      checkInDate.setHours(0, 0, 0, 0);
      return checkInDate.getTime() === today.getTime();
    }) || [];

  const userCheckedIn = todayCheckIns.some((c) => c.userId === currentUserId);
  const partnerCheckedIn = todayCheckIns.some((c) => c.userId === partner.id);
  const partnerCheckIn = todayCheckIns.find((c) => c.userId === partner.id);

  // Pending request (for recipient)
  if (partnership.status === "PENDING" && !isRequester) {
    return (
      <div
        className={cn(
          "p-5 rounded-2xl bg-zinc-900 border border-amber-500/30",
          className
        )}
      >
        <div className="flex items-start gap-4">
          {/* Partner avatar */}
          <Link href={partnership.requester.slug ? `/${partnership.requester.slug}` : "#"}>
            {partnership.requester.image ? (
              <Image
                src={partnership.requester.image}
                alt={getDisplayName(partnership.requester)}
                width={48}
                height={48}
                className="rounded-lg ring-1 ring-white/10"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                <User className="h-6 w-6 text-white" />
              </div>
            )}
          </Link>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                Pending Request
              </span>
            </div>
            <h3 className="mt-1 text-lg font-medium text-white">
              {getDisplayName(partnership.requester)}
            </h3>
            {partnership.goal && (
              <p className="mt-1 text-sm text-zinc-400">{partnership.goal}</p>
            )}
            <p className="mt-2 text-xs text-zinc-500">
              {getFrequencyLabel(partnership.checkInFrequency)}
            </p>
          </div>
        </div>

        {/* Accept/Decline buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={onDecline}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors"
          >
            <XCircle className="h-4 w-4" />
            Decline
          </button>
          <button
            onClick={onAccept}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors"
          >
            <CheckCircle className="h-4 w-4" />
            Accept
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-5 rounded-2xl bg-zinc-900 border border-white/10",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        {/* Partner avatar */}
        <Link href={partner.slug ? `/${partner.slug}` : "#"} className="shrink-0">
          <div className="relative">
            {partner.image ? (
              <Image
                src={partner.image}
                alt={partnerName}
                width={48}
                height={48}
                className="rounded-lg ring-1 ring-white/10"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                <User className="h-6 w-6 text-white" />
              </div>
            )}

            {/* Streak badge */}
            {partner.currentStreak > 0 && (
              <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 rounded-full bg-orange-500 px-1 py-0.5 text-[8px] font-bold text-white ring-2 ring-zinc-900">
                <Flame className="h-2 w-2" />
                {partner.currentStreak}
              </div>
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {partnership.status === "ACTIVE" && (
                <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                  Active
                </span>
              )}
              {partnership.status === "PENDING" && isRequester && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                  Pending
                </span>
              )}
            </div>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <MoreHorizontal className="h-5 w-5 text-zinc-500" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1 w-40 rounded-lg bg-zinc-800 border border-zinc-700 shadow-lg overflow-hidden z-10">
                  <button
                    onClick={() => {
                      onEnd?.();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-zinc-700 transition-colors text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>End Partnership</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <Link href={partner.slug ? `/${partner.slug}` : "#"}>
            <h3 className="text-lg font-medium text-white hover:text-green-400 transition-colors">
              {partnerName}
            </h3>
          </Link>

          {partnership.goal && (
            <div className="flex items-center gap-1 mt-1 text-sm text-zinc-400">
              <Target className="h-3 w-3" />
              {partnership.goal}
            </div>
          )}

          <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {getFrequencyLabel(partnership.checkInFrequency)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Started {formatDistanceToNow(new Date(partnership.startDate), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      {/* Check-in status */}
      {partnership.status === "ACTIVE" && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-zinc-500">Today's check-ins</span>
            <div className="flex items-center gap-2">
              {/* Partner status */}
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
                  partnerCheckedIn
                    ? "bg-green-500/20 text-green-400"
                    : "bg-zinc-800 text-zinc-500"
                )}
              >
                {partnerCheckedIn ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    <span>{partnerName.split(" ")[0]}</span>
                    {partnerCheckIn?.mood && (
                      <span>{getMoodEmoji(partnerCheckIn.mood)}</span>
                    )}
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3" />
                    <span>{partnerName.split(" ")[0]}</span>
                  </>
                )}
              </div>

              {/* User status */}
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
                  userCheckedIn
                    ? "bg-green-500/20 text-green-400"
                    : "bg-zinc-800 text-zinc-500"
                )}
              >
                {userCheckedIn ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    <span>You</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3" />
                    <span>You</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Check-in card */}
          <CheckInCard
            partnershipId={partnership.id}
            partnerName={partnerName}
            hasCheckedInToday={userCheckedIn}
          />
        </div>
      )}

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-4 text-xs text-zinc-500">
        <span>{partnership._count.checkIns} total check-ins</span>
        {partnership.endDate && (
          <span>Ends {format(new Date(partnership.endDate), "MMM d, yyyy")}</span>
        )}
      </div>
    </div>
  );
}
