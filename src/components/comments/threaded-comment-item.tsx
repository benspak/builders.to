"use client";

import { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  X,
  Check,
  Heart,
  BarChart3,
  Clock,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  CornerDownRight,
} from "lucide-react";
import { formatRelativeTime, cn, MENTION_REGEX } from "@/lib/utils";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { YouTubeEmbed, extractYouTubeUrlFromText } from "@/components/ui/youtube-embed";
import { RichCommentForm } from "./rich-comment-form";
import type { ThreadedComment } from "./threaded-comment-list";

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

interface ThreadedCommentItemProps {
  comment: ThreadedComment;
  onDeleted?: () => void;
  onUpdated?: () => void;
  onReply?: (
    parentId: string,
    data: {
      content: string;
      imageUrl?: string | null;
      gifUrl?: string | null;
      videoUrl?: string | null;
      pollOptions?: string[];
    }
  ) => Promise<void>;
  /** API endpoint type for voting on polls */
  pollVoteEndpoint?: "feed-event-comment" | "update-comment";
  /** Current nesting depth (for indentation) */
  depth?: number;
  /** Maximum nesting depth before collapsing */
  maxDepth?: number;
}

const MAX_VISIBLE_DEPTH = 4;

export function ThreadedCommentItem({
  comment,
  onDeleted,
  onUpdated,
  onReply,
  pollVoteEndpoint = "feed-event-comment",
  depth = 0,
  maxDepth = MAX_VISIBLE_DEPTH,
}: ThreadedCommentItemProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  // Reply state
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);
  const [showReplies, setShowReplies] = useState(depth < 2); // Auto-expand first 2 levels

  // Poll state
  const [votedOptionId, setVotedOptionId] = useState<string | null>(
    comment.votedOptionId || null
  );
  const [pollOptions, setPollOptions] = useState(comment.pollOptions || []);
  const [isVoting, setIsVoting] = useState(false);

  const hasPoll = !!comment.pollQuestion && pollOptions.length > 0;
  const isPollExpired = comment.pollExpiresAt
    ? new Date() > new Date(comment.pollExpiresAt)
    : false;
  const hasVoted = !!votedOptionId;
  const showPollResults = hasVoted || isPollExpired;

  const totalPollVotes = pollOptions.reduce(
    (sum, opt) => sum + opt._count.votes,
    0
  );

  const hasReplies = comment.replies && comment.replies.length > 0;
  const replyCount = comment.replyCount || comment.replies?.length || 0;

  // Calculate poll time remaining
  const getPollTimeRemaining = () => {
    if (!comment.pollExpiresAt) return "";
    const now = new Date();
    const expires = new Date(comment.pollExpiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return "Poll ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}m left`;
  };

  const [pollTimeRemaining, setPollTimeRemaining] = useState(
    getPollTimeRemaining()
  );

  useEffect(() => {
    if (!hasPoll) return;
    const interval = setInterval(() => {
      setPollTimeRemaining(getPollTimeRemaining());
    }, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comment.pollExpiresAt]);

  const detectedVideoUrl = useMemo(() => {
    if (comment.videoUrl) return comment.videoUrl;
    return extractYouTubeUrlFromText(comment.content);
  }, [comment.videoUrl, comment.content]);

  const isOwner = session?.user?.id === comment.user.id;

  const handleLike = async () => {
    if (!session?.user) return;
    setLikeLoading(true);

    const wasLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!wasLiked);
    setLikesCount(wasLiked ? prevCount - 1 : prevCount + 1);

    try {
      const response = await fetch(`/api/comments/${comment.id}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        setIsLiked(wasLiked);
        setLikesCount(prevCount);
        throw new Error("Failed to toggle like");
      }

      const data = await response.json();
      setIsLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to update comment");
      }

      setIsEditing(false);
      onUpdated?.();
    } catch (error) {
      console.error("Error updating comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    setDeleting(true);

    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      onDeleted?.();
    } catch (error) {
      console.error("Error deleting comment:", error);
      setDeleting(false);
    }
  };

  async function handleVote(optionId: string) {
    if (!session?.user?.id) {
      router.push("/signin");
      return;
    }
    if (isVoting || isPollExpired || hasVoted) return;

    setIsVoting(true);

    setVotedOptionId(optionId);
    setPollOptions((prev) =>
      prev.map((opt) => ({
        ...opt,
        _count: {
          votes: opt.id === optionId ? opt._count.votes + 1 : opt._count.votes,
        },
      }))
    );

    try {
      const response = await fetch(`/api/comment-polls/${comment.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId, type: pollVoteEndpoint }),
      });

      if (!response.ok) {
        setVotedOptionId(null);
        setPollOptions(comment.pollOptions || []);
        const data = await response.json();
        console.error("Vote error:", data.error);
      } else {
        const data = await response.json();
        if (data.options) {
          setPollOptions(data.options);
        }
      }
    } catch (error) {
      setVotedOptionId(null);
      setPollOptions(comment.pollOptions || []);
      console.error("Error voting:", error);
    } finally {
      setIsVoting(false);
    }
  }

  async function handleSubmitReply(data: {
    content: string;
    imageUrl?: string | null;
    gifUrl?: string | null;
    videoUrl?: string | null;
    pollOptions?: string[];
  }) {
    if (!onReply) return;
    setReplyLoading(true);

    try {
      await onReply(comment.id, data);
      setShowReplyForm(false);
      setShowReplies(true);
    } catch (error) {
      console.error("Error posting reply:", error);
      throw error;
    } finally {
      setReplyLoading(false);
    }
  }

  // Calculate indentation based on depth
  const indentClass = depth > 0 ? "ml-6 md:ml-10" : "";
  const borderClass =
    depth > 0 ? "border-l-2 border-zinc-800 pl-4" : "";

  return (
    <div className={cn(indentClass)}>
      <div
        className={cn(
          "group relative rounded-xl border border-white/5 bg-zinc-900/30 p-4 transition-colors hover:border-white/10",
          deleting && "opacity-50 pointer-events-none",
          borderClass
        )}
      >
        <div className="flex gap-4">
          {/* Avatar */}
          {comment.user.slug ? (
            <Link href={`/${comment.user.slug}`} className="shrink-0">
              {comment.user.image ? (
                <Image
                  src={comment.user.image}
                  alt={comment.user.name || "User"}
                  width={depth > 0 ? 32 : 40}
                  height={depth > 0 ? 32 : 40}
                  className={cn(
                    "rounded-full hover:ring-2 hover:ring-orange-500/50 transition-all",
                    depth > 0 ? "h-8 w-8" : "h-10 w-10"
                  )}
                />
              ) : (
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full bg-zinc-700 hover:ring-2 hover:ring-orange-500/50 transition-all",
                    depth > 0 ? "h-8 w-8" : "h-10 w-10"
                  )}
                >
                  <User
                    className={cn(
                      "text-zinc-400",
                      depth > 0 ? "h-4 w-4" : "h-5 w-5"
                    )}
                  />
                </div>
              )}
            </Link>
          ) : (
            <>
              {comment.user.image ? (
                <Image
                  src={comment.user.image}
                  alt={comment.user.name || "User"}
                  width={depth > 0 ? 32 : 40}
                  height={depth > 0 ? 32 : 40}
                  className={cn(
                    "rounded-full shrink-0",
                    depth > 0 ? "h-8 w-8" : "h-10 w-10"
                  )}
                />
              ) : (
                <div
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-full bg-zinc-700",
                    depth > 0 ? "h-8 w-8" : "h-10 w-10"
                  )}
                >
                  <User
                    className={cn(
                      "text-zinc-400",
                      depth > 0 ? "h-4 w-4" : "h-5 w-5"
                    )}
                  />
                </div>
              )}
            </>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {comment.user.slug ? (
                  <Link
                    href={`/${comment.user.slug}`}
                    className={cn(
                      "font-medium text-white truncate hover:text-orange-400 transition-colors",
                      depth > 0 && "text-sm"
                    )}
                  >
                    {comment.user.name}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      "font-medium text-white truncate",
                      depth > 0 && "text-sm"
                    )}
                  >
                    {comment.user.name}
                  </span>
                )}
                <span className="text-xs text-zinc-500">
                  {formatRelativeTime(comment.createdAt)}
                </span>
              </div>

              {/* Actions Menu */}
              {isOwner && !isEditing && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/5 transition-all"
                  >
                    <MoreHorizontal className="h-4 w-4 text-zinc-500" />
                  </button>

                  {showMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 z-20 w-32 rounded-lg border border-white/10 bg-zinc-900/95 p-1 shadow-xl backdrop-blur-xl">
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setShowMenu(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            handleDelete();
                            setShowMenu(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Comment Content */}
            {isEditing ? (
              <div className="mt-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="textarea text-sm"
                  rows={3}
                />
                <div className="mt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleEdit}
                    disabled={loading || !editContent.trim()}
                    className="p-2 rounded-lg text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {comment.content && comment.content.trim() && (
                  <p
                    className={cn(
                      "mt-2 text-zinc-300 whitespace-pre-wrap break-words",
                      depth > 0 && "text-sm"
                    )}
                  >
                    <ContentWithMentions content={comment.content} />
                  </p>
                )}

                {/* Display Image if present */}
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

                {/* Display GIF if present */}
                {comment.gifUrl && (
                  <div className="mt-2 rounded-lg overflow-hidden max-w-xs relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={comment.gifUrl}
                      alt="GIF"
                      className="w-full h-auto max-h-48 object-contain rounded-lg"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 text-xs text-fuchsia-300 font-medium">
                      GIF
                    </div>
                  </div>
                )}

                {/* Display YouTube video if present */}
                {detectedVideoUrl && (
                  <div className="mt-2 max-w-sm">
                    <YouTubeEmbed url={detectedVideoUrl} />
                  </div>
                )}

                {/* Poll attachment */}
                {hasPoll && (
                  <div className="mt-3 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-3.5 w-3.5 text-violet-400" />
                      <span className="text-xs font-medium text-violet-400">
                        Poll
                      </span>
                      <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <Clock className="h-3 w-3" />
                        <span className={isPollExpired ? "text-red-400" : ""}>
                          {pollTimeRemaining}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {pollOptions.map((option) => {
                        const percentage =
                          totalPollVotes > 0
                            ? Math.round(
                                (option._count.votes / totalPollVotes) * 100
                              )
                            : 0;
                        const isVoted = votedOptionId === option.id;
                        const isWinning =
                          showPollResults &&
                          option._count.votes ===
                            Math.max(
                              ...pollOptions.map((o) => o._count.votes)
                            ) &&
                          option._count.votes > 0;

                        return (
                          <button
                            key={option.id}
                            onClick={() => handleVote(option.id)}
                            disabled={
                              !session?.user?.id ||
                              isVoting ||
                              isPollExpired ||
                              hasVoted
                            }
                            className={cn(
                              "relative w-full text-left rounded-lg border transition-all overflow-hidden",
                              showPollResults
                                ? "cursor-default"
                                : "hover:border-violet-500/50 hover:bg-violet-500/5 cursor-pointer",
                              isVoted
                                ? "border-violet-500/50 bg-violet-500/10"
                                : "border-white/10 bg-zinc-800/30",
                              (!session?.user?.id || isPollExpired) &&
                                !showPollResults &&
                                "opacity-60 cursor-not-allowed"
                            )}
                          >
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

                            <div className="relative flex items-center justify-between px-2.5 py-1.5">
                              <div className="flex items-center gap-1.5">
                                {isVoted && (
                                  <Check className="h-3 w-3 text-violet-400" />
                                )}
                                <span
                                  className={cn(
                                    "text-xs",
                                    isVoted
                                      ? "text-violet-300 font-medium"
                                      : "text-zinc-200"
                                  )}
                                >
                                  {option.text}
                                </span>
                              </div>
                              {showPollResults && (
                                <span
                                  className={cn(
                                    "text-xs font-semibold tabular-nums",
                                    isVoted
                                      ? "text-violet-300"
                                      : isWinning
                                      ? "text-white"
                                      : "text-zinc-400"
                                  )}
                                >
                                  {percentage}%
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-1.5 text-xs text-zinc-500">
                      {totalPollVotes} {totalPollVotes === 1 ? "vote" : "votes"}
                      {!session?.user?.id && !isPollExpired && (
                        <span className="ml-2 text-violet-400">
                          <Link href="/signin" className="hover:underline">
                            Sign in to vote
                          </Link>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action buttons: Like, Reply, Show Replies */}
                <div className="mt-3 flex items-center gap-3">
                  {/* Like button */}
                  <button
                    onClick={handleLike}
                    disabled={!session?.user || likeLoading}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all",
                      isLiked
                        ? "text-rose-400 bg-rose-500/10 hover:bg-rose-500/20"
                        : "text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10",
                      !session?.user && "cursor-not-allowed opacity-50"
                    )}
                    title={
                      session?.user
                        ? isLiked
                          ? "Unlike"
                          : "Like"
                        : "Sign in to like"
                    }
                  >
                    <Heart
                      className={cn(
                        "h-3.5 w-3.5 transition-all",
                        isLiked && "fill-current",
                        likeLoading && "animate-pulse"
                      )}
                    />
                    {likesCount > 0 && (
                      <span className="font-medium">{likesCount}</span>
                    )}
                  </button>

                  {/* Reply button */}
                  {session?.user && depth < maxDepth && (
                    <button
                      onClick={() => setShowReplyForm(!showReplyForm)}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all",
                        showReplyForm
                          ? "text-orange-400 bg-orange-500/10"
                          : "text-zinc-500 hover:text-orange-400 hover:bg-orange-500/10"
                      )}
                    >
                      <CornerDownRight className="h-3.5 w-3.5" />
                      Reply
                    </button>
                  )}

                  {/* Show/Hide replies button */}
                  {hasReplies && (
                    <button
                      onClick={() => setShowReplies(!showReplies)}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-zinc-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>
                        {replyCount} {replyCount === 1 ? "reply" : "replies"}
                      </span>
                      {showReplies ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="mt-4 ml-14">
            <RichCommentForm
              onSubmit={handleSubmitReply}
              placeholder={`Reply to ${comment.user.name}...`}
              compact
              autoFocus
              onCancel={() => setShowReplyForm(false)}
            />
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {hasReplies && showReplies && (
        <div className="mt-3 space-y-3">
          {comment.replies!.map((reply) => (
            <ThreadedCommentItem
              key={reply.id}
              comment={reply}
              onDeleted={onDeleted}
              onUpdated={onUpdated}
              onReply={onReply}
              pollVoteEndpoint={pollVoteEndpoint}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}
    </div>
  );
}
