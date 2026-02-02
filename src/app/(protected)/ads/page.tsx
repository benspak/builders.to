import { Suspense } from "react";
import Link from "next/link";
import { Megaphone, Plus, Loader2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PLATFORM_AD_SLOTS, getCurrentAdPriceCents, formatAdPrice } from "@/lib/stripe";
import { AdsList } from "./ads-list";

export const metadata = {
  title: "My Ads - Builders.to",
  description: "Manage your sidebar advertisements",
};

export const dynamic = "force-dynamic";

async function AdsListServer() {
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

  // Get platform pricing info
  const now = new Date();
  const platformActiveCount = await prisma.advertisement.count({
    where: {
      status: "ACTIVE",
      startDate: { lte: now },
      endDate: { gt: now },
    },
  });

  let pricingConfig = await prisma.adPricingConfig.findUnique({
    where: { id: "singleton" },
  });

  if (!pricingConfig) {
    pricingConfig = await prisma.adPricingConfig.create({
      data: { id: "singleton", currentTier: 0 },
    });
  }

  const currentPriceFormatted = formatAdPrice(getCurrentAdPriceCents(pricingConfig.currentTier));
  const availableSlots = Math.max(0, PLATFORM_AD_SLOTS - platformActiveCount);

  if (ads.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <Megaphone className="h-8 w-8 text-emerald-500/60" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No Ads Yet</h3>
        <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
          Create your first ad to reach thousands of builders on the Builders.to feed.
          {availableSlots > 0
            ? ` Each ad runs for 30 days for ${currentPriceFormatted}. ${availableSlots} of ${PLATFORM_AD_SLOTS} slots available.`
            : ` All ${PLATFORM_AD_SLOTS} slots are currently filled. Create your ad to be ready when a slot opens.`
          }
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

  // Pass serialized ads to the client component
  const serializedAds = ads.map((ad) => ({
    ...ad,
    startDate: ad.startDate?.toISOString() || null,
    endDate: ad.endDate?.toISOString() || null,
    createdAt: ad.createdAt.toISOString(),
  }));

  return <AdsList initialAds={serializedAds} />;
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
                Limited to {PLATFORM_AD_SLOTS} ad slots platform-wide. Price increases when slots fill up to ensure quality exposure for advertisers.
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
          <AdsListServer />
        </Suspense>
      </div>
    </div>
  );
}
