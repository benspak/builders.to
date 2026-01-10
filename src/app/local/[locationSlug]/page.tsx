import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MapPin, Plus, ArrowLeft, Users, Building2, Briefcase } from "lucide-react";
import { LocalListingCard } from "@/components/local/local-listing-card";
import { LocalCategoryFilter } from "@/components/local/local-category-filter";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locationSlug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locationSlug } = await params;

  // Try to find location name from listings or users
  const listing = await prisma.localListing.findFirst({
    where: { locationSlug },
    select: { city: true, state: true },
  });

  const locationName = listing
    ? `${listing.city}, ${listing.state}`
    : locationSlug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return {
    title: `${locationName} - Local Classifieds | Builders.to`,
    description: `Find local services, jobs, and classifieds in ${locationName}. Connect with builders in your area.`,
  };
}

export default async function LocationPage({ params }: PageProps) {
  const { locationSlug } = await params;

  // Get listings for this location
  const listings = await prisma.localListing.findMany({
    where: {
      locationSlug,
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

  // Get builders in this location
  const builderCount = await prisma.user.count({
    where: { locationSlug },
  });

  // Get companies in this location
  const companyCount = await prisma.company.count({
    where: { locationSlug },
  });

  // Get job count (company roles in this location)
  const jobCount = await prisma.companyRole.count({
    where: {
      isActive: true,
      company: { locationSlug },
    },
  });

  // Determine location name
  const firstListing = listings[0];
  let locationName = locationSlug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  if (firstListing) {
    locationName = `${firstListing.city}, ${firstListing.state}`;
  } else {
    // Try to get from user
    const user = await prisma.user.findFirst({
      where: { locationSlug },
      select: { city: true, state: true },
    });
    if (user?.city && user?.state) {
      locationName = `${user.city}, ${user.state}`;
    }
  }

  // Check if location has any data
  const hasData = listings.length > 0 || builderCount > 0 || companyCount > 0;

  if (!hasData) {
    notFound();
  }

  return (
    <div className="relative min-h-screen bg-zinc-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/local"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all locations
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                <MapPin className="h-6 w-6 text-emerald-400" />
              </div>
              <h1 className="text-3xl font-bold text-white">{locationName}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {builderCount} builder{builderCount !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                {companyCount} compan{companyCount !== 1 ? "ies" : "y"}
              </span>
              {jobCount > 0 && (
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Briefcase className="h-4 w-4" />
                  {jobCount} job{jobCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
          <Link
            href="/local/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-zinc-900 rounded-lg bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/20"
          >
            <Plus className="h-4 w-4" />
            Post a Listing
          </Link>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <LocalCategoryFilter locationSlug={locationSlug} includeJobs={jobCount > 0} />
        </div>

        {/* Listings */}
        {listings.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-zinc-800/50 bg-zinc-900/50">
            <MapPin className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-white mb-2">
              No listings yet in {locationName}
            </h2>
            <p className="text-zinc-400 mb-6">
              Be the first to post a listing in this area!
            </p>
            <Link
              href="/local/new"
              className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create First Listing
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
