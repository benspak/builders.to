"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Briefcase,
  MapPin,
  DollarSign,
  Globe,
  Link as LinkIcon,
  Mail,
  X,
  Plus,
} from "lucide-react";

interface CompanyRoleFormProps {
  companyId: string;
  initialData?: {
    id: string;
    title: string;
    description?: string | null;
    type: string;
    category: string;
    location?: string | null;
    isRemote: boolean;
    timezone?: string | null;
    compensationType?: string | null;
    salaryMin?: number | null;
    salaryMax?: number | null;
    currency?: string | null;
    equityMin?: number | null;
    equityMax?: number | null;
    skills: string[];
    experienceMin?: number | null;
    experienceMax?: number | null;
    applicationUrl?: string | null;
    applicationEmail?: string | null;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const roleTypes = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "COFOUNDER", label: "Co-founder" },
  { value: "ADVISOR", label: "Advisor" },
  { value: "INTERN", label: "Intern" },
];

const roleCategories = [
  { value: "ENGINEERING", label: "Engineering" },
  { value: "DESIGN", label: "Design" },
  { value: "PRODUCT", label: "Product" },
  { value: "MARKETING", label: "Marketing" },
  { value: "SALES", label: "Sales" },
  { value: "OPERATIONS", label: "Operations" },
  { value: "FINANCE", label: "Finance" },
  { value: "LEGAL", label: "Legal" },
  { value: "SUPPORT", label: "Support" },
  { value: "OTHER", label: "Other" },
];

const compensationTypes = [
  { value: "SALARY", label: "Salary" },
  { value: "HOURLY", label: "Hourly" },
  { value: "PROJECT", label: "Project-based" },
  { value: "EQUITY_ONLY", label: "Equity Only" },
  { value: "SALARY_PLUS_EQUITY", label: "Salary + Equity" },
];

