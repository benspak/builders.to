import { Suspense } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CombinedFeed, TopBuilders, OpenJobs, UserInterviewCTA } from "@/components/feed";
import { SiteViewsCounter } from "@/components/analytics/site-views-counter";
import { SidebarAd } from "@/components/ads";

export const metadata = {
  title: "Builders.to Feed – Launch Updates, Milestones & Jobs | Builders.to",
  description: "A launch pad and social network for builders, entrepreneurs, and founders. Share daily updates, celebrate milestones, discover projects, meet collaborators, and find early users.",
};

// Force dynamic rendering since this page requires database access
export const dynamic = "force-dynamic";

async function FeedContent() {
  const session = await auth();

  // Fetch daily updates and feed events (milestones)
  // Polls are now part of updates (as an attachment type)
  // Fetch all for SEO indexability - the CombinedFeed component handles "load more" UX
  const [updates, feedEvents] = await Promise.all([
    prisma.dailyUpdate.findMany({
      orderBy: { createdAt: "desc" },
      // Fetch more items for SEO - component will handle pagination UX
      take: 100,
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
            // Include first company with logo for display next to username
            companies: {
              where: { logo: { not: null } },
              take: 1,
              orderBy: { createdAt: "asc" },
              select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
              },
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
    }),
    prisma.feedEvent.findMany({
      orderBy: { createdAt: "desc" },
      // Fetch more items for SEO
      take: 50,
      include: {
        milestone: {
          include: {
            project: {
              select: {
                id: true,
                slug: true,
                title: true,
                imageUrl: true,
                status: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    displayName: true,
                    firstName: true,
                    lastName: true,
                    image: true,
                    slug: true,
                    // Include first company with logo for display next to username
                    companies: {
                      where: { logo: { not: null } },
                      take: 1,
                      orderBy: { createdAt: "asc" },
                      select: {
                        id: true,
                        name: true,
                        slug: true,
                        logo: true,
                      },
                    },
                  },
                },
              },
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
    }).then(async (events) => {
      // For status update events, fetch the user info
      const statusEvents = events.filter(e => e.type === "STATUS_UPDATE");
      // For project status change events and project created events, fetch the project info
      const projectStatusChangeEvents = events.filter(e => e.type === "PROJECT_STATUS_CHANGE");
      const projectCreatedEvents = events.filter(e => e.type === "PROJECT_CREATED");
      // For job posted events, fetch company role info
      const jobPostedEvents = events.filter(e => e.type === "JOB_POSTED");
      // For user joined events, fetch user info with location
      const userJoinedEvents = events.filter(e => e.type === "USER_JOINED");
      // For listing created events, fetch local listing info
      const listingCreatedEvents = events.filter(e => e.type === "LISTING_CREATED");

      // Fetch users for status updates
      let userMap = new Map<string, { id: string; name: string | null; displayName: string | null; firstName: string | null; lastName: string | null; image: string | null; slug: string | null; headline: string | null; companies: { id: string; name: string; slug: string | null; logo: string | null }[] }>();
      if (statusEvents.length > 0) {
        const userIds = Array.from(new Set(statusEvents.map(e => e.userId)));
        const users = await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: {
            id: true,
            name: true,
            displayName: true,
            firstName: true,
            lastName: true,
            image: true,
            slug: true,
            headline: true,
            // Include first company with logo for display next to username
            companies: {
              where: { logo: { not: null } },
              take: 1,
              orderBy: { createdAt: "asc" },
              select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
              },
            },
          },
        });
        userMap = new Map(users.map(u => [u.id, u]));
      }

      // Fetch users for user joined events (with location data)
      let userJoinedMap = new Map<string, { id: string; name: string | null; displayName: string | null; firstName: string | null; lastName: string | null; image: string | null; slug: string | null; headline: string | null; city: string | null; state: string | null; country: string | null; companies: { id: string; name: string; slug: string | null; logo: string | null }[] }>();
      if (userJoinedEvents.length > 0) {
        const userIds = Array.from(new Set(userJoinedEvents.map(e => e.userId)));
        const users = await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: {
            id: true,
            name: true,
            displayName: true,
            firstName: true,
            lastName: true,
            image: true,
            slug: true,
            headline: true,
            city: true,
            state: true,
            country: true,
            // Include first company with logo for display next to username
            companies: {
              where: { logo: { not: null } },
              take: 1,
              orderBy: { createdAt: "asc" },
              select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
              },
            },
          },
        });
        userJoinedMap = new Map(users.map(u => [u.id, u]));
      }

      // Fetch projects for project status changes and project created events
      let projectMap = new Map<string, { id: string; slug: string | null; title: string; tagline: string | null; imageUrl: string | null; status: string; user: { id: string; name: string | null; displayName: string | null; firstName: string | null; lastName: string | null; image: string | null; slug: string | null; companies: { id: string; name: string; slug: string | null; logo: string | null }[] } }>();
      const projectEventsWithIds = [...projectStatusChangeEvents, ...projectCreatedEvents];
      if (projectEventsWithIds.length > 0) {
        const projectIds = Array.from(new Set(projectEventsWithIds.map(e => e.projectId).filter(Boolean))) as string[];
        const projects = await prisma.project.findMany({
          where: { id: { in: projectIds } },
          select: {
            id: true,
            slug: true,
            title: true,
            tagline: true,
            imageUrl: true,
            status: true,
            user: {
              select: {
                id: true,
                name: true,
                displayName: true,
                firstName: true,
                lastName: true,
                image: true,
                slug: true,
                // Include first company with logo for display next to username
                companies: {
                  where: { logo: { not: null } },
                  take: 1,
                  orderBy: { createdAt: "asc" },
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    logo: true,
                  },
                },
              },
            },
          },
        });
        projectMap = new Map(projects.map(p => [p.id, p]));
      }

      // Fetch company roles for job posted events
      let companyRoleMap = new Map<string, { id: string; title: string; type: string; category: string; location: string | null; isRemote: boolean; salaryMin: number | null; salaryMax: number | null; currency: string | null; company: { id: string; slug: string | null; name: string; logo: string | null } }>();
      if (jobPostedEvents.length > 0) {
        const companyRoleIds = Array.from(new Set(jobPostedEvents.map(e => e.companyRoleId).filter(Boolean))) as string[];
        const companyRoles = await prisma.companyRole.findMany({
          where: { id: { in: companyRoleIds } },
          select: {
            id: true,
            title: true,
            type: true,
            category: true,
            location: true,
            isRemote: true,
            salaryMin: true,
            salaryMax: true,
            currency: true,
            company: {
              select: {
                id: true,
                slug: true,
                name: true,
                logo: true,
              },
            },
          },
        });
        companyRoleMap = new Map(companyRoles.map(r => [r.id, r]));
      }

      // Fetch local listings for listing created events
      let localListingMap = new Map<string, { id: string; slug: string; title: string; description: string; category: string; city: string; state: string; locationSlug: string; priceInCents: number | null; user: { id: string; name: string | null; displayName: string | null; firstName: string | null; lastName: string | null; image: string | null; slug: string | null; companies: { id: string; name: string; slug: string | null; logo: string | null }[] } }>();
      if (listingCreatedEvents.length > 0) {
        const localListingIds = Array.from(new Set(listingCreatedEvents.map(e => e.localListingId).filter(Boolean))) as string[];
        const localListings = await prisma.localListing.findMany({
          where: { id: { in: localListingIds } },
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            category: true,
            city: true,
            state: true,
            locationSlug: true,
            priceInCents: true,
            user: {
              select: {
                id: true,
                name: true,
                displayName: true,
                firstName: true,
                lastName: true,
                image: true,
                slug: true,
                // Include first company with logo for display next to username
                companies: {
                  where: { logo: { not: null } },
                  take: 1,
                  orderBy: { createdAt: "asc" },
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    logo: true,
                  },
                },
              },
            },
          },
        });
        localListingMap = new Map(localListings.map(l => [l.id, l]));
      }

      return events.map(event => ({
        ...event,
        user: event.type === "STATUS_UPDATE"
          ? userMap.get(event.userId) || null
          : event.type === "USER_JOINED"
            ? userJoinedMap.get(event.userId) || null
            : null,
        project: (event.type === "PROJECT_STATUS_CHANGE" || event.type === "PROJECT_CREATED") && event.projectId ? projectMap.get(event.projectId) || null : null,
        companyRole: event.type === "JOB_POSTED" && event.companyRoleId ? companyRoleMap.get(event.companyRoleId) || null : null,
        localListing: event.type === "LISTING_CREATED" && event.localListingId ? localListingMap.get(event.localListingId) || null : null,
      }));
    }),
  ]);

  // Get current user's pinned post IDs (to show pin state)
  const currentUserPinnedIds = session?.user?.id
    ? await prisma.pinnedPost.findMany({
        where: { userId: session.user.id },
        select: { updateId: true },
      }).then(pins => new Set(pins.map(p => p.updateId)))
    : new Set<string>();

  // Get current user's poll votes (for updates that have polls)
  const updatesWithPolls = updates.filter(u => u.pollQuestion && u.pollOptions.length > 0);
  const pollVotes = session?.user?.id && updatesWithPolls.length > 0
    ? await prisma.updatePollVote.findMany({
        where: {
          userId: session.user.id,
          updateId: { in: updatesWithPolls.map(u => u.id) },
        },
        select: { updateId: true, optionId: true },
      })
    : [];
  const pollVoteMap = new Map(pollVotes.map(v => [v.updateId, v.optionId]));

  // Transform updates to include like, comment, and poll vote info
  const updatesWithLikes = updates.map(update => ({
    ...update,
    likesCount: update._count.likes,
    commentsCount: update._count.comments,
    isLiked: session?.user?.id
      ? update.likes.some(like => like.userId === session.user.id)
      : false,
    isPinned: currentUserPinnedIds.has(update.id),
    votedOptionId: pollVoteMap.get(update.id) || null,
  }));

  // Transform feed events
  const feedEventsWithLikes = feedEvents.map(event => ({
    ...event,
    likesCount: event._count.likes,
    commentsCount: event._count.comments,
    hasLiked: session?.user?.id
      ? event.likes.some(like => like.userId === session.user.id)
      : false,
  }));

  return (
    <CombinedFeed
      updates={updatesWithLikes}
      feedEvents={feedEventsWithLikes}
      currentUserId={session?.user?.id}
      showAuthor={true}
    />
  );
}

