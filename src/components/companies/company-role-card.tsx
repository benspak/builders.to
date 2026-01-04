"use client";

import Link from "next/link";
import { formatRelativeTime, cn } from "@/lib/utils";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  ExternalLink,
  Globe,
  Percent,
} from "lucide-react";

interface CompanyRoleCardProps {
  role: {
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
    isActive: boolean;
    applicationUrl?: string | null;
    applicationEmail?: string | null;
    createdAt: string | Date;
    expiresAt?: string | Date | null;
  };
  company?: {
    id: string;
    slug?: string | null;
    name: string;
    logo?: string | null;
  };
  showCompany?: boolean;
}

const roleTypeLabels: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  FREELANCE: "Freelance",
  COFOUNDER: "Co-founder",
  ADVISOR: "Advisor",
  INTERN: "Intern",
};

const roleTypeColors: Record<string, string> = {
  FULL_TIME: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  PART_TIME: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  CONTRACT: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  FREELANCE: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  COFOUNDER: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  ADVISOR: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  INTERN: "bg-teal-500/20 text-teal-300 border-teal-500/30",
};

const categoryLabels: Record<string, string> = {
  ENGINEERING: "Engineering",
  DESIGN: "Design",
  PRODUCT: "Product",
  MARKETING: "Marketing",
  SALES: "Sales",
  OPERATIONS: "Operations",
  FINANCE: "Finance",
  LEGAL: "Legal",
  SUPPORT: "Support",
  OTHER: "Other",
};

function formatSalary(min?: number | null, max?: number | null, currency?: string | null): string | null {
  if (!min && !max) return null;
  const curr = currency || "USD";
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: curr,
    maximumFractionDigits: 0,
  });

  if (min && max) {
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  }
  if (min) return `${formatter.format(min)}+`;
  if (max) return `Up to ${formatter.format(max)}`;
  return null;
}

function formatEquity(min?: number | null, max?: number | null): string | null {
  if (!min && !max) return null;
  if (min && max) return `${min}% - ${max}%`;
  if (min) return `${min}%+`;
  if (max) return `Up to ${max}%`;
  return null;
}

function formatExperience(min?: number | null, max?: number | null): string | null {
  if (!min && !max) return null;
  if (min && max) return `${min}-${max} years`;
  if (min) return `${min}+ years`;
  if (max) return `Up to ${max} years`;
  return null;
}

export function CompanyRoleCard({ role, company, showCompany }: CompanyRoleCardProps) {
  const salary = formatSalary(role.salaryMin, role.salaryMax, role.currency);
  const equity = formatEquity(role.equityMin, role.equityMax);
  const experience = formatExperience(role.experienceMin, role.experienceMax);

  const applicationLink = role.applicationUrl || (role.applicationEmail ? `mailto:${role.applicationEmail}` : null);

  return (
    <div className={cn(
      "card p-5 space-y-4",
      !role.isActive && "opacity-60"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate">{role.title}</h3>
          {showCompany && company && (
            <Link
              href={`/companies/${company.slug || company.id}`}
              className="text-sm text-zinc-400 hover:text-orange-400 transition-colors"
            >
              at {company.name}
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border",
              roleTypeColors[role.type] || "bg-zinc-500/20 text-zinc-300 border-zinc-500/30"
            )}
          >
            {roleTypeLabels[role.type] || role.type}
          </span>
        </div>
      </div>

      {/* Category */}
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <Briefcase className="h-4 w-4 flex-shrink-0" />
        <span>{categoryLabels[role.category] || role.category}</span>
      </div>

      {/* Location */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
        {role.isRemote && (
          <div className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            <span>Remote</span>
          </div>
        )}
        {role.location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span>{role.location}</span>
          </div>
        )}
        {role.timezone && (
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{role.timezone}</span>
          </div>
        )}
      </div>

      {/* Compensation */}
      {(salary || equity) && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {salary && (
            <div className="flex items-center gap-1.5 text-emerald-400">
              <DollarSign className="h-3.5 w-3.5" />
              <span>{salary}</span>
            </div>
          )}
          {equity && (
            <div className="flex items-center gap-1.5 text-purple-400">
              <Percent className="h-3.5 w-3.5" />
              <span>{equity} equity</span>
            </div>
          )}
        </div>
      )}

      {/* Experience */}
      {experience && (
        <div className="text-sm text-zinc-500">
          {experience} experience
        </div>
      )}

      {/* Skills */}
      {role.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {role.skills.slice(0, 5).map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-zinc-800/50 text-zinc-400 border border-white/5"
            >
              {skill}
            </span>
          ))}
          {role.skills.length > 5 && (
            <span className="text-xs text-zinc-500">+{role.skills.length - 5} more</span>
          )}
        </div>
      )}

      {/* Description preview */}
      {role.description && (
        <p className="text-sm text-zinc-400 line-clamp-2">{role.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <span className="text-xs text-zinc-500">
          Posted {formatRelativeTime(role.createdAt)}
        </span>
        {applicationLink && role.isActive && (
          <a
            href={applicationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Apply
          </a>
        )}
        {!role.isActive && (
          <span className="text-xs text-zinc-500 italic">Position closed</span>
        )}
      </div>
    </div>
  );
}
