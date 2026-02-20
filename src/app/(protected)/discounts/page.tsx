import { Suspense } from "react";
import { Loader2, Ticket } from "lucide-react";
import { DiscountFilters } from "@/components/discounts/discount-filters";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isProMember } from "@/lib/stripe-subscription";
import { DiscountsPageClient } from "./discounts-page-client";

export const metadata = {
  title: "Discounts | Builders",
  description:
    "Exclusive discounts from builders for builders. Save on tools, SaaS, courses, and more.",
};

const FREE_DISCOUNT_LIMIT = 2;

export default async function DiscountsPage() {
  const session = await auth();

  const [totalDiscountCount, isPro, userDiscountCount] = await Promise.all([
    prisma.discount.count({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    }),
    session?.user?.id ? isProMember(session.user.id) : Promise.resolve(false),
    session?.user?.id
      ? prisma.discount.count({ where: { userId: session.user.id } })
      : Promise.resolve(0),
  ]);

  const canCreateMore = isPro || userDiscountCount < FREE_DISCOUNT_LIMIT;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">Discounts</h1>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              <Ticket className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">
                {totalDiscountCount.toLocaleString()}
              </span>
            </div>
          </div>
          <p className="text-zinc-400 mt-1">
            Exclusive discounts from builders for builders. Save on tools, SaaS,
            courses, and more.
          </p>
        </div>
        <DiscountsPageClient
          canCreateMore={canCreateMore}
          isPro={isPro}
          userDiscountCount={userDiscountCount}
          freeLimit={FREE_DISCOUNT_LIMIT}
        />
      </div>

      {/* Pro upgrade hint for free users at limit */}
      {!isPro && userDiscountCount >= FREE_DISCOUNT_LIMIT && (
        <div className="mb-8 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-4">
          <p className="text-sm text-emerald-400">
            You&apos;ve used {userDiscountCount}/{FREE_DISCOUNT_LIMIT} free
            discount slots.{" "}
            <a
              href="/settings/subscription"
              className="underline hover:text-emerald-300"
            >
              Upgrade to Pro
            </a>{" "}
            for unlimited discounts.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="mb-8">
        <Suspense fallback={<div className="h-[88px]" />}>
          <DiscountFilters />
        </Suspense>
      </div>

      {/* Discounts Grid */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        }
      >
        <DiscountsPageClient
          canCreateMore={canCreateMore}
          isPro={isPro}
          userDiscountCount={userDiscountCount}
          freeLimit={FREE_DISCOUNT_LIMIT}
          showGrid
        />
      </Suspense>
    </div>
  );
}
