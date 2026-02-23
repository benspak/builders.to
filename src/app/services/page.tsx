import { Suspense } from "react";
import Link from "next/link";
import { Briefcase, Plus, Loader2 } from "lucide-react";
import { ServiceFilters } from "@/components/services/service-filters";
import { ServiceGrid } from "@/components/services/service-grid";
import { BannerAd } from "@/components/ads";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface ServicesPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
  }>;
}

export const metadata = {
  title: "Services | Builders",
  description:
    "Find builder-to-builder services: MVP builds, design, marketing, AI integration, DevOps, and more. Hire vetted builders from the community.",
};

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const params = await searchParams;
  const now = new Date();
  const totalCount = await prisma.serviceListing.count({
    where: {
      status: "ACTIVE",
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
  });
  const session = await auth();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <BannerAd isAuthenticated={!!session} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">Services</h1>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30">
              <Briefcase className="h-4 w-4 text-violet-400" />
              <span className="text-sm font-semibold text-violet-400">
                {totalCount.toLocaleString()}
              </span>
            </div>
          </div>
          <p className="text-zinc-400 mt-1">
            Builder-to-builder marketplace: MVPs, design, marketing, AI, DevOps, and more
          </p>
        </div>
        {session && (
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            <Plus className="h-4 w-4" />
            List a service
          </Link>
        )}
      </div>

      <div className="mb-8">
        <Suspense fallback={<div className="h-[52px]" />}>
          <ServiceFilters />
        </Suspense>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          </div>
        }
      >
        <ServiceGrid
          category={params.category}
          search={params.search}
        />
      </Suspense>
    </div>
  );
}
