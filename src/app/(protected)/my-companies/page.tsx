"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Building2, Plus, Loader2, MapPin, Users, Briefcase, Edit, ExternalLink, Zap } from "lucide-react";
import { cn, getCategoryLabel, getCategoryColor, getSizeShortLabel, getCompanyUrl } from "@/lib/utils";

interface Company {
  id: string;
  slug: string | null;
  name: string;
  logo: string | null;
  location: string | null;
  category: string;
  about: string | null;
  website: string | null;
  size: string | null;
  isHiring: boolean;
  acceptsContracts: boolean;
  createdAt: string;
  _count: {
    projects: number;
    roles: number;
    members: number;
  };
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const response = await fetch("/api/companies?mine=true");
        if (response.ok) {
          const data = await response.json();
          setCompanies(data.companies);
        }
      } catch (error) {
        console.error("Failed to fetch companies:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCompanies();
  }, []);

  return (
    <div className="relative min-h-screen bg-zinc-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/25">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">My Companies</h1>
              <p className="text-zinc-400 text-sm">
                Manage your company profiles
              </p>
            </div>
          </div>
          <Link
            href="/my-companies/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-zinc-900 rounded-lg bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/20"
          >
            <Plus className="h-4 w-4" />
            Add Company
          </Link>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : companies.length === 0 ? (
          <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-orange-500/60" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No companies yet</h3>
            <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
              Create a company profile to showcase your team, hire builders, and link your projects.
            </p>
            <Link
              href="/my-companies/new"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-900 rounded-lg bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/20"
            >
              <Plus className="h-4 w-4" />
              Create Your First Company
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {companies.map((company) => (
              <div
                key={company.id}
                className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6 hover:border-orange-500/30 transition-colors"
              >
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

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link
                          href={getCompanyUrl(company)}
                          className="text-lg font-semibold text-white hover:text-orange-400 transition-colors"
                        >
                          {company.name}
                        </Link>
                        {company.location && (
                          <div className="mt-1 flex items-center gap-1 text-sm text-zinc-400">
                            <MapPin className="h-3.5 w-3.5" />
                            {company.location}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/my-companies/${company.slug || company.id}/edit`}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-400 rounded-lg border border-zinc-700 hover:bg-zinc-800 hover:text-white transition-colors"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <Link
                          href={getCompanyUrl(company)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-400 rounded-lg border border-zinc-700 hover:bg-zinc-800 hover:text-white transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View
                        </Link>
                      </div>
                    </div>

                    {/* Status badges */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border",
                          getCategoryColor(company.category)
                        )}
                      >
                        {getCategoryLabel(company.category)}
                      </span>
                      {company.isHiring && (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <Zap className="h-3 w-3" />
                          Hiring
                        </span>
                      )}
                      {company.acceptsContracts && (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Contracts
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-zinc-500">
                      {company.size && (
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          {getSizeShortLabel(company.size)}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5" />
                        {company._count.projects} project{company._count.projects !== 1 ? "s" : ""}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {company._count.members} member{company._count.members !== 1 ? "s" : ""}
                      </div>
                      {company._count.roles > 0 && (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <Zap className="h-3.5 w-3.5" />
                          {company._count.roles} open role{company._count.roles !== 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
