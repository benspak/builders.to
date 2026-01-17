import Link from "next/link";
import { Globe, ArrowLeft, Users, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BuildersMapClient } from "@/components/map/map-wrapper";

export const metadata = {
  title: "Builder Map | Builders.to — See where builders are located worldwide",
  description:
    "Explore the global builder community. See where entrepreneurs, makers, and founders are located around the world on our interactive map.",
  openGraph: {
    title: "Builder Map | Builders.to",
    description: "Explore the global builder community on our interactive world map.",
  },
};

export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const [totalUsers, usersWithLocation] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          OR: [
            { city: { not: null } },
            { AND: [{ latitude: { not: null } }, { longitude: { not: null } }] },
          ],
        },
      }),
    ]);
    return { totalUsers, usersWithLocation };
  } catch {
    return { totalUsers: 0, usersWithLocation: 0 };
  }
}

export default async function MapPage() {
  const stats = await getStats();

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute top-1/4 -left-40 h-[500px] w-[500px] rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Builder World Map
                </h1>
              </div>
              <p className="text-zinc-400">
                Explore where entrepreneurs, makers, and founders are building around the world.
              </p>
            </div>

            {/* Stats cards */}
            <div className="flex gap-4">
              <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 px-4 py-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-orange-500" />
                  <span className="text-white font-semibold">{stats.totalUsers.toLocaleString()}</span>
                  <span className="text-zinc-500">total</span>
                </div>
              </div>
              <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 px-4 py-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-cyan-500" />
                  <span className="text-white font-semibold">{stats.usersWithLocation.toLocaleString()}</span>
                  <span className="text-zinc-500">on map</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <BuildersMapClient />

        {/* CTA Section */}
        <div className="mt-12 rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-cyan-500/5 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Not on the map yet?
              </h2>
              <p className="text-zinc-400">
                Add your city to your profile to appear on the builder map and connect with nearby builders.
              </p>
            </div>
            <Link
              href="/settings"
              className="btn-primary shrink-0"
            >
              <MapPin className="h-4 w-4" />
              Update Your Location
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
