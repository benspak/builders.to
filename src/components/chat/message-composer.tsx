"use client";

import { useState, useRef, useCallback } from "react";
import { Send, Loader2, Code, ImagePlus } from "lucide-react";
import { GifButton, GiphyPicker, GifPreview } from "@/components/ui/giphy-picker";
import { useChatSocket } from "./chat-provider";

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
      if (socket) socket.emit("typing:stop", { channelId });
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
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
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => { setContent(e.target.value); handleTyping(); }}
            placeholder={placeholder}
            rows={1}
            className="w-full rounded-lg border border-white/10 bg-zinc-800/50 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
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
