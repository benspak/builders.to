import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  User,
  Calendar,
  Link as LinkIcon,
  MapPin,
  Building2,
  Rocket,
  Settings,
  Sparkles,
  Briefcase,
  Users,
  Code,
  Flame,
  Star,
  MessageCircle,
  Store,
  DollarSign,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { FollowButton, FollowStats } from "@/components/profile";
import { formatRelativeTime, getStatusColor, getStatusLabel, getCategoryColor, getCategoryLabel, getMemberRoleLabel, getMemberRoleColor, getCompanyUrl, formatLocationSlug } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { UpdateForm, UpdateTimeline } from "@/components/updates";
import { CompanyCard } from "@/components/companies/company-card";
import { BuilderCard } from "@/components/profile/builder-card";
import { LocalListingCard } from "@/components/local/local-listing-card";
import { Megaphone, Plus } from "lucide-react";

// Force dynamic rendering since this page fetches from database
export const dynamic = "force-dynamic";

// Social icons
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const TwitchIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
  </svg>
);

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Helper to check if slug is a location
async function getLocationData(locationSlug: string) {
  const [companies, builders, listings] = await Promise.all([
    prisma.company.findMany({
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
    }),
    prisma.user.findMany({
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
        country: true,
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
    }),
    prisma.localListing.findMany({
      where: {
        locationSlug,
        status: "ACTIVE",
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            displayName: true,
            image: true,
            slug: true,
          },
        },
        images: {
          orderBy: { order: "asc" },
          take: 1,
        },
        _count: {
          select: {
            comments: true,
            flags: true,
          },
        },
      },
    }),
  ]);

  if (companies.length === 0 && builders.length === 0 && listings.length === 0) {
    return null;
  }

  // Get the location display name
  let locationName: string;
  if (companies.length > 0 && companies[0].location) {
    locationName = companies[0].location;
  } else if (builders.length > 0 && builders[0].city) {
    const locationSuffix = builders[0].country || builders[0].state;
    locationName = locationSuffix ? `${builders[0].city}, ${locationSuffix}` : builders[0].city;
  } else if (listings.length > 0) {
    locationName = `${listings[0].city}, ${listings[0].state}`;
  } else {
    locationName = formatLocationSlug(locationSlug);
  }

  return { companies, builders, listings, locationName, locationSlug };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // First check if it's a user
  const user = await prisma.user.findUnique({
    where: { slug },
    select: { name: true, displayName: true, firstName: true, lastName: true, headline: true },
  });

  if (user) {
    // Priority: displayName > firstName+lastName > name
    const nameToDisplay = user.displayName
      || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null)
      || user.name
      || "Builder";

    return {
      title: `${nameToDisplay} - Builders.to`,
      description: user.headline || `${nameToDisplay}'s profile on Builders.to`,
    };
  }

  // Check if it's a location
  const company = await prisma.company.findFirst({
    where: { locationSlug: slug },
    select: { location: true },
  });

  const locationUser = await prisma.user.findFirst({
    where: { locationSlug: slug },
    select: { city: true, state: true, country: true },
  });

  if (company || locationUser) {
    let locationName: string;
    if (company?.location) {
      locationName = company.location;
    } else if (locationUser?.city) {
      const locationSuffix = locationUser.country || locationUser.state;
      locationName = locationSuffix ? `${locationUser.city}, ${locationSuffix}` : locationUser.city;
    } else {
      locationName = formatLocationSlug(slug);
    }

    return {
      title: `Builders & Companies in ${locationName} - Builders Local | Builders.to`,
      description: `Discover talented builders and innovative companies in ${locationName}. Connect with local talent and explore the tech ecosystem.`,
    };
  }

  return { title: "Not Found - Builders.to" };
}

