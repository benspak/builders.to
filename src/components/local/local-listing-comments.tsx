"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Loader2, Send, User, MessageSquare } from "lucide-react";
import { formatRelativeTime, MENTION_REGEX } from "@/lib/utils";
import { LocalListingComment } from "./types";
import { MentionTextarea } from "@/components/ui/mention-textarea";

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

interface LocalListingCommentsProps {
  listingId: string;
  initialCommentCount?: number;
}

export function LocalListingComments({ listingId, initialCommentCount = 0 }: LocalListingCommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<LocalListingComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
    fetchComments();
  }, [listingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/local-listings/${listingId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to post comment");
      }

      const comment = await response.json();
      setComments(prev => [...prev, comment]);
      setNewComment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      {session?.user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="text-sm text-red-400">{error}</div>
          )}
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "You"}
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
            <div className="flex-1">
              <MentionTextarea
                value={newComment}
                onChange={setNewComment}
                placeholder="Write a comment... Use @ to mention"
                rows={3}
                maxLength={2000}
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-zinc-500">
                  {newComment.length}/2000
                </span>
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-900 rounded-lg bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Post
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4 text-center">
          <p className="text-sm text-zinc-400">
            <Link href="/signin" className="text-orange-400 hover:underline">
              Sign in
            </Link>{" "}
            to leave a comment
          </p>
        </div>
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="h-10 w-10 text-zinc-700 mx-auto mb-2" />
          <p className="text-sm text-zinc-500">No comments yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="flex-shrink-0">
                {comment.user.image ? (
                  <Image
                    src={comment.user.image}
                    alt={comment.user.name || "User"}
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
                    {comment.user.firstName && comment.user.lastName
                      ? `${comment.user.firstName} ${comment.user.lastName}`
                      : comment.user.displayName || comment.user.name || "Anonymous"}
                  </Link>
                  <span className="text-xs text-zinc-500">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-300 whitespace-pre-wrap break-words">
                  <ContentWithMentions content={comment.content} />
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
