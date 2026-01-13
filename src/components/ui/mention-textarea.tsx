"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { User, Loader2 } from "lucide-react";
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

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  rows?: number;
  className?: string;
}

export function MentionTextarea({
  value,
  onChange,
  placeholder = "Write a comment...",
  disabled = false,
  maxLength = 2000,
  rows = 3,
  className,
}: MentionTextareaProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<MentionUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Detect @ mentions in text
  const detectMention = useCallback((text: string, cursorPos: number) => {
    // Find the @ symbol before cursor
    const textBeforeCursor = text.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex === -1) {
      return { isMentioning: false, query: "", startIndex: -1 };
    }

    // Check if there's a space or newline between @ and cursor (mention ended)
    const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
    if (/[\s\n]/.test(textAfterAt)) {
      return { isMentioning: false, query: "", startIndex: -1 };
    }

    // Check if @ is at start or preceded by whitespace/newline
    if (lastAtIndex > 0 && !/[\s\n]/.test(text[lastAtIndex - 1])) {
      return { isMentioning: false, query: "", startIndex: -1 };
    }

    return {
      isMentioning: true,
      query: textAfterAt,
      startIndex: lastAtIndex,
    };
  }, []);

  // Fetch suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&limit=5`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.users || []);
        setSelectedIndex(0);
      }
    } catch (error) {
      console.error("Error fetching mention suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    if (!showSuggestions || !mentionQuery) {
      return;
    }

    const timer = setTimeout(() => {
      fetchSuggestions(mentionQuery);
    }, 150);

    return () => clearTimeout(timer);
  }, [mentionQuery, showSuggestions, fetchSuggestions]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;

    onChange(newValue);

    const { isMentioning, query, startIndex } = detectMention(newValue, cursorPos);

    if (isMentioning) {
      setShowSuggestions(true);
      setMentionQuery(query);
      setMentionStartIndex(startIndex);
    } else {
      setShowSuggestions(false);
      setMentionQuery("");
      setMentionStartIndex(-1);
      setSuggestions([]);
    }
  };

  // Insert mention
  const insertMention = useCallback((user: MentionUser) => {
    if (!user.slug || mentionStartIndex === -1) return;

    const beforeMention = value.slice(0, mentionStartIndex);
    const afterMention = value.slice(mentionStartIndex + 1 + mentionQuery.length);
    const newValue = `${beforeMention}@${user.slug} ${afterMention}`;

    onChange(newValue);
    setShowSuggestions(false);
    setMentionQuery("");
    setMentionStartIndex(-1);
    setSuggestions([]);

    // Focus back on textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      const newCursorPos = mentionStartIndex + user.slug.length + 2; // +2 for @ and space
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [value, onChange, mentionStartIndex, mentionQuery]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        break;
      case "Enter":
        if (suggestions[selectedIndex]) {
          e.preventDefault();
          insertMention(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowSuggestions(false);
        break;
      case "Tab":
        if (suggestions[selectedIndex]) {
          e.preventDefault();
          insertMention(suggestions[selectedIndex]);
        }
        break;
    }
  };

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
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

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        rows={rows}
        className={cn(
          "w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none",
          className
        )}
      />

      {/* Suggestions dropdown */}
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div
          ref={suggestionsRef}
          className="absolute left-0 right-0 bottom-full mb-2 rounded-xl border border-white/10 bg-zinc-900 shadow-2xl overflow-hidden z-50"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-3">
              <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto">
              {suggestions.map((user, index) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => insertMention(user)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                    index === selectedIndex
                      ? "bg-orange-500/20"
                      : "hover:bg-zinc-800/50"
                  )}
                >
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={getDisplayName(user)}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-white/5"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {getDisplayName(user)}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">
                      @{user.slug}
                      {user.headline && ` · ${user.headline}`}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
