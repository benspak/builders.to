"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { User, Trash2, Loader2, MoreHorizontal } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface UpdateItemProps {
  update: {
    id: string;
    content: string;
    createdAt: string | Date;
    user: {
      id: string;
      name: string | null;
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

  const isOwner = currentUserId === update.user.id;
  const displayName = update.user.firstName && update.user.lastName
    ? `${update.user.firstName} ${update.user.lastName}`
    : update.user.name || "Builder";

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
              <Link href={update.user.slug ? `/profile/${update.user.slug}` : "#"} className="flex-shrink-0">
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
                  href={update.user.slug ? `/profile/${update.user.slug}` : "#"}
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

          <div className="rounded-xl border border-white/5 bg-zinc-800/30 p-4 hover:border-white/10 transition-colors">
            <p className="text-zinc-300 whitespace-pre-wrap text-sm leading-relaxed">
              {update.content}
            </p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
              <time className="text-xs text-zinc-500">
                {formatRelativeTime(update.createdAt)}
              </time>

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
        </div>
      </div>
    </div>
  );
}
