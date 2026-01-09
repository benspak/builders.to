"use client";

import Link from "next/link";
import Image from "next/image";
import { Building2, MapPin, Users, ExternalLink, Briefcase, Calendar, Zap, Code } from "lucide-react";
import { cn, formatRelativeTime, getCategoryLabel, getCategoryColor, getSizeShortLabel, getCompanyUrl } from "@/lib/utils";
import { TractionBadgesMinimal } from "./traction-badges";
import { TechStackDisplay } from "./tech-stack-display";

interface CompanyCardProps {
  company: {
    id: string;
    slug?: string | null;
    name: string;
    logo?: string | null;
    location?: string | null;
    locationSlug?: string | null;
    category: string;
    about?: string | null;
    website?: string | null;
    size?: string | null;
    yearFounded?: number | null;
    createdAt: string | Date;
    // New opportunity hub fields
    techStack?: string[];
    customerCount?: string | null;
    revenueRange?: string | null;
    userCount?: string | null;
    isBootstrapped?: boolean;
    isProfitable?: boolean;
    hasRaisedFunding?: boolean;
    isHiring?: boolean;
    acceptsContracts?: boolean;
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
    _count: {
      projects: number;
      roles?: number;
    };
  };
}

export function CompanyCard({ company }: CompanyCardProps) {
  // Check if has any traction data
  const hasTraction = company.customerCount || company.revenueRange || company.userCount ||
    company.isBootstrapped || company.isProfitable || company.hasRaisedFunding;

  const activeRolesCount = company._count.roles || 0;
  const companyUrl = getCompanyUrl(company);

  return (
    <div className="card card-hover group relative flex flex-col overflow-hidden">
      <div className="p-6">
        {/* Header with logo */}
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-800/50 border border-white/10">
            {company.logo ? (
              <Image
                src={company.logo}
                alt={company.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Building2 className="h-8 w-8 text-zinc-600" />
              </div>
            )}
          </div>

          {/* Name and location */}
          <div className="flex-1 min-w-0">
            <Link
              href={companyUrl}
              className="block group/title"
            >
              <h3 className="text-lg font-semibold text-white truncate group-hover/title:text-orange-400 transition-colors">
                {company.name}
              </h3>
            </Link>
            {company.location && (
              <div className="mt-1 flex items-center gap-1 text-sm text-zinc-400">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{company.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status badges (Hiring, Contracts) */}
        {(company.isHiring || company.acceptsContracts) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {company.isHiring && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Zap className="h-3 w-3" />
                Hiring
              </span>
            )}
            {company.acceptsContracts && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <Code className="h-3 w-3" />
                Contracts
              </span>
            )}
          </div>
        )}

        {/* About (truncated) */}
        {company.about && (
          <p className="mt-4 text-sm text-zinc-400 line-clamp-2">
            {company.about}
          </p>
        )}

        {/* Category badge and traction */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border",
              getCategoryColor(company.category)
            )}
          >
            {getCategoryLabel(company.category)}
          </span>

          {/* Traction icons */}
          {hasTraction && (
            <TractionBadgesMinimal
              customerCount={company.customerCount}
              revenueRange={company.revenueRange}
              userCount={company.userCount}
              isBootstrapped={company.isBootstrapped}
              isProfitable={company.isProfitable}
              hasRaisedFunding={company.hasRaisedFunding}
            />
          )}
        </div>

        {/* Tech Stack preview */}
        {company.techStack && company.techStack.length > 0 && (
          <div className="mt-3">
            <TechStackDisplay
              techStack={company.techStack}
              variant="minimal"
              maxItems={4}
            />
          </div>
        )}

        {/* Meta info */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-500">
          {company.size && (
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>{getSizeShortLabel(company.size)}</span>
            </div>
          )}
          {company.yearFounded && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>Est. {company.yearFounded}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" />
            <span>{company._count.projects} project{company._count.projects !== 1 ? "s" : ""}</span>
          </div>
          {activeRolesCount > 0 && (
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Zap className="h-3.5 w-3.5" />
              <span>{activeRolesCount} open</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 flex items-center justify-between border-t border-white/5">
          {/* Added date */}
          <div className="text-xs text-zinc-600">
            Added {formatRelativeTime(company.createdAt)}
          </div>

          {/* Website link */}
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-orange-400 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Website</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
