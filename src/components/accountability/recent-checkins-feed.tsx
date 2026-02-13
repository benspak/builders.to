"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Loader2,
  User,
  Flame,
  Zap,
  Smile,
  Meh,
  Frown,
  Heart,
  MessageCircle,
} from "lucide-react";
import { CheckInMood } from "@prisma/client";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { UpdateModal } from "@/components/updates/update-modal";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { MarkdownContent } from "@/components/ui/markdown-content";

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

interface DailyUpdateData {
  id: string;
  content: string;
  imageUrl: string | null;
  gifUrl: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
    slug: string | null;
    headline: string | null;
    companies: {
      id: string;
      name: string;
      slug: string | null;
      logo: string | null;
    }[];
  };
  _count: {
    likes: number;
    comments: number;
  };
  likes: { userId: string }[];
}

interface PublicCheckIn {
  id: string;
  userId: string;
  note: string | null;
  mood: CheckInMood | null;
  createdAt: string;
  dailyUpdateId: string | null;
  user: CheckInUser;
  dailyUpdate: DailyUpdateData | null;
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

function CheckInFeedItem({
  checkIn,
  currentUserId,
}: {
  checkIn: PublicCheckIn;
  currentUserId?: string;
}) {
  const router = useRouter();
  const moodInfo = getMoodIcon(checkIn.mood);
  const MoodIcon = moodInfo?.icon;
  const displayName = getDisplayName(checkIn.user);
  const profileHref = checkIn.user.slug ? `/${checkIn.user.slug}` : "#";

  // Social interaction states (for linked DailyUpdate)
  const update = checkIn.dailyUpdate;
  const [isLiked, setIsLiked] = useState(
    update ? update.likes.some((l) => l.userId === currentUserId) : false
  );
  const [likesCount, setLikesCount] = useState(update?._count.likes ?? 0);
  const [commentsCount, setCommentsCount] = useState(update?._count.comments ?? 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function handleLike() {
    if (!currentUserId || !update) {
      router.push("/signin");
      return;
    }
    if (isLiking) return;

    setIsLiking(true);
    const wasLiked = isLiked;
    setIsLiked(!isLiked);
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      const response = await fetch(`/api/updates/${update.id}/like`, {
        method: "POST",
      });
      if (!response.ok) {
        setIsLiked(wasLiked);
        setLikesCount((prev) => (wasLiked ? prev + 1 : prev - 1));
      } else {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikesCount(data.likesCount);
      }
    } catch {
      setIsLiked(wasLiked);
      setLikesCount((prev) => (wasLiked ? prev + 1 : prev - 1));
    } finally {
      setIsLiking(false);
    }
  }

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-colors">
      {/* Avatar */}
      <Link href={profileHref} className="shrink-0">
        <div className="relative">
          {checkIn.user.image ? (
            <Image
              src={checkIn.user.image}
              alt={displayName}
              width={40}
              height={40}
              className="rounded-lg ring-1 ring-white/10 object-cover"
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
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-green-500/10 text-green-400 border border-green-500/20">
            <CheckCircle className="h-2.5 w-2.5" />
            check-in
          </span>
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

        {/* Update content (from linked DailyUpdate or check-in note) */}
        {(update?.content || checkIn.note) && (
          <div className="mt-2 text-sm text-zinc-300 leading-relaxed">
            <MarkdownContent
              content={update?.content || checkIn.note || ""}
              className="prose-sm"
            />
          </div>
        )}

        {/* Image attachment */}
        {update?.imageUrl && (
          <div className="mt-3">
            <ImageLightbox
              src={update.imageUrl}
              alt="Check-in image"
              containerClassName="relative aspect-video max-h-64 rounded-lg overflow-hidden bg-zinc-900"
              className="object-cover"
            />
          </div>
        )}

        {/* GIF attachment */}
        {update?.gifUrl && (
          <div className="mt-3 relative max-h-64 rounded-lg bg-zinc-900 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={update.gifUrl}
              alt="GIF"
              className="w-full h-auto max-h-64 object-contain"
            />
          </div>
        )}

        {/* Social actions bar */}
        <div className="flex items-center gap-3 mt-3 pt-2 border-t border-white/5">
          {update ? (
            <>
              {/* Like button */}
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs transition-colors",
                  isLiked
                    ? "text-pink-400 hover:text-pink-300"
                    : "text-zinc-500 hover:text-pink-400"
                )}
              >
                <Heart
                  className={cn(
                    "h-4 w-4 transition-all",
                    isLiked && "fill-current scale-110"
                  )}
                />
                <span className={cn("tabular-nums", likesCount > 0 && "font-medium")}>
                  {likesCount > 0 ? likesCount : ""}
                </span>
              </button>

              {/* Comments button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-orange-400 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                {commentsCount > 0 && (
                  <span className="font-medium">{commentsCount}</span>
                )}
              </button>
            </>
          ) : null}

          <span className="text-xs text-zinc-600">
            {formatDistanceToNow(new Date(checkIn.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>

      {/* Check-in indicator */}
      <div className="shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle className="h-4 w-4 text-green-400" />
        </div>
      </div>

      {/* Update Modal for comments */}
      {update && (
        <UpdateModal
          update={{
            id: update.id,
            content: update.content,
            imageUrl: update.imageUrl,
            gifUrl: update.gifUrl,
            createdAt: update.createdAt,
            likesCount,
            isLiked,
            commentsCount,
            user: update.user,
          }}
          currentUserId={currentUserId}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onLikeChange={(liked, count) => {
            setIsLiked(liked);
            setLikesCount(count);
          }}
          onPinChange={() => {}}
          onDelete={() => {}}
          onCommentsCountChange={(count) => {
            setCommentsCount(count);
          }}
        />
      )}
    </div>
  );
}

export function RecentCheckInsFeed() {
  const [checkIns, setCheckIns] = useState<PublicCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);

  const fetchCheckIns = useCallback(async () => {
    try {
      const response = await fetch("/api/accountability/recent-checkins?limit=30");
      if (response.ok) {
        const data = await response.json();
        setCheckIns(data.checkIns);
        setTotal(data.total);
        setCurrentUserId(data.currentUserId || undefined);
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
            {dateCheckIns.map((checkIn) => (
              <CheckInFeedItem
                key={checkIn.id}
                checkIn={checkIn}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
