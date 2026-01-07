"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, DollarSign, Clock, Rocket, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ServiceCategory, Project } from "@prisma/client";

interface ServiceFormProps {
  initialData?: {
    id?: string;
    title?: string;
    description?: string;
    category?: ServiceCategory;
    priceInCents?: number;
    deliveryDays?: number;
    portfolioProjectIds?: string[];
  };
  projects: Array<Pick<Project, "id" | "title" | "slug" | "imageUrl" | "status">>;
  isEditing?: boolean;
}

const categories: { value: ServiceCategory; label: string; description: string }[] = [
  { value: "MVP_BUILD", label: "MVP Build", description: "Full product development from idea to launch" },
  { value: "DESIGN", label: "Design", description: "UI/UX design, branding, and visual identity" },
  { value: "MARKETING", label: "Marketing", description: "Growth, content, and go-to-market strategy" },
  { value: "AI_INTEGRATION", label: "AI Integration", description: "Add AI capabilities to existing products" },
  { value: "DEVOPS", label: "DevOps", description: "Infrastructure, deployment, and scaling" },
  { value: "AUDIT", label: "Audit", description: "Code review, security, and performance audits" },
  { value: "OTHER", label: "Other", description: "Other services" },
];

export function ServiceForm({ initialData, projects, isEditing = false }: ServiceFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [category, setCategory] = useState<ServiceCategory | "">(initialData?.category || "");
  const [priceInCents, setPriceInCents] = useState(initialData?.priceInCents ? initialData.priceInCents / 100 : 100);
  const [deliveryDays, setDeliveryDays] = useState(initialData?.deliveryDays || 7);
  const [selectedProjects, setSelectedProjects] = useState<string[]>(initialData?.portfolioProjectIds || []);

  // Filter to only launched projects
  const launchedProjects = projects.filter(p => p.status === "LAUNCHED");

  const toggleProject = (projectId: string) => {
    setSelectedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        title,
        description,
        category,
        priceInCents: Math.round(priceInCents * 100),
        deliveryDays,
        portfolioProjectIds: selectedProjects,
      };

      const url = isEditing ? `/api/services/${initialData?.id}` : "/api/services";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save service");
      }

      // Redirect to checkout or service page
      if (isEditing) {
        router.push(`/services/${data.slug || data.id}`);
      } else {
        router.push(`/services/${data.id}/checkout`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Basic Information</h3>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Service Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Full-Stack MVP Development"
            className="w-full px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            required
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you'll deliver, your process, and what makes you the right choice..."
            rows={6}
            className="w-full px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-none"
            required
            maxLength={2000}
          />
          <p className="mt-1 text-xs text-zinc-500">{description.length}/2000 characters</p>
        </div>
      </div>

      {/* Category */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Category</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={cn(
                "text-left p-4 rounded-lg border transition-all",
                category === cat.value
                  ? "border-amber-500 bg-amber-500/10"
                  : "border-zinc-700 bg-zinc-800/30 hover:border-zinc-600"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-white">{cat.label}</span>
                {category === cat.value && (
                  <Check className="h-4 w-4 text-amber-400" />
                )}
              </div>
              <p className="text-xs text-zinc-500">{cat.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Pricing & Delivery</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Price (USD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
              <input
                type="number"
                value={priceInCents}
                onChange={(e) => setPriceInCents(Math.max(10, Number(e.target.value)))}
                min={10}
                step={1}
                className="w-full pl-8 pr-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                required
              />
            </div>
            <p className="mt-1 text-xs text-zinc-500">Minimum $10</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              <Clock className="inline h-4 w-4 mr-1" />
              Delivery Time (days)
            </label>
            <input
              type="number"
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(Math.max(1, Math.min(365, Number(e.target.value))))}
              min={1}
              max={365}
              className="w-full px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              required
            />
          </div>
        </div>
      </div>

      {/* Portfolio Projects */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Proof of Work</h3>
          <p className="text-sm text-zinc-500 mt-1">
            Select launched projects that demonstrate your ability to deliver this service
          </p>
        </div>

        {launchedProjects.length === 0 ? (
          <div className="p-6 rounded-lg border border-zinc-700 bg-zinc-800/30 text-center">
            <Rocket className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm text-zinc-500">No launched projects yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {launchedProjects.map((project) => {
              const isSelected = selectedProjects.includes(project.id);
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => toggleProject(project.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-zinc-700 bg-zinc-800/30 hover:border-zinc-600"
                  )}
                >
                  <div className="relative h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-800">
                    {project.imageUrl ? (
                      <Image
                        src={project.imageUrl}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Rocket className="h-5 w-5 text-zinc-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white truncate">
                        {project.title}
                      </span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <span className="text-xs text-emerald-400">Launched</span>
                  </div>
                  {isSelected && (
                    <X className="h-4 w-4 text-zinc-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {selectedProjects.length > 0 && (
          <p className="text-sm text-emerald-400">
            {selectedProjects.length} project{selectedProjects.length !== 1 ? "s" : ""} selected
          </p>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-zinc-800">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !title || !description || !category}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-zinc-900 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            "Save Changes"
          ) : (
            <>
              Continue to Payment
              <DollarSign className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
