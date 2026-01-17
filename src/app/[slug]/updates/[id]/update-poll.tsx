"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart3, Clock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PollOption {
  id: string;
  text: string;
  order: number;
  _count: {
    votes: number;
  };
}

interface UpdatePollProps {
  updateId: string;
  pollQuestion: string;
  pollExpiresAt: Date | null;
  pollOptions: PollOption[];
  votedOptionId: string | null;
  currentUserId?: string;
}

export function UpdatePoll({
  updateId,
  pollQuestion,
  pollExpiresAt,
  pollOptions: initialPollOptions,
  votedOptionId: initialVotedOptionId,
  currentUserId,
}: UpdatePollProps) {
  const router = useRouter();
  const [votedOptionId, setVotedOptionId] = useState<string | null>(initialVotedOptionId);
  const [pollOptions, setPollOptions] = useState(initialPollOptions);
  const [isVoting, setIsVoting] = useState(false);

  const isPollExpired = pollExpiresAt ? new Date() > new Date(pollExpiresAt) : false;
  const hasVoted = !!votedOptionId;
  const showPollResults = hasVoted || isPollExpired;

  // Calculate total votes
  const totalPollVotes = pollOptions.reduce((sum, opt) => sum + opt._count.votes, 0);

  // Calculate time remaining for poll
  const getPollTimeRemaining = () => {
    if (!pollExpiresAt) return "";
    const now = new Date();
    const expires = new Date(pollExpiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return "Poll ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}m left`;
  };

  const [pollTimeRemaining, setPollTimeRemaining] = useState(getPollTimeRemaining());

  // Update poll time remaining every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setPollTimeRemaining(getPollTimeRemaining());
    }, 60000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollExpiresAt]);

  async function handleVote(optionId: string) {
    if (!currentUserId) {
      router.push("/signin");
      return;
    }

    if (isVoting || isPollExpired || hasVoted) return;

    setIsVoting(true);

    // Optimistic update
    setVotedOptionId(optionId);
    setPollOptions(prev => prev.map(opt => ({
      ...opt,
      _count: {
        votes: opt.id === optionId ? opt._count.votes + 1 : opt._count.votes,
      },
    })));

    try {
      const response = await fetch(`/api/updates/${updateId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
      });

      if (!response.ok) {
        // Revert on error
        setVotedOptionId(null);
        setPollOptions(initialPollOptions);
        const data = await response.json();
        console.error("Vote error:", data.error);
      } else {
        const data = await response.json();
        if (data.options) {
          setPollOptions(data.options);
        }
      }
    } catch (error) {
      // Revert on error
      setVotedOptionId(null);
      setPollOptions(initialPollOptions);
      console.error("Error voting:", error);
    } finally {
      setIsVoting(false);
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
      {/* Poll header */}
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-violet-400" />
        <span className="text-base font-medium text-violet-400">Poll</span>
        <div className="flex items-center gap-1.5 text-sm text-zinc-500">
          <Clock className="h-4 w-4" />
          <span className={isPollExpired ? "text-red-400" : ""}>{pollTimeRemaining}</span>
        </div>
      </div>

      {/* Poll question */}
      {pollQuestion && (
        <p className="text-zinc-200 font-medium mb-4">{pollQuestion}</p>
      )}

      {/* Poll options */}
      <div className="space-y-3">
        {pollOptions.map((option) => {
          const percentage = totalPollVotes > 0
            ? Math.round((option._count.votes / totalPollVotes) * 100)
            : 0;
          const isVoted = votedOptionId === option.id;
          const isWinning = showPollResults && option._count.votes === Math.max(...pollOptions.map(o => o._count.votes)) && option._count.votes > 0;

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={!currentUserId || isVoting || isPollExpired || hasVoted}
              className={cn(
                "relative w-full text-left rounded-lg border transition-all overflow-hidden",
                showPollResults
                  ? "cursor-default"
                  : "hover:border-violet-500/50 hover:bg-violet-500/5 cursor-pointer",
                isVoted
                  ? "border-violet-500/50 bg-violet-500/10"
                  : "border-white/10 bg-zinc-800/30",
                (!currentUserId || isPollExpired) && !showPollResults && "opacity-60 cursor-not-allowed"
              )}
            >
              {/* Progress bar background */}
              {showPollResults && (
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
                    "text-base",
                    isVoted ? "text-violet-300 font-medium" : "text-zinc-200"
                  )}>
                    {option.text}
                  </span>
                </div>
                {showPollResults && (
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
      <div className="mt-3 text-sm text-zinc-500">
        {totalPollVotes} {totalPollVotes === 1 ? "vote" : "votes"}
        {!currentUserId && !isPollExpired && (
          <span className="ml-2 text-violet-400">
            <Link href="/signin" className="hover:underline">Sign in to vote</Link>
          </span>
        )}
      </div>
    </div>
  );
}
