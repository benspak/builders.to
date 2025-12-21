"use client";

import Link from "next/link";
import Image from "next/image";
import { Building2, MapPin, Users, ExternalLink, Briefcase, Calendar } from "lucide-react";
import { cn, formatRelativeTime, getCategoryLabel, getCategoryColor, getSizeShortLabel } from "@/lib/utils";

interface CompanyCardProps {
  company: {
    id: string;
    slug?: string | null;
    name: string;
    logo?: string | null;
    location?: string | null;
    category: string;
    about?: string | null;
    website?: string | null;
    size?: string | null;
    yearFounded?: number | null;
    createdAt: string | Date;
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
    _count: {
      projects: number;
    };
  };
}

export function CompanyCard({ company }: CompanyCardProps) {
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
              href={`/companies/${company.slug || company.id}`}
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

        {/* About (truncated) */}
        {company.about && (
          <p className="mt-4 text-sm text-zinc-400 line-clamp-2">
            {company.about}
          </p>
        )}

        {/* Category badge */}
        <div className="mt-4">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border",
              getCategoryColor(company.category)
            )}
          >
            {getCategoryLabel(company.category)}
          </span>
        </div>

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
