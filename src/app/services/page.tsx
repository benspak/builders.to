import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Store, Loader2, User, Rocket, DollarSign, Clock, Filter, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { ServiceCategory } from "@prisma/client";

export const metadata = {
  title: "Services — Hire builders to launch faster | Builders.to",
  description: "Hire verified builders from the Builders.to launch pad and social network. MVP builds, design, marketing, AI integrations, DevOps, and more.",
};

export const dynamic = "force-dynamic";

const categoryLabels: Record<ServiceCategory, string> = {
  MVP_BUILD: "MVP Build",
  DESIGN: "Design",
  MARKETING: "Marketing",
  AI_INTEGRATION: "AI Integration",
  DEVOPS: "DevOps",
  AUDIT: "Audit",
  OTHER: "Other",
};

const categoryColors: Record<ServiceCategory, string> = {
  MVP_BUILD: "bg-orange-500/10 text-orange-400 border-orange-500/30 hover:bg-orange-500/20",
  DESIGN: "bg-pink-500/10 text-pink-400 border-pink-500/30 hover:bg-pink-500/20",
  MARKETING: "bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20",
  AI_INTEGRATION: "bg-violet-500/10 text-violet-400 border-violet-500/30 hover:bg-violet-500/20",
  DEVOPS: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20",
  AUDIT: "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20",
  OTHER: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30 hover:bg-zinc-500/20",
};

interface ServicesListProps {
  category?: string;
  search?: string;
}

async function ServicesList({ category, search }: ServicesListProps) {
  const session = await auth();

  // Build where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    status: "ACTIVE",
    expiresAt: { gt: new Date() },
  };

  if (category && category !== "all") {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const services = await prisma.serviceListing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          displayName: true,
          firstName: true,
          lastName: true,
          image: true,
          slug: true,
          headline: true,
          _count: {
            select: {
              projects: { where: { status: "LAUNCHED" } },
            },
          },
        },
      },
      portfolioProjects: {
        take: 3,
        include: {
          project: {
            select: {
              id: true,
              title: true,
              imageUrl: true,
              _count: { select: { upvotes: true } },
            },
          },
        },
      },
      _count: {
        select: { orders: { where: { status: "COMPLETED" } } },
      },
    },
    take: 50,
  });

  if (services.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <Store className="h-8 w-8 text-amber-500/60" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No Services Found</h3>
        <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
          {search || category !== "all"
            ? "Try adjusting your filters or search term."
            : "Be the first to list your services on the marketplace!"}
        </p>
        {session?.user && (
          <Link
            href="/services/seller"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-900 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 transition-all"
          >
            <Store className="h-4 w-4" />
            Become a Seller
          </Link>
        )}
      </div>
    );
  }

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => {
        const displayName =
          service.user.displayName ||
          (service.user.firstName && service.user.lastName
            ? `${service.user.firstName} ${service.user.lastName}`
            : null) ||
          service.user.name ||
          "Builder";

        const totalUpvotes = service.portfolioProjects.reduce(
          (sum, pp) => sum + pp.project._count.upvotes,
          0
        );

        return (
          <Link
            key={service.id}
            href={`/services/${service.slug || service.id}`}
            className="group rounded-xl border border-zinc-800/50 bg-zinc-900/50 overflow-hidden hover:border-amber-500/30 transition-all"
          >
            {/* Category Badge */}
            <div className="p-4 pb-0">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
                  categoryColors[service.category]
                )}
              >
                {categoryLabels[service.category]}
              </span>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors line-clamp-1 mb-2">
                {service.title}
              </h3>
              <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
                {service.description}
              </p>

              {/* Builder Info */}
              <div className="flex items-center gap-3 mb-4">
                {service.user.image ? (
                  <Image
                    src={service.user.image}
                    alt={displayName}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {displayName}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Rocket className="h-3 w-3" />
                      {service.user._count.projects} shipped
                    </span>
                    {service._count.orders > 0 && (
                      <span>• {service._count.orders} completed</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Portfolio Preview */}
              {service.portfolioProjects.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex -space-x-2">
                    {service.portfolioProjects.map((pp) => (
                      <div
                        key={pp.project.id}
                        className="h-7 w-7 rounded-md border-2 border-zinc-900 bg-zinc-800 overflow-hidden"
                        title={pp.project.title}
                      >
                        {pp.project.imageUrl ? (
                          <Image
                            src={pp.project.imageUrl}
                            alt={pp.project.title}
                            width={28}
                            height={28}
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[8px] text-zinc-500">
                            {pp.project.title.charAt(0)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {totalUpvotes > 0 && (
                    <span className="text-xs text-zinc-500">
                      {totalUpvotes} upvotes
                    </span>
                  )}
                </div>
              )}

              {/* Price and Delivery */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <DollarSign className="h-4 w-4" />
                  {formatPrice(service.priceInCents)}
                </span>
                <span className="flex items-center gap-1 text-xs text-zinc-500">
                  <Clock className="h-3 w-3" />
                  {service.deliveryDays} day{service.deliveryDays !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

interface ServicesPageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const session = await auth();
  const { category, q } = await searchParams;

  const categories: ServiceCategory[] = [
    "MVP_BUILD",
    "DESIGN",
    "MARKETING",
    "AI_INTEGRATION",
    "DEVOPS",
    "AUDIT",
    "OTHER",
  ];

  return (
    <div className="relative min-h-screen bg-zinc-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-orange-500/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Services Marketplace</h1>
              <p className="text-zinc-400 text-sm">
                Hire verified builders with proven track records
              </p>
            </div>
          </div>

          {session?.user && (
            <Link
              href="/services/seller"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-zinc-900 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/20"
            >
              <Store className="h-4 w-4" />
              Sell Services
            </Link>
          )}
        </div>

        {/* Value Prop */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 shrink-0">
              <Rocket className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-amber-400 mb-1">
                Credibility-First Marketplace — No Platform Fees
              </h3>
              <p className="text-xs text-zinc-400">
                Every seller has at least 1 launched project. See their proof of work before you hire.
                No bids, no races to the bottom—just verified builders with real track records.
                Sellers keep 100% of their earnings.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <form className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search services..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </form>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Filter className="h-4 w-4 text-zinc-500 shrink-0" />
            <Link
              href="/services"
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                !category || category === "all"
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  : "bg-zinc-800/50 text-zinc-400 border-zinc-700 hover:bg-zinc-800"
              )}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/services?category=${cat}`}
                className={cn(
                  "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  category === cat
                    ? categoryColors[cat]
                    : "bg-zinc-800/50 text-zinc-400 border-zinc-700 hover:bg-zinc-800"
                )}
              >
                {categoryLabels[cat]}
              </Link>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          }
        >
          <ServicesList category={category} search={q} />
        </Suspense>
      </div>
    </div>
  );
}
