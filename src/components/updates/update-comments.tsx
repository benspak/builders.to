"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { User, Send, Loader2, MoreHorizontal, Trash2, Pencil, X, Check } from "lucide-react";
import { formatRelativeTime, MENTION_REGEX } from "@/lib/utils";

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

interface Comment {
  id: string;
  content: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
  user: {
    id: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
    slug: string | null;
  };
}

interface UpdateCommentsProps {
  updateId: string;
  currentUserId?: string;
  initialCommentsCount?: number;
}

export function UpdateComments({ updateId, currentUserId, initialCommentsCount = 0 }: UpdateCommentsProps) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);

  // Fetch comments when expanded
  useEffect(() => {
    if (isExpanded && comments.length === 0) {
      fetchComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded]);

  async function fetchComments() {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/updates/${updateId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
        setCommentsCount(data.length);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!currentUserId) {
      router.push("/signin");
      return;
    }

    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/updates/${updateId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments(prev => [...prev, comment]);
        setCommentsCount(prev => prev + 1);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const response = await fetch(`/api/update-comments/${commentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        setCommentsCount(prev => prev - 1);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  }

  async function handleEdit(commentId: string, newContent: string) {
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

  return (
    <div className="border-t border-white/5 pt-3 mt-3">
      {/* Toggle comments button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        {isExpanded ? "Hide" : "Show"} comments {commentsCount > 0 && `(${commentsCount})`}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-3">
          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
            </div>
          )}

          {/* Comments list */}
          {!isLoading && comments.length > 0 && (
            <div className="space-y-3">
              {comments.map(comment => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUserId}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && comments.length === 0 && (
            <p className="text-xs text-zinc-500 py-2">No comments yet. Be the first to comment!</p>
          )}

          {/* Comment form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={currentUserId ? "Add a comment..." : "Sign in to comment"}
              disabled={!currentUserId || isSubmitting}
              maxLength={1000}
              className="flex-1 rounded-lg border border-white/10 bg-zinc-800/50 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-orange-500/50 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!currentUserId || isSubmitting || !newComment.trim()}
              className="rounded-lg bg-orange-500/20 px-3 py-2 text-orange-400 hover:bg-orange-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// Individual comment item
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
  const displayName = comment.user.firstName && comment.user.lastName
    ? `${comment.user.firstName} ${comment.user.lastName}`
    : comment.user.name || "Builder";
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
    <div className="group flex gap-2">
      {/* Avatar */}
      <Link href={comment.user.slug ? `/${comment.user.slug}` : "#"} className="flex-shrink-0">
        {comment.user.image ? (
          <Image
            src={comment.user.image}
            alt={displayName}
            width={24}
            height={24}
            className="h-6 w-6 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500">
            <User className="h-3 w-3 text-white" />
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="rounded-lg bg-zinc-800/50 px-3 py-2">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <Link
                href={comment.user.slug ? `/${comment.user.slug}` : "#"}
                className="text-xs font-medium text-white hover:text-orange-400 transition-colors"
              >
                {displayName}
              </Link>
<span className="text-[10px] text-zinc-500">
              {formatRelativeTime(comment.createdAt)}
              {isEdited && " (edited)"}
            </span>
            </div>

            {/* Actions menu */}
            {isOwner && !isEditing && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-zinc-500 hover:text-zinc-300 transition-all"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </button>

                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-full mt-1 z-20 w-24 rounded-lg border border-white/10 bg-zinc-800 shadow-xl py-1">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        className="flex w-full items-center gap-1.5 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-700/50"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          onDelete(comment.id);
                          setShowMenu(false);
                        }}
                        className="flex w-full items-center gap-1.5 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
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

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-zinc-700/50 px-2 py-1 text-xs text-white focus:border-orange-500/50 focus:outline-none resize-none"
                rows={2}
                maxLength={1000}
              />
              <div className="flex items-center justify-end gap-1">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isLoading || !editContent.trim()}
                  className="p-1 rounded text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-300 whitespace-pre-wrap break-words">
              <ContentWithMentions content={comment.content} />
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
