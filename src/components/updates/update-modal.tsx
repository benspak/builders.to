"use client";

import { useState, useEffect, useMemo, useCallback, ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  X,
  Heart,
  MessageCircle,
  Loader2,
  MoreHorizontal,
  Trash2,
  Pin,
  PinOff,
  Link2,
  Check,
  Send,
  BarChart3,
  Clock,
} from "lucide-react";
import { formatRelativeTime, MENTION_REGEX, cn } from "@/lib/utils";
import { YouTubeEmbed, extractYouTubeUrlFromText } from "@/components/ui/youtube-embed";
import { AutoLinkPreview } from "@/components/ui/link-preview";
import { ReportButton } from "@/components/ui/report-button";
import { UserNameWithCompany } from "@/components/ui/user-name-with-company";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { MentionInput } from "@/components/ui/mention-input";
import { GiphyPicker, GifButton, GifPreview } from "@/components/ui/giphy-picker";

// X/Twitter icon
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

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

interface Comment {
  id: string;
  content: string;
  gifUrl?: string | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
  user: {
    id: string;
    name: string | null;
    displayName?: string | null;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
    slug: string | null;
  };
}

interface UpdateModalProps {
  update: {
    id: string;
    content: string;
    imageUrl?: string | null;
    gifUrl?: string | null;
    createdAt: string | Date;
    likesCount?: number;
    isLiked?: boolean;
    isPinned?: boolean;
    commentsCount?: number;
    pollQuestion?: string | null;
    pollExpiresAt?: string | Date | null;
    pollOptions?: PollOption[];
    votedOptionId?: string | null;
    user: {
      id: string;
      name: string | null;
      displayName?: string | null;
      firstName: string | null;
      lastName: string | null;
      image: string | null;
      slug: string | null;
      headline?: string | null;
      companies?: {
        id: string;
        name: string;
        slug: string | null;
        logo: string | null;
      }[];
    };
  };
  currentUserId?: string;
  isOpen: boolean;
  onClose: () => void;
  onLikeChange?: (liked: boolean, count: number) => void;
  onPinChange?: (pinned: boolean) => void;
  onDelete?: () => void;
  onCommentsCountChange?: (count: number) => void;
}

