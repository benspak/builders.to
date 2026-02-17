import { Suspense } from "react";
import Link from "next/link";
import { Plus, Loader2, Github, Rocket } from "lucide-react";
import { ProjectFilters } from "@/components/projects/project-filters";
import { ProjectGrid } from "@/components/projects/project-grid";
import { SiteViewsCounter } from "@/components/analytics/site-views-counter";
import { BannerAd } from "@/components/ads";
import { ProUpgradePrompt } from "@/components/pro";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isProMember } from "@/lib/stripe-subscription";

interface ProjectsPageProps {
  searchParams: Promise<{
    sort?: string;
    status?: string;
    search?: string;
  }>;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = await searchParams;
  const [session, totalProjectCount] = await Promise.all([
    auth(),
    prisma.project.count(),
  ]);

  // Check if user is a Pro member and get their project count
  const isPro = session?.user?.id ? await isProMember(session.user.id) : false;
  
  const userProjectCount = (!isPro && session?.user?.id)
    ? await prisma.project.count({ where: { userId: session.user.id } })
    : 0;
  const canCreateMore = isPro || userProjectCount < 3;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Banner Ad Spot */}
      <div className="mb-8">
        <BannerAd isAuthenticated={!!session} />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">Projects</h1>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30">
              <Rocket className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-semibold text-orange-400">
                {totalProjectCount.toLocaleString()}
              </span>
            </div>
          </div>
          <p className="text-zinc-400 mt-1">
            Discover what builders, founders, and entrepreneurs are building and launching
          </p>
        </div>
        {session && canCreateMore ? (
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
        ) : !session ? (
          <Link href="/signin?callbackUrl=/projects/new" className="btn-primary">
            <Plus className="h-4 w-4" />
            Sign in to Share
          </Link>
        ) : null}
      </div>

      {/* Project limit banner for logged-in non-Pro users */}
      {session && !isPro && (
        <div className="mb-8">
          <ProUpgradePrompt
            feature="projects"
            variant="banner"
            isAuthenticated={true}
            projectCount={userProjectCount}
          />
        </div>
      )}

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
