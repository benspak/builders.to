"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Heart,
  Loader2,
  BarChart3,
  Check,
  Clock,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { UserNameWithCompany } from "@/components/ui/user-name-with-company";
import { PollComments } from "./poll-comments";

interface PollOption {
  id: string;
  text: string;
  order: number;
  _count: {
    votes: number;
  };
}

interface PollCardProps {
  poll: {
    id: string;
    question: string;
    createdAt: Date | string;
    expiresAt: Date | string;
    user: {
      id: string;
      name?: string | null;
      displayName?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      image?: string | null;
      slug?: string | null;
      headline?: string | null;
      companies?: {
        id: string;
        name: string;
        slug: string | null;
        logo: string | null;
      }[];
    };
    options: PollOption[];
    likesCount: number;
    hasLiked: boolean;
    commentsCount?: number;
    votedOptionId?: string | null;
  };
  currentUserId?: string;
}

export function PollCard({ poll, currentUserId }: PollCardProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(poll.hasLiked);
  const [likesCount, setLikesCount] = useState(poll.likesCount);
  const [loading, setLoading] = useState(false);
  const [votedOptionId, setVotedOptionId] = useState<string | null>(poll.votedOptionId || null);
  const [options, setOptions] = useState(poll.options);
  const [isVoting, setIsVoting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const user = poll.user;
  const isOwner = currentUserId === user.id;
  const isExpired = new Date() > new Date(poll.expiresAt);
  const hasVoted = !!votedOptionId;
  const showResults = hasVoted || isExpired;

  // Calculate total votes
  const totalVotes = options.reduce((sum, opt) => sum + opt._count.votes, 0);

  // Calculate time remaining
  const getTimeRemaining = () => {
    const now = new Date();
    const expires = new Date(poll.expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return "Poll ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}m left`;
  };

  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining());

  // Update time remaining every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining());
    }, 60000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poll.expiresAt]);

  // Priority: displayName > firstName+lastName > name
  const displayName = user?.displayName
    || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null)
    || user?.name
    || "Builder";

  const userUrl = user?.slug ? `/${user.slug}` : null;

  const handleVote = async (optionId: string) => {
    if (!currentUserId || isVoting || isExpired || hasVoted) return;

    setIsVoting(true);

    // Optimistic update
    setVotedOptionId(optionId);
    setOptions(prev => prev.map(opt => ({
      ...opt,
      _count: {
        votes: opt.id === optionId ? opt._count.votes + 1 : opt._count.votes,
      },
    })));

    try {
      const response = await fetch(`/api/polls/${poll.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
      });

      if (!response.ok) {
        // Revert on error
        setVotedOptionId(null);
        setOptions(poll.options);
        const data = await response.json();
        console.error("Vote error:", data.error);
      } else {
        const data = await response.json();
        if (data.poll) {
          setOptions(data.poll.options);
        }
      }
    } catch (error) {
      // Revert on error
      setVotedOptionId(null);
      setOptions(poll.options);
      console.error("Error voting:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleLike = async () => {
    if (!currentUserId || loading) return;

    setLoading(true);

    // Optimistic update
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);

    try {
      const response = await fetch(`/api/polls/${poll.id}/like`, {
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

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this poll?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/polls/${poll.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete poll");
      }

      router.refresh();
    } catch (error) {
      console.error("Error deleting poll:", error);
      alert("Failed to delete poll. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  return (
    <div className="group relative rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
      {/* Poll header with gradient */}
      <div className="bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-pink-500/10 px-6 py-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 border border-violet-500/30">
              <BarChart3 className="h-5 w-5 text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-300">
                <span className="font-semibold text-white">Poll</span>
              </p>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Clock className="h-3 w-3" />
                <span className={isExpired ? "text-red-400" : ""}>{timeRemaining}</span>
              </div>
            </div>
          </div>

          {/* Owner menu */}
          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/50 transition-colors opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 z-20 w-32 rounded-lg border border-white/10 bg-zinc-800 shadow-xl py-1">
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-zinc-700/50 disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* User and question */}
        <div className="flex items-start gap-4">
          {/* User avatar */}
          {userUrl ? (
            <Link href={userUrl} className="flex-shrink-0">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={displayName}
                  width={48}
                  height={48}
                  className="rounded-xl ring-2 ring-white/10 hover:ring-violet-500/30 transition-all"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500">
                  <User className="h-6 w-6 text-white" />
                </div>
              )}
            </Link>
          ) : (
            <div className="flex-shrink-0">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={displayName}
                  width={48}
                  height={48}
                  className="rounded-xl ring-2 ring-white/10"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500">
                  <User className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* User name and headline */}
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">
                <UserNameWithCompany
                  name={displayName}
                  slug={user?.slug}
                  company={user?.companies?.[0]}
                  linkToProfile={!!userUrl}
                  className="text-white hover:text-violet-400"
                />
              </h3>
              <span className="text-xs text-zinc-500">
                {formatRelativeTime(poll.createdAt)}
              </span>
            </div>
            {user?.headline && (
              <p className="text-xs text-zinc-500 truncate">{user.headline}</p>
            )}

            {/* Poll question */}
            <p className="mt-3 text-lg text-white font-medium">
              {poll.question}
            </p>

            {/* Poll options */}
            <div className="mt-4 space-y-2">
              {options.map((option) => {
                const percentage = totalVotes > 0
                  ? Math.round((option._count.votes / totalVotes) * 100)
                  : 0;
                const isVoted = votedOptionId === option.id;
                const isWinning = showResults && option._count.votes === Math.max(...options.map(o => o._count.votes)) && option._count.votes > 0;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleVote(option.id)}
                    disabled={!currentUserId || isVoting || isExpired || hasVoted}
                    className={cn(
                      "relative w-full text-left rounded-xl border transition-all overflow-hidden",
                      showResults
                        ? "cursor-default"
                        : "hover:border-violet-500/50 hover:bg-violet-500/5 cursor-pointer",
                      isVoted
                        ? "border-violet-500/50 bg-violet-500/10"
                        : "border-white/10 bg-zinc-800/30",
                      (!currentUserId || isExpired) && !showResults && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    {/* Progress bar background */}
                    {showResults && (
                      <div
                        className={cn(
                          "absolute inset-y-0 left-0 transition-all duration-500",
                          isVoted
                            ? "bg-violet-500/30"
                            : isWinning
                              ? "bg-violet-500/20"
                              : "bg-zinc-700/50"
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    )}

                    {/* Option content */}
                    <div className="relative flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isVoted && (
                          <Check className="h-4 w-4 text-violet-400" />
                        )}
                        <span className={cn(
                          "text-sm font-medium",
                          isVoted ? "text-violet-300" : "text-zinc-200"
                        )}>
                          {option.text}
                        </span>
                      </div>
                      {showResults && (
                        <span className={cn(
                          "text-sm font-semibold tabular-nums",
                          isVoted ? "text-violet-300" : isWinning ? "text-white" : "text-zinc-400"
                        )}>
                          {percentage}%
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Vote count */}
            <div className="mt-3 text-xs text-zinc-500">
              {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
              {!currentUserId && !isExpired && (
                <span className="ml-2 text-violet-400">
                  <Link href="/signin" className="hover:underline">Sign in to vote</Link>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          {/* View profile link */}
          {userUrl && (
            <Link
              href={userUrl}
              className="text-sm text-zinc-500 hover:text-violet-400 transition-colors"
            >
              View profile →
            </Link>
          )}
          {!userUrl && <div />}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Comments button */}
            <PollComments
              pollId={poll.id}
              currentUserId={currentUserId}
              initialCommentsCount={poll.commentsCount ?? 0}
            >
              {/* Original content for modal */}
              <div className="flex items-start gap-4">
                {/* User avatar */}
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={displayName}
                    width={48}
                    height={48}
                    className="rounded-xl ring-2 ring-white/10"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500">
                    <User className="h-6 w-6 text-white" />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white">{displayName}</h3>
                  {user?.headline && (
                    <p className="text-xs text-zinc-500 truncate">{user.headline}</p>
                  )}

                  {/* Poll question */}
                  <p className="mt-3 text-lg text-white font-medium">
                    {poll.question}
                  </p>

                  {/* Results summary */}
                  <div className="mt-3 text-sm text-zinc-400">
                    {totalVotes} votes · {timeRemaining}
                  </div>
                </div>
              </div>
            </PollComments>

            {/* Like button */}
            <button
              onClick={handleLike}
              disabled={!currentUserId || loading}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                liked
                  ? "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                  : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800 hover:text-white hover:border-zinc-600",
                (!currentUserId || loading) && "opacity-50 cursor-not-allowed"
              )}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className={cn("h-4 w-4", liked && "fill-current")} />
              )}
              <span>{likesCount}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
