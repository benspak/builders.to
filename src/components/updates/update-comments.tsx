"use client";

import { useState, useEffect, useMemo, ReactNode, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { User, Send, Loader2, MoreHorizontal, Trash2, Pencil, X, MessageCircle, ImagePlus, BarChart3, Plus, Clock, Check } from "lucide-react";
import { formatRelativeTime, MENTION_REGEX, cn } from "@/lib/utils";
import { MentionInput } from "@/components/ui/mention-input";
import { GiphyPicker, GifButton, GifPreview } from "@/components/ui/giphy-picker";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { YouTubeEmbed, extractYouTubeUrlFromText } from "@/components/ui/youtube-embed";

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
  imageUrl?: string | null;
  videoUrl?: string | null;
  pollQuestion?: string | null;
  pollExpiresAt?: string | Date | null;
  pollOptions?: PollOption[];
  votedOptionId?: string | null;
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

interface UpdateCommentsProps {
  updateId: string;
  currentUserId?: string;
  initialCommentsCount?: number;
  /** Original content to display in the modal */
  children?: ReactNode;
}

export function UpdateComments({ updateId, currentUserId, initialCommentsCount = 0, children }: UpdateCommentsProps) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [selectedGifUrl, setSelectedGifUrl] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Poll state
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", ""]);

  // Track if component is mounted (for portal SSR safety)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch comments when modal opens
  useEffect(() => {
    if (isOpen && comments.length === 0) {
      fetchComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "comments");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedImageUrl(data.url);
        setSelectedGifUrl(null);
      }
    } catch (err) {
      console.error("Failed to upload image:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // Poll functions
  const maxPollOptions = 5;
  const minPollOptions = 2;
  const maxOptionLength = 50;

  function handlePollOptionChange(index: number, value: string) {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  }

  function addPollOption() {
    if (pollOptions.length < maxPollOptions) {
      setPollOptions([...pollOptions, ""]);
    }
  }

  function removePollOption(index: number) {
    if (pollOptions.length > minPollOptions) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  }

  function togglePoll() {
    if (showPoll) {
      setShowPoll(false);
      setPollOptions(["", ""]);
    } else {
      setSelectedImageUrl(null);
      setSelectedGifUrl(null);
      setShowPoll(true);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!currentUserId) {
      router.push("/signin");
      return;
    }

    // Allow submit if there's text OR media
    if (!newComment.trim() && !selectedGifUrl && !selectedImageUrl) return;

    // Validate poll if present
    if (showPoll) {
      const validOptions = pollOptions.filter((opt) => opt.trim().length > 0);
      if (validOptions.length < 2) return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/updates/${updateId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment.trim() || " ",
          gifUrl: selectedGifUrl,
          imageUrl: selectedImageUrl,
          ...(showPoll && {
            pollOptions: pollOptions.filter((opt) => opt.trim().length > 0).map((opt) => opt.trim()),
          }),
        }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments(prev => [...prev, comment]);
        setCommentsCount(prev => prev + 1);
        setNewComment("");
        setSelectedGifUrl(null);
        setSelectedImageUrl(null);
        setShowPoll(false);
        setPollOptions(["", ""]);
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGifSelect(gif: { url: string; width: number; height: number }) {
    setSelectedGifUrl(gif.url);
    setSelectedImageUrl(null);
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

  // Modal content to be portaled
  const modalContent = isOpen && mounted ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
    >
      {/* Modal content */}
      <div
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-orange-500/10 via-pink-500/10 to-violet-500/10">
          <h2 className="text-lg font-semibold text-white">Comments</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          {/* Original content */}
          {children && (
            <div className="p-6 border-b border-white/5">
              {children}
            </div>
          )}

          {/* Comments section */}
          <div className="p-6 space-y-4">
            {/* Loading state */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
              </div>
            )}

            {/* Comments list */}
            {!isLoading && comments.length > 0 && (
              <div className="space-y-4">
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
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-orange-400 opacity-30" />
                <p className="text-sm text-zinc-500">No comments yet</p>
                <p className="text-xs text-zinc-600 mt-1">Be the first to comment!</p>
              </div>
            )}
          </div>
        </div>

        {/* Comment form - fixed at bottom */}
        <div className="border-t border-white/10 p-4 bg-zinc-900/95">
          {/* Selected Image preview */}
          {selectedImageUrl && (
            <div className="mb-3 relative rounded-xl overflow-hidden border border-white/10 bg-zinc-800/30 max-w-xs">
              <div className="relative aspect-video max-h-32">
                <Image src={selectedImageUrl} alt="Upload preview" fill className="object-cover" />
              </div>
              <button
                type="button"
                onClick={() => setSelectedImageUrl(null)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-red-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Selected GIF preview */}
          {selectedGifUrl && (
            <div className="mb-3">
              <GifPreview
                gifUrl={selectedGifUrl}
                onRemove={() => setSelectedGifUrl(null)}
                className="max-w-xs"
              />
            </div>
          )}

          {/* Poll editor */}
          {showPoll && (
            <div className="mb-3 rounded-xl border border-violet-500/30 bg-violet-500/5 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-violet-400">
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span className="font-medium">Poll</span>
                </div>
                <button type="button" onClick={() => { setShowPoll(false); setPollOptions(["", ""]); }} className="p-1 rounded-lg text-zinc-400 hover:text-red-400">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-1.5">
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex gap-1.5">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handlePollOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      maxLength={maxOptionLength}
                      className="flex-1 rounded-lg border border-white/10 bg-zinc-800/50 px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none"
                    />
                    {pollOptions.length > minPollOptions && (
                      <button type="button" onClick={() => removePollOption(index)} className="p-1.5 rounded-lg border border-white/10 bg-zinc-800/50 text-zinc-400 hover:text-red-400">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {pollOptions.length < maxPollOptions && (
                <button type="button" onClick={addPollOption} className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300">
                  <Plus className="h-3 w-3" /> Add option
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex gap-2 items-center">
              <MentionInput
                value={newComment}
                onChange={setNewComment}
                placeholder={currentUserId ? "Write a comment... Use @ to mention" : "Sign in to comment"}
                disabled={!currentUserId || isSubmitting}
                maxLength={1000}
                onSubmit={handleSubmit}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isSubmitting || isUploading} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!currentUserId || isSubmitting || isUploading || !!selectedImageUrl || !!selectedGifUrl || showPoll}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/50 disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
                </button>
                <GifButton
                  onClick={() => setShowGifPicker(true)}
                  disabled={!currentUserId || isSubmitting || !!selectedImageUrl || !!selectedGifUrl || showPoll}
                  className="text-xs px-2 py-1.5"
                />
                <button
                  type="button"
                  onClick={togglePoll}
                  disabled={!currentUserId || isSubmitting || !!selectedImageUrl || !!selectedGifUrl}
                  className={cn("inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs disabled:opacity-50", showPoll ? "text-violet-400 bg-violet-500/10" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50")}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                type="submit"
                disabled={!currentUserId || isSubmitting || (!newComment.trim() && !selectedGifUrl && !selectedImageUrl)}
                className="rounded-xl px-4 py-2 text-sm bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </form>

          {/* GIF Picker Modal */}
          <GiphyPicker
            isOpen={showGifPicker}
            onClose={() => setShowGifPicker(false)}
            onSelect={handleGifSelect}
          />
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Comment trigger button - just icon and count */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-orange-400 hover:bg-orange-500/10 transition-all"
      >
        <MessageCircle className="h-4 w-4" />
        {commentsCount > 0 && <span className="font-medium">{commentsCount}</span>}
      </button>

      {/* Portal modal to document.body to avoid backdrop-filter stacking context issues */}
      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}

// Individual comment item
interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string) => void;
  onVote?: () => void;
}

function CommentItem({ comment, currentUserId, onDelete, onEdit, onVote }: CommentItemProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isLoading, setIsLoading] = useState(false);

  // Poll state
  const [votedOptionId, setVotedOptionId] = useState<string | null>(comment.votedOptionId || null);
  const [pollOptions, setPollOptions] = useState(comment.pollOptions || []);
  const [isVoting, setIsVoting] = useState(false);

  const hasPoll = !!comment.pollQuestion && pollOptions.length > 0;
  const isPollExpired = comment.pollExpiresAt ? new Date() > new Date(comment.pollExpiresAt) : false;
  const hasVoted = !!votedOptionId;
  const showPollResults = hasVoted || isPollExpired;
  const totalPollVotes = pollOptions.reduce((sum, opt) => sum + opt._count.votes, 0);

  const isOwner = currentUserId === comment.user.id;
  // Priority: displayName > firstName+lastName > name
  const displayName = comment.user.displayName
    || (comment.user.firstName && comment.user.lastName ? `${comment.user.firstName} ${comment.user.lastName}` : null)
    || comment.user.name
    || "Builder";
  const isEdited = comment.updatedAt &&
    new Date(comment.updatedAt).getTime() - new Date(comment.createdAt).getTime() > 1000;

  // Auto-detect YouTube video from content
  const detectedVideoUrl = useMemo(() => {
    if (comment.videoUrl) return comment.videoUrl;
    return extractYouTubeUrlFromText(comment.content);
  }, [comment.videoUrl, comment.content]);

  const getPollTimeRemaining = () => {
    if (!comment.pollExpiresAt) return "";
    const now = new Date();
    const expires = new Date(comment.pollExpiresAt);
    const diff = expires.getTime() - now.getTime();
    if (diff <= 0) return "Poll ended";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}m left`;
  };

  async function handleSaveEdit() {
    if (!editContent.trim()) return;
    setIsLoading(true);
    await onEdit(comment.id, editContent.trim());
    setIsLoading(false);
    setIsEditing(false);
  }

  async function handleVote(optionId: string) {
    if (!currentUserId) {
      router.push("/signin");
      return;
    }
    if (isVoting || isPollExpired || hasVoted) return;

    setIsVoting(true);
    setVotedOptionId(optionId);
    setPollOptions(prev => prev.map(opt => ({
      ...opt,
      _count: { votes: opt.id === optionId ? opt._count.votes + 1 : opt._count.votes },
    })));

    try {
      const response = await fetch(`/api/comment-polls/${comment.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId, type: "update-comment" }),
      });

      if (!response.ok) {
        setVotedOptionId(null);
        setPollOptions(comment.pollOptions || []);
      } else {
        const data = await response.json();
        if (data.options) setPollOptions(data.options);
        onVote?.();
      }
    } catch {
      setVotedOptionId(null);
      setPollOptions(comment.pollOptions || []);
    } finally {
      setIsVoting(false);
    }
  }

  return (
    <div className="group flex gap-3">
      {/* Avatar */}
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

      {/* Content */}
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

            {/* Actions menu */}
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
                        <Pencil className="h-3.5 w-3.5" />
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
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 text-xs text-fuchsia-300 font-medium">GIF</div>
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
                    <span className="text-xs font-medium text-violet-400">Poll</span>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <Clock className="h-3 w-3" />
                      <span className={isPollExpired ? "text-red-400" : ""}>{getPollTimeRemaining()}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {pollOptions.map((option) => {
                      const percentage = totalPollVotes > 0 ? Math.round((option._count.votes / totalPollVotes) * 100) : 0;
                      const isVoted = votedOptionId === option.id;
                      const isWinning = showPollResults && option._count.votes === Math.max(...pollOptions.map(o => o._count.votes)) && option._count.votes > 0;

                      return (
                        <button
                          key={option.id}
                          onClick={() => handleVote(option.id)}
                          disabled={!currentUserId || isVoting || isPollExpired || hasVoted}
                          className={cn(
                            "relative w-full text-left rounded-lg border transition-all overflow-hidden",
                            showPollResults ? "cursor-default" : "hover:border-violet-500/50 hover:bg-violet-500/5 cursor-pointer",
                            isVoted ? "border-violet-500/50 bg-violet-500/10" : "border-white/10 bg-zinc-800/30",
                            (!currentUserId || isPollExpired) && !showPollResults && "opacity-60 cursor-not-allowed"
                          )}
                        >
                          {showPollResults && (
                            <div className={cn("absolute inset-y-0 left-0 transition-all duration-500", isVoted ? "bg-violet-500/30" : isWinning ? "bg-violet-500/20" : "bg-zinc-700/50")} style={{ width: `${percentage}%` }} />
                          )}
                          <div className="relative flex items-center justify-between px-2.5 py-1.5">
                            <div className="flex items-center gap-1.5">
                              {isVoted && <Check className="h-3 w-3 text-violet-400" />}
                              <span className={cn("text-xs", isVoted ? "text-violet-300 font-medium" : "text-zinc-200")}>{option.text}</span>
                            </div>
                            {showPollResults && <span className={cn("text-xs font-semibold tabular-nums", isVoted ? "text-violet-300" : isWinning ? "text-white" : "text-zinc-400")}>{percentage}%</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-1.5 text-xs text-zinc-500">
                    {totalPollVotes} {totalPollVotes === 1 ? "vote" : "votes"}
                    {!currentUserId && !isPollExpired && <span className="ml-2 text-violet-400"><Link href="/signin" className="hover:underline">Sign in to vote</Link></span>}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
