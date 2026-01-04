"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Briefcase,
  Building2,
  MapPin,
  Globe,
  DollarSign,
  PartyPopper,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";

interface JobPostedCardProps {
  event: {
    id: string;
    type: string;
    title: string;
    description?: string | null;
    createdAt: Date | string;
    likesCount: number;
    hasLiked: boolean;
    companyRole?: {
      id: string;
      title: string;
      type: string;
      category: string;
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
    } | null;
  };
  currentUserId?: string;
}

function formatRoleType(type: string): string {
  const types: Record<string, string> = {
    FULL_TIME: "Full-time",
    PART_TIME: "Part-time",
    CONTRACT: "Contract",
    FREELANCE: "Freelance",
    COFOUNDER: "Co-founder",
    ADVISOR: "Advisor",
    INTERN: "Intern",
  };
  return types[type] || type;
}

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
  } else if (min) {
    return `From ${formatter.format(min)}`;
  } else if (max) {
    return `Up to ${formatter.format(max)}`;
  }
  return null;
}

export function JobPostedCard({ event, currentUserId }: JobPostedCardProps) {
  const [liked, setLiked] = useState(event.hasLiked);
  const [likesCount, setLikesCount] = useState(event.likesCount);
  const [loading, setLoading] = useState(false);

  const companyRole = event.companyRole;
  const company = companyRole?.company;

  const companyUrl = company?.slug ? `/companies/${company.slug}` : company?.id ? `/companies/${company.id}` : null;
  const salary = formatSalary(companyRole?.salaryMin, companyRole?.salaryMax, companyRole?.currency);

  const handleLike = async () => {
    if (!currentUserId || loading) return;

    setLoading(true);

    // Optimistic update
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);

    try {
      const response = await fetch(`/api/feed-events/${event.id}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        // Revert on error
        setLiked(liked);
        setLikesCount(likesCount);
      }
    } catch {
      // Revert on error
      setLiked(liked);
      setLikesCount(likesCount);
    } finally {
      setLoading(false);
    }
  };

  if (!companyRole || !company) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
      {/* Job posting header with gradient */}
      <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-violet-500/10 px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 border border-blue-500/30">
            <Briefcase className="h-5 w-5 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-300">
              <span className="font-semibold text-white">New Job Posted</span>
            </p>
            <p className="text-xs text-zinc-500">
              {formatRelativeTime(event.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Job info */}
        <div className="flex gap-4">
          {/* Company logo */}
          {companyUrl && (
            <Link href={companyUrl} className="flex-shrink-0">
              <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-zinc-800 border border-white/10 group">
                {company.logo ? (
                  <Image
                    src={company.logo}
                    alt={company.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Building2 className="h-8 w-8 text-zinc-600" />
                  </div>
                )}
              </div>
            </Link>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Job title */}
            {companyUrl ? (
              <Link href={companyUrl}>
                <h3 className="font-semibold text-white hover:text-blue-400 transition-colors truncate">
                  {companyRole.title}
                </h3>
              </Link>
            ) : (
              <h3 className="font-semibold text-white truncate">
                {companyRole.title}
              </h3>
            )}

            {/* Company name */}
            {companyUrl ? (
              <Link href={companyUrl} className="text-sm text-zinc-400 hover:text-white transition-colors">
                {company.name}
              </Link>
            ) : (
              <p className="text-sm text-zinc-400">{company.name}</p>
            )}

            {/* Job details badges */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {formatRoleType(companyRole.type)}
              </span>

              {companyRole.isRemote && (
                <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Globe className="h-3 w-3" />
                  Remote
                </span>
              )}

              {companyRole.location && !companyRole.isRemote && (
                <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-zinc-700/50 text-zinc-300 border border-zinc-600/50">
                  <MapPin className="h-3 w-3" />
                  {companyRole.location}
                </span>
              )}

              {salary && (
                <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <DollarSign className="h-3 w-3" />
                  {salary}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-end">
          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Celebrate button */}
            <button
              onClick={handleLike}
              disabled={!currentUserId || loading}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                liked
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800 hover:text-white hover:border-zinc-600",
                (!currentUserId || loading) && "opacity-50 cursor-not-allowed"
              )}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PartyPopper className={cn("h-4 w-4", liked && "text-blue-400")} />
              )}
              <span>{likesCount}</span>
            </button>

            {/* View company */}
            {companyUrl && (
              <Link
                href={companyUrl}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">View</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
