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
  Code,
  Wrench,
  DollarSign,
  UserCheck,
  TrendingUp,
  Sprout,
  Gem,
  X,
  Plus,
  Briefcase,
} from "lucide-react";
import { cn, getCompanyUrl } from "@/lib/utils";
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
    // New fields
    techStack?: string[];
    tools?: string[];
    customerCount?: string | null;
    revenueRange?: string | null;
    userCount?: string | null;
    isBootstrapped?: boolean;
    isProfitable?: boolean;
    hasRaisedFunding?: boolean;
    fundingStage?: string | null;
    isHiring?: boolean;
    acceptsContracts?: boolean;
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

const customerRanges = [
  { value: "RANGE_0", label: "Pre-customers" },
  { value: "RANGE_1_10", label: "1-10 customers" },
  { value: "RANGE_11_50", label: "11-50 customers" },
  { value: "RANGE_51_100", label: "51-100 customers" },
  { value: "RANGE_101_500", label: "101-500 customers" },
  { value: "RANGE_500_PLUS", label: "500+ customers" },
];

const userRanges = [
  { value: "RANGE_0", label: "Pre-launch" },
  { value: "RANGE_1_100", label: "1-100 users" },
  { value: "RANGE_101_1K", label: "101-1K users" },
  { value: "RANGE_1K_10K", label: "1K-10K users" },
  { value: "RANGE_10K_100K", label: "10K-100K users" },
  { value: "RANGE_100K_PLUS", label: "100K+ users" },
];

const revenueRanges = [
  { value: "RANGE_0", label: "Pre-revenue" },
  { value: "RANGE_1_10K", label: "$1-$10K ARR" },
  { value: "RANGE_10K_50K", label: "$10K-$50K ARR" },
  { value: "RANGE_50K_100K", label: "$50K-$100K ARR" },
  { value: "RANGE_100K_500K", label: "$100K-$500K ARR" },
  { value: "RANGE_500K_1M", label: "$500K-$1M ARR" },
  { value: "RANGE_1M_5M", label: "$1M-$5M ARR" },
  { value: "RANGE_5M_PLUS", label: "$5M+ ARR" },
];

const fundingStages = [
  { value: "PRE_SEED", label: "Pre-seed" },
  { value: "SEED", label: "Seed" },
  { value: "SERIES_A", label: "Series A" },
  { value: "SERIES_B", label: "Series B" },
  { value: "SERIES_C_PLUS", label: "Series C+" },
];

const commonTechStack = [
  "TypeScript", "JavaScript", "Python", "Go", "Rust", "Ruby", "Java",
  "React", "Vue", "Angular", "Next.js", "Svelte", "Tailwind CSS",
  "Node.js", "Django", "Rails", "FastAPI", "Express",
  "PostgreSQL", "MongoDB", "Redis", "MySQL", "Supabase",
  "AWS", "GCP", "Azure", "Vercel", "Docker", "Kubernetes",
  "OpenAI", "Anthropic", "LangChain",
];

