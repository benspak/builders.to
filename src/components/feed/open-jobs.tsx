"use client";

import Link from "next/link";
import Image from "next/image";
import { Building2, MapPin, Globe, DollarSign, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface OpenJob {
  id: string;
  title: string;
  type: string;
  location?: string | null;
  isRemote: boolean;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
  company: {
    id: string;
    slug?: string | null;
    name: string;
    logo?: string | null;
  };
}

interface OpenJobsProps {
  jobs: OpenJob[];
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
  FULL_TIME: "text-emerald-400",
  PART_TIME: "text-blue-400",
  CONTRACT: "text-amber-400",
  FREELANCE: "text-purple-400",
  COFOUNDER: "text-rose-400",
  ADVISOR: "text-cyan-400",
  INTERN: "text-teal-400",
};

function formatSalary(min?: number | null, max?: number | null): string | null {
  if (!min && !max) return null;

  // Format with K notation for readability
  const formatK = (num: number) => {
    if (num >= 1000) {
      return `${Math.round(num / 1000)}K`;
    }
    return num.toString();
  };

  if (min && max) {
    return `$${formatK(min)}-${formatK(max)}`;
  }
  if (min) return `$${formatK(min)}+`;
  if (max) return `Up to $${formatK(max)}`;
  return null;
}

export function OpenJobs({ jobs }: OpenJobsProps) {
  if (jobs.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800/50 bg-gradient-to-r from-emerald-500/10 to-transparent">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
            <Zap className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Open Roles</h3>
            <p className="text-xs text-zinc-500">From builder companies</p>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="divide-y divide-zinc-800/30">
        {jobs.map((job) => {
          const salary = formatSalary(job.salaryMin, job.salaryMax);

          return (
            <Link
              key={job.id}
              href={`/companies/${job.company.slug || job.company.id}`}
              className="block px-4 py-3 hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-start gap-3">
                {/* Company Logo */}
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800/50 border border-white/5">
                  {job.company.logo ? (
                    <Image
                      src={job.company.logo}
                      alt={job.company.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Building2 className="h-5 w-5 text-zinc-600" />
                    </div>
                  )}
                </div>

                {/* Job Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white truncate group-hover:text-orange-400 transition-colors">
                    {job.title}
                  </h4>
                  <p className="text-xs text-zinc-400 truncate">
                    {job.company.name}
                  </p>

                  {/* Meta */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                    <span className={cn("font-medium", roleTypeColors[job.type] || "text-zinc-400")}>
                      {roleTypeLabels[job.type] || job.type}
                    </span>

                    {job.isRemote && (
                      <span className="flex items-center gap-0.5 text-zinc-500">
                        <Globe className="h-3 w-3" />
                        Remote
                      </span>
                    )}

                    {!job.isRemote && job.location && (
                      <span className="flex items-center gap-0.5 text-zinc-500 truncate">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </span>
                    )}

                    {salary && (
                      <span className="flex items-center gap-0.5 text-emerald-400">
                        <DollarSign className="h-3 w-3" />
                        {salary}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* View All Link */}
      <Link
        href="/companies?hiring=true"
        className="block px-4 py-2.5 text-center text-sm font-medium text-orange-400 hover:text-orange-300 hover:bg-white/5 border-t border-zinc-800/50 transition-colors"
      >
        View all hiring companies →
      </Link>
    </div>
  );
}
