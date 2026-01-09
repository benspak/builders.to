import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MapPin, Building2, ArrowRight, Globe, Users } from "lucide-react";

// Force dynamic rendering since this page fetches from database
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Builders Local - Discover Builders & Companies by Location | Builders.to",
  description: "Find builders and companies in your city. Connect with local talent and explore regional tech ecosystems.",
};

interface BuilderLocationData {
  location: string;
  locationSlug: string;
  count: number;
}

interface CompanyLocationData {
  location: string;
  locationSlug: string;
  count: number;
}

export default async function LocalPage() {
  // Get all unique locations with company counts
  const companies = await prisma.company.findMany({
    where: {
      locationSlug: { not: null },
    },
    select: {
      location: true,
      locationSlug: true,
    },
  });

  // Get all unique locations with builder counts
  const builders = await prisma.user.findMany({
    where: {
      locationSlug: { not: null },
    },
    select: {
      city: true,
      state: true,
      locationSlug: true,
    },
  });

  // Group builders by locationSlug
  const builderLocationMap = new Map<string, BuilderLocationData>();
  for (const builder of builders) {
    if (builder.locationSlug && builder.city && builder.state) {
      const location = `${builder.city}, ${builder.state}`;
      const existing = builderLocationMap.get(builder.locationSlug);
      if (existing) {
        existing.count += 1;
      } else {
        builderLocationMap.set(builder.locationSlug, {
          location,
          locationSlug: builder.locationSlug,
          count: 1,
        });
      }
    }
  }

  // Group companies by locationSlug
  const companyLocationMap = new Map<string, CompanyLocationData>();
  for (const company of companies) {
    if (company.locationSlug && company.location) {
      const existing = companyLocationMap.get(company.locationSlug);
      if (existing) {
        existing.count += 1;
      } else {
        companyLocationMap.set(company.locationSlug, {
          location: company.location,
          locationSlug: company.locationSlug,
          count: 1,
        });
      }
    }
  }

  // Convert to arrays and sort by count (descending)
  const builderLocations = Array.from(builderLocationMap.values())
    .sort((a, b) => b.count - a.count);

  const companyLocations = Array.from(companyLocationMap.values())
    .sort((a, b) => b.count - a.count);

  // Calculate totals
  const totalBuilders = builderLocations.reduce((sum, loc) => sum + loc.count, 0);
  const totalCompanies = companyLocations.reduce((sum, loc) => sum + loc.count, 0);
  const totalLocations = new Set([
    ...builderLocations.map(l => l.locationSlug),
    ...companyLocations.map(l => l.locationSlug)
  ]).size;

  const hasNoData = builderLocations.length === 0 && companyLocations.length === 0;

  return (
    <div className="relative min-h-screen bg-zinc-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-sm text-emerald-400 mb-6">
            <Globe className="h-4 w-4" />
            <span>Builders Local</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Discover Builders & Companies by Location
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Find talented builders and innovative companies in your city. Connect with local talent and explore regional tech ecosystems.
          </p>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-zinc-500">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {totalLocations} locations
            </span>
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {totalBuilders} builders
            </span>
            <span className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {totalCompanies} companies
            </span>
          </div>
        </div>

        {hasNoData ? (
          <div className="text-center py-20">
            <MapPin className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              No locations yet
            </h2>
            <p className="text-zinc-400 mb-6">
              Set your location in your profile to appear here.
            </p>
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
            >
              <MapPin className="h-4 w-4" />
              Set Your Location
            </Link>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Builders Section */}
            {builderLocations.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 border border-orange-500/30">
                    <Users className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Builders by Location</h2>
                    <p className="text-sm text-zinc-400">{totalBuilders} builders across {builderLocations.length} locations</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {builderLocations.map((loc) => (
                    <Link
                      key={loc.locationSlug}
                      href={`/local/${loc.locationSlug}`}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6 hover:border-orange-500/30 hover:bg-zinc-900/70 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-5 w-5 text-orange-400" />
                            <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors">
                              {loc.location}
                            </h3>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-zinc-400">
                            <Users className="h-3.5 w-3.5" />
                            {loc.count} {loc.count === 1 ? "builder" : "builders"}
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-zinc-600 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Companies Section */}
            {companyLocations.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                    <Building2 className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Companies by Location</h2>
                    <p className="text-sm text-zinc-400">{totalCompanies} companies across {companyLocations.length} locations</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {companyLocations.map((loc) => (
                    <Link
                      key={loc.locationSlug}
                      href={`/local/${loc.locationSlug}`}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6 hover:border-emerald-500/30 hover:bg-zinc-900/70 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-5 w-5 text-emerald-400" />
                            <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                              {loc.location}
                            </h3>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-zinc-400">
                            <Building2 className="h-3.5 w-3.5" />
                            {loc.count} {loc.count === 1 ? "company" : "companies"}
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
