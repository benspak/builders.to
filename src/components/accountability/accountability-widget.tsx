"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, User, Flame, ArrowRight, CheckCircle, Clock } from "lucide-react";
import { PartnershipStatus, CheckInMood } from "@prisma/client";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

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
  goal: string | null;
  requester: Partner;
  partner: Partner;
  recentCheckIns?: {
    id: string;
    userId: string;
    mood: CheckInMood | null;
    createdAt: string;
  }[];
}

interface AccountabilityWidgetProps {
  currentUserId?: string;
  className?: string;
}

function getDisplayName(user: Partner): string {
  if (user.displayName) return user.displayName;
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.name || "Builder";
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
      return "✓";
  }
}

export function AccountabilityWidget({ currentUserId, className }: AccountabilityWidgetProps) {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPartnerships() {
      try {
        const response = await fetch("/api/accountability?status=active&limit=3");
        if (response.ok) {
          const data = await response.json();
          setPartnerships(data.partnerships);
        }
      } catch (error) {
        console.error("Error fetching partnerships:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPartnerships();
  }, []);

  if (loading) {
    return (
      <div className={cn("rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6", className)}>
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-green-400" />
          <h3 className="text-sm font-semibold text-white">Accountability</h3>
        </div>
        <div className="space-y-3 animate-pulse">
          <div className="h-16 rounded-lg bg-zinc-800" />
          <div className="h-16 rounded-lg bg-zinc-800" />
        </div>
      </div>
    );
  }

  if (partnerships.length === 0) {
    return (
      <div className={cn("rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6", className)}>
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-green-400" />
          <h3 className="text-sm font-semibold text-white">Accountability</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-sm text-zinc-500">No accountability partners yet</p>
          <Link
            href="/accountability"
            className="text-xs text-green-400 hover:text-green-300 mt-1 inline-block"
          >
            Find a partner
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-green-400" />
          <h3 className="text-sm font-semibold text-white">Accountability</h3>
        </div>
        <Link
          href="/accountability"
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          View all
        </Link>
      </div>

      <div className="space-y-3">
        {partnerships.map((partnership) => {
          // Determine who the partner is (the other person)
          const partner = partnership.requester.id === currentUserId
            ? partnership.partner
            : partnership.requester;
          
          const partnerName = getDisplayName(partner);
          const profileUrl = partner.slug ? `/${partner.slug}` : null;

          // Check if both have checked in today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const todayCheckIns = partnership.recentCheckIns?.filter(c => {
            const checkInDate = new Date(c.createdAt);
            checkInDate.setHours(0, 0, 0, 0);
            return checkInDate.getTime() === today.getTime();
          }) || [];

          const userCheckedIn = todayCheckIns.some(c => c.userId === currentUserId);
          const partnerCheckedIn = todayCheckIns.some(c => c.userId === partner.id);
          const partnerCheckIn = todayCheckIns.find(c => c.userId === partner.id);

          return (
            <Link
              key={partnership.id}
              href={`/accountability/${partnership.id}`}
              className="block p-3 -mx-3 rounded-lg hover:bg-zinc-800/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                {/* Partner avatar */}
                <div className="relative shrink-0">
                  {partner.image ? (
                    <Image
                      src={partner.image}
                      alt={partnerName}
                      width={40}
                      height={40}
                      className="rounded-lg ring-1 ring-white/10 group-hover:ring-green-500/30 transition-all object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                      <User className="h-5 w-5 text-white" />
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

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white truncate group-hover:text-green-400 transition-colors">
                    {partnerName}
                  </h4>
                  {partnership.goal && (
                    <p className="text-xs text-zinc-500 truncate">
                      {partnership.goal}
                    </p>
                  )}
                </div>

                {/* Check-in status */}
                <div className="shrink-0 flex items-center gap-2">
                  {/* Partner status */}
                  <div
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
                      partnerCheckedIn
                        ? "bg-green-500/20 text-green-400"
                        : "bg-zinc-800 text-zinc-500"
                    )}
                    title={partnerCheckedIn ? "Checked in today" : "Not checked in yet"}
                  >
                    {partnerCheckedIn ? (
                      <>
                        <span>{getMoodEmoji(partnerCheckIn?.mood || null)}</span>
                      </>
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <Link
        href="/accountability"
        className="mt-4 flex items-center justify-center gap-2 py-2 rounded-lg bg-green-500/10 text-green-400 text-sm hover:bg-green-500/20 transition-colors"
      >
        <CheckCircle className="h-4 w-4" />
        <span>Check in now</span>
      </Link>
    </div>
  );
}
