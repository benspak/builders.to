"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Pin, User, Heart, X, Loader2, ExternalLink } from "lucide-react";
import { formatRelativeTime, cn } from "@/lib/utils";
import { UpdateComments } from "./update-comments";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { MarkdownContent } from "@/components/ui/markdown-content";

const TRUNCATE_LENGTH = 300;

interface PinnedPost {
  id: string;
  order: number;
  update: {
    id: string;
    content: string;
    imageUrl?: string | null;
    gifUrl?: string | null;
    createdAt: string | Date;
    likesCount?: number;
    commentsCount?: number;
    isLiked?: boolean;
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
}

interface PinnedPostsSectionProps {
  pinnedPosts: PinnedPost[];
  currentUserId?: string;
  isOwnProfile: boolean;
}

function PinnedPostItem({
  pinnedPost,
  currentUserId,
  isOwnProfile,
}: {
  pinnedPost: PinnedPost;
  currentUserId?: string;
  isOwnProfile: boolean;
}) {
  const router = useRouter();
  const [isUnpinning, setIsUnpinning] = useState(false);
  const [isLiked, setIsLiked] = useState(pinnedPost.update.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(pinnedPost.update.likesCount ?? 0);
  const [isLiking, setIsLiking] = useState(false);

  const { update } = pinnedPost;
  const displayName =
    update.user.displayName ||
    (update.user.firstName && update.user.lastName
      ? `${update.user.firstName} ${update.user.lastName}`
      : null) ||
    update.user.name ||
    "Builder";

  const isTruncated = update.content.length > TRUNCATE_LENGTH;
  const displayContent = isTruncated
    ? update.content.slice(0, TRUNCATE_LENGTH)
    : update.content;

  const updateUrl = update.user.slug ? `/${update.user.slug}/updates/${update.id}` : null;

  async function handleUnpin() {
    if (isUnpinning) return;

    setIsUnpinning(true);
    try {
      const response = await fetch(`/api/pinned-posts?updateId=${update.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to unpin post");
      }

      router.refresh();
    } catch (error) {
      console.error("Error unpinning post:", error);
      alert("Failed to unpin post. Please try again.");
    } finally {
      setIsUnpinning(false);
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
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      const response = await fetch(`/api/updates/${update.id}/like`, {
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

  return (
    <div className="rounded-xl border border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-transparent overflow-hidden">
      {/* Pin indicator header */}
      <div className="flex items-center justify-between px-4 py-2 bg-orange-500/10 border-b border-orange-500/20">
        <div className="flex items-center gap-2 text-xs text-orange-400">
          <Pin className="h-3.5 w-3.5" />
          <span className="font-medium">Pinned</span>
        </div>
        {isOwnProfile && (
          <button
            onClick={handleUnpin}
            disabled={isUnpinning}
            className="p-1 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            title="Unpin this post"
          >
            {isUnpinning ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>

      {/* Post content */}
      <div className="p-4">
        {/* Author info */}
        <div className="flex items-center gap-3 mb-3">
          <Link
            href={update.user.slug ? `/${update.user.slug}` : "#"}
            className="flex-shrink-0"
          >
            {update.user.image ? (
              <Image
                src={update.user.image}
                alt={displayName}
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-zinc-800"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500">
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
            <p className="text-xs text-zinc-500">
              {formatRelativeTime(update.createdAt)}
            </p>
          </div>
        </div>

        {/* Image attachment */}
        {update.imageUrl && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <ImageLightbox
              src={update.imageUrl}
              alt="Update image"
              containerClassName="relative aspect-video max-h-48 bg-zinc-900"
              className="object-cover"
            />
          </div>
        )}

        {/* GIF attachment */}
        {update.gifUrl && (
          <div className="mb-3 relative max-h-48 rounded-lg bg-zinc-900 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={update.gifUrl}
              alt="GIF"
              className="w-full h-auto max-h-48 object-contain"
            />
            <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 text-xs text-fuchsia-300 font-medium">
              GIF
            </div>
          </div>
        )}

        {/* Content */}
        <div className="text-zinc-300 text-sm leading-relaxed">
          <MarkdownContent content={displayContent} className="prose-sm" />
          {isTruncated && (
            <div className="mt-2">
              <span className="text-zinc-500">...</span>
              {updateUrl && (
                <Link
                  href={updateUrl}
                  className="inline-flex items-center gap-1 ml-2 text-orange-400 hover:text-orange-300 transition-colors font-medium"
                >
                  Read more
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
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

          {/* Comments */}
          <UpdateComments
            updateId={update.id}
            currentUserId={currentUserId}
            initialCommentsCount={pinnedPost.update.commentsCount ?? 0}
          >
            <div className="flex items-start gap-3">
              {update.user.image ? (
                <Image
                  src={update.user.image}
                  alt={displayName}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-white/5"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white">{displayName}</span>
                  <span className="text-xs text-zinc-500">
                    {formatRelativeTime(update.createdAt)}
                  </span>
                </div>
                <div className="text-zinc-300 text-sm leading-relaxed">
                  <MarkdownContent content={update.content} className="prose-sm" />
                </div>
                {update.imageUrl && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-white/10">
                    <Image
                      src={update.imageUrl}
                      alt="Update image"
                      width={500}
                      height={300}
                      className="w-full object-cover max-h-64"
                    />
                  </div>
                )}
                {update.gifUrl && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-white/10 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={update.gifUrl}
                      alt="GIF"
                      className="w-full object-contain max-h-64"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 text-xs text-fuchsia-300 font-medium">
                      GIF
                    </div>
                  </div>
                )}
              </div>
            </div>
          </UpdateComments>
        </div>
      </div>
    </div>
  );
}

export function PinnedPostsSection({
  pinnedPosts,
  currentUserId,
  isOwnProfile,
}: PinnedPostsSectionProps) {
  if (pinnedPosts.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Pin className="h-5 w-5 text-orange-500" />
        <h2 className="text-xl font-semibold text-white">Pinned</h2>
        <span className="text-sm text-zinc-500">({pinnedPosts.length})</span>
      </div>

      <div className="space-y-4">
        {pinnedPosts.map((pinnedPost) => (
          <PinnedPostItem
            key={pinnedPost.id}
            pinnedPost={pinnedPost}
            currentUserId={currentUserId}
            isOwnProfile={isOwnProfile}
          />
        ))}
      </div>
    </section>
  );
}
