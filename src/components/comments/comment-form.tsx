"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Send, User, Loader2 } from "lucide-react";

interface MentionUser {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  slug: string | null;
  headline: string | null;
}

interface CommentFormProps {
  projectId: string;
  onCommentAdded?: () => void;
}

export function CommentForm({ projectId, onCommentAdded }: CommentFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mention autocomplete state
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStartPos, setMentionStartPos] = useState<number>(0);
  const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const mentionDropdownRef = useRef<HTMLDivElement>(null);

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

  const getDisplayName = (user: MentionUser) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.name || user.slug || "Builder";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      router.push("/signin");
      return;
    }

    if (!content.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, content: content.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to post comment");
      }

      setContent("");
      onCommentAdded?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="rounded-xl border border-white/10 bg-zinc-900/30 p-6 text-center">
        <p className="text-zinc-400 mb-4">Sign in to leave a comment</p>
        <button
          onClick={() => router.push("/signin")}
          className="btn-primary"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        {session.user?.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || "User"}
            width={40}
            height={40}
            className="rounded-full h-10 w-10 shrink-0"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-700">
            <User className="h-5 w-5 text-zinc-400" />
          </div>
        )}

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder="Share your thoughts... Use @ to mention someone"
            rows={3}
            className="textarea"
          />

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

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              Be constructive and supportive
            </span>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="btn-primary py-2 px-4"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Post
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
