"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Link as LinkIcon,
  Building2,
  MapPin,
  Users,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/ui/image-upload";

interface CompanyFormProps {
  initialData?: {
    id: string;
    slug?: string | null;
    name: string;
    logo: string | null;
    location: string | null;
    category: string;
    about: string | null;
    website: string | null;
    size: string | null;
    yearFounded: number | null;
  };
}

const categories = [
  { value: "SAAS", label: "SaaS" },
  { value: "AGENCY", label: "Agency" },
  { value: "FINTECH", label: "Fintech" },
  { value: "ECOMMERCE", label: "E-commerce" },
  { value: "HEALTHTECH", label: "Healthtech" },
  { value: "EDTECH", label: "Edtech" },
  { value: "AI_ML", label: "AI / ML" },
  { value: "DEVTOOLS", label: "Dev Tools" },
  { value: "MEDIA", label: "Media" },
  { value: "MARKETPLACE", label: "Marketplace" },
  { value: "OTHER", label: "Other" },
];

const sizes = [
  { value: "SIZE_1_10", label: "1-10 employees" },
  { value: "SIZE_11_50", label: "11-50 employees" },
  { value: "SIZE_51_200", label: "51-200 employees" },
  { value: "SIZE_201_500", label: "201-500 employees" },
  { value: "SIZE_500_PLUS", label: "500+ employees" },
];

export function CompanyForm({ initialData }: CompanyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    logo: initialData?.logo || "",
    location: initialData?.location || "",
    category: initialData?.category || "OTHER",
    about: initialData?.about || "",
    website: initialData?.website || "",
    size: initialData?.size || "",
    yearFounded: initialData?.yearFounded?.toString() || "",
  });

  const isEditing = !!initialData?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = isEditing
        ? `/api/companies/${initialData.id}`
        : "/api/companies";

      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          size: formData.size || null,
          yearFounded: formData.yearFounded || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Something went wrong");
      }

      const company = await response.json();
      router.push(`/companies/${company.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Company Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">
          Company Name <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <Building2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            id="name"
            type="text"
            required
            maxLength={100}
            placeholder="Acme Inc."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input pl-11"
          />
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          {formData.name.length}/100 characters
        </p>
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-3">
          Company Logo
        </label>
        <div className="max-w-[200px]">
          <ImageUpload
            value={formData.logo}
            onChange={(url) => setFormData({ ...formData, logo: url })}
            placeholder="Upload logo"
            aspectRatio="square"
            uploadType="companies"
          />
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Square image recommended (e.g., 200x200px)
        </p>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-zinc-300 mb-2">
          Location
        </label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            id="location"
            type="text"
            maxLength={100}
            placeholder="San Francisco, CA"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="input pl-11"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-3">
          Category <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {categories.map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() => setFormData({ ...formData, category: category.value })}
              className={cn(
                "flex items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium transition-all",
                formData.category === category.value
                  ? "border-orange-500/50 bg-orange-500/10 text-orange-300"
                  : "border-zinc-700/50 bg-zinc-800/30 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800/50 hover:text-zinc-300"
              )}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* About */}
      <div>
        <label htmlFor="about" className="block text-sm font-medium text-zinc-300 mb-2">
          About
        </label>
        <textarea
          id="about"
          rows={5}
          placeholder="Tell us about your company. What do you do? What's your mission?"
          value={formData.about}
          onChange={(e) => setFormData({ ...formData, about: e.target.value })}
          className="textarea"
        />
      </div>

      {/* Website */}
      <div>
        <label htmlFor="website" className="block text-sm font-medium text-zinc-300 mb-2">
          Website
        </label>
        <div className="relative">
          <LinkIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            id="website"
            type="url"
            placeholder="https://your-company.com"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="input pl-11"
          />
        </div>
      </div>

      {/* Company Size */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-3">
          Company Size
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {sizes.map((size) => (
            <button
              key={size.value}
              type="button"
              onClick={() => setFormData({ ...formData, size: formData.size === size.value ? "" : size.value })}
              className={cn(
                "flex items-center justify-center rounded-xl border px-3 py-3 text-sm font-medium transition-all",
                formData.size === size.value
                  ? "border-orange-500/50 bg-orange-500/10 text-orange-300"
                  : "border-zinc-700/50 bg-zinc-800/30 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800/50 hover:text-zinc-300"
              )}
            >
              <Users className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{size.label.replace(" employees", "")}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Year Founded */}
      <div>
        <label htmlFor="yearFounded" className="block text-sm font-medium text-zinc-300 mb-2">
          Year Founded
        </label>
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            id="yearFounded"
            type="number"
            min={1800}
            max={currentYear}
            placeholder={currentYear.toString()}
            value={formData.yearFounded}
            onChange={(e) => setFormData({ ...formData, yearFounded: e.target.value })}
            className="input pl-11"
          />
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
          disabled={loading || !formData.name}
          className="btn-primary"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {isEditing ? "Saving..." : "Creating..."}
            </>
          ) : (
            <>
              <Building2 className="h-4 w-4" />
              {isEditing ? "Save Changes" : "Create Company"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
