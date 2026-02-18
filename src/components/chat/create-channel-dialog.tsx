"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Hash, Lock, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface CreateChannelDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateChannelDialog({ open, onClose }: CreateChannelDialogProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [type, setType] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    fetch("/api/chat/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, [open]);

  if (!open) return null;

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/chat/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          topic: topic.trim() || undefined,
          type,
          categoryId: categoryId || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create channel");
        return;
      }

      const channel = await res.json();
      setName("");
      setDescription("");
      setTopic("");
      setType("PUBLIC");
      setCategoryId("");
      onClose();
      router.push(`/messages/${channel.id}`);
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-zinc-900 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <h2 className="text-base font-semibold text-white">Create Channel</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Channel Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType("PUBLIC")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-colors ${
                  type === "PUBLIC"
                    ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                    : "border-white/10 bg-zinc-800/50 text-zinc-400 hover:border-white/20"
                }`}
              >
                <Hash className="h-3.5 w-3.5" />
                Public
              </button>
              <button
                type="button"
                onClick={() => setType("PRIVATE")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-colors ${
                  type === "PRIVATE"
                    ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                    : "border-white/10 bg-zinc-800/50 text-zinc-400 hover:border-white/20"
                }`}
              >
                <Lock className="h-3.5 w-3.5" />
                Private
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="ch-name" className="block text-xs font-medium text-zinc-400 mb-1.5">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              id="ch-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ai-builders"
              className="w-full rounded-lg border border-white/10 bg-zinc-800/50 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none"
              required
              autoFocus
            />
            {slug && (
              <p className="mt-1 text-[11px] text-zinc-500">
                Slug: <span className="text-zinc-400">#{slug}</span>
              </p>
            )}
          </div>

          <div>
            <label htmlFor="ch-desc" className="block text-xs font-medium text-zinc-400 mb-1.5">
              Description
            </label>
            <textarea
              id="ch-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this channel about?"
              rows={2}
              className="w-full rounded-lg border border-white/10 bg-zinc-800/50 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label htmlFor="ch-topic" className="block text-xs font-medium text-zinc-400 mb-1.5">
              Topic
            </label>
            <input
              id="ch-topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Current topic of discussion"
              className="w-full rounded-lg border border-white/10 bg-zinc-800/50 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none"
            />
          </div>

          {categories.length > 0 && (
            <div>
              <label htmlFor="ch-cat" className="block text-xs font-medium text-zinc-400 mb-1.5">
                Category
              </label>
              <select
                id="ch-cat"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-zinc-800/50 px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
              >
                <option value="">No category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-white/10 text-xs text-zinc-400 hover:text-white hover:border-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-xs font-medium text-white hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Hash className="h-3.5 w-3.5" />
              )}
              Create Channel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
