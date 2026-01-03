"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Link as LinkIcon,
  Github,
  Rocket,
  Building2,
  Hash,
  Images,
  Play,
  FileText,
  ScrollText
} from "lucide-react";
import { cn, generateSlug } from "@/lib/utils";
import { ImageUpload, GalleryUpload } from "@/components/ui/image-upload";

interface Company {
  id: string;
  name: string;
  logo: string | null;
}

interface GalleryImage {
  id?: string;
  url: string;
  caption?: string | null;
}

interface ProjectFormProps {
  initialData?: {
    id: string;
    slug: string | null;
    title: string;
    tagline: string;
    description: string | null;
    url: string | null;
    githubUrl: string | null;
    imageUrl: string | null;
    status: string;
    companyId?: string | null;
    images?: GalleryImage[];
    // Artifact fields
    demoUrl?: string | null;
    docsUrl?: string | null;
    changelogUrl?: string | null;
  };
  initialCompanyId?: string;
}

// Project lifecycle states - from idea to exit
const statuses = [
  { value: "IDEA", label: "💡 Idea", description: "Just an idea, looking for feedback" },
  { value: "BUILDING", label: "🔨 Building", description: "Actively working on it" },
  { value: "BETA", label: "🧪 Beta", description: "Ready for early users" },
  { value: "LAUNCHED", label: "🚀 Launched", description: "Live and available" },
  { value: "PAUSED", label: "⏸️ Paused", description: "On hold or hibernating" },
  { value: "ACQUIRED", label: "🏆 Acquired", description: "Successfully exited" },
];

