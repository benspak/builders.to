"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Loader2, User, MessageSquare, BarChart3, Clock, Check } from "lucide-react";
import { formatRelativeTime, MENTION_REGEX, cn } from "@/lib/utils";
import { LocalListingComment } from "./types";
import { RichCommentForm } from "@/components/comments/rich-comment-form";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { YouTubeEmbed, extractYouTubeUrlFromText } from "@/components/ui/youtube-embed";

// Component to render content with clickable @mentions
function ContentWithMentions({ content }: { content: string }) {
  const parts = useMemo(() => {
    const result: Array<{ type: "text" | "mention"; value: string }> = [];
    let lastIndex = 0;

    const regex = new RegExp(MENTION_REGEX.source, "g");
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        result.push({
          type: "text",
          value: content.slice(lastIndex, match.index),
        });
      }

      result.push({
        type: "mention",
        value: match[1],
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      result.push({
        type: "text",
        value: content.slice(lastIndex),
      });
    }

    return result;
  }, [content]);

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === "mention") {
          return (
            <Link
              key={index}
              href={`/${part.value}`}
              className="text-orange-400 hover:text-orange-300 hover:underline transition-colors font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              @{part.value}
            </Link>
          );
        }
        return <span key={index}>{part.value}</span>;
      })}
    </>
  );
}

interface PollOption {
  id: string;
  text: string;
  order: number;
  _count: {
    votes: number;
  };
}

interface EnhancedComment extends LocalListingComment {
  gifUrl?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  pollQuestion?: string | null;
  pollExpiresAt?: string | null;
  pollOptions?: PollOption[];
  votedOptionId?: string | null;
}

interface LocalListingCommentsProps {
  listingId: string;
  initialCommentCount?: number;
}

