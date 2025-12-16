"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Image as ImageIcon, Link as LinkIcon, Github, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectFormProps {
  initialData?: {
    id: string;
    title: string;
    tagline: string;
    description: string | null;
    url: string | null;
    githubUrl: string | null;
    imageUrl: string | null;
    status: string;
  };
}

const statuses = [
  { value: "IDEA", label: "💡 Idea", description: "Just an idea, looking for feedback" },
  { value: "BUILDING", label: "🔨 Building", description: "Actively working on it" },
  { value: "BETA", label: "🧪 Beta", description: "Ready for early users" },
  { value: "LAUNCHED", label: "🚀 Launched", description: "Live and available" },
];

export function ProjectForm({ initialData }: ProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    tagline: initialData?.tagline || "",
    description: initialData?.description || "",
    url: initialData?.url || "",
    githubUrl: initialData?.githubUrl || "",
    imageUrl: initialData?.imageUrl || "",
    status: initialData?.status || "IDEA",
  });

  const isEditing = !!initialData?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = isEditing
        ? `/api/projects/${initialData.id}`
        : "/api/projects";

      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Something went wrong");
      }

      const project = await response.json();
      router.push(`/projects/${project.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-zinc-300 mb-2">
          Project Name <span className="text-red-400">*</span>
        </label>
        <input
          id="title"
          type="text"
          required
          maxLength={100}
          placeholder="My Awesome Project"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="input"
        />
        <p className="mt-2 text-xs text-zinc-500">
          {formData.title.length}/100 characters
        </p>
      </div>

      {/* Tagline */}
      <div>
        <label htmlFor="tagline" className="block text-sm font-medium text-zinc-300 mb-2">
          Tagline <span className="text-red-400">*</span>
        </label>
        <input
          id="tagline"
          type="text"
          required
          maxLength={150}
          placeholder="A brief, catchy description of your project"
          value={formData.tagline}
          onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
          className="input"
        />
        <p className="mt-2 text-xs text-zinc-500">
          {formData.tagline.length}/150 characters
        </p>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-3">
          Project Status <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statuses.map((status) => (
            <button
              key={status.value}
              type="button"
              onClick={() => setFormData({ ...formData, status: status.value })}
              className={cn(
                "flex flex-col items-center rounded-xl border p-4 text-center transition-all",
                formData.status === status.value
                  ? "border-orange-500/50 bg-orange-500/10"
                  : "border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600 hover:bg-zinc-800/50"
              )}
            >
              <span className="text-2xl mb-1">{status.label.split(" ")[0]}</span>
              <span className="text-sm font-medium text-white">
                {status.label.split(" ")[1]}
              </span>
              <span className="text-xs text-zinc-500 mt-1 line-clamp-2">
                {status.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-2">
          Description
        </label>
        <textarea
          id="description"
          rows={6}
          placeholder="Tell us more about your project. What problem does it solve? What features does it have? What are your plans?"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="textarea"
        />
        <p className="mt-2 text-xs text-zinc-500">
          Markdown is supported
        </p>
      </div>

      {/* URLs Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-300">Links (optional)</h3>

        <div className="relative">
          <LinkIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="url"
            placeholder="https://your-project.com"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="input pl-11"
          />
        </div>

        <div className="relative">
          <Github className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="url"
            placeholder="https://github.com/username/repo"
            value={formData.githubUrl}
            onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
            className="input pl-11"
          />
        </div>

        <div className="relative">
          <ImageIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="url"
            placeholder="https://example.com/screenshot.png"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            className="input pl-11"
          />
          <p className="mt-2 text-xs text-zinc-500">
            Add a cover image URL (recommended: 1200x630px)
          </p>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/5">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !formData.title || !formData.tagline}
          className="btn-primary"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {isEditing ? "Saving..." : "Creating..."}
            </>
          ) : (
            <>
              <Rocket className="h-4 w-4" />
              {isEditing ? "Save Changes" : "Share Project"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