export default async function SlugPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await auth();

  // First, try to find a user with this slug
  const user = await prisma.user.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      username: true,
      displayName: true,
      firstName: true,
      lastName: true,
      city: true,
      country: true,
      headline: true,
      bio: true,
      websiteUrl: true,
      twitterUrl: true,
      youtubeUrl: true,
      linkedinUrl: true,
      twitchUrl: true,
      featuredVideoUrl: true,
      image: true,
      createdAt: true,
      // Status
      status: true,
      statusUpdatedAt: true,
      // Intent flags
      openToWork: true,
      lookingForCofounder: true,
      availableForContract: true,
      // Streak tracking
      currentStreak: true,
      longestStreak: true,
      // Follow counts
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
      // Check if current user is following (will filter later)
      followers: session?.user?.id ? {
        where: { followerId: session.user.id },
        select: { id: true },
      } : false,
      projects: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          slug: true,
          title: true,
          tagline: true,
          status: true,
          imageUrl: true,
          createdAt: true,
          _count: {
            select: { upvotes: true, comments: true },
          },
        },
      },
      companies: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          slug: true,
          name: true,
          logo: true,
          location: true,
          locationSlug: true,
          category: true,
          about: true,
          createdAt: true,
          _count: {
            select: { projects: true },
          },
        },
      },
      // Companies where user is a team member (not owner)
      companyMemberships: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          role: true,
          createdAt: true,
          company: {
            select: {
              id: true,
              slug: true,
              name: true,
              logo: true,
              location: true,
              locationSlug: true,
              category: true,
              _count: {
                select: { projects: true },
              },
            },
          },
        },
      },
      dailyUpdates: {
        orderBy: { createdAt: "desc" },
        // Fetch all updates for SEO indexability
        select: {
          id: true,
          content: true,
          imageUrl: true,
          gifUrl: true,
          createdAt: true,
          likes: {
            select: {
              userId: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      },
      // Services marketplace listings
      serviceListings: {
        where: {
          status: "ACTIVE",
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          category: true,
          priceInCents: true,
          deliveryDays: true,
        },
      },
    },
  });

  // If no user found, check if it's a location page
  if (!user) {
    const locationData = await getLocationData(slug);

    if (!locationData) {
      notFound();
    }

    // Render location page
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
                <h1 className="text-3xl font-bold text-white">{locationData.locationName}</h1>
                <div className="flex items-center gap-4 text-zinc-400 text-sm mt-1">
                  {locationData.builders.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      {locationData.builders.length} {locationData.builders.length === 1 ? "builder" : "builders"}
                    </span>
                  )}
                  {locationData.companies.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4" />
                      {locationData.companies.length} {locationData.companies.length === 1 ? "company" : "companies"}
                    </span>
                  )}
                  {locationData.listings.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Megaphone className="h-4 w-4" />
                      {locationData.listings.length} {locationData.listings.length === 1 ? "listing" : "listings"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Builders Section */}
          {locationData.builders.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Users className="h-5 w-5 text-orange-400" />
                <h2 className="text-xl font-semibold text-white">Builders</h2>
                <span className="text-sm text-zinc-500">({locationData.builders.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {locationData.builders.map((builder) => (
                  <BuilderCard key={builder.id} builder={builder} />
                ))}
              </div>
            </section>
          )}

          {/* Companies Section */}
          {locationData.companies.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Building2 className="h-5 w-5 text-emerald-400" />
                <h2 className="text-xl font-semibold text-white">Companies</h2>
                <span className="text-sm text-zinc-500">({locationData.companies.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {locationData.companies.map((company) => (
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

          {/* Local Listings Section */}
          {locationData.listings.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-amber-400" />
                  <h2 className="text-xl font-semibold text-white">Local Listings</h2>
                  <span className="text-sm text-zinc-500">({locationData.listings.length})</span>
                </div>
                <Link
                  href="/my-listings/new"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-900 rounded-lg bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  Post a Listing
                </Link>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {locationData.listings.map((listing) => (
                  <LocalListingCard
                    key={listing.id}
                    listing={{
                      ...listing,
                      activatedAt: listing.activatedAt?.toISOString() || null,
                      expiresAt: listing.expiresAt?.toISOString() || null,
                      createdAt: listing.createdAt.toISOString(),
                      updatedAt: listing.updatedAt.toISOString(),
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

  // User profile page logic
  const isOwnProfile = session?.user?.id === user.id;
  // Priority: displayName > firstName+lastName > name
  const displayName = user.displayName
    || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null)
    || user.name
    || "Builder";

  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const socialLinks = [
    { url: user.twitterUrl, icon: XIcon, label: "X" },
    { url: user.youtubeUrl, icon: YouTubeIcon, label: "YouTube" },
    { url: user.twitchUrl, icon: TwitchIcon, label: "Twitch" },
    { url: user.linkedinUrl, icon: LinkedInIcon, label: "LinkedIn" },
  ].filter(link => link.url);

  // Compute credibility signals
  const launchedProjects = user.projects.filter(p => p.status === "LAUNCHED").length;
  const totalUpvotes = user.projects.reduce((sum, p) => sum + p._count.upvotes, 0);


  // Check if current user is following this profile
  const isFollowing = session?.user?.id && user.followers
    ? (Array.isArray(user.followers) ? user.followers.length > 0 : false)
    : false;

  // Follow counts
  const followersCount = user._count.followers;
  const followingCount = user._count.following;

  // Intent flags for display
  const intentFlags = [
    { active: user.openToWork, label: "Open to Work", icon: Briefcase, color: "emerald" },
    { active: user.lookingForCofounder, label: "Looking for Co-founder", icon: Users, color: "violet" },
    { active: user.availableForContract, label: "Available for Contract", icon: Code, color: "cyan" },
  ].filter(flag => flag.active);

  return (
    <div className="relative min-h-screen bg-zinc-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      {/* Hero Section */}
      <div className="relative border-b border-white/5">
        {/* Gradient banner */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-orange-600/20 via-orange-500/10 to-cyan-500/10" />

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-12 sm:-mt-14 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:gap-6">
              {/* Avatar */}
              <div className="relative">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={displayName}
                    width={96}
                    height={96}
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-4 border-zinc-950 object-cover shadow-2xl"
                  />
                ) : (
                  <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl border-4 border-zinc-950 bg-gradient-to-br from-orange-500 to-pink-500 shadow-2xl">
                    <User className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                  </div>
                )}
              </div>

              {/* Name and info */}
              <div className="mt-4 sm:mt-0 sm:pb-2 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                      {displayName}
                    </h1>
                    {user.username && (
                      <p className="text-sm text-orange-400">@{user.username}</p>
                    )}
                    {user.headline && (
                      <p className="mt-1 text-zinc-400 text-sm sm:text-base max-w-xl">
                        {user.headline}
                      </p>
                    )}

                    {/* Status */}
                    {user.status && (
                      <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500/10 to-cyan-500/10 border border-orange-500/20 px-4 py-2">
                        <MessageCircle className="h-4 w-4 text-orange-400 flex-shrink-0" />
                        <span className="text-sm text-zinc-200">{user.status}</span>
                      </div>
                    )}

                    {/* Intent Badges */}
                    {intentFlags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {intentFlags.map(({ label, icon: Icon, color }) => (
                          <span
                            key={label}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border",
                              color === "emerald" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                              color === "violet" && "bg-violet-500/10 border-violet-500/30 text-violet-400",
                              color === "cyan" && "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                            )}
                          >
                            <Icon className="h-3 w-3" />
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {isOwnProfile ? (
                      <Link
                        href="/settings"
                        className="inline-flex items-center gap-2 rounded-xl bg-zinc-800/50 border border-zinc-700/50 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
                      >
                        <Settings className="h-4 w-4" />
                        Edit Profile
                      </Link>
                    ) : (
                      <FollowButton
                        userId={user.id}
                        isFollowing={isFollowing}
                        currentUserId={session?.user?.id}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Meta info card */}
            <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6">
              <div className="space-y-4">
                {/* Joined date */}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-zinc-500" />
                  <span className="text-zinc-400">
                    Joined <span className="text-white">{joinedDate}</span>
                  </span>
                </div>

                {/* Location */}
                {(user.city || user.country) && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-300">
                      {user.city && user.country
                        ? `${user.city}, ${user.country}`
                        : user.city || user.country}
                    </span>
                  </div>
                )}

                {/* Website */}
                {user.websiteUrl && (
                  <div className="flex items-center gap-3 text-sm">
                    <LinkIcon className="h-4 w-4 text-zinc-500" />
                    <a
                      href={user.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-400 hover:text-orange-300 transition-colors truncate"
                    >
                      {user.websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </a>
                  </div>
                )}

                {/* Follow Stats */}
                <div className="pt-4 border-t border-white/5">
                  <FollowStats
                    userId={user.id}
                    followersCount={followersCount}
                    followingCount={followingCount}
                  />
                </div>

                {/* Stats */}
                <div className="pt-4 border-t border-white/5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 rounded-xl bg-zinc-800/30">
                      <div className="text-2xl font-bold text-white">{user.projects.length}</div>
                      <div className="text-xs text-zinc-400">Projects</div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-zinc-800/30">
                      <div className="text-2xl font-bold text-white">{user.companies.length + user.companyMemberships.length}</div>
                      <div className="text-xs text-zinc-400">Companies</div>
                    </div>
                  </div>
                </div>

                {/* Credibility Signals */}
                <div className="pt-4 border-t border-white/5 space-y-3">
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Builder Stats</h4>

                  {/* Shipped Projects */}
                  {launchedProjects > 0 && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20">
                        <Rocket className="h-4 w-4 text-orange-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          Shipped {launchedProjects} project{launchedProjects !== 1 ? "s" : ""}
                        </div>
                        <div className="text-xs text-zinc-500">Launched & live</div>
                      </div>
                    </div>
                  )}

                  {/* Streak */}
                  {(user.currentStreak > 0 || user.longestStreak > 0) && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
                        <Flame className="h-4 w-4 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {user.currentStreak > 0 ? `${user.currentStreak} day streak` : `Best: ${user.longestStreak} days`}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {user.currentStreak > 0 && user.longestStreak > user.currentStreak
                            ? `Best: ${user.longestStreak} days`
                            : "Consecutive updates"
                          }
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Upvotes */}
                  {totalUpvotes > 0 && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-transparent border border-violet-500/20">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20">
                        <Star className="h-4 w-4 text-violet-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {totalUpvotes} upvote{totalUpvotes !== 1 ? "s" : ""}
                        </div>
                        <div className="text-xs text-zinc-500">Community support</div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6">
                <h3 className="text-sm font-semibold text-white mb-4">Connect</h3>
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map(({ url, icon: Icon, label }) => (
                    <a
                      key={label}
                      href={url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-zinc-800/50 border border-zinc-700/50 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-orange-500/30 transition-all"
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            {user.bio && (
              <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6">
                <h3 className="text-sm font-semibold text-white mb-3">About</h3>
                <p className="text-sm text-zinc-400 whitespace-pre-wrap leading-relaxed">
                  {user.bio}
                </p>
              </div>
            )}
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Featured Content */}
            {user.featuredVideoUrl && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-purple-600">
                    <YouTubeIcon className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Featured Content</h2>
                </div>
                <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4">
                  {(() => {
                    // Extract video ID and create embed
                    const url = user.featuredVideoUrl!;
                    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
                    const twitchVideoMatch = url.match(/twitch\.tv\/videos\/(\d+)/);
                    const twitchClipMatch = url.match(/(?:clips\.twitch\.tv\/|twitch\.tv\/\w+\/clip\/)([^?\s]+)/);

                    if (youtubeMatch) {
                      return (
                        <div className="aspect-video rounded-lg overflow-hidden bg-zinc-800">
                          <iframe
                            src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      );
                    } else if (twitchVideoMatch) {
                      return (
                        <div className="aspect-video rounded-lg overflow-hidden bg-zinc-800">
                          <iframe
                            src={`https://player.twitch.tv/?video=${twitchVideoMatch[1]}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}&autoplay=false`}
                            className="w-full h-full"
                            allowFullScreen
                          />
                        </div>
                      );
                    } else if (twitchClipMatch) {
                      return (
                        <div className="aspect-video rounded-lg overflow-hidden bg-zinc-800">
                          <iframe
                            src={`https://clips.twitch.tv/embed?clip=${twitchClipMatch[1]}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}&autoplay=false`}
                            className="w-full h-full"
                            allowFullScreen
                          />
                        </div>
                      );
                    } else {
                      // Fallback to link
                      return (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-orange-500/30 transition-all"
                        >
                          <p className="text-sm text-zinc-400 truncate">{url}</p>
                          <p className="text-xs text-orange-400 mt-1">Watch video →</p>
                        </a>
                      );
                    }
                  })()}
                </div>
              </section>
            )}

            {/* Projects */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Rocket className="h-5 w-5 text-orange-500" />
                <h2 className="text-xl font-semibold text-white">Projects</h2>
                <span className="text-sm text-zinc-500">({user.projects.length})</span>
              </div>

              {user.projects.length > 0 ? (
                <div className="space-y-4">
                  {user.projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.slug || project.id}`}
                      className="block rounded-xl border border-white/10 bg-zinc-900/50 p-4 hover:border-orange-500/30 hover:bg-zinc-900/70 transition-all group"
                    >
                      <div className="flex gap-4">
                        {/* Thumbnail */}
                        <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                          {project.imageUrl ? (
                            <Image
                              src={project.imageUrl}
                              alt={project.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Rocket className="h-6 w-6 text-zinc-600" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-white group-hover:text-orange-400 transition-colors truncate">
                              {project.title}
                            </h3>
                            <span
                              className={cn(
                                "flex-shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
                                getStatusColor(project.status)
                              )}
                            >
                              {getStatusLabel(project.status)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-zinc-400 line-clamp-2">
                            {project.tagline}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500">
                            <span>👍 {project._count.upvotes}</span>
                            <span>💬 {project._count.comments}</span>
                            <span>{formatRelativeTime(project.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-zinc-900/30 p-8 text-center">
                  <Rocket className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-500">No projects yet</p>
                </div>
              )}
            </section>

            {/* Companies (Owned) */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="h-5 w-5 text-cyan-500" />
                <h2 className="text-xl font-semibold text-white">Companies</h2>
                <span className="text-sm text-zinc-500">({user.companies.length})</span>
              </div>

              {user.companies.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.companies.map((company) => (
                    <Link
                      key={company.id}
                      href={getCompanyUrl(company)}
                      className="block rounded-xl border border-white/10 bg-zinc-900/50 p-4 hover:border-cyan-500/30 hover:bg-zinc-900/70 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        {/* Logo */}
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-800/50 border border-white/10">
                          {company.logo ? (
                            <Image
                              src={company.logo}
                              alt={company.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Building2 className="h-5 w-5 text-zinc-600" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors truncate">
                              {company.name}
                            </h3>
                            <span className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border",
                              getMemberRoleColor("OWNER")
                            )}>
                              Owner
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
                                getCategoryColor(company.category)
                              )}
                            >
                              {getCategoryLabel(company.category)}
                            </span>
                            {company.location && (
                              <span className="text-xs text-zinc-500 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {company.location}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 text-xs text-zinc-500">
                            {company._count.projects} project{company._count.projects !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-zinc-900/30 p-8 text-center">
                  <Building2 className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-500">No companies yet</p>
                </div>
              )}
            </section>

            {/* Team Member At */}
            {user.companyMemberships.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Users className="h-5 w-5 text-violet-500" />
                  <h2 className="text-xl font-semibold text-white">Team Member At</h2>
                  <span className="text-sm text-zinc-500">({user.companyMemberships.length})</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.companyMemberships.map((membership) => (
                    <Link
                      key={membership.id}
                      href={getCompanyUrl(membership.company)}
                      className="block rounded-xl border border-white/10 bg-zinc-900/50 p-4 hover:border-violet-500/30 hover:bg-zinc-900/70 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        {/* Logo */}
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-800/50 border border-white/10">
                          {membership.company.logo ? (
                            <Image
                              src={membership.company.logo}
                              alt={membership.company.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Building2 className="h-5 w-5 text-zinc-600" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white group-hover:text-violet-400 transition-colors truncate">
                              {membership.company.name}
                            </h3>
                            <span className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border",
                              getMemberRoleColor(membership.role)
                            )}>
                              {getMemberRoleLabel(membership.role)}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
                                getCategoryColor(membership.company.category)
                              )}
                            >
                              {getCategoryLabel(membership.company.category)}
                            </span>
                            {membership.company.location && (
                              <span className="text-xs text-zinc-500 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {membership.company.location}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 text-xs text-zinc-500">
                            {membership.company._count.projects} project{membership.company._count.projects !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Services */}
            {user.serviceListings.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Store className="h-5 w-5 text-amber-500" />
                  <h2 className="text-xl font-semibold text-white">Services</h2>
                  <span className="text-sm text-zinc-500">({user.serviceListings.length})</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.serviceListings.map((service) => {
                    const formatPrice = (cents: number) => {
                      return new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 0,
                      }).format(cents / 100);
                    };

                    const categoryLabels: Record<string, string> = {
                      MVP_BUILD: "MVP Build",
                      DESIGN: "Design",
                      MARKETING: "Marketing",
                      AI_INTEGRATION: "AI Integration",
                      DEVOPS: "DevOps",
                      AUDIT: "Audit",
                      OTHER: "Other",
                    };

                    const categoryColors: Record<string, string> = {
                      MVP_BUILD: "bg-orange-500/10 text-orange-400 border-orange-500/30",
                      DESIGN: "bg-pink-500/10 text-pink-400 border-pink-500/30",
                      MARKETING: "bg-blue-500/10 text-blue-400 border-blue-500/30",
                      AI_INTEGRATION: "bg-violet-500/10 text-violet-400 border-violet-500/30",
                      DEVOPS: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
                      AUDIT: "bg-amber-500/10 text-amber-400 border-amber-500/30",
                      OTHER: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
                    };

                    return (
                      <Link
                        key={service.id}
                        href={`/services/${service.slug || service.id}`}
                        className="block rounded-xl border border-white/10 bg-zinc-900/50 p-4 hover:border-amber-500/30 hover:bg-zinc-900/70 transition-all group"
                      >
                        <div className="mb-2">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
                              categoryColors[service.category] || categoryColors.OTHER
                            )}
                          >
                            {categoryLabels[service.category] || "Other"}
                          </span>
                        </div>
                        <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                          {service.title}
                        </h3>
                        <p className="text-sm text-zinc-400 line-clamp-2 mt-1">
                          {service.description}
                        </p>
                        <div className="mt-3 flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <DollarSign className="h-4 w-4" />
                            {formatPrice(service.priceInCents)}
                          </span>
                          <span className="flex items-center gap-1 text-zinc-500">
                            <Clock className="h-4 w-4" />
                            {service.deliveryDays} day{service.deliveryDays !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Updates */}
            <section id="updates" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <h2 className="text-xl font-semibold text-white">Updates</h2>
                <span className="text-sm text-zinc-500">({user.dailyUpdates.length})</span>
              </div>

              {/* Post new update form - only for profile owner */}
              {isOwnProfile && (
                <div className="mb-6 rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-4">
                  <h3 className="text-sm font-medium text-zinc-400 mb-3">Share what you&apos;re working on</h3>
                  <UpdateForm />
                </div>
              )}

              {/* Updates timeline */}
              <UpdateTimeline
                updates={user.dailyUpdates.map(update => ({
                  ...update,
                  likesCount: update._count.likes,
                  commentsCount: update._count.comments,
                  isLiked: session?.user?.id
                    ? update.likes.some(like => like.userId === session.user.id)
                    : false,
                  user: {
                    id: user.id,
                    name: user.name,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    image: user.image,
                    slug: user.slug,
                    headline: user.headline,
                  },
                }))}
                currentUserId={session?.user?.id}
                showAuthor={false}
                emptyMessage={isOwnProfile ? "Share your first update!" : "No updates yet"}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
