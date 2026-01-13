import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  User,
  ArrowLeft,
  DollarSign,
  Clock,
  Rocket,
  Star,
  CheckCircle2,
  ShoppingCart,
  ExternalLink,
  MessageCircle,
  Award,
} from "lucide-react";
import type { ServiceCategory } from "@prisma/client";
import { PurchaseButton } from "@/components/services/purchase-button";
import { ReportButton } from "@/components/ui/report-button";

interface ServicePageProps {
  params: Promise<{ id: string }>;
}

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
  MVP_BUILD: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  DESIGN: "bg-pink-500/10 text-pink-400 border-pink-500/30",
  MARKETING: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  AI_INTEGRATION: "bg-violet-500/10 text-violet-400 border-violet-500/30",
  DEVOPS: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  AUDIT: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  OTHER: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
};

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { id } = await params;

  const service = await prisma.serviceListing.findFirst({
    where: {
      OR: [{ slug: id }, { id }],
    },
    select: {
      title: true,
      description: true,
      user: {
        select: { name: true, displayName: true },
      },
    },
  });

  if (!service) {
    return { title: "Service Not Found - Builders.to" };
  }

  const sellerName = service.user.displayName || service.user.name || "Builder";

  return {
    title: `${service.title} by ${sellerName} - Builders.to`,
    description: service.description.slice(0, 160),
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { id } = await params;
  const session = await auth();

  const service = await prisma.serviceListing.findFirst({
    where: {
      OR: [{ slug: id }, { id }],
    },
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
          bio: true,
          createdAt: true,
          currentStreak: true,
          longestStreak: true,
          _count: {
            select: {
              projects: { where: { status: "LAUNCHED" } },
              endorsementsReceived: true,
              followers: true,
            },
          },
          projects: {
            where: { status: "LAUNCHED" },
            select: {
              id: true,
              title: true,
              slug: true,
              imageUrl: true,
              tagline: true,
              _count: { select: { upvotes: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 6,
          },
        },
      },
      portfolioProjects: {
        include: {
          project: {
            select: {
              id: true,
              title: true,
              tagline: true,
              slug: true,
              imageUrl: true,
              status: true,
              url: true,
              _count: { select: { upvotes: true, comments: true } },
            },
          },
        },
      },
      _count: {
        select: {
          orders: { where: { status: "COMPLETED" } },
        },
      },
    },
  });

  if (!service) {
    notFound();
  }

  // Check if listing is viewable
  const isOwner = session?.user?.id === service.userId;
  const isActive = service.status === "ACTIVE" && service.expiresAt && new Date(service.expiresAt) > new Date();

  if (!isOwner && !isActive) {
    notFound();
  }

  const displayName =
    service.user.displayName ||
    (service.user.firstName && service.user.lastName
      ? `${service.user.firstName} ${service.user.lastName}`
      : null) ||
    service.user.name ||
    "Builder";

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const totalUpvotes = service.user.projects.reduce((sum, p) => sum + p._count.upvotes, 0);
  const memberSince = new Date(service.user.createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="relative min-h-screen bg-zinc-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Service Header */}
            <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6">
              <div className="flex items-start gap-4 mb-4">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium border",
                    categoryColors[service.category]
                  )}
                >
                  {categoryLabels[service.category]}
                </span>
                {service._count.orders > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    {service._count.orders} orders completed
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                {service.title}
              </h1>

              {/* Price and Delivery - Mobile */}
              <div className="lg:hidden flex items-center gap-6 mb-6 p-4 rounded-lg bg-zinc-800/50">
                <div>
                  <span className="text-xs text-zinc-500">Starting at</span>
                  <p className="text-2xl font-bold text-emerald-400">
                    {formatPrice(service.priceInCents)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-zinc-500">Delivery</span>
                  <p className="text-lg font-medium text-white flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {service.deliveryDays} day{service.deliveryDays !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="prose prose-invert prose-zinc max-w-none">
                <p className="text-zinc-300 whitespace-pre-wrap">
                  {service.description}
                </p>
              </div>
            </div>

            {/* Proof of Work */}
            <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Rocket className="h-5 w-5 text-amber-400" />
                <h2 className="text-lg font-semibold text-white">Proof of Work</h2>
              </div>

              {service.portfolioProjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {service.portfolioProjects.map((pp) => (
                    <Link
                      key={pp.project.id}
                      href={`/projects/${pp.project.slug || pp.project.id}`}
                      className="group flex gap-4 p-4 rounded-lg border border-zinc-700/50 bg-zinc-800/30 hover:border-amber-500/30 transition-colors"
                    >
                      <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-800">
                        {pp.project.imageUrl ? (
                          <Image
                            src={pp.project.imageUrl}
                            alt={pp.project.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Rocket className="h-6 w-6 text-zinc-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white group-hover:text-amber-400 transition-colors truncate">
                          {pp.project.title}
                        </h3>
                        <p className="text-xs text-zinc-500 line-clamp-1">
                          {pp.project.tagline}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {pp.project._count.upvotes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {pp.project._count.comments}
                          </span>
                          {pp.project.url && (
                            <span className="flex items-center gap-1 text-emerald-400">
                              <ExternalLink className="h-3 w-3" />
                              Live
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">
                  No specific projects linked to this service.
                </p>
              )}

              {/* All Launched Projects */}
              {service.user.projects.length > service.portfolioProjects.length && (
                <div className="mt-6 pt-6 border-t border-zinc-800">
                  <p className="text-sm text-zinc-400 mb-4">
                    {displayName} has shipped {service.user._count.projects} project{service.user._count.projects !== 1 ? "s" : ""} total
                  </p>
                  <Link
                    href={`/${service.user.slug}`}
                    className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    View all projects →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card - Desktop */}
            <div className="hidden lg:block rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6 sticky top-6">
              <div className="mb-6">
                <span className="text-xs text-zinc-500">Starting at</span>
                <p className="text-3xl font-bold text-emerald-400">
                  {formatPrice(service.priceInCents)}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-zinc-400 mb-6">
                <Clock className="h-4 w-4" />
                <span>
                  {service.deliveryDays} day{service.deliveryDays !== 1 ? "s" : ""} delivery
                </span>
              </div>

              {/* What's Included */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-zinc-300">Direct communication with seller</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-zinc-300">Secure payment with escrow</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-zinc-300">Verified builder with track record</span>
                </div>
              </div>

              {isOwner ? (
                <Link
                  href={`/services/${service.id}/edit`}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-lg bg-zinc-700 hover:bg-zinc-600 transition-colors"
                >
                  Edit Listing
                </Link>
              ) : (
                <PurchaseButton
                  serviceId={service.id}
                  serviceTitle={service.title}
                  priceInCents={service.priceInCents}
                  sellerId={service.userId}
                  isLoggedIn={!!session?.user}
                />
              )}
            </div>

            {/* Seller Card */}
            <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-amber-400" />
                <h2 className="text-lg font-semibold text-white">About the Seller</h2>
              </div>

              <Link
                href={`/${service.user.slug}`}
                className="flex items-center gap-3 mb-4 group"
              >
                {service.user.image ? (
                  <Image
                    src={service.user.image}
                    alt={displayName}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                    {displayName}
                  </h3>
                  {service.user.headline && (
                    <p className="text-xs text-zinc-500 line-clamp-1">
                      {service.user.headline}
                    </p>
                  )}
                </div>
              </Link>

              {/* Builder Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-zinc-800/50 text-center">
                  <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                    <Rocket className="h-4 w-4" />
                    <span className="text-lg font-bold">{service.user._count.projects}</span>
                  </div>
                  <span className="text-xs text-zinc-500">Shipped</span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-800/50 text-center">
                  <div className="flex items-center justify-center gap-1 text-violet-400 mb-1">
                    <Star className="h-4 w-4" />
                    <span className="text-lg font-bold">{totalUpvotes}</span>
                  </div>
                  <span className="text-xs text-zinc-500">Upvotes</span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-800/50 text-center">
                  <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1">
                    <Award className="h-4 w-4" />
                    <span className="text-lg font-bold">{service.user._count.endorsementsReceived}</span>
                  </div>
                  <span className="text-xs text-zinc-500">Endorsements</span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-800/50 text-center">
                  <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
                    <User className="h-4 w-4" />
                    <span className="text-lg font-bold">{service.user._count.followers}</span>
                  </div>
                  <span className="text-xs text-zinc-500">Followers</span>
                </div>
              </div>

              <p className="text-xs text-zinc-500">
                Member since {memberSince}
                {service.user.currentStreak > 0 && (
                  <> • 🔥 {service.user.currentStreak} day streak</>
                )}
              </p>

              {service.user.bio && (
                <p className="mt-4 text-sm text-zinc-400 line-clamp-3">
                  {service.user.bio}
                </p>
              )}

              <Link
                href={`/${service.user.slug}`}
                className="mt-4 block text-sm text-amber-400 hover:text-amber-300 transition-colors"
              >
                View full profile →
              </Link>

              {/* Report this listing */}
              {!isOwner && session?.user && (
                <div className="mt-4 pt-4 border-t border-zinc-800/50">
                  <ReportButton
                    contentType="SERVICE_LISTING"
                    contentId={service.id}
                    variant="full"
                  />
                </div>
              )}
            </div>

            {/* Mobile Purchase Button */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/95 backdrop-blur border-t border-zinc-800 z-50">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-zinc-500">Starting at</span>
                  <p className="text-xl font-bold text-emerald-400">
                    {formatPrice(service.priceInCents)}
                  </p>
                </div>
                {isOwner ? (
                  <Link
                    href={`/services/${service.id}/edit`}
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-lg bg-zinc-700"
                  >
                    Edit
                  </Link>
                ) : (
                  <PurchaseButton
                    serviceId={service.id}
                    serviceTitle={service.title}
                    priceInCents={service.priceInCents}
                    sellerId={service.userId}
                    isLoggedIn={!!session?.user}
                    compact
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Padding for Mobile CTA */}
        <div className="lg:hidden h-24" />
      </div>
    </div>
  );
}
