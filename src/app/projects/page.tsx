import { Suspense } from "react";
import Link from "next/link";
import { Plus, Loader2, Github } from "lucide-react";
import { ProjectFilters } from "@/components/projects/project-filters";
import { ProjectGrid } from "@/components/projects/project-grid";
import { SiteViewsCounter } from "@/components/analytics/site-views-counter";
import { BannerAd } from "@/components/ads";
import { auth } from "@/lib/auth";

interface ProjectsPageProps {
  searchParams: Promise<{
    sort?: string;
    status?: string;
    search?: string;
  }>;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = await searchParams;
  const session = await auth();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Banner Ad Spot */}
      <div className="mb-8">
        <BannerAd isAuthenticated={!!session} />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-zinc-400 mt-1">
            Discover what builders are working on
          </p>
        </div>
        {session ? (
          <div className="flex gap-3">
            <Link
              href="/projects/import"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              <Github className="h-4 w-4" />
              Import
            </Link>
            <Link href="/projects/new" className="btn-primary">
              <Plus className="h-4 w-4" />
              Share Project
            </Link>
          </div>
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