async function TopBuildersSection() {
  try {
    // Fetch top builders with ranking based on:
    // 1. LAUNCHED projects (owned) - highest weight
    // 2. LAUNCHED projects (co-built) - medium weight
    // 3. Streaks - rewards consistent daily engagement
    const buildersWithStats = await prisma.user.findMany({
      where: {
        OR: [
          { projects: { some: {} } },      // Has at least one owned project
          { coBuilderOn: { some: {} } },   // Or is a co-builder on at least one project
        ],
      },
      select: {
        id: true,
        name: true,
        displayName: true,
        firstName: true,
        lastName: true,
        image: true,
        slug: true,
        headline: true,
        currentStreak: true,
        longestStreak: true,
        projects: {
          where: { status: "LAUNCHED" },
          select: { id: true },
        },
        coBuilderOn: {
          where: { project: { status: "LAUNCHED" } },
          select: { id: true },
        },
        _count: {
          select: {
            projects: true,
            coBuilderOn: true,
          },
        },
      },
    });

    // Calculate ranking score and sort
    // Score formula: (launched projects * 10) + (co-launched * 5) + (current streak * 2) + longest streak
    const topBuilders = buildersWithStats
      .map(builder => {
        const launchedProjects = builder.projects.length;
        const coLaunchedProjects = builder.coBuilderOn.length;
        const currentStreak = builder.currentStreak ?? 0;
        const longestStreak = builder.longestStreak ?? 0;
        const rankingScore =
          (launchedProjects * 10) +
          (coLaunchedProjects * 5) +
          (currentStreak * 2) +
          longestStreak;

        return {
          id: builder.id,
          name: builder.name,
          displayName: builder.displayName,
          firstName: builder.firstName,
          lastName: builder.lastName,
          image: builder.image,
          slug: builder.slug,
          headline: builder.headline,
          currentStreak,
          longestStreak,
          launchedProjects,
          coLaunchedProjects,
          totalProjects: builder._count.projects + builder._count.coBuilderOn,
          rankingScore,
          _count: builder._count,
        };
      })
      .filter(builder => builder.rankingScore > 0)
      .sort((a, b) => b.rankingScore - a.rankingScore)
      .slice(0, 5);

    return <TopBuilders builders={topBuilders} />;
  } catch (error) {
    console.error("Error fetching top builders:", error);
    return null;
  }
}

