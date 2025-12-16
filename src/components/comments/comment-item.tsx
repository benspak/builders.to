"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { User, MoreHorizontal, Pencil, Trash2, Loader2, X, Check } from "lucide-react";
import { formatRelativeTime, cn } from "@/lib/utils";

interface Comment {
  id: string;
  content: string;
  createdAt: string | Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface CommentItemProps {
  comment: Comment;
  onDeleted?: () => void;
  onUpdated?: () => void;
}

export function CommentItem({ comment, onDeleted, onUpdated }: CommentItemProps) {
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = session?.user?.id === comment.user.id;

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

  return (
    <div className={cn(
      "group relative rounded-xl border border-white/5 bg-zinc-900/30 p-4 transition-colors hover:border-white/10",
      deleting && "opacity-50 pointer-events-none"
    )}>
      <div className="flex gap-4">
        {/* Avatar */}
        {comment.user.image ? (
          <Image
            src={comment.user.image}
            alt={comment.user.name || "User"}
            width={40}
            height={40}
            className="rounded-full h-10 w-10 shrink-0"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-700">
            <User className="h-5 w-5 text-zinc-400" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white truncate">
                {comment.user.name}
              </span>
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
            <p className="mt-2 text-zinc-300 whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
