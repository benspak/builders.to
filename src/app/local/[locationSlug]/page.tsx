import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CompanyCard } from "@/components/companies/company-card";
import { MapPin, Building2, ArrowLeft } from "lucide-react";
import { formatLocationSlug } from "@/lib/utils";

// Force dynamic rendering since this page fetches from database
export const dynamic = "force-dynamic";

interface LocationPageProps {
  params: Promise<{ locationSlug: string }>;
}

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const { locationSlug } = await params;

  // Get the first company with this location to get the display name
  const company = await prisma.company.findFirst({
    where: { locationSlug },
    select: { location: true },
  });

  if (!company) {
    return { title: "Location Not Found - Builders.to" };
  }

  const locationName = company.location || formatLocationSlug(locationSlug);

  return {
    title: `Companies in ${locationName} - Builders Local | Builders.to`,
    description: `Discover companies building amazing products in ${locationName}. Connect with local builders and explore the tech ecosystem.`,
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

  if (companies.length === 0) {
    notFound();
  }

  // Get the location display name from the first company
  const locationName = companies[0].location || formatLocationSlug(locationSlug);

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
              <p className="text-zinc-400">
                {companies.length} {companies.length === 1 ? "company" : "companies"} building here
              </p>
            </div>
          </div>
        </div>

        {/* Companies Grid */}
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

        {/* Browse More */}
        <div className="mt-12 text-center">
          <p className="text-zinc-500 mb-4">
            Looking for companies in other locations?
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
