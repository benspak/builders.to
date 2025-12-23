import { Suspense } from "react";
import Link from "next/link";
import { Plus, Loader2 } from "lucide-react";
import { ProjectFilters } from "@/components/projects/project-filters";
import { ProjectGrid } from "@/components/projects/project-grid";
import { RoastMVPCard } from "@/components/roast-mvp/roast-mvp-card";
import { SiteViewsCounter } from "@/components/analytics/site-views-counter";
import { auth } from "@/lib/auth";

interface DashboardPageProps {
  searchParams: Promise<{
    sort?: string;
    status?: string;
    search?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const session = await auth();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* PopVia Sponsor Banner */}
      <div className="mb-8 rounded-xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-500/20 p-4 text-center">
        <p className="text-zinc-300 text-sm sm:text-base">
          <span className="font-semibold text-white">Builders.to</span> brought to you by{" "}
          <a
            href="https://PopVia.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-orange-400 hover:text-orange-300 transition-colors underline underline-offset-2"
          >
            PopVia
          </a>
          {" "}- customer service automation for solo founders and small teams.
        </p>
      </div>

      {/* Roast my MVP Featured Card */}
      <RoastMVPCard />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-zinc-400 mt-1">
            Discover what builders are working on
          </p>
        </div>
        {session ? (
          <Link href="/projects/new" className="btn-primary">
            <Plus className="h-4 w-4" />
            Share Project
          </Link>
        ) : (
          <Link href="/signin?callbackUrl=/projects/new" className="btn-primary">
            <Plus className="h-4 w-4" />
            Sign in to Share
          </Link>
        )}
      </div>

      {/* Site Views Counter */}
      <div className="mb-8">
        <SiteViewsCounter />
      </div>

      {/* Filters */}
      <div className="mb-8">
        <Suspense fallback={<div className="h-[88px]" />}>
          <ProjectFilters />
        </Suspense>
      </div>

      {/* Projects Grid */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        }
      >
        <ProjectGrid
          sort={params.sort}
          status={params.status}
          search={params.search}
        />
      </Suspense>
    </div>
  );
}
