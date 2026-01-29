"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Send, Loader2, ImagePlus, X, User, BarChart3, Plus } from "lucide-react";
import { GiphyPicker, GifButton, GifPreview } from "@/components/ui/giphy-picker";
import { cn } from "@/lib/utils";

interface MentionUser {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  slug: string | null;
  headline: string | null;
}

export interface RichCommentFormProps {
  onSubmit: (data: {
    content: string;
    imageUrl?: string | null;
    gifUrl?: string | null;
    videoUrl?: string | null;
    pollOptions?: string[];
  }) => Promise<void>;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  showAvatar?: boolean;
  compact?: boolean;
  autoFocus?: boolean;
  onCancel?: () => void;
  className?: string;
}

export function RichCommentForm({
  onSubmit,
  placeholder = "Write a comment... Use @ to mention",
  maxLength = 2000,
  disabled = false,
  showAvatar = true,
  compact = false,
  autoFocus = false,
  onCancel,
  className,
}: RichCommentFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Poll state
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", ""]);

  // Mention autocomplete state
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStartPos, setMentionStartPos] = useState<number>(0);
  const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const mentionDropdownRef = useRef<HTMLDivElement>(null);

  const remainingChars = maxLength - content.length;

  // Debounced user search
  useEffect(() => {
    if (mentionQuery === null || mentionQuery.length < 1) {
      setMentionUsers([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(mentionQuery)}&limit=5`);
        if (response.ok) {
          const data = await response.json();
          setMentionUsers(data.users);
          setSelectedMentionIndex(0);
        }
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(searchTimeout);
  }, [mentionQuery]);

  // Handle text change and detect @mentions
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const cursorPos = e.target.selectionStart;
    setContent(newContent);

    // Find if we're in the middle of typing a mention
    const textBeforeCursor = newContent.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@([a-zA-Z0-9_-]*)$/);

    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setMentionStartPos(cursorPos - mentionMatch[0].length);
    } else {
      setMentionQuery(null);
      setMentionUsers([]);
    }
  }, []);

  // Insert selected mention
  const insertMention = useCallback((user: MentionUser) => {
    if (!user.slug) return;

    const beforeMention = content.slice(0, mentionStartPos);
    const afterMention = content.slice(mentionStartPos + (mentionQuery?.length ?? 0) + 1);
    const newContent = `${beforeMention}@${user.slug} ${afterMention}`;

    setContent(newContent);
    setMentionQuery(null);
    setMentionUsers([]);

    // Focus back on textarea and set cursor position
    setTimeout(() => {
      if (textareaRef.current && user.slug) {
        const newCursorPos = mentionStartPos + user.slug.length + 2;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, [content, mentionStartPos, mentionQuery]);

  // Handle keyboard navigation in mention dropdown and form submission
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Cmd/Ctrl + Enter to submit the form
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (content.trim() && content.length <= maxLength && !isSubmitting && !isUploading) {
        const form = e.currentTarget.closest("form");
        if (form) {
          form.requestSubmit();
        }
      }
      return;
    }

    // Only handle mention navigation if mention dropdown is open
    if (mentionUsers.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          prev < mentionUsers.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedMentionIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
      case "Tab":
        if (mentionUsers.length > 0) {
          e.preventDefault();
          insertMention(mentionUsers[selectedMentionIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setMentionQuery(null);
        setMentionUsers([]);
        break;
    }
  }, [mentionUsers, selectedMentionIndex, insertMention, content, maxLength, isSubmitting, isUploading]);

  // Close mention dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mentionDropdownRef.current && !mentionDropdownRef.current.contains(e.target as Node)) {
        setMentionQuery(null);
        setMentionUsers([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "comments");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      setImageUrl(data.url);
      // Remove GIF if an image is selected (can only have one)
      setGifUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function removeImage() {
    setImageUrl(null);
  }

  function handleGifSelect(gif: { url: string; width: number; height: number }) {
    setGifUrl(gif.url);
    // Remove image if a GIF is selected (can only have one)
    setImageUrl(null);
  }

  function removeGif() {
    setGifUrl(null);
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
      // Remove image/gif when adding poll (mutually exclusive)
      setImageUrl(null);
      setGifUrl(null);
      setShowPoll(true);
    }
  }

  function removePoll() {
    setShowPoll(false);
    setPollOptions(["", ""]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!session) {
      router.push("/signin");
      return;
    }

    // Allow submit if there's text OR media
    if (!content.trim() && !imageUrl && !gifUrl) {
      setError("Please enter a comment or add media");
      return;
    }

    // Validate poll if present
    if (showPoll) {
      const validOptions = pollOptions.filter((opt) => opt.trim().length > 0);
      if (validOptions.length < 2) {
        setError("Please add at least 2 poll options");
        return;
      }
      const uniqueOptions = new Set(validOptions.map((opt) => opt.trim().toLowerCase()));
      if (uniqueOptions.size !== validOptions.length) {
        setError("Poll options must be unique");
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        content: content.trim() || " ", // Need at least a space for DB
        imageUrl,
        gifUrl,
        ...(showPoll && {
          pollOptions: pollOptions.filter((opt) => opt.trim().length > 0).map((opt) => opt.trim()),
        }),
      });

      // Clear form
      setContent("");
      setImageUrl(null);
      setGifUrl(null);
      setShowPoll(false);
      setPollOptions(["", ""]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  }

  const getDisplayName = (user: MentionUser) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.name || user.slug || "Builder";
  };

  if (!session) {
    return (
      <div className="rounded-xl border border-white/10 bg-zinc-900/30 p-4 text-center">
        <p className="text-sm text-zinc-400">
          <button
            onClick={() => router.push("/signin")}
            className="text-orange-400 hover:underline"
          >
            Sign in
          </button>{" "}
          to leave a comment
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-3", className)}>
      <div className={cn("flex gap-3", !showAvatar && "gap-0")}>
        {showAvatar && (
          <>
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={36}
                height={36}
                className="rounded-full h-9 w-9 shrink-0"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-700">
                <User className="h-4 w-4 text-zinc-400" />
              </div>
            )}
          </>
        )}

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={compact ? 2 : 3}
            disabled={disabled || isSubmitting}
            autoFocus={autoFocus}
            className={cn(
              "w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50 disabled:opacity-50 resize-y min-h-[60px]",
              compact && "min-h-[48px] py-2"
            )}
          />

          {/* Character count */}
          <div className="absolute bottom-2 right-3 text-xs text-zinc-500">
            <span className={remainingChars < 100 ? (remainingChars < 0 ? "text-red-400" : "text-amber-400") : ""}>
              {content.length}/{maxLength}
            </span>
          </div>

          {/* Mention autocomplete dropdown */}
          {(mentionUsers.length > 0 || isSearching) && mentionQuery !== null && (
            <div
              ref={mentionDropdownRef}
              className="absolute left-0 bottom-full mb-2 w-72 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-zinc-900 shadow-xl shadow-black/50 z-50"
            >
              {isSearching && mentionUsers.length === 0 ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                </div>
              ) : mentionUsers.length === 0 ? (
                <div className="px-3 py-2 text-sm text-zinc-500">
                  No users found
                </div>
              ) : (
                <div className="py-1">
                  {mentionUsers.map((user, index) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => insertMention(user)}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                        index === selectedMentionIndex
                          ? "bg-orange-500/20 text-white"
                          : "text-zinc-300 hover:bg-white/5"
                      }`}
                    >
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={getDisplayName(user)}
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {getDisplayName(user)}
                        </div>
                        <div className="text-xs text-zinc-500 truncate">
                          @{user.slug}
                          {user.headline && ` · ${user.headline}`}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image preview */}
      {imageUrl && (
        <div className="relative rounded-xl overflow-hidden border border-white/10 bg-zinc-800/30">
          <div className="relative aspect-video max-h-48">
            <Image
              src={imageUrl}
              alt="Upload preview"
              fill
              className="object-cover"
            />
          </div>
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-red-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* GIF preview */}
      {gifUrl && (
        <GifPreview gifUrl={gifUrl} onRemove={removeGif} className="max-w-xs" />
      )}

      {/* Poll editor */}
      {showPoll && (
        <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-violet-400">
              <BarChart3 className="h-4 w-4" />
              <span className="font-medium">Poll</span>
              <span className="text-xs text-zinc-500">(7 days)</span>
            </div>
            <button
              type="button"
              onClick={removePoll}
              className="p-1 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2">
            {pollOptions.map((option, index) => (
              <div key={index} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handlePollOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    disabled={isSubmitting}
                    maxLength={maxOptionLength}
                    className="w-full rounded-lg border border-white/10 bg-zinc-800/50 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/50 disabled:opacity-50"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-600">
                    {option.length}/{maxOptionLength}
                  </div>
                </div>
                {pollOptions.length > minPollOptions && (
                  <button
                    type="button"
                    onClick={() => removePollOption(index)}
                    disabled={isSubmitting}
                    className="p-2 rounded-lg border border-white/10 bg-zinc-800/50 text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-colors disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {pollOptions.length < maxPollOptions && (
            <button
              type="button"
              onClick={addPollOption}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Add option
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <div className="flex items-center justify-between">
        {/* Media buttons */}
        <div className="flex items-center gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageUpload}
            className="hidden"
            disabled={isSubmitting || isUploading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting || isUploading || !!imageUrl || !!gifUrl || showPoll}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Add image"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Image</span>
          </button>

          <GifButton
            onClick={() => setShowGifPicker(true)}
            disabled={isSubmitting || isUploading || !!imageUrl || !!gifUrl || showPoll}
            className="text-xs px-2 py-1.5"
          />

          {/* Poll button */}
          <button
            type="button"
            onClick={togglePoll}
            disabled={isSubmitting || isUploading || !!imageUrl || !!gifUrl}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              showPoll
                ? "text-violet-400 bg-violet-500/10"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            )}
            title="Add poll"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Poll</span>
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || isUploading || (!content.trim() && !imageUrl && !gifUrl) || content.length > maxLength}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500/20 text-orange-400 px-4 py-2 text-sm font-medium hover:bg-orange-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{compact ? "Reply" : "Post"}</span>
          </button>
        </div>
      </div>

      {/* GIF Picker Modal */}
      <GiphyPicker
        isOpen={showGifPicker}
        onClose={() => setShowGifPicker(false)}
        onSelect={handleGifSelect}
      />
    </form>
  );
}
