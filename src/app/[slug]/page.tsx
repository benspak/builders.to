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
  ArrowLeft,
  Award,
  Target,
  Lightbulb,
} from "lucide-react";
import { FollowButton, FollowStats, GiftSuccessToast, GiftTokensButton, PeopleAlsoViewed, ProfileViewTracker } from "@/components/profile";
import { ReportButton } from "@/components/ui/report-button";
import { ProBadgeWithTooltip } from "@/components/ui/pro-badge";
import { KarmaBadge } from "@/components/karma";
import { ProfilePartnerButton } from "@/components/accountability";
import { Suspense } from "react";
import { formatRelativeTime, getStatusColor, getStatusLabel, getCategoryColor, getCategoryLabel, getMemberRoleLabel, getMemberRoleColor, getCompanyUrl, formatLocationSlug } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { UpdateTimeline, PinnedPostsSection } from "@/components/updates";
import { ComposerWithAI } from "@/components/composer/composer-with-ai";
import { CompanyCard } from "@/components/companies/company-card";
import { TechStackDisplay } from "@/components/companies/tech-stack-display";
import { BuilderCard } from "@/components/profile/builder-card";



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
  const [companies, builders] = await Promise.all([
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
        openToMeeting: true,
        currentStreak: true,
        _count: {
          select: {
            projects: true,
          },
        },
      },
    }),
  ]);

  if (companies.length === 0 && builders.length === 0) {
    return null;
  }

  // Get the location display name
  let locationName: string;
  if (companies.length > 0 && companies[0].location) {
    locationName = companies[0].location;
  } else if (builders.length > 0 && builders[0].city) {
    const locationSuffix = builders[0].country || builders[0].state;
    locationName = locationSuffix ? `${builders[0].city}, ${locationSuffix}` : builders[0].city;
  } else {
    locationName = formatLocationSlug(locationSlug);
  }

  return { companies, builders, locationName, locationSlug };
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

  // Check if it's a location - check companies and users
  const [company, locationUser] = await Promise.all([
    prisma.company.findFirst({
      where: { locationSlug: slug },
      select: { location: true },
    }),
    prisma.user.findFirst({
      where: { locationSlug: slug },
      select: { city: true, state: true, country: true },
    }),
  ]);

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
      title: `Builders & Companies in ${locationName} | Builders.to`,
      description: `Discover talented builders and companies in ${locationName}. Connect with local talent and explore the tech ecosystem.`,
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
      profileBackgroundImage: true,
      calendarUrl: true,
      image: true,
      createdAt: true,
      // Status
      status: true,
      statusUpdatedAt: true,
      // Intent flags
      openToWork: true,
      lookingForCofounder: true,
      availableForContract: true,
      openToMeeting: true,
      // Streak tracking
      currentStreak: true,
      longestStreak: true,
      // Karma & matching
      karma: true,
      karmaLevel: true,
      techStack: true,
      interests: true,
      buildingCategory: true,
      // Pro subscription status
      proSubscription: {
        select: {
          status: true,
        },
      },
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
          // Poll fields
          pollQuestion: true,
          pollExpiresAt: true,
          pollOptions: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              text: true,
              order: true,
              _count: {
                select: { votes: true },
              },
            },
          },
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
      // Pinned posts on profile
      pinnedPosts: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          update: {
            select: {
              id: true,
              content: true,
              imageUrl: true,
              gifUrl: true,
              createdAt: true,
              // Poll fields
              pollQuestion: true,
              pollExpiresAt: true,
              pollOptions: {
                orderBy: { order: "asc" },
                select: {
                  id: true,
                  text: true,
                  order: true,
                  _count: {
                    select: { votes: true },
                  },
                },
              },
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
                },
              },
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
        },
      },
    },
  });

  // Get current user's pinned post IDs (to show pin state)
  const currentUserPinnedIds = session?.user?.id
    ? await prisma.pinnedPost.findMany({
        where: { userId: session.user.id },
        select: { updateId: true },
      }).then(pins => new Set(pins.map(p => p.updateId)))
    : new Set<string>();

  // Get current user's poll votes for this user's updates and pinned posts (to show which option they voted for)
  const userUpdateIds = user?.dailyUpdates?.map(u => u.id) || [];
  const pinnedUpdateIds = user?.pinnedPosts?.map(p => p.update.id) || [];
  const allUpdateIds = [...new Set([...userUpdateIds, ...pinnedUpdateIds])];
  const pollVotes = session?.user?.id && allUpdateIds.length > 0
    ? await prisma.updatePollVote.findMany({
        where: {
          userId: session.user.id,
          updateId: { in: allUpdateIds },
        },
        select: { updateId: true, optionId: true },
      })
    : [];
  const pollVoteMap = new Map(pollVotes.map(v => [v.updateId, v.optionId]));

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

          {/* Browse More */}
          <div className="mt-12 text-center">
            <p className="text-zinc-500 mb-4">
              Looking for builders or companies in other locations?
            </p>
            <Link
              href="/map"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-6 py-3 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/30 transition-colors"
            >
              <MapPin className="h-4 w-4" />
              Browse the Map
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
  // Note: "Open to Meeting" is restricted to Pro members only
  const isPro = user.proSubscription?.status === "ACTIVE";
  const intentFlags = [
    { active: user.openToWork, label: "Open to Work", icon: Briefcase, color: "emerald" },
    { active: user.lookingForCofounder, label: "Looking for Co-founder", icon: Users, color: "violet" },
    { active: user.availableForContract, label: "Available for Contract", icon: Code, color: "cyan" },
    { active: user.openToMeeting && isPro, label: "Open to Meeting", icon: Calendar, color: "amber" },
  ].filter(flag => flag.active);

  return (
    <div className="relative min-h-screen bg-zinc-950">
      {/* Profile View Tracker - tracks profile views for "People also viewed" */}
      {!isOwnProfile && (
        <Suspense fallback={null}>
          <ProfileViewTracker userId={user.id} />
        </Suspense>
      )}

      {/* Gift Success Toast */}
      <Suspense fallback={null}>
        <GiftSuccessToast />
      </Suspense>

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      {/* Hero Section */}
      <div className="relative border-b border-white/5">
        {/* Profile banner - custom image or default gradient */}
        <div className="h-32 sm:h-40 relative overflow-hidden">
          {user.profileBackgroundImage ? (
            <>
              <Image
                src={user.profileBackgroundImage}
                alt="Profile background"
                fill
                className="object-cover"
                priority
              />
              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950/70" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-orange-500/10 to-cyan-500/10" />
          )}
        </div>

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
                    <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 flex-wrap">
                      {displayName}
                      {user.proSubscription?.status === "ACTIVE" && (
                        <ProBadgeWithTooltip size="lg" />
                      )}
                      {user.karma > 0 && (
                        <KarmaBadge karma={user.karma} level={user.karmaLevel} size="md" />
                      )}
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
                              color === "cyan" && "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
                              color === "amber" && "bg-amber-500/10 border-amber-500/30 text-amber-400"
                            )}
                          >
                            <Icon className="h-3 w-3" />
                            {label}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Book a Meeting CTA - Pro members only */}
                    {user.openToMeeting && user.calendarUrl && isPro && (
                      <div className="mt-3">
                        <a
                          href={user.calendarUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-medium text-zinc-900 hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/25"
                        >
                          <Calendar className="h-4 w-4" />
                          Book a Meeting
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {isOwnProfile ? (
                      <Link
                        href="/settings"
                        className="inline-flex items-center gap-2 rounded-xl bg-zinc-800/80 backdrop-blur-sm border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-700 hover:text-white transition-all"
                      >
                        <Settings className="h-4 w-4" />
                        Edit Profile
                      </Link>
                    ) : (
                      <>
                        <FollowButton
                          userId={user.id}
                          isFollowing={isFollowing}
                          currentUserId={session?.user?.id}
                        />
                        {session?.user?.id && (
                          <ProfilePartnerButton
                            partnerId={user.id}
                            partnerName={displayName}
                            partnerImage={user.image}
                            partnerSlug={user.slug}
                          />
                        )}
                        {session?.user?.id && (
                          <GiftTokensButton
                            recipientUserId={user.id}
                            recipientName={displayName}
                            profileSlug={user.slug}
                          />
                        )}
                        {session?.user && (
                          <ReportButton
                            contentType="USER"
                            contentId={user.id}
                            variant="icon"
                          />
                        )}
                      </>
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

                  {/* Karma/Reputation */}
                  {user.karma > 0 && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/20">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20">
                        <Award className="h-4 w-4 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white flex items-center gap-2">
                          {user.karma.toLocaleString()} karma
                          <KarmaBadge karma={user.karma} level={user.karmaLevel} size="sm" />
                        </div>
                        <div className="text-xs text-zinc-500">Community reputation</div>
                      </div>
                    </div>
                  )}

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

            {/* Tech Stack & Interests */}
            {(user.techStack.length > 0 || user.interests.length > 0 || user.buildingCategory) && (
              <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Code className="h-4 w-4 text-cyan-500" />
                  Building With
                </h3>

                {/* Building Category */}
                {user.buildingCategory && (
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-zinc-500" />
                    <span className="text-sm text-zinc-300 capitalize">
                      {user.buildingCategory.replace(/_/g, " ").toLowerCase()}
                    </span>
                  </div>
                )}

                {/* Tech Stack */}
                {user.techStack.length > 0 && (
                  <TechStackDisplay techStack={user.techStack} variant="compact" />
                )}

                {/* Interests */}
                {user.interests.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                      <Lightbulb className="h-4 w-4" />
                      <span className="font-medium">Interests</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {user.interests.map((interest) => (
                        <span
                          key={interest}
                          className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Companies (Owned) - Sidebar on desktop */}
            {user.companies.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="h-4 w-4 text-cyan-500" />
                  <h3 className="text-sm font-semibold text-white">Companies</h3>
                  <span className="text-xs text-zinc-500">({user.companies.length})</span>
                </div>

                <div className="space-y-3">
                  {user.companies.map((company) => (
                    <Link
                      key={company.id}
                      href={getCompanyUrl(company)}
                      className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-zinc-800/50 transition-colors group"
                    >
                      {/* Logo */}
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800/50 border border-white/10">
                        {company.logo ? (
                          <Image
                            src={company.logo}
                            alt={company.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Building2 className="h-4 w-4 text-zinc-600" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors truncate">
                            {company.name}
                          </h4>
                          <span className={cn(
                            "inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium border",
                            getMemberRoleColor("OWNER")
                          )}>
                            Owner
                          </span>
                        </div>
                        {company.location && (
                          <span className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            {company.location}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Team Member At - Sidebar on desktop */}
            {user.companyMemberships.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-4 w-4 text-violet-500" />
                  <h3 className="text-sm font-semibold text-white">Team Member At</h3>
                  <span className="text-xs text-zinc-500">({user.companyMemberships.length})</span>
                </div>

                <div className="space-y-3">
                  {user.companyMemberships.map((membership) => (
                    <Link
                      key={membership.id}
                      href={getCompanyUrl(membership.company)}
                      className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-zinc-800/50 transition-colors group"
                    >
                      {/* Logo */}
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800/50 border border-white/10">
                        {membership.company.logo ? (
                          <Image
                            src={membership.company.logo}
                            alt={membership.company.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Building2 className="h-4 w-4 text-zinc-600" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-medium text-white group-hover:text-violet-400 transition-colors truncate">
                            {membership.company.name}
                          </h4>
                          <span className={cn(
                            "inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium border",
                            getMemberRoleColor(membership.role)
                          )}>
                            {getMemberRoleLabel(membership.role)}
                          </span>
                        </div>
                        {membership.company.location && (
                          <span className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            {membership.company.location}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* People Also Viewed - LinkedIn-style recommendations */}
            {!isOwnProfile && (
              <PeopleAlsoViewed
                userId={user.id}
                currentUserId={session?.user?.id}
              />
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

            {/* Pinned Posts */}
            {user.pinnedPosts.length > 0 && (
              <PinnedPostsSection
                pinnedPosts={user.pinnedPosts.map(pin => ({
                  id: pin.id,
                  order: pin.order,
                  update: {
                    ...pin.update,
                    likesCount: pin.update._count.likes,
                    commentsCount: pin.update._count.comments,
                    isLiked: session?.user?.id
                      ? pin.update.likes.some(like => like.userId === session.user.id)
                      : false,
                    votedOptionId: pollVoteMap.get(pin.update.id) || null,
                  },
                }))}
                currentUserId={session?.user?.id}
                isOwnProfile={isOwnProfile}
              />
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
                  <ComposerWithAI compact />
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
                  isPinned: currentUserPinnedIds.has(update.id),
                  votedOptionId: pollVoteMap.get(update.id) || null,
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
