"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Send, Loader2, Code, ImagePlus, User } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { GifButton, GiphyPicker, GifPreview } from "@/components/ui/giphy-picker";
import { useChatSocket } from "./chat-provider";

interface MentionUser {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  slug: string | null;
  headline: string | null;
}

interface MessageComposerProps {
  channelId: string;
  threadParentId?: string;
  placeholder?: string;
  onSendViaRest?: (data: {
    content: string;
    channelId: string;
    threadParentId?: string;
    gifUrl?: string;
    codeSnippet?: string;
    codeLanguage?: string;
  }) => Promise<void>;
}

function getDisplayName(user: MentionUser) {
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
  return user.name || user.slug || "Builder";
}

export function MessageComposer({
  channelId,
  threadParentId,
  placeholder = "Type a message...",
  onSendViaRest,
}: MessageComposerProps) {
  const { socket } = useChatSocket();
  const [content, setContent] = useState("");
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mention autocomplete state
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionUser[]>([]);
  const [mentionSelectedIndex, setMentionSelectedIndex] = useState(0);
  const [isFetchingMentions, setIsFetchingMentions] = useState(false);
  const mentionRef = useRef<HTMLDivElement>(null);

  const detectMention = useCallback((text: string, cursorPos: number) => {
    const textBeforeCursor = text.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    if (lastAtIndex === -1) return { active: false, query: "", start: -1 };
    const afterAt = textBeforeCursor.slice(lastAtIndex + 1);
    if (/[\n]/.test(afterAt) || (afterAt.length > 0 && afterAt.endsWith(" ") && afterAt.trim().includes(" "))) {
      return { active: false, query: "", start: -1 };
    }
    if (lastAtIndex > 0 && !/[\s\n]/.test(text[lastAtIndex - 1])) {
      return { active: false, query: "", start: -1 };
    }
    return { active: true, query: afterAt, start: lastAtIndex };
  }, []);

  useEffect(() => {
    if (!showMentions || !mentionQuery) return;
    const timer = setTimeout(async () => {
      if (mentionQuery.length < 1) { setMentionSuggestions([]); return; }
      setIsFetchingMentions(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(mentionQuery)}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          setMentionSuggestions(data.users || []);
          setMentionSelectedIndex(0);
        }
      } catch { setMentionSuggestions([]); }
      finally { setIsFetchingMentions(false); }
    }, 150);
    return () => clearTimeout(timer);
  }, [mentionQuery, showMentions]);

  const insertMention = useCallback((user: MentionUser) => {
    if (mentionStartIndex === -1) return;
    const displayName = getDisplayName(user);
    const mentionToken = `@[${displayName}](${user.id}) `;
    const before = content.slice(0, mentionStartIndex);
    const after = content.slice(mentionStartIndex + 1 + mentionQuery.length);
    const newValue = `${before}${mentionToken}${after}`;
    setContent(newValue);
    setShowMentions(false);
    setMentionQuery("");
    setMentionStartIndex(-1);
    setMentionSuggestions([]);
    setTimeout(() => {
      textareaRef.current?.focus();
      const pos = before.length + mentionToken.length;
      textareaRef.current?.setSelectionRange(pos, pos);
    }, 0);
  }, [content, mentionStartIndex, mentionQuery]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const cursor = e.target.selectionStart || 0;
    setContent(val);
    handleTyping();
    const { active, query, start } = detectMention(val, cursor);
    if (active) {
      setShowMentions(true);
      setMentionQuery(query);
      setMentionStartIndex(start);
    } else {
      setShowMentions(false);
      setMentionQuery("");
      setMentionStartIndex(-1);
      setMentionSuggestions([]);
    }
  };

  const handleTyping = useCallback(() => {
    if (!socket) return;
    socket.emit("typing:start", { channelId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", { channelId });
    }, 3000);
  }, [socket, channelId]);

  const handleSend = async () => {
    const text = content.trim();
    if (!text && !gifUrl && !codeSnippet) return;

    setIsSending(true);

    try {
      if (socket?.connected) {
        await new Promise<void>((resolve, reject) => {
          socket.emit(
            "message:send",
            {
              channelId,
              content: text || (gifUrl ? " " : codeSnippet ? "Code shared" : ""),
              threadParentId,
              gifUrl: gifUrl || undefined,
              codeSnippet: codeSnippet || undefined,
              codeLanguage: codeSnippet ? codeLanguage : undefined,
            },
            (response: { success?: boolean; error?: string }) => {
              if (response?.error) reject(new Error(response.error));
              else resolve();
            }
          );
        });
      } else if (onSendViaRest) {
        await onSendViaRest({
          content: text,
          channelId,
          threadParentId,
          gifUrl: gifUrl || undefined,
          codeSnippet: codeSnippet || undefined,
          codeLanguage: codeSnippet ? codeLanguage : undefined,
        });
      }

      setContent("");
      setGifUrl(null);
      setCodeSnippet("");
      setShowCodeInput(false);
      setShowMentions(false);
      if (socket) socket.emit("typing:stop", { channelId });
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions && mentionSuggestions.length > 0) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setMentionSelectedIndex((p) => (p + 1) % mentionSuggestions.length);
          return;
        case "ArrowUp":
          e.preventDefault();
          setMentionSelectedIndex((p) => (p - 1 + mentionSuggestions.length) % mentionSuggestions.length);
          return;
        case "Tab":
        case "Enter":
          e.preventDefault();
          insertMention(mentionSuggestions[mentionSelectedIndex]);
          return;
        case "Escape":
          e.preventDefault();
          setShowMentions(false);
          return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-white/5 bg-zinc-900/50 p-3">
      {gifUrl && (
        <GifPreview
          gifUrl={gifUrl}
          onRemove={() => setGifUrl(null)}
          className="mb-2 max-w-xs"
        />
      )}

      {showCodeInput && (
        <div className="mb-2 rounded-lg border border-white/10 bg-zinc-800/50 p-2">
          <div className="flex items-center gap-2 mb-1">
            <select
              value={codeLanguage}
              onChange={(e) => setCodeLanguage(e.target.value)}
              className="rounded border border-white/10 bg-zinc-700 px-2 py-0.5 text-xs text-white"
            >
              {["javascript", "typescript", "python", "rust", "go", "html", "css", "sql", "bash", "json"].map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <button
              onClick={() => { setShowCodeInput(false); setCodeSnippet(""); }}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Remove
            </button>
          </div>
          <textarea
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            placeholder="Paste your code here..."
            className="w-full rounded border border-white/10 bg-zinc-900 px-3 py-2 text-xs font-mono text-zinc-300 placeholder:text-zinc-600 focus:outline-none resize-none"
            rows={4}
          />
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            placeholder={placeholder}
            rows={1}
            className="w-full rounded-lg border border-white/10 bg-zinc-800/50 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none resize-none"
            onKeyDown={handleKeyDown}
          />

          {/* Mention autocomplete dropdown */}
          {showMentions && (mentionSuggestions.length > 0 || isFetchingMentions) && (
            <div
              ref={mentionRef}
              className="absolute left-0 right-0 bottom-full mb-1 rounded-xl border border-white/10 bg-zinc-900 shadow-2xl overflow-hidden z-50"
            >
              {isFetchingMentions && mentionSuggestions.length === 0 ? (
                <div className="flex items-center justify-center py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  {mentionSuggestions.map((user, index) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => insertMention(user)}
                      onMouseEnter={() => setMentionSelectedIndex(index)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                        index === mentionSelectedIndex ? "bg-cyan-500/20" : "hover:bg-zinc-800/50"
                      )}
                    >
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={getDisplayName(user)}
                          width={28}
                          height={28}
                          className="h-7 w-7 rounded-full object-cover ring-2 ring-white/5"
                        />
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-500">
                          <User className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {getDisplayName(user)}
                        </p>
                        {user.slug && (
                          <p className="text-xs text-zinc-500 truncate">@{user.slug}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowCodeInput(!showCodeInput)}
            className={`p-2 rounded-lg transition-colors ${showCodeInput ? "text-cyan-400 bg-cyan-500/10" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
            title="Add code"
          >
            <Code className="h-4 w-4" />
          </button>

          <GifButton
            onClick={() => setShowGifPicker(true)}
            disabled={isSending}
            className="p-2"
          />

          <button
            onClick={handleSend}
            disabled={isSending || (!content.trim() && !gifUrl && !codeSnippet)}
            className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <GiphyPicker
        isOpen={showGifPicker}
        onClose={() => setShowGifPicker(false)}
        onSelect={(gif) => { setGifUrl(gif.url); setShowGifPicker(false); }}
      />
    </div>
  );
}
