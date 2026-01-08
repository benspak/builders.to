"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatRelativeTime } from "@/lib/utils";
import { Pin, MoreHorizontal, Pencil, Trash2, Loader2, X, Check } from "lucide-react";
import { ImageLightbox } from "@/components/ui/image-lightbox";

interface CompanyUpdateItemProps {
  update: {
    id: string;
    content: string;
    imageUrl?: string | null;
    isPinned: boolean;
    createdAt: string | Date;
  };
  isOwner?: boolean;
}

export function CompanyUpdateItem({ update, isOwner }: CompanyUpdateItemProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(update.content);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!editContent.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/company-updates/${update.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to update");
      }

      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this update?")) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/company-updates/${update.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      router.refresh();
    } catch (error) {
      console.error("Error deleting:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePin = async () => {
    try {
      const response = await fetch(`/api/company-updates/${update.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !update.isPinned }),
      });

      if (!response.ok) {
        throw new Error("Failed to update pin status");
      }

      router.refresh();
    } catch (error) {
      console.error("Error toggling pin:", error);
    }
  };

  return (
    <div className={`p-4 border-b border-white/5 last:border-b-0 ${update.isPinned ? "bg-orange-500/5" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {update.isPinned && (
            <div className="flex items-center gap-1.5 text-xs text-orange-400 mb-2">
              <Pin className="h-3 w-3" />
              <span>Pinned update</span>
            </div>
          )}

          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                maxLength={5000}
                className="textarea resize-none w-full"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={loading || !editContent.trim()}
                  className="btn-primary text-sm"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(update.content);
                  }}
                  className="btn-secondary text-sm"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-zinc-300 whitespace-pre-wrap break-words">{update.content}</p>
          )}

          {update.imageUrl && !isEditing && (
            <div className="mt-3 rounded-xl overflow-hidden border border-white/10">
              <ImageLightbox
                src={update.imageUrl}
                alt="Update image"
                containerClassName="relative aspect-video max-h-[300px] bg-zinc-900"
                className="object-cover"
              />
            </div>
          )}

          <div className="mt-2 text-xs text-zinc-500">
            {formatRelativeTime(update.createdAt)}
          </div>
        </div>

        {isOwner && !isEditing && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 w-40 rounded-xl bg-zinc-900 border border-white/10 shadow-xl overflow-hidden">
                  <button
                    onClick={() => {
                      handleTogglePin();
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Pin className="h-4 w-4" />
                    {update.isPinned ? "Unpin" : "Pin"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowMenu(false);
                    }}
                    disabled={deleting}
                    className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                  >
                    {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
