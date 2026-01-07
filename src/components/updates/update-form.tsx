"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Send, Loader2, ImagePlus, X, User } from "lucide-react";

interface MentionUser {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  slug: string | null;
  headline: string | null;
}

interface UpdateFormProps {
  onSuccess?: () => void;
}

export function UpdateForm({ onSuccess }: UpdateFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mention autocomplete state
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStartPos, setMentionStartPos] = useState<number>(0);
  const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const mentionDropdownRef = useRef<HTMLDivElement>(null);

  const maxLength = 10000;
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
        const newCursorPos = mentionStartPos + user.slug.length + 2; // +2 for @ and space
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, [content, mentionStartPos, mentionQuery]);

  // Handle keyboard navigation in mention dropdown
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
  }, [mentionUsers, selectedMentionIndex, insertMention]);

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
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function removeImage() {
    setImageUrl(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!content.trim()) {
      setError("Please enter an update");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          imageUrl: imageUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to post update");
      }

      setContent("");
      setImageUrl(null);
      router.refresh();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post update");
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

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          placeholder="What did you work on today? Use @ to mention others..."
          rows={3}
          disabled={isSubmitting}
          className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50 disabled:opacity-50 resize-y min-h-[80px] max-h-[400px]"
        />
        <div className="absolute bottom-3 right-3 text-xs text-zinc-500">
          <span className={remainingChars < 100 ? (remainingChars < 0 ? "text-red-400" : "text-amber-400") : ""}>
            {content.length.toLocaleString()}/{maxLength.toLocaleString()}
          </span>
        </div>

        {/* Mention autocomplete dropdown */}
        {(mentionUsers.length > 0 || isSearching) && mentionQuery !== null && (
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

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <div className="flex items-center justify-between">
        {/* Image upload button */}
        <div>
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
            disabled={isSubmitting || isUploading || !!imageUrl}
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
                Add image
              </>
            )}
          </button>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting || isUploading || !content.trim() || content.length > maxLength}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:from-orange-400 hover:to-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Post Update
            </>
          )}
        </button>
      </div>
    </form>
  );
}
