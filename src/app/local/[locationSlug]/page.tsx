import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CompanyCard } from "@/components/companies/company-card";
import { BuilderCard } from "@/components/profile/builder-card";
import { MapPin, Building2, ArrowLeft, Users } from "lucide-react";
import { formatLocationSlug } from "@/lib/utils";

// Force dynamic rendering since this page fetches from database
export const dynamic = "force-dynamic";

interface LocationPageProps {
  params: Promise<{ locationSlug: string }>;
}

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const { locationSlug } = await params;

  // Get the first company or user with this location to get the display name
  const company = await prisma.company.findFirst({
    where: { locationSlug },
    select: { location: true },
  });

  const user = await prisma.user.findFirst({
    where: { locationSlug },
    select: { city: true, state: true },
  });

  let locationName: string;
  if (company?.location) {
    locationName = company.location;
  } else if (user?.city && user?.state) {
    locationName = `${user.city}, ${user.state}`;
  } else {
    locationName = formatLocationSlug(locationSlug);
  }

  return {
    title: `Builders & Companies in ${locationName} - Builders Local | Builders.to`,
    description: `Discover talented builders and innovative companies in ${locationName}. Connect with local talent and explore the tech ecosystem.`,
  };
}

export default async function LocationPage({ params }: LocationPageProps) {
  const { locationSlug } = await params;

  // Get all companies in this location
  const companies = await prisma.company.findMany({
    where: { locationSlug },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          projects: true,
          roles: {
            where: { isActive: true },
          },
        },
      },
    },
  });

  // Get all builders in this location
  const builders = await prisma.user.findMany({
    where: { locationSlug },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      displayName: true,
      firstName: true,
      lastName: true,
      image: true,
      headline: true,
      city: true,
      state: true,
      openToWork: true,
      lookingForCofounder: true,
      availableForContract: true,
      currentStreak: true,
      _count: {
        select: {
          projects: true,
        },
      },
    },
  });

  if (companies.length === 0 && builders.length === 0) {
    notFound();
  }

  // Get the location display name
  let locationName: string;
  if (companies.length > 0 && companies[0].location) {
    locationName = companies[0].location;
  } else if (builders.length > 0 && builders[0].city && builders[0].state) {
    locationName = `${builders[0].city}, ${builders[0].state}`;
  } else {
    locationName = formatLocationSlug(locationSlug);
  }

  return (
    <div className="relative min-h-screen bg-zinc-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 -left-40 h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Link
          href="/local"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all locations
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30">
              <MapPin className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{locationName}</h1>
              <div className="flex items-center gap-4 text-zinc-400 text-sm mt-1">
                {builders.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {builders.length} {builders.length === 1 ? "builder" : "builders"}
                  </span>
                )}
                {companies.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    {companies.length} {companies.length === 1 ? "company" : "companies"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Builders Section */}
        {builders.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Users className="h-5 w-5 text-orange-400" />
              <h2 className="text-xl font-semibold text-white">Builders</h2>
              <span className="text-sm text-zinc-500">({builders.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {builders.map((builder) => (
                <BuilderCard key={builder.id} builder={builder} />
              ))}
            </div>
          </section>
        )}

        {/* Companies Section */}
        {companies.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="h-5 w-5 text-emerald-400" />
              <h2 className="text-xl font-semibold text-white">Companies</h2>
              <span className="text-sm text-zinc-500">({companies.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={{
                    ...company,
                    createdAt: company.createdAt.toISOString(),
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Browse More */}
        <div className="mt-12 text-center">
          <p className="text-zinc-500 mb-4">
            Looking for builders or companies in other locations?
          </p>
          <Link
            href="/local"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-6 py-3 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/30 transition-colors"
          >
            <MapPin className="h-4 w-4" />
            Browse All Locations
          </Link>
        </div>
      </div>
    </div>
  );
}