const commonTools = [
  "Figma", "Linear", "Notion", "Slack", "GitHub", "GitLab",
  "VS Code", "Cursor", "Stripe", "Segment", "Mixpanel",
  "Intercom", "Zendesk", "HubSpot", "Salesforce",
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
    // Traction
    customerCount: initialData?.customerCount || "",
    revenueRange: initialData?.revenueRange || "",
    userCount: initialData?.userCount || "",
    isBootstrapped: initialData?.isBootstrapped || false,
    isProfitable: initialData?.isProfitable || false,
    hasRaisedFunding: initialData?.hasRaisedFunding || false,
    fundingStage: initialData?.fundingStage || "",
    // Opportunity flags
    isHiring: initialData?.isHiring || false,
    acceptsContracts: initialData?.acceptsContracts || false,
  });

  const [techStack, setTechStack] = useState<string[]>(initialData?.techStack || []);
  const [tools, setTools] = useState<string[]>(initialData?.tools || []);
  const [techInput, setTechInput] = useState("");
  const [toolInput, setToolInput] = useState("");

  const isEditing = !!initialData?.id;

  const addTech = (tech: string) => {
    const trimmed = tech.trim();
    if (trimmed && !techStack.includes(trimmed)) {
      setTechStack([...techStack, trimmed]);
    }
    setTechInput("");
  };

  const removeTech = (tech: string) => {
    setTechStack(techStack.filter((t) => t !== tech));
  };

  const addTool = (tool: string) => {
    const trimmed = tool.trim();
    if (trimmed && !tools.includes(trimmed)) {
      setTools([...tools, trimmed]);
    }
    setToolInput("");
  };

  const removeTool = (tool: string) => {
    setTools(tools.filter((t) => t !== tool));
  };

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
          customerCount: formData.customerCount || null,
          revenueRange: formData.revenueRange || null,
          userCount: formData.userCount || null,
          fundingStage: formData.hasRaisedFunding ? (formData.fundingStage || null) : null,
          techStack,
          tools,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Something went wrong");
      }

      const company = await response.json();
      // Use the new URL format with location
      const companyUrl = getCompanyUrl(company);
      router.push(companyUrl);
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

      {/* Company Size & Year */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">
            Company Size
          </label>
          <div className="grid grid-cols-1 gap-2">
            {sizes.map((size) => (
              <button
                key={size.value}
                type="button"
                onClick={() => setFormData({ ...formData, size: formData.size === size.value ? "" : size.value })}
                className={cn(
                  "flex items-center rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
                  formData.size === size.value
                    ? "border-orange-500/50 bg-orange-500/10 text-orange-300"
                    : "border-zinc-700/50 bg-zinc-800/30 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800/50 hover:text-zinc-300"
                )}
              >
                <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                {size.label}
              </button>
            ))}
          </div>
        </div>

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
      </div>

      {/* Divider */}
      <div className="border-t border-white/10 pt-8">
        <h3 className="text-lg font-semibold text-white mb-2">📊 Traction Badges</h3>
        <p className="text-sm text-zinc-500 mb-6">
          Show your progress and build credibility with traction badges
        </p>

        {/* Revenue Range */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-3">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            Revenue (ARR)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {revenueRanges.map((range) => (
              <button
                key={range.value}
                type="button"
                onClick={() => setFormData({ ...formData, revenueRange: formData.revenueRange === range.value ? "" : range.value })}
                className={cn(
                  "rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                  formData.revenueRange === range.value
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                    : "border-zinc-700/50 bg-zinc-800/30 text-zinc-400 hover:border-zinc-600"
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Customer Count */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-3">
            <UserCheck className="h-4 w-4 text-amber-400" />
            Paying Customers
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {customerRanges.map((range) => (
              <button
                key={range.value}
                type="button"
                onClick={() => setFormData({ ...formData, customerCount: formData.customerCount === range.value ? "" : range.value })}
                className={cn(
                  "rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                  formData.customerCount === range.value
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                    : "border-zinc-700/50 bg-zinc-800/30 text-zinc-400 hover:border-zinc-600"
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* User Count */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-3">
            <Users className="h-4 w-4 text-violet-400" />
            Total Users
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {userRanges.map((range) => (
              <button
                key={range.value}
                type="button"
                onClick={() => setFormData({ ...formData, userCount: formData.userCount === range.value ? "" : range.value })}
                className={cn(
                  "rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                  formData.userCount === range.value
                    ? "border-violet-500/50 bg-violet-500/10 text-violet-300"
                    : "border-zinc-700/50 bg-zinc-800/30 text-zinc-400 hover:border-zinc-600"
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap gap-3 mb-6">
          <label
            className={cn(
              "flex items-center gap-2 rounded-lg border px-4 py-2.5 cursor-pointer transition-all",
              formData.isProfitable
                ? "border-lime-500/50 bg-lime-500/10 text-lime-300"
                : "border-zinc-700/50 bg-zinc-800/30 text-zinc-400 hover:border-zinc-600"
            )}
          >
            <input
              type="checkbox"
              checked={formData.isProfitable}
              onChange={(e) => setFormData({ ...formData, isProfitable: e.target.checked })}
              className="sr-only"
            />
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">Profitable</span>
          </label>

          <label
            className={cn(
              "flex items-center gap-2 rounded-lg border px-4 py-2.5 cursor-pointer transition-all",
              formData.isBootstrapped
                ? "border-green-500/50 bg-green-500/10 text-green-300"
                : "border-zinc-700/50 bg-zinc-800/30 text-zinc-400 hover:border-zinc-600"
            )}
          >
            <input
              type="checkbox"
              checked={formData.isBootstrapped}
              onChange={(e) => setFormData({ ...formData, isBootstrapped: e.target.checked })}
              className="sr-only"
            />
            <Sprout className="h-4 w-4" />
            <span className="text-sm font-medium">Bootstrapped</span>
          </label>

          <label
            className={cn(
              "flex items-center gap-2 rounded-lg border px-4 py-2.5 cursor-pointer transition-all",
              formData.hasRaisedFunding
                ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                : "border-zinc-700/50 bg-zinc-800/30 text-zinc-400 hover:border-zinc-600"
            )}
          >
            <input
              type="checkbox"
              checked={formData.hasRaisedFunding}
              onChange={(e) => setFormData({ ...formData, hasRaisedFunding: e.target.checked })}
              className="sr-only"
            />
            <Gem className="h-4 w-4" />
            <span className="text-sm font-medium">Raised Funding</span>
          </label>
        </div>

        {/* Funding stage (shown if raised funding) */}
        {formData.hasRaisedFunding && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-300 mb-3">
              Funding Stage
            </label>
            <div className="flex flex-wrap gap-2">
              {fundingStages.map((stage) => (
                <button
                  key={stage.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, fundingStage: formData.fundingStage === stage.value ? "" : stage.value })}
                  className={cn(
                    "rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                    formData.fundingStage === stage.value
                      ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                      : "border-zinc-700/50 bg-zinc-800/30 text-zinc-400 hover:border-zinc-600"
                  )}
                >
                  {stage.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tech Stack */}
      <div className="border-t border-white/10 pt-8">
        <h3 className="text-lg font-semibold text-white mb-2">💻 Tech Stack & Tools</h3>
        <p className="text-sm text-zinc-500 mb-6">
          Showcase the technologies and tools your team uses
        </p>

        {/* Tech Stack */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-3">
            <Code className="h-4 w-4" />
            Tech Stack
          </label>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              placeholder="Add technology..."
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTech(techInput);
                }
              }}
              className="input flex-1"
            />
            <button
              type="button"
              onClick={() => addTech(techInput)}
              className="btn-secondary"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Quick add suggestions */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {commonTechStack
              .filter((t) => !techStack.includes(t))
              .slice(0, 12)
              .map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => addTech(tech)}
                  className="text-xs px-2 py-1 rounded-full border border-zinc-700/50 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-colors"
                >
                  + {tech}
                </button>
              ))}
          </div>

          {/* Selected tech */}
          {techStack.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm bg-blue-500/10 text-blue-300 border border-blue-500/30"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTech(tech)}
                    className="text-blue-400 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tools */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-3">
            <Wrench className="h-4 w-4" />
            Tools & Services
          </label>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              placeholder="Add tool..."
              value={toolInput}
              onChange={(e) => setToolInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTool(toolInput);
                }
              }}
              className="input flex-1"
            />
            <button
              type="button"
              onClick={() => addTool(toolInput)}
              className="btn-secondary"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Quick add suggestions */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {commonTools
              .filter((t) => !tools.includes(t))
              .slice(0, 8)
              .map((tool) => (
                <button
                  key={tool}
                  type="button"
                  onClick={() => addTool(tool)}
                  className="text-xs px-2 py-1 rounded-full border border-zinc-700/50 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-colors"
                >
                  + {tool}
                </button>
              ))}
          </div>

          {/* Selected tools */}
          {tools.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tools.map((tool) => (
                <span
                  key={tool}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm bg-zinc-800 text-zinc-300 border border-white/10"
                >
                  {tool}
                  <button
                    type="button"
                    onClick={() => removeTool(tool)}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Opportunity Flags */}
      <div className="border-t border-white/10 pt-8">
        <h3 className="text-lg font-semibold text-white mb-2">🚀 Opportunity Hub</h3>
        <p className="text-sm text-zinc-500 mb-6">
          Let builders know what opportunities are available
        </p>

        <div className="flex flex-wrap gap-3">
          <label
            className={cn(
              "flex items-center gap-2 rounded-lg border px-4 py-2.5 cursor-pointer transition-all",
              formData.isHiring
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                : "border-zinc-700/50 bg-zinc-800/30 text-zinc-400 hover:border-zinc-600"
            )}
          >
            <input
              type="checkbox"
              checked={formData.isHiring}
              onChange={(e) => setFormData({ ...formData, isHiring: e.target.checked })}
              className="sr-only"
            />
            <Briefcase className="h-4 w-4" />
            <span className="text-sm font-medium">We&apos;re Hiring</span>
          </label>

          <label
            className={cn(
              "flex items-center gap-2 rounded-lg border px-4 py-2.5 cursor-pointer transition-all",
              formData.acceptsContracts
                ? "border-purple-500/50 bg-purple-500/10 text-purple-300"
                : "border-zinc-700/50 bg-zinc-800/30 text-zinc-400 hover:border-zinc-600"
            )}
          >
            <input
              type="checkbox"
              checked={formData.acceptsContracts}
              onChange={(e) => setFormData({ ...formData, acceptsContracts: e.target.checked })}
              className="sr-only"
            />
            <Code className="h-4 w-4" />
            <span className="text-sm font-medium">Open for Contracts</span>
          </label>
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
