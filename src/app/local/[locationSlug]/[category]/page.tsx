import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MapPin, Plus, ArrowLeft } from "lucide-react";
import { LocalListingCard } from "@/components/local/local-listing-card";
import { LocalCategoryFilter } from "@/components/local/local-category-filter";
import { CompanyRoleCard } from "@/components/companies/company-role-card";
import { CATEGORY_LABELS, LocalListingCategory } from "@/components/local/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locationSlug: string; category: string }>;
}

const validCategories = ["community", "services", "discussion", "coworking_housing", "for_sale", "jobs"];

export async function generateMetadata({ params }: PageProps) {
  const { locationSlug, category } = await params;

  if (!validCategories.includes(category.toLowerCase())) {
    return { title: "Not Found" };
  }

  const categoryLabel = category === "jobs"
    ? "Jobs"
    : CATEGORY_LABELS[category.toUpperCase() as LocalListingCategory] || category;

  // Try to find location name
  const listing = await prisma.localListing.findFirst({
    where: { locationSlug },
    select: { city: true, state: true },
  });

  const locationName = listing
    ? `${listing.city}, ${listing.state}`
    : locationSlug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return {
    title: `${categoryLabel} in ${locationName} | Builders.to`,
    description: `Find ${categoryLabel.toLowerCase()} listings in ${locationName}. Connect with your local builder community.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { locationSlug, category } = await params;

  // Validate category
  if (!validCategories.includes(category.toLowerCase())) {
    notFound();
  }

  const isJobsCategory = category.toLowerCase() === "jobs";
  const categoryEnum = category.toUpperCase() as LocalListingCategory;

  // Get location name
  let locationName = locationSlug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  const userWithLocation = await prisma.user.findFirst({
    where: { locationSlug },
    select: { city: true, state: true },
  });
  if (userWithLocation?.city && userWithLocation?.state) {
    locationName = `${userWithLocation.city}, ${userWithLocation.state}`;
  }

  if (isJobsCategory) {
    // Get jobs from CompanyRole
    const jobs = await prisma.companyRole.findMany({
      where: {
        isActive: true,
        company: { locationSlug },
      },
      orderBy: { createdAt: "desc" },
      include: {
        company: {
          select: {
            id: true,
            slug: true,
            name: true,
            logo: true,
            location: true,
          },
        },
      },
    });

    return (
      <div className="relative min-h-screen bg-zinc-950">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href={`/${locationSlug}`}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {locationName}
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/30">
                <MapPin className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Jobs in {locationName}</h1>
                <p className="text-zinc-400">{jobs.length} open position{jobs.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <LocalCategoryFilter locationSlug={locationSlug} currentCategory="jobs" />
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-16 rounded-xl border border-zinc-800/50 bg-zinc-900/50">
              <MapPin className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-white mb-2">
                No jobs posted in {locationName} yet
              </h2>
              <p className="text-zinc-400">
                Check back later or explore other categories.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <CompanyRoleCard
                  key={job.id}
                  role={{
                    ...job,
                    createdAt: job.createdAt.toISOString(),
                    updatedAt: job.updatedAt.toISOString(),
                    expiresAt: job.expiresAt?.toISOString() || null,
                  }}
                  company={job.company}
                  showCompany={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Regular listing categories
  const listings = await prisma.localListing.findMany({
    where: {
      locationSlug,
      category: categoryEnum,
      status: "ACTIVE",
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          displayName: true,
          image: true,
          slug: true,
        },
      },
      images: {
        orderBy: { order: "asc" },
        take: 1,
      },
      _count: {
        select: {
          comments: true,
          flags: true,
        },
      },
    },
  });

  const categoryLabel = CATEGORY_LABELS[categoryEnum] || category;

  return (
    <div className="relative min-h-screen bg-zinc-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href={`/local/${locationSlug}`}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {locationName}
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                <MapPin className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{categoryLabel} in {locationName}</h1>
                <p className="text-zinc-400">{listings.length} listing{listings.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
          </div>
          <Link
            href="/my-listings/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-zinc-900 rounded-lg bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/20"
          >
            <Plus className="h-4 w-4" />
            Post a Listing
          </Link>
        </div>

        <div className="mb-8">
          <LocalCategoryFilter locationSlug={locationSlug} currentCategory={category} />
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-zinc-800/50 bg-zinc-900/50">
            <MapPin className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-white mb-2">
              No {categoryLabel.toLowerCase()} listings in {locationName} yet
            </h2>
            <p className="text-zinc-400 mb-6">
              Be the first to post!
            </p>
            <Link
              href="/my-listings/new"
              className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {listings.map((listing) => (
              <LocalListingCard
                key={listing.id}
                listing={{
                  ...listing,
                  activatedAt: listing.activatedAt?.toISOString() || null,
                  expiresAt: listing.expiresAt?.toISOString() || null,
                  createdAt: listing.createdAt.toISOString(),
                  updatedAt: listing.updatedAt.toISOString(),
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
