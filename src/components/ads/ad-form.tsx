"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, ExternalLink, Megaphone } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { cn } from "@/lib/utils";

interface AdFormData {
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  ctaText: string;
}

interface AdFormProps {
  initialData?: AdFormData & { id?: string };
  onSuccess?: (ad: { id: string }) => void;
  isEditing?: boolean;
}

export function AdForm({ initialData, onSuccess, isEditing = false }: AdFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AdFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    imageUrl: initialData?.imageUrl || "",
    linkUrl: initialData?.linkUrl || "",
    ctaText: initialData?.ctaText || "Learn More",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validation
      if (!formData.title.trim()) {
        throw new Error("Title is required");
      }
      if (!formData.linkUrl.trim()) {
        throw new Error("Link URL is required");
      }

      // Validate URL format
      try {
        new URL(formData.linkUrl);
      } catch {
        throw new Error("Please enter a valid URL (e.g., https://example.com)");
      }

      const url = isEditing ? `/api/ads/${initialData?.id}` : "/api/ads";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save ad");
      }

      if (onSuccess) {
        onSuccess(data);
      } else {
        router.push(`/ads/${data.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof AdFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium text-zinc-300">
          Headline <span className="text-red-400">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="Your catchy headline"
          maxLength={100}
          className="w-full rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
          disabled={loading}
        />
        <p className="text-xs text-zinc-500">{formData.title.length}/100 characters</p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-zinc-300">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Brief description of your product or service..."
          rows={3}
          maxLength={200}
          className="w-full rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none"
          disabled={loading}
        />
        <p className="text-xs text-zinc-500">{formData.description.length}/200 characters</p>
      </div>

      {/* Image */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-300">
          Ad Image
        </label>
        <p className="text-xs text-zinc-500 mb-2">
          Recommended size: 600x300px (2:1 aspect ratio)
        </p>
        <ImageUpload
          value={formData.imageUrl}
          onChange={(url) => updateField("imageUrl", url)}
          placeholder="Upload your ad image"
          aspectRatio="video"
          uploadType="ads"
          disabled={loading}
        />
      </div>

      {/* Link URL */}
      <div className="space-y-2">
        <label htmlFor="linkUrl" className="block text-sm font-medium text-zinc-300">
          Destination URL <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            id="linkUrl"
            type="url"
            value={formData.linkUrl}
            onChange={(e) => updateField("linkUrl", e.target.value)}
            placeholder="https://your-website.com"
            className="w-full rounded-lg border border-zinc-700/50 bg-zinc-800/50 pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
            disabled={loading}
          />
        </div>
        <p className="text-xs text-zinc-500">Where users will be directed when they click your ad</p>
      </div>

      {/* CTA Text */}
      <div className="space-y-2">
        <label htmlFor="ctaText" className="block text-sm font-medium text-zinc-300">
          Button Text
        </label>
        <input
          id="ctaText"
          type="text"
          value={formData.ctaText}
          onChange={(e) => updateField("ctaText", e.target.value)}
          placeholder="Learn More"
          maxLength={30}
          className="w-full rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
          disabled={loading}
        />
        <p className="text-xs text-zinc-500">Examples: "Get Started", "Try Free", "Shop Now"</p>
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-zinc-300">Preview</h3>
        <div className="max-w-xs">
          <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800/50 bg-zinc-900/80">
              <Megaphone className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Sponsored</span>
            </div>
            <div className="p-4">
              {formData.imageUrl && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden mb-3 ring-1 ring-zinc-800/50 bg-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.imageUrl}
                    alt="Ad preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <h3 className={cn(
                "text-sm font-semibold text-white line-clamp-2 mb-1",
                !formData.title && "text-zinc-600"
              )}>
                {formData.title || "Your headline here"}
              </h3>
              {(formData.description || !formData.title) && (
                <p className={cn(
                  "text-xs text-zinc-400 line-clamp-2 mb-3",
                  !formData.description && "text-zinc-600"
                )}>
                  {formData.description || "Your description here"}
                </p>
              )}
              <span className="inline-flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500">
                {formData.ctaText || "Learn More"}
                <ExternalLink className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/50">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 text-sm font-medium text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            "Save Changes"
          ) : (
            "Create Ad"
          )}
        </button>
      </div>
    </form>
  );
}
