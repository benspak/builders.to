import { Suspense } from "react";
import Link from "next/link";
import { Megaphone, Plus, Loader2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { AdCard } from "@/components/ads";

export const metadata = {
  title: "My Ads - Builders.to",
  description: "Manage your sidebar advertisements",
};

export const dynamic = "force-dynamic";

async function AdsList() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const ads = await prisma.advertisement.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { views: true },
      },
    },
  });

  if (ads.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <Megaphone className="h-8 w-8 text-emerald-500/60" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No Ads Yet</h3>
        <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
          Create your first ad to reach thousands of builders on the Builders.to feed.
          Each ad runs for 30 days for just $50.
        </p>
        <Link
          href="/ads/new"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="h-4 w-4" />
          Create Your First Ad
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ads.map((ad) => (
        <AdCard
          key={ad.id}
          ad={{
            ...ad,
            startDate: ad.startDate?.toISOString() || null,
            endDate: ad.endDate?.toISOString() || null,
            createdAt: ad.createdAt.toISOString(),
          }}
        />
      ))}
    </div>
  );
}

export default function AdsPage() {
  return (
    <div className="relative min-h-screen bg-zinc-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-teal-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
              <Megaphone className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">My Ads</h1>
              <p className="text-zinc-400 text-sm">
                Manage your sidebar advertisements
              </p>
            </div>
          </div>

          <Link
            href="/ads/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus className="h-4 w-4" />
            Create Ad
          </Link>
        </div>

        {/* Info Card */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 shrink-0">
              <Megaphone className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-emerald-400 mb-1">
                Reach Builders Where They Are
              </h3>
              <p className="text-xs text-zinc-400">
                Your ad will be displayed in the feed sidebar, seen by thousands of builders daily.
                Each ad runs for 30 days for a flat $50 fee (non-refundable once active).
              </p>
            </div>
          </div>
        </div>

        {/* Ads List */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          }
        >
          <AdsList />
        </Suspense>
      </div>
    </div>
  );
}