export function ProjectForm({ initialData, initialCompanyId }: ProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    tagline: initialData?.tagline || "",
    description: initialData?.description || "",
    url: initialData?.url || "",
    githubUrl: initialData?.githubUrl || "",
    imageUrl: initialData?.imageUrl || "",
    status: initialData?.status || "IDEA",
    companyId: initialData?.companyId || initialCompanyId || "",
    // Artifact fields
    demoUrl: initialData?.demoUrl || "",
    docsUrl: initialData?.docsUrl || "",
    changelogUrl: initialData?.changelogUrl || "",
  });
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(
    initialData?.images || []
  );
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [slugTouched, setSlugTouched] = useState(!!initialData?.slug);

  // Handle gallery image changes with deletion tracking
  const handleGalleryChange = (newImages: GalleryImage[]) => {
    // Find deleted images (ones that had ids but are no longer in the array)
    const currentIds = new Set(newImages.filter(img => img.id).map(img => img.id));
    const deletedIds = galleryImages
      .filter(img => img.id && !currentIds.has(img.id))
      .map(img => img.id as string);

    if (deletedIds.length > 0) {
      setDeletedImageIds(prev => [...prev, ...deletedIds]);
    }

    setGalleryImages(newImages);
  };

  const isEditing = !!initialData?.id;

  // Fetch user's companies
  useEffect(() => {
    async function fetchCompanies() {
      try {
        const response = await fetch("/api/companies?limit=100");
        const data = await response.json();
        // Filter to only show companies the user owns (API should handle this, but just in case)
        setCompanies(data.companies || []);
      } catch (error) {
        console.error("Failed to fetch companies:", error);
      } finally {
        setLoadingCompanies(false);
      }
    }
    fetchCompanies();
  }, []);

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
        body: JSON.stringify({
          ...formData,
          companyId: formData.companyId || null,
          slug: formData.slug || undefined,
          // Send artifact fields
          demoUrl: formData.demoUrl || null,
          docsUrl: formData.docsUrl || null,
          changelogUrl: formData.changelogUrl || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Something went wrong");
      }

      const project = await response.json();

      // Delete removed gallery images
      for (const imageId of deletedImageIds) {
        await fetch(`/api/projects/${project.id}/images?imageId=${imageId}`, {
          method: "DELETE",
        });
      }

      // Save gallery images if there are new ones (without id)
      const newImages = galleryImages.filter((img) => !img.id);
      if (newImages.length > 0) {
        await fetch(`/api/projects/${project.id}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ images: newImages }),
        });
      }

      router.push(`/projects/${project.slug}`);
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
          onChange={(e) => {
            const newTitle = e.target.value;
            setFormData({
              ...formData,
              title: newTitle,
              // Auto-generate slug from title if user hasn't manually edited it
              ...((!slugTouched && !isEditing) && { slug: generateSlug(newTitle) })
            });
          }}
          className="input"
        />
        <p className="mt-2 text-xs text-zinc-500">
          {formData.title.length}/100 characters
        </p>
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-zinc-300 mb-2">
          URL Slug {!isEditing && <span className="text-red-400">*</span>}
        </label>
        <div className="relative">
          <Hash className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            id="slug"
            type="text"
            required={!isEditing}
            maxLength={100}
            placeholder="my-awesome-project"
            value={formData.slug}
            onChange={(e) => {
              const newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
              setSlugTouched(true);
              setFormData({ ...formData, slug: newSlug });
            }}
            className="input pl-11"
          />
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Your project will be available at: /projects/{formData.slug || "your-slug"}
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

      {/* Status - Lifecycle States */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-3">
          Lifecycle Status <span className="text-red-400">*</span>
        </label>
        <p className="text-xs text-zinc-500 mb-3">
          Track your project&apos;s journey from idea to exit
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
                {status.label.split(" ").slice(1).join(" ")}
              </span>
              <span className="text-xs text-zinc-500 mt-1 line-clamp-2">
                {status.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Company Selection */}
      <div>
        <label htmlFor="companyId" className="block text-sm font-medium text-zinc-300 mb-2">
          Company (optional)
        </label>
        <div className="relative">
          <Building2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <select
            id="companyId"
            value={formData.companyId}
            onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
            className="input pl-11 appearance-none cursor-pointer"
            disabled={loadingCompanies}
          >
            <option value="">No company (personal project)</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Link this project to one of your companies
        </p>
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

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-3">
          Cover Screenshot
        </label>
        <ImageUpload
          value={formData.imageUrl}
          onChange={(url) => setFormData({ ...formData, imageUrl: url })}
          placeholder="Upload a cover screenshot"
          aspectRatio="video"
        />
        <p className="mt-2 text-xs text-zinc-500">
          Recommended: 1200x630px (16:9 aspect ratio)
        </p>
      </div>

      {/* Gallery Images */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-3">
          <span className="flex items-center gap-2">
            <Images className="h-4 w-4" />
            Image Gallery
          </span>
        </label>
        <GalleryUpload
          images={galleryImages}
          onChange={handleGalleryChange}
          maxImages={10}
        />
        <p className="mt-2 text-xs text-zinc-500">
          Add up to 10 additional screenshots to showcase your project
        </p>
      </div>

      {/* URLs Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-300">Primary Links (optional)</h3>

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
      </div>

      {/* Artifacts Section - compound value */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-zinc-300">Artifacts (optional)</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Add links to resources that showcase your project&apos;s progress
          </p>
        </div>

        <div className="relative">
          <Play className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="url"
            placeholder="https://demo.your-project.com"
            value={formData.demoUrl}
            onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
            className="input pl-11"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-600">
            Live Demo
          </span>
        </div>

        <div className="relative">
          <FileText className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="url"
            placeholder="https://docs.your-project.com"
            value={formData.docsUrl}
            onChange={(e) => setFormData({ ...formData, docsUrl: e.target.value })}
            className="input pl-11"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-600">
            Documentation
          </span>
        </div>

        <div className="relative">
          <ScrollText className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="url"
            placeholder="https://your-project.com/changelog"
            value={formData.changelogUrl}
            onChange={(e) => setFormData({ ...formData, changelogUrl: e.target.value })}
            className="input pl-11"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-600">
            Changelog
          </span>
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
          disabled={loading || !formData.title || !formData.tagline || (!isEditing && !formData.slug)}
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