export function LocalListingComments({ listingId, initialCommentCount = 0 }: LocalListingCommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<EnhancedComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchComments() {
    try {
      const response = await fetch(`/api/local-listings/${listingId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchComments();
  }, [listingId]);

  async function handleSubmitComment(data: {
    content: string;
    imageUrl?: string | null;
    gifUrl?: string | null;
    videoUrl?: string | null;
    pollOptions?: string[];
  }) {
    const response = await fetch(`/api/local-listings/${listingId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to post comment");
    }

    fetchComments();
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-zinc-400" />
        <h3 className="text-lg font-semibold text-white">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment form */}
      <RichCommentForm
        onSubmit={handleSubmitComment}
        placeholder="Write a comment... Use @ to mention"
        maxLength={2000}
      />

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="h-10 w-10 text-zinc-700 mx-auto mb-2" />
          <p className="text-sm text-zinc-500">No comments yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <LocalListingCommentItem
              key={comment.id}
              comment={comment}
              currentUserId={session?.user?.id}
              onVote={fetchComments}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Individual comment item with rich content display
interface LocalListingCommentItemProps {
  comment: EnhancedComment;
  currentUserId?: string;
  onVote?: () => void;
}

function LocalListingCommentItem({ comment, currentUserId, onVote }: LocalListingCommentItemProps) {
  const [votedOptionId, setVotedOptionId] = useState<string | null>(comment.votedOptionId || null);
  const [pollOptions, setPollOptions] = useState(comment.pollOptions || []);
  const [isVoting, setIsVoting] = useState(false);

  const hasPoll = !!comment.pollQuestion && pollOptions.length > 0;
  const isPollExpired = comment.pollExpiresAt ? new Date() > new Date(comment.pollExpiresAt) : false;
  const hasVoted = !!votedOptionId;
  const showPollResults = hasVoted || isPollExpired;
  const totalPollVotes = pollOptions.reduce((sum, opt) => sum + opt._count.votes, 0);

  const detectedVideoUrl = useMemo(() => {
    if (comment.videoUrl) return comment.videoUrl;
    return extractYouTubeUrlFromText(comment.content);
  }, [comment.videoUrl, comment.content]);

  const getPollTimeRemaining = () => {
    if (!comment.pollExpiresAt) return "";
    const now = new Date();
    const expires = new Date(comment.pollExpiresAt);
    const diff = expires.getTime() - now.getTime();
    if (diff <= 0) return "Poll ended";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}m left`;
  };

  async function handleVote(optionId: string) {
    if (!currentUserId || isVoting || isPollExpired || hasVoted) return;

    setIsVoting(true);
    setVotedOptionId(optionId);
    setPollOptions(prev => prev.map(opt => ({
      ...opt,
      _count: { votes: opt.id === optionId ? opt._count.votes + 1 : opt._count.votes },
    })));

    try {
      const response = await fetch(`/api/comment-polls/${comment.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId, type: "feed-event-comment" }),
      });

      if (!response.ok) {
        setVotedOptionId(null);
        setPollOptions(comment.pollOptions || []);
      } else {
        const data = await response.json();
        if (data.options) setPollOptions(data.options);
        onVote?.();
      }
    } catch {
      setVotedOptionId(null);
      setPollOptions(comment.pollOptions || []);
    } finally {
      setIsVoting(false);
    }
  }

  const displayName = comment.user.firstName && comment.user.lastName
    ? `${comment.user.firstName} ${comment.user.lastName}`
    : comment.user.displayName || comment.user.name || "Anonymous";

  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0">
        {comment.user.image ? (
          <Image
            src={comment.user.image}
            alt={displayName}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center">
            <User className="h-5 w-5 text-zinc-500" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <Link
            href={comment.user.slug ? `/${comment.user.slug}` : "#"}
            className="font-medium text-white hover:text-orange-400 transition-colors"
          >
            {displayName}
          </Link>
          <span className="text-xs text-zinc-500">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>

        {/* Text content */}
        {comment.content && comment.content.trim() && (
          <p className="mt-1 text-sm text-zinc-300 whitespace-pre-wrap break-words">
            <ContentWithMentions content={comment.content} />
          </p>
        )}

        {/* Image */}
        {comment.imageUrl && (
          <div className="mt-2 rounded-lg overflow-hidden max-w-sm">
            <ImageLightbox
              src={comment.imageUrl}
              alt="Comment image"
              containerClassName="relative aspect-video max-h-48 bg-zinc-900"
              className="object-cover"
            />
          </div>
        )}

        {/* GIF */}
        {comment.gifUrl && (
          <div className="mt-2 rounded-lg overflow-hidden max-w-xs relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={comment.gifUrl} alt="GIF" className="w-full h-auto max-h-48 object-contain rounded-lg" />
            <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 text-xs text-fuchsia-300 font-medium">GIF</div>
          </div>
        )}

        {/* Video */}
        {detectedVideoUrl && (
          <div className="mt-2 max-w-sm">
            <YouTubeEmbed url={detectedVideoUrl} />
          </div>
        )}

        {/* Poll */}
        {hasPoll && (
          <div className="mt-3 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-3.5 w-3.5 text-violet-400" />
              <span className="text-xs font-medium text-violet-400">Poll</span>
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <Clock className="h-3 w-3" />
                <span className={isPollExpired ? "text-red-400" : ""}>{getPollTimeRemaining()}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              {pollOptions.map((option) => {
                const percentage = totalPollVotes > 0 ? Math.round((option._count.votes / totalPollVotes) * 100) : 0;
                const isVoted = votedOptionId === option.id;
                const isWinning = showPollResults && option._count.votes === Math.max(...pollOptions.map(o => o._count.votes)) && option._count.votes > 0;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleVote(option.id)}
                    disabled={!currentUserId || isVoting || isPollExpired || hasVoted}
                    className={cn(
                      "relative w-full text-left rounded-lg border transition-all overflow-hidden",
                      showPollResults ? "cursor-default" : "hover:border-violet-500/50 hover:bg-violet-500/5 cursor-pointer",
                      isVoted ? "border-violet-500/50 bg-violet-500/10" : "border-white/10 bg-zinc-800/30",
                      (!currentUserId || isPollExpired) && !showPollResults && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    {showPollResults && (
                      <div
                        className={cn("absolute inset-y-0 left-0 transition-all duration-500", isVoted ? "bg-violet-500/30" : isWinning ? "bg-violet-500/20" : "bg-zinc-700/50")}
                        style={{ width: `${percentage}%` }}
                      />
                    )}
                    <div className="relative flex items-center justify-between px-2.5 py-1.5">
                      <div className="flex items-center gap-1.5">
                        {isVoted && <Check className="h-3 w-3 text-violet-400" />}
                        <span className={cn("text-xs", isVoted ? "text-violet-300 font-medium" : "text-zinc-200")}>{option.text}</span>
                      </div>
                      {showPollResults && (
                        <span className={cn("text-xs font-semibold tabular-nums", isVoted ? "text-violet-300" : isWinning ? "text-white" : "text-zinc-400")}>{percentage}%</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-1.5 text-xs text-zinc-500">
              {totalPollVotes} {totalPollVotes === 1 ? "vote" : "votes"}
              {!currentUserId && !isPollExpired && (
                <span className="ml-2 text-violet-400">
                  <Link href="/signin" className="hover:underline">Sign in to vote</Link>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
