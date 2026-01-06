"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { User, Trash2, Loader2, MoreHorizontal, Heart, MessageCircle, ExternalLink } from "lucide-react";
import { formatRelativeTime, cn, MENTION_REGEX } from "@/lib/utils";
import { UpdateComments } from "./update-comments";

const FEED_TRUNCATE_LENGTH = 500;

// Component to render content with clickable @mentions
function ContentWithMentions({ content }: { content: string }) {
  const parts = useMemo(() => {
    const result: Array<{ type: "text" | "mention"; value: string }> = [];
    let lastIndex = 0;

    // Reset regex lastIndex to ensure fresh matching
    const regex = new RegExp(MENTION_REGEX.source, "g");
    let match;

    while ((match = regex.exec(content)) !== null) {
      // Add text before the mention
      if (match.index > lastIndex) {
        result.push({
          type: "text",
          value: content.slice(lastIndex, match.index),
        });
      }

      // Add the mention
      result.push({
        type: "mention",
        value: match[1], // The slug without @
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last mention
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

// X/Twitter icon
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface UpdateItemProps {
  update: {
    id: string;
    content: string;
    imageUrl?: string | null;
    createdAt: string | Date;
    likesCount?: number;
    isLiked?: boolean;
    commentsCount?: number;
    user: {
      id: string;
      name: string | null;
      displayName?: string | null;
      firstName: string | null;
      lastName: string | null;
      image: string | null;
      slug: string | null;
      headline?: string | null;
    };
  };
  currentUserId?: string;
  showAuthor?: boolean;
}

export function UpdateItem({ update, currentUserId, showAuthor = true }: UpdateItemProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(update.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(update.likesCount ?? 0);
  const [isLiking, setIsLiking] = useState(false);

  const isOwner = currentUserId === update.user.id;
  // Priority: displayName > firstName+lastName > name
  const displayName = update.user.displayName
    || (update.user.firstName && update.user.lastName ? `${update.user.firstName} ${update.user.lastName}` : null)
    || update.user.name
    || "Builder";

  // Truncate content for feed display
  const isTruncated = update.content.length > FEED_TRUNCATE_LENGTH;
  const displayContent = isTruncated
    ? update.content.slice(0, FEED_TRUNCATE_LENGTH)
    : update.content;

  // Build the update URL for linking
  const updateUrl = update.user.slug ? `/${update.user.slug}/updates/${update.id}` : null;

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

      router.refresh();
    } catch (error) {
      console.error("Error deleting update:", error);
      alert("Failed to delete update. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  }

  async function handleLike() {
    if (!currentUserId) {
      // Redirect to sign in
      router.push("/signin");
      return;
    }

    if (isLiking) return;

    setIsLiking(true);
    // Optimistic update
    const wasLiked = isLiked;
    setIsLiked(!isLiked);
    setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);

    try {
      const response = await fetch(`/api/updates/${update.id}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        // Revert on error
        setIsLiked(wasLiked);
        setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
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

  function handleShareToX() {
    // Build the share URL - use the unique update URL
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const shareableUrl = updateUrl ? `${baseUrl}${updateUrl}` : baseUrl;

    // Create the X share URL with just the link (let Twitter unfurl the OG image)
    const shareUrl = `https://x.com/intent/tweet?url=${encodeURIComponent(shareableUrl)}`;

    // Open in new window
    window.open(shareUrl, "_blank", "width=550,height=420");
  }

  return (
    <div className="group relative">
      <div className="flex gap-4">
        {/* Timeline line and dot */}
        <div className="flex flex-col items-center">
          <div className="h-3 w-3 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 ring-4 ring-zinc-900/50 shadow-lg shadow-orange-500/20" />
          <div className="flex-1 w-px bg-gradient-to-b from-orange-500/30 to-transparent min-h-[2rem]" />
        </div>

        {/* Content */}
        <div className="flex-1 pb-6">
          {showAuthor && (
            <div className="flex items-center gap-3 mb-2">
              <Link href={update.user.slug ? `/${update.user.slug}` : "#"} className="flex-shrink-0">
                {update.user.image ? (
                  <Image
                    src={update.user.image}
                    alt={displayName}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-zinc-800"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  href={update.user.slug ? `/${update.user.slug}` : "#"}
                  className="text-sm font-medium text-white hover:text-orange-400 transition-colors"
                >
                  {displayName}
                </Link>
                {update.user.headline && (
                  <p className="text-xs text-zinc-500 truncate">{update.user.headline}</p>
                )}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-white/5 bg-zinc-800/30 overflow-hidden hover:border-white/10 transition-colors">
            {/* Image attachment */}
            {update.imageUrl && (
              <div className="relative aspect-video max-h-80 bg-zinc-900">
                <Image
                  src={update.imageUrl}
                  alt="Update image"
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="p-4">
              <div className="text-zinc-300 whitespace-pre-wrap text-sm leading-relaxed">
                <ContentWithMentions content={displayContent} />
                {isTruncated && (
                  <>
                    <span className="text-zinc-500">...</span>
                    {updateUrl && (
                      <Link
                        href={updateUrl}
                        className="inline-flex items-center gap-1 ml-2 text-orange-400 hover:text-orange-300 transition-colors font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Read more
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </>
                )}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <div className="flex items-center gap-4">
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
                    <span className={cn(
                      "tabular-nums",
                      likesCount > 0 && "font-medium"
                    )}>
                      {likesCount > 0 ? likesCount : ""}
                    </span>
                  </button>

                  {/* Comment count indicator */}
                  <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                    <MessageCircle className="h-4 w-4" />
                    {(update.commentsCount ?? 0) > 0 && (
                      <span className="tabular-nums">{update.commentsCount}</span>
                    )}
                  </span>

                  <time className="text-xs text-zinc-500">
                    {formatRelativeTime(update.createdAt)}
                  </time>
                </div>

                <div className="flex items-center gap-1">
                  {/* Share to X button */}
                  <button
                    onClick={handleShareToX}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-colors"
                    title="Share to X"
                  >
                    <XIcon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Share</span>
                  </button>

                  {/* Actions menu for owner */}
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
                          <div className="absolute right-0 bottom-full mb-1 z-20 w-32 rounded-lg border border-white/10 bg-zinc-800 shadow-xl py-1">
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

              {/* Comments section */}
              <UpdateComments
                updateId={update.id}
                currentUserId={currentUserId}
                initialCommentsCount={update.commentsCount ?? 0}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