async function OpenJobsSection() {
  // Fetch latest open roles from companies
  const openRoles = await prisma.companyRole.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      title: true,
      type: true,
      location: true,
      isRemote: true,
      salaryMin: true,
      salaryMax: true,
      currency: true,
      company: {
        select: {
          id: true,
          slug: true,
          name: true,
          logo: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return <OpenJobs jobs={openRoles} />;
}

async function SidebarAdSection() {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  return <SidebarAd isAuthenticated={isAuthenticated} />;
}

export default function FeedPage() {
  return (
    <div className="relative min-h-screen" style={{ background: "var(--background)" }}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-orange-500/25">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Builder Feed</h1>
              <p className="text-zinc-400 text-sm">
                See what builders, founders, and entrepreneurs are building and launching
              </p>
            </div>
          </div>

          {/* Site Stats */}
          <SiteViewsCounter />
        </div>

        {/* Three Column Layout */}
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Left Sidebar - Sticky and scrollable on desktop */}
          <aside className="xl:w-72 shrink-0 order-1">
            <div className="xl:sticky xl:top-24 xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto space-y-6 xl:pb-4">
              {/* Top Builders Section */}
              <Suspense
                fallback={
                  <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 overflow-hidden animate-pulse">
                    <div className="px-4 py-3 border-b border-zinc-800/50">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-zinc-800 rounded-lg" />
                        <div className="h-5 w-24 bg-zinc-800 rounded" />
                      </div>
                    </div>
                    <div className="divide-y divide-zinc-800/30">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3">
                          <div className="h-6 w-6 bg-zinc-800 rounded-md" />
                          <div className="h-8 w-8 bg-zinc-800 rounded-full" />
                          <div className="flex-1">
                            <div className="h-4 w-24 bg-zinc-800 rounded mb-1" />
                            <div className="h-3 w-16 bg-zinc-800 rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                }
              >
                <TopBuildersSection />
              </Suspense>
            </div>
          </aside>

          {/* Main Feed */}
          <main className="flex-1 min-w-0 max-w-2xl order-3 xl:order-2">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
              }
            >
              <FeedContent />
            </Suspense>
          </main>

          {/* Right Sidebar - Open Jobs */}
          <aside className="xl:w-72 shrink-0 order-2 xl:order-3">
            <div className="xl:sticky xl:top-24 xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto space-y-6 xl:pb-4">
              {/* User Interview CTA Section */}
              <UserInterviewCTA />

              {/* Sidebar Ad Section */}
              <Suspense
                fallback={
                  <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 overflow-hidden animate-pulse">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/50">
                      <div className="h-4 w-4 bg-zinc-800 rounded" />
                      <div className="h-3 w-16 bg-zinc-800 rounded" />
                    </div>
                    <div className="p-5">
                      <div className="w-full h-32 bg-zinc-800 rounded-lg mb-4" />
                      <div className="h-5 w-3/4 bg-zinc-800 rounded mb-2" />
                      <div className="h-4 w-full bg-zinc-800 rounded mb-4" />
                      <div className="h-9 w-full bg-zinc-800 rounded-lg" />
                    </div>
                  </div>
                }
              >
                <SidebarAdSection />
              </Suspense>

              {/* Open Jobs Section */}
              <Suspense
                fallback={
                  <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 overflow-hidden animate-pulse">
                    <div className="px-4 py-3 border-b border-zinc-800/50">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-zinc-800 rounded-lg" />
                        <div className="h-5 w-24 bg-zinc-800 rounded" />
                      </div>
                    </div>
                    <div className="divide-y divide-zinc-800/30">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-start gap-3 px-4 py-3">
                          <div className="h-10 w-10 bg-zinc-800 rounded-lg" />
                          <div className="flex-1">
                            <div className="h-4 w-32 bg-zinc-800 rounded mb-1" />
                            <div className="h-3 w-20 bg-zinc-800 rounded mb-2" />
                            <div className="h-3 w-24 bg-zinc-800 rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                }
              >
                <OpenJobsSection />
              </Suspense>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
