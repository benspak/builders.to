"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, Pin, Image as ImageIcon, X } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

interface CompanyUpdateFormProps {
  companyId: string;
  onSuccess?: () => void;
}

export function CompanyUpdateForm({ companyId, onSuccess }: CompanyUpdateFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/companies/${companyId}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          imageUrl: imageUrl || null,
          isPinned,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to post update");
      }

      setContent("");
      setImageUrl("");
      setIsPinned(false);
      setShowImageUpload(false);
      router.refresh();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4 space-y-4">
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <div>
        <textarea
          placeholder="Share a company update... What are you building? Any wins to celebrate?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          maxLength={5000}
          className="textarea resize-none"
        />
        <div className="mt-1 flex items-center justify-between text-xs text-zinc-500">
          <span>{content.length}/5000</span>
        </div>
      </div>

      {showImageUpload && (
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowImageUpload(false);
              setImageUrl("");
            }}
            className="absolute -top-2 -right-2 z-10 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <ImageUpload
            value={imageUrl}
            onChange={setImageUrl}
            placeholder="Add an image to your update"
            uploadType="companies"
          />
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowImageUpload(!showImageUpload)}
            className={`p-2 rounded-lg transition-colors ${
              showImageUpload || imageUrl
                ? "bg-orange-500/20 text-orange-400"
                : "text-zinc-500 hover:text-white hover:bg-white/5"
            }`}
            title="Add image"
          >
            <ImageIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsPinned(!isPinned)}
            className={`p-2 rounded-lg transition-colors ${
              isPinned
                ? "bg-orange-500/20 text-orange-400"
                : "text-zinc-500 hover:text-white hover:bg-white/5"
            }`}
            title={isPinned ? "Unpin update" : "Pin update"}
          >
            <Pin className="h-4 w-4" />
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="btn-primary text-sm"
        >
          {loading ? (
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