export function CompanyRoleForm({ companyId, initialData, onSuccess, onCancel }: CompanyRoleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    type: initialData?.type || "FULL_TIME",
    category: initialData?.category || "ENGINEERING",
    location: initialData?.location || "",
    isRemote: initialData?.isRemote || false,
    timezone: initialData?.timezone || "",
    compensationType: initialData?.compensationType || "",
    salaryMin: initialData?.salaryMin?.toString() || "",
    salaryMax: initialData?.salaryMax?.toString() || "",
    currency: initialData?.currency || "USD",
    equityMin: initialData?.equityMin?.toString() || "",
    equityMax: initialData?.equityMax?.toString() || "",
    experienceMin: initialData?.experienceMin?.toString() || "",
    experienceMax: initialData?.experienceMax?.toString() || "",
    applicationUrl: initialData?.applicationUrl || "",
    applicationEmail: initialData?.applicationEmail || "",
  });

  const [skills, setSkills] = useState<string[]>(initialData?.skills || []);
  const [skillInput, setSkillInput] = useState("");

  const isEditing = !!initialData?.id;

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setLoading(true);
    setError("");

    try {
      const url = isEditing
        ? `/api/company-roles/${initialData.id}`
        : `/api/companies/${companyId}/roles`;

      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          type: formData.type,
          category: formData.category,
          location: formData.location.trim() || null,
          isRemote: formData.isRemote,
          timezone: formData.timezone.trim() || null,
          compensationType: formData.compensationType || null,
          salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
          salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
          currency: formData.currency,
          equityMin: formData.equityMin ? parseFloat(formData.equityMin) : null,
          equityMax: formData.equityMax ? parseFloat(formData.equityMax) : null,
          skills,
          experienceMin: formData.experienceMin ? parseInt(formData.experienceMin) : null,
          experienceMax: formData.experienceMax ? parseInt(formData.experienceMax) : null,
          applicationUrl: formData.applicationUrl.trim() || null,
          applicationEmail: formData.applicationEmail.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save role");
      }

      router.refresh();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-zinc-300 mb-2">
          Role Title <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <Briefcase className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            id="title"
            type="text"
            required
            maxLength={100}
            placeholder="Senior Frontend Engineer"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input pl-11"
          />
        </div>
      </div>

      {/* Type & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Role Type
          </label>
          <div className="flex flex-wrap gap-2">
            {roleTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.value })}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border",
                  formData.type === type.value
                    ? "border-orange-500/50 bg-orange-500/10 text-orange-300"
                    : "border-zinc-700/50 bg-zinc-800/30 text-zinc-400 hover:border-zinc-600"
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="input"
          >
            {roleCategories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-zinc-300 mb-2">
          Location
        </label>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              id="location"
              type="text"
              placeholder="San Francisco, CA"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="input pl-11"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isRemote}
              onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })}
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-orange-500 focus:ring-orange-500"
            />
            <Globe className="h-4 w-4 text-zinc-500" />
            <span className="text-sm text-zinc-400">Remote</span>
          </label>
        </div>
      </div>

      {/* Timezone */}
      <div>
        <label htmlFor="timezone" className="block text-sm font-medium text-zinc-300 mb-2">
          Preferred Timezone
        </label>
        <input
          id="timezone"
          type="text"
          placeholder="PST, UTC±3, etc."
          value={formData.timezone}
          onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
          className="input"
        />
      </div>

      {/* Compensation */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-zinc-300">
          Compensation
        </label>

        <div className="flex flex-wrap gap-2">
          {compensationTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setFormData({ ...formData, compensationType: formData.compensationType === type.value ? "" : type.value })}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border",
                formData.compensationType === type.value
                  ? "border-orange-500/50 bg-orange-500/10 text-orange-300"
                  : "border-zinc-700/50 bg-zinc-800/30 text-zinc-400 hover:border-zinc-600"
              )}
            >
              {type.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="number"
              placeholder="Min salary"
              value={formData.salaryMin}
              onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
              className="input pl-9 text-sm"
            />
          </div>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="number"
              placeholder="Max salary"
              value={formData.salaryMax}
              onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
              className="input pl-9 text-sm"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Equity min %"
              value={formData.equityMin}
              onChange={(e) => setFormData({ ...formData, equityMin: e.target.value })}
              className="input text-sm"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Equity max %"
              value={formData.equityMax}
              onChange={(e) => setFormData({ ...formData, equityMax: e.target.value })}
              className="input text-sm"
            />
          </div>
        </div>
      </div>

      {/* Experience */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Experience (years)
        </label>
        <div className="grid grid-cols-2 gap-3 max-w-xs">
          <input
            type="number"
            placeholder="Min"
            min={0}
            value={formData.experienceMin}
            onChange={(e) => setFormData({ ...formData, experienceMin: e.target.value })}
            className="input"
          />
          <input
            type="number"
            placeholder="Max"
            min={0}
            value={formData.experienceMax}
            onChange={(e) => setFormData({ ...formData, experienceMax: e.target.value })}
            className="input"
          />
        </div>
      </div>

      {/* Skills */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Required Skills
        </label>
        <div className="flex items-center gap-2 mb-3">
          <input
            type="text"
            placeholder="Add a skill..."
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            className="input flex-1"
          />
          <button
            type="button"
            onClick={addSkill}
            className="btn-secondary"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm bg-zinc-800 text-zinc-300 border border-white/10"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-zinc-500 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-2">
          Description
        </label>
        <textarea
          id="description"
          rows={5}
          placeholder="Describe the role, responsibilities, and what you're looking for..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="textarea"
        />
      </div>

      {/* Application */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-zinc-300">
          How to Apply
        </label>
        <div className="relative">
          <LinkIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="url"
            placeholder="Application URL"
            value={formData.applicationUrl}
            onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
            className="input pl-11"
          />
        </div>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="email"
            placeholder="Or email address"
            value={formData.applicationEmail}
            onChange={(e) => setFormData({ ...formData, applicationEmail: e.target.value })}
            className="input pl-11"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !formData.title.trim()}
          className="btn-primary"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {isEditing ? "Saving..." : "Creating..."}
            </>
          ) : (
            <>
              <Briefcase className="h-4 w-4" />
              {isEditing ? "Save Changes" : "Post Role"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