export function UpdateModal({
  update,
  currentUserId,
  isOpen,
  onClose,
  onLikeChange,
  onPinChange,
  onDelete,
  onCommentsCountChange,
}: UpdateModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Like state
  const [isLiked, setIsLiked] = useState(update.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(update.likesCount ?? 0);
  const [isLiking, setIsLiking] = useState(false);

  // Pin state
  const [isPinned, setIsPinned] = useState(update.isPinned ?? false);
  const [isPinning, setIsPinning] = useState(false);

  // Copy state
  const [copied, setCopied] = useState(false);

  // Menu state
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Poll state
  const [votedOptionId, setVotedOptionId] = useState<string | null>(update.votedOptionId || null);
  const [pollOptions, setPollOptions] = useState(update.pollOptions || []);
  const [isVoting, setIsVoting] = useState(false);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [selectedGifUrl, setSelectedGifUrl] = useState<string | null>(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentsCount, setCommentsCount] = useState(update.commentsCount ?? 0);

  const hasPoll = !!update.pollQuestion && pollOptions.length > 0;
  const isPollExpired = update.pollExpiresAt ? new Date() > new Date(update.pollExpiresAt) : false;
  const hasVoted = !!votedOptionId;
  const showPollResults = hasVoted || isPollExpired;
  const totalPollVotes = pollOptions.reduce((sum, opt) => sum + opt._count.votes, 0);

  const isOwner = currentUserId === update.user.id;
  const displayName = update.user.displayName
    || (update.user.firstName && update.user.lastName ? `${update.user.firstName} ${update.user.lastName}` : null)
    || update.user.name
    || "Builder";

  const detectedVideoUrl = useMemo(() => extractYouTubeUrlFromText(update.content), [update.content]);
  const updateUrl = update.user.slug ? `/${update.user.slug}/updates/${update.id}` : null;

  // Calculate time remaining for poll
  const getPollTimeRemaining = useCallback(() => {
    if (!update.pollExpiresAt) return "";
    const now = new Date();
    const expires = new Date(update.pollExpiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return "Poll ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}m left`;
  }, [update.pollExpiresAt]);

  const [pollTimeRemaining, setPollTimeRemaining] = useState(getPollTimeRemaining());

  // Sync state with props when update changes
  useEffect(() => {
    setIsLiked(update.isLiked ?? false);
    setLikesCount(update.likesCount ?? 0);
    setIsPinned(update.isPinned ?? false);
    setVotedOptionId(update.votedOptionId || null);
    setPollOptions(update.pollOptions || []);
    setCommentsCount(update.commentsCount ?? 0);
  }, [update]);

  // Mount tracking for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Fetch comments when modal opens
  useEffect(() => {
    if (isOpen && comments.length === 0) {
      fetchComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Update poll time remaining every minute
  useEffect(() => {
    if (!hasPoll) return;
    const interval = setInterval(() => {
      setPollTimeRemaining(getPollTimeRemaining());
    }, 60000);
    return () => clearInterval(interval);
  }, [hasPoll, getPollTimeRemaining]);

  async function fetchComments() {
    setIsLoadingComments(true);
    try {
      const response = await fetch(`/api/updates/${update.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
        setCommentsCount(data.length);
        onCommentsCountChange?.(data.length);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  }

  async function handleLike() {
    if (!currentUserId) {
      router.push("/signin");
      return;
    }

    if (isLiking) return;

    setIsLiking(true);
    const wasLiked = isLiked;
    setIsLiked(!isLiked);
    setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);

    try {
      const response = await fetch(`/api/updates/${update.id}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        setIsLiked(wasLiked);
        setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
        throw new Error("Failed to like update");
      }

      const data = await response.json();
      setIsLiked(data.liked);
      setLikesCount(data.likesCount);
      onLikeChange?.(data.liked, data.likesCount);
    } catch (error) {
      console.error("Error liking update:", error);
    } finally {
      setIsLiking(false);
    }
  }

  async function handlePin() {
    if (!currentUserId) {
      router.push("/signin");
      return;
    }

    if (isPinning) return;

    setIsPinning(true);

    try {
      if (isPinned) {
        const response = await fetch(`/api/pinned-posts?updateId=${update.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to unpin post");
        }

        setIsPinned(false);
        onPinChange?.(false);
      } else {
        const response = await fetch("/api/pinned-posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updateId: update.id }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to pin post");
        }

        setIsPinned(true);
        onPinChange?.(true);
      }

      router.refresh();
    } catch (error) {
      console.error("Error toggling pin:", error);
      alert(error instanceof Error ? error.message : "Failed to toggle pin. Please try again.");
    } finally {
      setIsPinning(false);
      setShowMenu(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this update?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/updates/${update.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete update");
      }

      onDelete?.();
      onClose();
      router.refresh();
    } catch (error) {
      console.error("Error deleting update:", error);
      alert("Failed to delete update. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  }

  function handleShareToX() {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const shareableUrl = updateUrl ? `${baseUrl}${updateUrl}` : baseUrl;
    const maxContentLength = 250;
    const tweetContent = update.content.length > maxContentLength
      ? update.content.slice(0, maxContentLength).trim() + "..."
      : update.content;
    const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetContent)}&url=${encodeURIComponent(shareableUrl)}`;
    window.open(shareUrl, "_blank", "width=550,height=420");
  }

  async function handleCopyUrl() {
    if (!updateUrl) return;

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const fullUrl = `${baseUrl}${updateUrl}`;

    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  }

  async function handleVote(optionId: string) {
    if (!currentUserId || isVoting || isPollExpired || hasVoted) return;

    setIsVoting(true);
    setVotedOptionId(optionId);
    setPollOptions(prev => prev.map(opt => ({
      ...opt,
      _count: {
        votes: opt.id === optionId ? opt._count.votes + 1 : opt._count.votes,
      },
    })));

    try {
      const response = await fetch(`/api/updates/${update.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
      });

      if (!response.ok) {
        setVotedOptionId(null);
        setPollOptions(update.pollOptions || []);
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
      setPollOptions(update.pollOptions || []);
      console.error("Error voting:", error);
    } finally {
      setIsVoting(false);
    }
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();

    if (!currentUserId) {
      router.push("/signin");
      return;
    }

    if (!newComment.trim() && !selectedGifUrl) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/updates/${update.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment.trim() || " ",
          gifUrl: selectedGifUrl,
        }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments(prev => [...prev, comment]);
        const newCount = commentsCount + 1;
        setCommentsCount(newCount);
        onCommentsCountChange?.(newCount);
        setNewComment("");
        setSelectedGifUrl(null);
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  }

  function handleGifSelect(gif: { url: string; width: number; height: number }) {
    setSelectedGifUrl(gif.url);
  }

  async function handleDeleteComment(commentId: string) {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const response = await fetch(`/api/update-comments/${commentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        const newCount = commentsCount - 1;
        setCommentsCount(newCount);
        onCommentsCountChange?.(newCount);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  }

  async function handleEditComment(commentId: string, newContent: string) {
    try {
      const response = await fetch(`/api/update-comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
      });

      if (response.ok) {
        const updatedComment = await response.json();
        setComments(prev => prev.map(c => c.id === commentId ? updatedComment : c));
      }
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  }

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Modal container - centered with max width */}
      <div className="relative w-full max-w-2xl my-4 sm:my-8 mx-4">
        <div
          className="relative flex flex-col rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 bg-zinc-900/95 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white">Update</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Main content area */}
          <div className="flex-1 overflow-y-auto">
            {/* Author header */}
            <div className="px-4 sm:px-6 pt-4 sm:pt-6">
              <div className="flex items-start gap-3">
                <Link href={update.user.slug ? `/${update.user.slug}` : "#"} className="flex-shrink-0">
                  {update.user.image ? (
                    <Image
                      src={update.user.image}
                      alt={displayName}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-zinc-800"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500">
                      <User className="h-6 w-6 text-white" />
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <UserNameWithCompany
                      name={displayName}
                      slug={update.user.slug}
                      company={update.user.companies?.[0]}
                      linkToProfile={true}
                    />
                    <span className="text-sm text-zinc-500">·</span>
                    <time className="text-sm text-zinc-500">
                      {formatRelativeTime(update.createdAt)}
                    </time>
                  </div>
                  {update.user.headline && (
                    <p className="text-sm text-zinc-500 mt-0.5">{update.user.headline}</p>
                  )}
                </div>

                {/* Actions menu */}
                {currentUserId && (
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/50 transition-colors"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </button>

                    {showMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowMenu(false)}
                        />
                        <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-xl border border-white/10 bg-zinc-800 shadow-xl py-1">
                          <button
                            onClick={handlePin}
                            disabled={isPinning}
                            className={cn(
                              "flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-zinc-700/50 disabled:opacity-50",
                              isPinned ? "text-orange-400" : "text-zinc-300"
                            )}
                          >
                            {isPinning ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isPinned ? (
                              <PinOff className="h-4 w-4" />
                            ) : (
                              <Pin className="h-4 w-4" />
                            )}
                            {isPinned ? "Unpin from profile" : "Pin to profile"}
                          </button>

                          {isOwner && (
                            <button
                              onClick={handleDelete}
                              disabled={isDeleting}
                              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-700/50 disabled:opacity-50"
                            >
                              {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              Delete
                            </button>
                          )}

                          {!isOwner && (
                            <div className="px-1">
                              <ReportButton
                                contentType="DAILY_UPDATE"
                                contentId={update.id}
                                variant="menu-item"
                                className="w-full"
                              />
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="px-4 sm:px-6 py-4">
              <div className="text-zinc-200 text-base leading-relaxed">
                <MarkdownContent content={update.content} />
              </div>
            </div>

            {/* Media attachments */}
            {update.imageUrl && (
              <div className="px-4 sm:px-6 pb-4">
                <div className="rounded-xl overflow-hidden border border-white/10">
                  <Image
                    src={update.imageUrl}
                    alt="Update image"
                    width={600}
                    height={400}
                    className="w-full object-cover max-h-96"
                  />
                </div>
              </div>
            )}

            {update.gifUrl && (
              <div className="px-4 sm:px-6 pb-4">
                <div className="rounded-xl overflow-hidden border border-white/10 relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={update.gifUrl}
                    alt="GIF"
                    className="max-h-96 object-contain"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 text-xs text-fuchsia-300 font-medium">
                    GIF
                  </div>
                </div>
              </div>
            )}

            {detectedVideoUrl && (
              <div className="px-4 sm:px-6 pb-4">
                <YouTubeEmbed url={detectedVideoUrl} />
              </div>
            )}

            {/* Auto-detected builders.to link preview */}
            {!detectedVideoUrl && (
              <div className="px-4 sm:px-6 pb-4">
                <AutoLinkPreview content={update.content} maxPreviews={1} />
              </div>
            )}

            {/* Poll */}
            {hasPoll && (
              <div className="px-4 sm:px-6 pb-4">
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="h-4 w-4 text-violet-400" />
                    <span className="text-sm font-medium text-violet-400">Poll</span>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <Clock className="h-3 w-3" />
                      <span className={isPollExpired ? "text-red-400" : ""}>{pollTimeRemaining}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
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

                          <div className="relative flex items-center justify-between px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              {isVoted && (
                                <Check className="h-3.5 w-3.5 text-violet-400" />
                              )}
                              <span className={cn(
                                "text-sm",
                                isVoted ? "text-violet-300 font-medium" : "text-zinc-200"
                              )}>
                                {option.text}
                              </span>
                            </div>
                            {showPollResults && (
                              <span className={cn(
                                "text-xs font-semibold tabular-nums",
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

                  <div className="mt-2 text-xs text-zinc-500">
                    {totalPollVotes} {totalPollVotes === 1 ? "vote" : "votes"}
                    {!currentUserId && !isPollExpired && (
                      <span className="ml-2 text-violet-400">
                        <Link href="/signin" className="hover:underline">Sign in to vote</Link>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="px-4 sm:px-6 py-3 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {/* Like button */}
                  <button
                    onClick={handleLike}
                    disabled={isLiking}
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                      isLiked
                        ? "text-pink-400 bg-pink-500/10 hover:bg-pink-500/20"
                        : "text-zinc-400 hover:text-pink-400 hover:bg-pink-500/10"
                    )}
                  >
                    <Heart
                      className={cn(
                        "h-5 w-5 transition-all",
                        isLiked && "fill-current"
                      )}
                    />
                    <span className="font-medium tabular-nums">
                      {likesCount > 0 ? likesCount : "Like"}
                    </span>
                  </button>

                  {/* Comment count */}
                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400">
                    <MessageCircle className="h-5 w-5" />
                    <span className="font-medium tabular-nums">
                      {commentsCount > 0 ? commentsCount : "0"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Copy URL */}
                  {updateUrl && (
                    <button
                      onClick={handleCopyUrl}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-colors"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Link2 className="h-4 w-4" />
                      )}
                      <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
                    </button>
                  )}

                  {/* Share to X */}
                  <button
                    onClick={handleShareToX}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-colors"
                  >
                    <XIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Comments section */}
            <div className="border-t border-white/10">
              <div className="px-4 sm:px-6 py-4">
                <h3 className="text-sm font-semibold text-zinc-300 mb-4">
                  Comments {commentsCount > 0 && `(${commentsCount})`}
                </h3>

                {/* Loading state */}
                {isLoadingComments && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
                  </div>
                )}

                {/* Comments list */}
                {!isLoadingComments && comments.length > 0 && (
                  <div className="space-y-4 mb-4">
                    {comments.map(comment => (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
                        currentUserId={currentUserId}
                        onDelete={handleDeleteComment}
                        onEdit={handleEditComment}
                      />
                    ))}
                  </div>
                )}

                {/* Empty state */}
                {!isLoadingComments && comments.length === 0 && (
                  <div className="text-center py-6 mb-4">
                    <MessageCircle className="h-10 w-10 mx-auto mb-2 text-zinc-600" />
                    <p className="text-sm text-zinc-500">No comments yet</p>
                    <p className="text-xs text-zinc-600 mt-1">Be the first to comment!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comment form - fixed at bottom */}
          <div className="sticky bottom-0 border-t border-white/10 p-4 bg-zinc-900/95 backdrop-blur-sm">
            {selectedGifUrl && (
              <div className="mb-3">
                <GifPreview
                  gifUrl={selectedGifUrl}
                  onRemove={() => setSelectedGifUrl(null)}
                  className="max-w-xs"
                />
              </div>
            )}

            <form onSubmit={handleSubmitComment} className="flex gap-3">
              <div className="flex-1 flex gap-2 items-center">
                <MentionInput
                  value={newComment}
                  onChange={setNewComment}
                  placeholder={currentUserId ? "Write a comment... Use @ to mention" : "Sign in to comment"}
                  disabled={!currentUserId || isSubmittingComment}
                  maxLength={1000}
                  onSubmit={handleSubmitComment}
                />
                <GifButton
                  onClick={() => setShowGifPicker(true)}
                  disabled={!currentUserId || isSubmittingComment || !!selectedGifUrl}
                  className="shrink-0"
                />
              </div>
              <button
                type="submit"
                disabled={!currentUserId || isSubmittingComment || (!newComment.trim() && !selectedGifUrl)}
                className="rounded-xl px-4 py-3 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {isSubmittingComment ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </form>

            <GiphyPicker
              isOpen={showGifPicker}
              onClose={() => setShowGifPicker(false)}
              onSelect={handleGifSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// Individual comment item component
interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string) => void;
}

function CommentItem({ comment, currentUserId, onDelete, onEdit }: CommentItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isLoading, setIsLoading] = useState(false);

  const isOwner = currentUserId === comment.user.id;
  const displayName = comment.user.displayName
    || (comment.user.firstName && comment.user.lastName ? `${comment.user.firstName} ${comment.user.lastName}` : null)
    || comment.user.name
    || "Builder";
  const isEdited = comment.updatedAt &&
    new Date(comment.updatedAt).getTime() - new Date(comment.createdAt).getTime() > 1000;

  async function handleSaveEdit() {
    if (!editContent.trim()) return;
    setIsLoading(true);
    await onEdit(comment.id, editContent.trim());
    setIsLoading(false);
    setIsEditing(false);
  }

  return (
    <div className="group flex gap-3">
      <Link href={comment.user.slug ? `/${comment.user.slug}` : "#"} className="flex-shrink-0">
        {comment.user.image ? (
          <Image
            src={comment.user.image}
            alt={displayName}
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover ring-2 ring-white/5"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500">
            <User className="h-4 w-4 text-white" />
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <div className="rounded-2xl bg-zinc-800/50 px-4 py-3">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <Link
                href={comment.user.slug ? `/${comment.user.slug}` : "#"}
                className="text-sm font-medium text-white hover:text-orange-400 transition-colors"
              >
                {displayName}
              </Link>
              <span className="text-xs text-zinc-500">
                {formatRelativeTime(comment.createdAt)}
                {isEdited && " · edited"}
              </span>
            </div>

            {isOwner && !isEditing && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/50 transition-all"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>

                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-full mt-1 z-20 w-28 rounded-xl border border-white/10 bg-zinc-800 shadow-xl py-1 overflow-hidden">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700/50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          <path d="m15 5 4 4" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          onDelete(comment.id);
                          setShowMenu(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-700/50 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none resize-none"
                rows={3}
                maxLength={1000}
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  className="px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isLoading || !editContent.trim()}
                  className="px-3 py-1.5 rounded-lg text-sm bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          ) : (
            <>
              {comment.content && comment.content.trim() && (
                <p className="text-sm text-zinc-300 whitespace-pre-wrap break-words leading-relaxed">
                  <ContentWithMentions content={comment.content} />
                </p>
              )}
              {comment.gifUrl && (
                <div className="mt-2 rounded-lg overflow-hidden max-w-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={comment.gifUrl}
                    alt="GIF"
                    className="w-full h-auto max-h-48 object-contain rounded-lg"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
