"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  Coffee,
  Building2,
  BookOpen,
  Check,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistance } from "@/lib/geo";

interface SessionCardProps {
  session: {
    id: string;
    date: string | Date;
    startTime: string;
    endTime: string | null;
    venueName: string;
    venueType: "CAFE" | "COWORKING_SPACE" | "LIBRARY" | "OTHER";
    address: string | null;
    city: string;
    state: string | null;
    country: string;
    latitude: number | null;
    longitude: number | null;
    maxBuddies: number;
    description: string | null;
    acceptedCount: number;
    spotsRemaining: number;
    userBuddyStatus: string | null;
    isHost: boolean;
    distance?: number;
    host: {
      id: string;
      name: string | null;
      firstName: string | null;
      lastName: string | null;
      image: string | null;
      slug: string | null;
      headline?: string | null;
    };
    buddies?: {
      status: string;
      user: {
        id: string;
        name: string | null;
        firstName: string | null;
        lastName: string | null;
        image: string | null;
        slug: string | null;
      };
    }[];
  };
  onDelete?: () => void;
}

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

export function SessionCard({ session, onDelete }: SessionCardProps) {
  const router = useRouter();
  const sessionDate = new Date(session.date);
  const VenueIcon = venueIcons[session.venueType];
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/coworking/sessions/${session.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete session");
      }

      onDelete?.();
      router.refresh();
    } catch (error) {
      console.error("Error deleting session:", error);
      alert(error instanceof Error ? error.message : "Failed to delete session");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setShowMenu(false);
    }
  };

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

  const hostName =
    session.host.firstName && session.host.lastName
      ? `${session.host.firstName} ${session.host.lastName}`
      : session.host.name || "Anonymous";

  const isPast = sessionDate < new Date(new Date().toDateString());
  const isFull = session.spotsRemaining <= 0;

  return (
    <div
      className={cn(
        "rounded-xl border border-white/5 bg-zinc-900/30 p-4 transition-all hover:border-white/10",
        isPast && "opacity-60"
      )}
    >
      {/* Date & Time */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-emerald-400 text-sm">
          <Calendar className="h-4 w-4" />
          <span className="font-medium">{formatSessionDate(sessionDate)}</span>
          <span className="text-zinc-500">·</span>
          <Clock className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-zinc-400">
            {session.startTime}
            {session.endTime && ` - ${session.endTime}`}
          </span>
        </div>

        {/* Status badges and menu */}
        <div className="flex items-center gap-2">
          {session.isHost && (
            <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
              Hosting
            </span>
          )}
          {session.userBuddyStatus === "ACCEPTED" && (
            <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <Check className="h-3 w-3" />
              Joined
            </span>
          )}
          {session.userBuddyStatus === "PENDING" && (
            <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
              <Loader2 className="h-3 w-3" />
              Pending
            </span>
          )}

          {/* Host actions menu */}
          {session.isHost && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {showMenu && (
                <>
                  {/* Backdrop to close menu */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteConfirm(false);
                    }}
                  />

                  {/* Menu dropdown */}
                  <div className="absolute right-0 top-full mt-1 z-20 w-36 rounded-xl border border-white/10 bg-zinc-900 shadow-xl overflow-hidden">
                    {showDeleteConfirm ? (
                      <div className="p-3 space-y-2">
                        <p className="text-xs text-zinc-400">Delete this session?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 px-2 py-1 text-xs text-zinc-400 hover:text-white transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex-1 px-2 py-1 text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                          >
                            {isDeleting ? "..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Link
                          href={`/coworking/${session.id}/edit`}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 transition-colors"
                          onClick={() => setShowMenu(false)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Venue */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 shrink-0">
          <VenueIcon className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="font-medium text-white">{session.venueName}</h3>
          <p className="text-sm text-zinc-400">
            {venueLabels[session.venueType]}
            {session.address && ` · ${session.address}`}
          </p>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5 text-sm text-zinc-400 mb-3">
        <MapPin className="h-4 w-4" />
        <span>
          {session.city}
          {session.state && `, ${session.state}`}, {session.country}
        </span>
        {session.distance !== undefined && (
          <span className="text-emerald-400 ml-1">
            ({formatDistance(session.distance)})
          </span>
        )}
      </div>

      {/* Description */}
      {session.description && (
        <p className="text-sm text-zinc-500 mb-3 line-clamp-2">
          {session.description}
        </p>
      )}

      {/* Footer: Host & Spots */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        {/* Host */}
        <div className="flex items-center gap-2">
          {session.host.slug ? (
            <Link
              href={`/${session.host.slug}`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              {session.host.image ? (
                <Image
                  src={session.host.image}
                  alt={hostName}
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
                Hosted by <span className="text-zinc-300">{hostName}</span>
              </span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-700">
                <User className="h-3 w-3 text-zinc-400" />
              </div>
              <span className="text-xs text-zinc-500">
                Hosted by <span className="text-zinc-300">{hostName}</span>
              </span>
            </div>
          )}
        </div>

        {/* Spots */}
        <div className="flex items-center gap-1.5 text-sm">
          <Users className="h-4 w-4 text-zinc-500" />
          {isFull ? (
            <span className="text-red-400">Full</span>
          ) : (
            <span className="text-zinc-400">
              {session.spotsRemaining} spot{session.spotsRemaining !== 1 && "s"} left
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
