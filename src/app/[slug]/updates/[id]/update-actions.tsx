"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Share2, Trash2, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// X/Twitter icon
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface UpdateActionsProps {
  updateId: string;
  userSlug: string;
  content: string;
  isLiked: boolean;
  likesCount: number;
  currentUserId?: string;
  isOwner: boolean;
}

export function UpdateActions({
  updateId,
  userSlug,
  content,
  isLiked: initialIsLiked,
  likesCount: initialLikesCount,
  currentUserId,
  isOwner,
}: UpdateActionsProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleLike() {
    if (!currentUserId) {
      router.push("/signin");
      return;
    }

    if (isLiking) return;

    setIsLiking(true);
    const wasLiked = isLiked;
    setIsLiked(!isLiked);
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      const response = await fetch(`/api/updates/${updateId}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        setIsLiked(wasLiked);
        setLikesCount((prev) => (wasLiked ? prev + 1 : prev - 1));
        throw new Error("Failed to like update");
      }

      const data = await response.json();
      setIsLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (error) {
      console.error("Error liking update:", error);
    } finally {
      setIsLiking(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this update?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/updates/${updateId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete update");
      }

      router.push(`/${userSlug}`);
      router.refresh();
    } catch (error) {
      console.error("Error deleting update:", error);
      alert("Failed to delete update. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/${userSlug}/updates/${updateId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleShareToX() {
    const url = `${window.location.origin}/${userSlug}/updates/${updateId}`;

    // Twitter has 280 char limit, URL takes ~23 chars (t.co shortening)
    // Leave room for the URL + some spacing
    const maxContentLength = 250;
    const tweetContent = content.length > maxContentLength
      ? content.slice(0, maxContentLength).trim() + "..."
      : content;

    // Create the X share URL with the update content and link
    const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetContent)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, "_blank", "width=550,height=420");
  }

  return (
    <div className="flex items-center gap-2">
      {/* Like button */}
      <button
        onClick={handleLike}
        disabled={isLiking}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
          isLiked
            ? "bg-pink-500/20 text-pink-400 border border-pink-500/30"
            : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800 hover:text-white hover:border-zinc-600",
          isLiking && "opacity-50 cursor-not-allowed"
        )}
      >
        {isLiking ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
        )}
        <span>{likesCount}</span>
      </button>

      {/* Copy link button */}
      <button
        onClick={handleCopyLink}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800 hover:text-white hover:border-zinc-600 transition-all"
        title="Copy link"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-emerald-400" />
            <span className="text-emerald-400">Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Copy link</span>
          </>
        )}
      </button>

      {/* Share to X button */}
      <button
        onClick={handleShareToX}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800 hover:text-white hover:border-zinc-600 transition-all"
        title="Share to X"
      >
        <XIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Share</span>
      </button>

      {/* Delete button (owner only) */}
      {isOwner && (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400 border border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50 transition-all disabled:opacity-50"
          title="Delete update"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
}
