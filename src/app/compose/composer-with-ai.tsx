"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { SocialPlatform } from "@prisma/client";
import {
  Send,
  Loader2,
  AlertCircle,
  ImagePlus,
  X,
  User,
  BarChart3,
  Plus,
  CheckCircle,
} from "lucide-react";
import { PlatformSelector, getCharacterLimit } from "@/components/composer/platform-selector";
import { SchedulePicker } from "@/components/composer/schedule-picker";
import { PlatformPreviews } from "@/components/composer/platform-preview";
import { GiphyPicker, GifButton, GifPreview } from "@/components/ui/giphy-picker";
import { cn } from "@/lib/utils";

interface ConnectedPlatform {
  platform: SocialPlatform;
  username: string | null;
  displayName: string | null;
  avatar: string | null;
  connectedAt: Date;
  scopes: string[];
}

interface MentionUser {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  slug: string | null;
  headline: string | null;
}

interface ComposerWithAIProps {
  /** Called after a successful submission */
  onSuccess?: () => void;
  /** Pre-fill content */
  initialContent?: string;
  /** Pre-select platforms */
  initialPlatforms?: SocialPlatform[];
  /** Render in compact/inline mode (e.g. on profile pages) */
  compact?: boolean;
}

export function ComposerWithAI({
  onSuccess,
  initialContent = "",
  initialPlatforms,
  compact = false,
}: ComposerWithAIProps) {
  const router = useRouter();

  // -- Core state --
  const [content, setContent] = useState(initialContent);
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(
    initialPlatforms || [SocialPlatform.BUILDERS]
  );
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState<ConnectedPlatform[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // -- Media state (from UpdateForm) --
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // -- Poll state (from UpdateForm) --
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", ""]);

  // -- Mention autocomplete state (from UpdateForm) --
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStartPos, setMentionStartPos] = useState<number>(0);
  const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const mentionDropdownRef = useRef<HTMLDivElement>(null);

  // -- Derived values --
  const hasExternalPlatforms = platforms.some(
    (p) => p !== SocialPlatform.BUILDERS
  );
  const hasBuildersSelected = platforms.includes(SocialPlatform.BUILDERS);

  // Character limit: use platform-based limit when external platforms are selected,
  // otherwise generous limit for Builders.to only
  const platformCharLimit = getCharacterLimit(platforms);
  const characterLimit = hasExternalPlatforms ? platformCharLimit : 10000;
  const isOverLimit = content.length > characterLimit;
  const remainingChars = characterLimit - content.length;
  const canSubmit =
    content.trim().length > 0 &&
    !isOverLimit &&
    platforms.length > 0 &&
    !isUploading;

  // Poll constraints
  const maxPollOptions = 5;
  const minPollOptions = 2;
  const maxOptionLength = 50;

  // ─── Fetch connected platforms ──────────────────────────────────────
  useEffect(() => {
    async function fetchPlatforms() {
      try {
        const response = await fetch("/api/platforms");
        if (response.ok) {
          const data = await response.json();
          setConnectedPlatforms(data.platforms || []);
        }
      } catch (error) {
        console.error("Error fetching platforms:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPlatforms();
  }, []);

  // ─── Mention: debounced user search ─────────────────────────────────
  useEffect(() => {
    if (mentionQuery === null || mentionQuery.length < 1) {
      setMentionUsers([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/users/search?q=${encodeURIComponent(mentionQuery)}&limit=5`
        );
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

  // Close mention dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mentionDropdownRef.current &&
        !mentionDropdownRef.current.contains(e.target as Node)
      ) {
        setMentionQuery(null);
        setMentionUsers([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Handlers ───────────────────────────────────────────────────────

  // Detect @mentions as the user types
  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      const cursorPos = e.target.selectionStart;
      setContent(newContent);

      const textBeforeCursor = newContent.slice(0, cursorPos);
      const mentionMatch = textBeforeCursor.match(/@([a-zA-Z0-9_-]*)$/);

      if (mentionMatch) {
        setMentionQuery(mentionMatch[1]);
        setMentionStartPos(cursorPos - mentionMatch[0].length);
      } else {
        setMentionQuery(null);
        setMentionUsers([]);
      }
    },
    []
  );

  // Insert a selected @mention into the content
  const insertMention = useCallback(
    (user: MentionUser) => {
      if (!user.slug) return;

      const beforeMention = content.slice(0, mentionStartPos);
      const afterMention = content.slice(
        mentionStartPos + (mentionQuery?.length ?? 0) + 1
      );
      const newContent = `${beforeMention}@${user.slug} ${afterMention}`;

      setContent(newContent);
      setMentionQuery(null);
      setMentionUsers([]);

      setTimeout(() => {
        if (textareaRef.current && user.slug) {
          const newCursorPos = mentionStartPos + user.slug.length + 2;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    },
    [content, mentionStartPos, mentionQuery]
  );

  // Keyboard: Cmd/Ctrl+Enter to submit, arrow keys for mention nav
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (canSubmit && !isSubmitting) {
          handleSubmit(true);
        }
        return;
      }

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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mentionUsers, selectedMentionIndex, insertMention, canSubmit, isSubmitting]
  );

  // ── Image upload ────────────────────────────────────────────────────
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "updates");

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
    setImageUrl(null); // only one media at a time
  }

  function removeGif() {
    setGifUrl(null);
  }

  // ── Poll helpers ────────────────────────────────────────────────────
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
      setImageUrl(null);
      setGifUrl(null);
      setShowPoll(true);
    }
  }

  function removePoll() {
    setShowPoll(false);
    setPollOptions(["", ""]);
  }

  // ── Display name helper ─────────────────────────────────────────────
  const getDisplayName = (user: MentionUser) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.name || user.slug || "Builder";
  };

  // ─── Submit ─────────────────────────────────────────────────────────
  const handleSubmit = async (publishNow: boolean) => {
    if (!canSubmit || isSubmitting) return;

    // Validate poll if present
    if (showPoll) {
      const validOptions = pollOptions.filter((opt) => opt.trim().length > 0);
      if (validOptions.length < 2) {
        setError("Please add at least 2 poll options");
        return;
      }
      const uniqueOptions = new Set(
        validOptions.map((opt) => opt.trim().toLowerCase())
      );
      if (uniqueOptions.size !== validOptions.length) {
        setError("Poll options must be unique");
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // ── 1. Post to Builders.to via /api/updates (if BUILDERS is selected) ──
      if (hasBuildersSelected) {
        const updateResponse = await fetch("/api/updates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: content.trim(),
            imageUrl,
            gifUrl,
            ...(showPoll && {
              pollOptions: pollOptions
                .filter((opt) => opt.trim().length > 0)
                .map((opt) => opt.trim()),
            }),
          }),
        });

        if (!updateResponse.ok) {
          const data = await updateResponse.json();
          throw new Error(data.error || "Failed to post update");
        }
      }

      // ── 2. Cross-post to external platforms via /api/posts (if any selected) ──
      if (hasExternalPlatforms) {
        const externalPlatforms = platforms.filter(
          (p) => p !== SocialPlatform.BUILDERS
        );

        const createResponse = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: content.trim(),
            platforms: externalPlatforms,
            scheduledAt: scheduledAt?.toISOString(),
          }),
        });

        if (!createResponse.ok) {
          const data = await createResponse.json();
          throw new Error(data.error || "Failed to create post");
        }

        const { post } = await createResponse.json();

        // Publish immediately if not scheduling
        if (publishNow && !scheduledAt) {
          const publishResponse = await fetch(
            `/api/posts/${post.id}/publish`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            }
          );

          const publishData = await publishResponse.json();

          if (publishResponse.status === 422) {
            throw new Error(
              publishData.error || "Failed to publish to all platforms"
            );
          }

          if (publishResponse.status === 207) {
            console.warn("Partial publish failure:", publishData.warnings);
            setError(
              publishData.message || "Post published but some platforms failed"
            );
            await new Promise((resolve) => setTimeout(resolve, 3000));
          } else if (!publishResponse.ok) {
            throw new Error(publishData.error || "Failed to publish post");
          }
        }
      }

      // ── 3. Reset form & show success ───────────────────────────────
      setContent("");
      setImageUrl(null);
      setGifUrl(null);
      setShowPoll(false);
      setPollOptions(["", ""]);
      setScheduledAt(null);
      setPlatforms([SocialPlatform.BUILDERS]);

      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/feed");
        }
        router.refresh();
      }, 1500);
    } catch (err) {
      console.error("Error creating post:", err);
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Loading state ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────
  return (
    <div>
      <div
        className={cn(
          "space-y-4",
          !compact && "bg-card border rounded-xl p-6"
        )}
      >
        {/* ── Platform Selector ──────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-medium mb-2">Post to</label>
          <PlatformSelector
            selectedPlatforms={platforms}
            onPlatformsChange={setPlatforms}
            connectedPlatforms={connectedPlatforms}
            disabled={isSubmitting}
          />
        </div>

        {/* ── Content Editor with @mentions ───────────────────────────── */}
        <div>
          {!compact && (
            <label className="block text-sm font-medium mb-2">Content</label>
          )}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder="What did you work on today? Use @ to mention others..."
              rows={compact ? 3 : 6}
              disabled={isSubmitting}
              className={cn(
                "w-full rounded-xl border bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-500 resize-y min-h-[80px] max-h-[400px]",
                "focus:outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50",
                "disabled:opacity-50",
                isOverLimit
                  ? "border-red-500/50 focus:ring-red-500/50"
                  : "border-white/10"
              )}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-3 text-xs text-zinc-500">
              <span title="Markdown supported: **bold**, *italic*, [links](url), `code`, lists, etc.">
                Markdown supported
              </span>
              <span
                className={
                  remainingChars < 100
                    ? remainingChars < 0
                      ? "text-red-400"
                      : "text-amber-400"
                    : ""
                }
              >
                {content.length.toLocaleString()}/{characterLimit.toLocaleString()}
              </span>
            </div>

            {/* Mention autocomplete dropdown */}
            {(mentionUsers.length > 0 || isSearching) &&
              mentionQuery !== null && (
                <div
                  ref={mentionDropdownRef}
                  className="absolute left-4 bottom-full mb-2 w-72 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-zinc-900 shadow-xl shadow-black/50 z-50"
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

        {/* ── Image preview ───────────────────────────────────────────── */}
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

        {/* ── GIF preview ─────────────────────────────────────────────── */}
        {gifUrl && <GifPreview gifUrl={gifUrl} onRemove={removeGif} />}

        {/* ── Poll editor ─────────────────────────────────────────────── */}
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
                      onChange={(e) =>
                        handlePollOptionChange(index, e.target.value)
                      }
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

        {/* ── Media toolbar ───────────────────────────────────────────── */}
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
            disabled={
              isSubmitting || isUploading || !!imageUrl || !!gifUrl || showPoll
            }
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <ImagePlus className="h-4 w-4" />
                <span className="hidden sm:inline">Image</span>
              </>
            )}
          </button>

          <GifButton
            onClick={() => setShowGifPicker(true)}
            disabled={
              isSubmitting || isUploading || !!imageUrl || !!gifUrl || showPoll
            }
          />

          <button
            type="button"
            onClick={togglePoll}
            disabled={isSubmitting || isUploading || !!imageUrl || !!gifUrl}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              showPoll
                ? "text-violet-400 bg-violet-500/10"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            )}
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Poll</span>
          </button>

          {/* Builders.to-only media note when cross-posting */}
          {hasExternalPlatforms && (imageUrl || gifUrl || showPoll) && (
            <span className="ml-2 text-xs text-amber-400/80">
              Media &amp; polls are Builders.to only
            </span>
          )}
        </div>

        {/* ── Schedule Picker (from Compose) ──────────────────────────── */}
        {hasExternalPlatforms && (
          <SchedulePicker
            scheduledAt={scheduledAt}
            onScheduleChange={setScheduledAt}
            disabled={isSubmitting}
          />
        )}

        {/* ── Platform Previews (from Compose) ────────────────────────── */}
        {content.trim() && hasExternalPlatforms && (
          <PlatformPreviews
            platforms={platforms}
            content={content}
            connectedPlatforms={connectedPlatforms}
          />
        )}

        {/* ── Error Message ───────────────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-400 bg-red-500/10 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* ── Submit Buttons ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          {/* Keyboard shortcut hint */}
          <div className="text-xs text-zinc-500 hidden sm:block">
            <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[10px]">
              ⌘
            </kbd>{" "}
            +{" "}
            <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[10px]">
              Enter
            </kbd>{" "}
            to post
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {scheduledAt ? (
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={!canSubmit || isSubmitting}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all",
                  "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25",
                  "hover:shadow-orange-500/40 hover:from-orange-400 hover:to-orange-500",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                )}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Schedule Post
              </button>
            ) : (
              <>
                {hasExternalPlatforms && (
                  <button
                    type="button"
                    onClick={() => handleSubmit(false)}
                    disabled={!canSubmit || isSubmitting}
                    className={cn(
                      "px-4 py-2 text-sm rounded-lg border border-white/10 transition-colors",
                      "text-zinc-400 hover:text-white hover:bg-zinc-800/50",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    Save as Draft
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  disabled={!canSubmit || isSubmitting}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all",
                    "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25",
                    "hover:shadow-orange-500/40 hover:from-orange-400 hover:to-orange-500",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Post Now
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── GIF Picker Modal ──────────────────────────────────────────── */}
      <GiphyPicker
        isOpen={showGifPicker}
        onClose={() => setShowGifPicker(false)}
        onSelect={handleGifSelect}
      />

      {/* ── Success Toast ─────────────────────────────────────────────── */}
      {showSuccessToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-lg">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">
              {hasExternalPlatforms
                ? scheduledAt
                  ? "Post scheduled successfully!"
                  : "Posted successfully!"
                : "Update posted successfully!"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
