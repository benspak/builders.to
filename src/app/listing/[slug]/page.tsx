import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  MapPin, ArrowLeft, Clock, Edit, DollarSign,
  User, MessageSquare, Users, Wrench, Home, ShoppingBag, Calendar, AlertCircle
} from "lucide-react";
import { formatRelativeTime, cn } from "@/lib/utils";
import { LocalListingComments } from "@/components/local/local-listing-comments";
import { LocalFlagButton } from "@/components/local/local-flag-button";
import { LocalRating } from "@/components/local/local-rating";
import { EntityViewTracker } from "@/components/analytics/entity-view-tracker";
import { ViewStatsDisplay } from "@/components/analytics/view-stats";
import { ListingContactLink } from "@/components/local/listing-contact-link";
import {
  CATEGORY_LABELS, CATEGORY_COLORS, STATUS_LABELS, STATUS_COLORS,
  LocalListingCategory, LocalListingStatus
} from "@/components/local/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const CategoryIcons = {
  COMMUNITY: Users,
  SERVICES: Wrench,
  DISCUSSION: MessageSquare,
  COWORKING_HOUSING: Home,
  FOR_SALE: ShoppingBag,
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;

  const listing = await prisma.localListing.findUnique({
    where: { slug },
    select: { title: true, description: true, city: true, state: true, category: true },
  });

  if (!listing) {
    return { title: "Listing Not Found" };
  }

  return {
    title: `${listing.title} - ${listing.city}, ${listing.state} | Builders.to`,
    description: listing.description.slice(0, 160),
  };
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await auth();

  const listing = await prisma.localListing.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          displayName: true,
          image: true,
          slug: true,
          headline: true,
          createdAt: true,
          _count: {
            select: {
              localListings: {
                where: { status: "ACTIVE" },
              },
            },
          },
        },
      },
      images: {
        orderBy: { order: "asc" },
      },
      feedEvents: {
        take: 1,
        include: {
          _count: {
            select: {
              comments: true,
            },
          },
        },
      },
      _count: {
        select: {
          flags: true,
        },
      },
    },
  });

  if (!listing) {
    notFound();
  }

  const isOwner = session?.user?.id === listing.userId;

  // Non-owners can only see active listings
  if (!isOwner && listing.status !== "ACTIVE") {
    notFound();
  }

  // Check if expired
  const isExpired = listing.expiresAt && new Date(listing.expiresAt) < new Date();
  if (!isOwner && isExpired) {
    notFound();
  }

  // Get user's rating stats
  const ratingStats = await prisma.localListingRating.aggregate({
    where: { ratedUserId: listing.userId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const CategoryIcon = CategoryIcons[listing.category as LocalListingCategory];
  const displayName = listing.user.displayName || listing.user.name || "Anonymous";

  return (
    <div className="relative min-h-screen bg-zinc-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Track page view */}
        <EntityViewTracker entityType="listing" entityId={listing.id} />

        {/* Back link */}
        <Link
          href={`/${listing.locationSlug}`}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {listing.city}, {listing.state}
        </Link>

        {/* Status banners for owner */}
        {isOwner && listing.status !== "ACTIVE" && (
          <div className={cn(
            "rounded-lg border p-4 mb-6",
            listing.status === "DRAFT" && "bg-zinc-800/50 border-zinc-700",
            listing.status === "PENDING_PAYMENT" && "bg-amber-500/10 border-amber-500/20",
            listing.status === "EXPIRED" && "bg-red-500/10 border-red-500/20",
            listing.status === "FLAGGED" && "bg-orange-500/10 border-orange-500/20",
          )}>
            <div className="flex items-center gap-3">
              <AlertCircle className={cn(
                "h-5 w-5",
                listing.status === "DRAFT" && "text-zinc-400",
                listing.status === "PENDING_PAYMENT" && "text-amber-400",
                listing.status === "EXPIRED" && "text-red-400",
                listing.status === "FLAGGED" && "text-orange-400",
              )} />
              <div>
                <p className="font-medium text-white">
                  {STATUS_LABELS[listing.status as LocalListingStatus]}
                </p>
                {listing.status === "PENDING_PAYMENT" && (
                  <p className="text-sm text-zinc-400">
                    Complete payment to activate your listing.
                  </p>
                )}
                {listing.status === "EXPIRED" && (
                  <p className="text-sm text-zinc-400">
                    Your listing has expired. Create a new one to continue.
                  </p>
                )}
              </div>
              {listing.status === "PENDING_PAYMENT" && (
                <Link
                  href={`/api/local-listings/${listing.id}/checkout`}
                  className="ml-auto px-4 py-2 text-sm font-semibold text-zinc-900 rounded-lg bg-amber-500 hover:bg-amber-600 transition-colors"
                >
                  Complete Payment
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6">
              {/* Category & Status badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium border",
                    CATEGORY_COLORS[listing.category as LocalListingCategory]
                  )}
                >
                  <CategoryIcon className="h-4 w-4" />
                  {CATEGORY_LABELS[listing.category as LocalListingCategory]}
                </span>
                {listing.category === "SERVICES" && listing.priceInCents && (
                  <span className="inline-flex items-center gap-1 text-sm text-emerald-400 font-semibold">
                    <DollarSign className="h-4 w-4" />
                    {(listing.priceInCents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}
                  </span>
                )}
                {isOwner && listing.status !== "ACTIVE" && (
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border",
                      STATUS_COLORS[listing.status as LocalListingStatus]
                    )}
                  >
                    {STATUS_LABELS[listing.status as LocalListingStatus]}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                {listing.title}
              </h1>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {listing.city}, {listing.state}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  Posted {formatRelativeTime(listing.createdAt)}
                </div>
                {listing.expiresAt && !isExpired && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Expires {formatRelativeTime(listing.expiresAt)}
                  </div>
                )}
              </div>

              {/* Owner actions and stats */}
              {isOwner && (
                <div className="mt-4 pt-4 border-t border-zinc-800 space-y-4">
                  {/* View Stats */}
                  <ViewStatsDisplay
                    entityType="listing"
                    entityId={listing.id}
                    showCtr={true}
                  />

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/my-listings/${listing.id}/edit`}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-300 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Listing
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Images */}
            {listing.images.length > 0 && (
              <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Photos</h2>
                <div className="grid grid-cols-2 gap-4">
                  {listing.images.map((image, index) => (
                    <div
                      key={image.id}
                      className={cn(
                        "relative rounded-lg overflow-hidden bg-zinc-800",
                        index === 0 && listing.images.length > 1 && "col-span-2"
                      )}
                    >
                      <Image
                        src={image.url}
                        alt={image.caption || listing.title}
                        width={800}
                        height={600}
                        className="object-cover w-full h-auto"
                      />
                      {image.caption && (
                        <p className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-sm text-white">
                          {image.caption}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Description</h2>
              <div className="prose prose-invert prose-sm max-w-none">
                <p className="text-zinc-300 whitespace-pre-wrap">
                  {listing.description}
                </p>
              </div>
            </div>

            {/* Comments */}
            <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6">
              <LocalListingComments
                listingId={listing.id}
                initialCommentCount={listing.feedEvents[0]?._count?.comments ?? 0}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact card */}
            <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
              <div className="space-y-3">
                {listing.contactUrl ? (
                  <ListingContactLink
                    listingId={listing.id}
                    contactUrl={listing.contactUrl}
                  />
                ) : (
                  <p className="text-sm text-zinc-500">
                    No contact link provided. Use comments to reach out.
                  </p>
                )}
              </div>
            </div>

            {/* Poster info */}
            <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Posted by</h3>
              <Link
                href={listing.user.slug ? `/${listing.user.slug}` : "#"}
                className="flex items-center gap-3 mb-4 group"
              >
                {listing.user.image ? (
                  <Image
                    src={listing.user.image}
                    alt={displayName}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center">
                    <User className="h-6 w-6 text-zinc-500" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-white group-hover:text-orange-400 transition-colors">
                    {displayName}
                  </p>
                  {listing.user.headline && (
                    <p className="text-sm text-zinc-500 line-clamp-1">
                      {listing.user.headline}
                    </p>
                  )}
                </div>
              </Link>

              {/* Rating */}
              <div className="mb-4">
                <LocalRating
                  listingId={listing.id}
                  ratedUserId={listing.userId}
                  initialRating={{
                    average: ratingStats._avg.rating || 0,
                    count: ratingStats._count.rating || 0,
                  }}
                />
              </div>

              {/* Stats */}
              <div className="text-sm text-zinc-500 space-y-1">
                <p>
                  {listing.user._count.localListings} active listing{listing.user._count.localListings !== 1 ? "s" : ""}
                </p>
                <p>
                  Member since {new Date(listing.user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </p>
              </div>
            </div>

            {/* Report */}
            {!isOwner && (
              <div className="flex justify-center">
                <LocalFlagButton listingId={listing.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
