"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Send, User, Loader2 } from "lucide-react";

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

        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            className="textarea"
          />
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
