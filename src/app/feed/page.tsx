import { Suspense } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CombinedFeed, TopBuilders, OpenJobs } from "@/components/feed";
import { RoastMVPCard } from "@/components/roast-mvp/roast-mvp-card";
import { SiteViewsCounter } from "@/components/analytics/site-views-counter";
import { SidebarAd } from "@/components/ads";
import { ProductHuntBadge } from "@/components/ui/product-hunt-badge";

export const metadata = {
  title: "Feed - Builders.to",
  description: "See what builders are working on",
};

// Force dynamic rendering since this page requires database access
export const dynamic = "force-dynamic";

async function FeedContent() {
  const session = await auth();

  // Fetch both daily updates and feed events (milestones)
  const [updates, feedEvents] = await Promise.all([
    prisma.dailyUpdate.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true,
        content: true,
        imageUrl: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
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
    }),
    prisma.feedEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
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
                    firstName: true,
                    lastName: true,
                    image: true,
                    slug: true,
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

      // Fetch users for status updates
      let userMap = new Map<string, { id: string; name: string | null; firstName: string | null; lastName: string | null; image: string | null; slug: string | null; headline: string | null }>();
      if (statusEvents.length > 0) {
        const userIds = Array.from(new Set(statusEvents.map(e => e.userId)));
        const users = await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            image: true,
            slug: true,
            headline: true,
          },
        });
        userMap = new Map(users.map(u => [u.id, u]));
      }

      // Fetch projects for project status changes and project created events
      let projectMap = new Map<string, { id: string; slug: string | null; title: string; tagline: string | null; imageUrl: string | null; status: string; user: { id: string; name: string | null; firstName: string | null; lastName: string | null; image: string | null; slug: string | null } }>();
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
                firstName: true,
                lastName: true,
                image: true,
                slug: true,
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

      return events.map(event => ({
        ...event,
        user: event.type === "STATUS_UPDATE" ? userMap.get(event.userId) || null : null,
        project: (event.type === "PROJECT_STATUS_CHANGE" || event.type === "PROJECT_CREATED") && event.projectId ? projectMap.get(event.projectId) || null : null,
        companyRole: event.type === "JOB_POSTED" && event.companyRoleId ? companyRoleMap.get(event.companyRoleId) || null : null,
      }));
    }),
  ]);

  // Transform updates to include like and comment info
  const updatesWithLikes = updates.map(update => ({
    ...update,
    likesCount: update._count.likes,
    commentsCount: update._count.comments,
    isLiked: session?.user?.id
      ? update.likes.some(like => like.userId === session.user.id)
      : false,
  }));

  // Transform feed events
  const feedEventsWithLikes = feedEvents.map(event => ({
    ...event,
    likesCount: event._count.likes,
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

async function RoastMVPSection() {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  let userProjects: Array<{ id: string; title: string; slug: string | null }> = [];

  if (session?.user?.id) {
    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id,
        // Exclude projects already in the roast queue (paid or featured)
        OR: [
          { roastMVP: null },
          {
            roastMVP: {
              status: { in: ["PENDING_PAYMENT", "COMPLETED", "CANCELLED"] }
            }
          },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
      orderBy: { createdAt: "desc" },
    });
    userProjects = projects;
  }

  return (
    <RoastMVPCard
      isAuthenticated={isAuthenticated}
      userProjects={userProjects}
    />
  );
}

async function TopBuildersSection() {
  // Fetch top builders by total project count (owned + co-built)
  // This rewards collaboration by counting both owned projects and co-builder contributions
  const buildersWithCounts = await prisma.user.findMany({
    where: {
      OR: [
        { projects: { some: {} } },      // Has at least one owned project
        { coBuilderOn: { some: {} } },   // Or is a co-builder on at least one project
      ],
    },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      image: true,
      slug: true,
      headline: true,
      _count: {
        select: {
          projects: true,
          coBuilderOn: true,
        },
      },
    },
  });

  // Calculate total project count (owned + co-built) and sort
  const topBuilders = buildersWithCounts
    .map(builder => ({
      ...builder,
      totalProjects: builder._count.projects + builder._count.coBuilderOn,
    }))
    .sort((a, b) => b.totalProjects - a.totalProjects)
    .slice(0, 5);

  return <TopBuilders builders={topBuilders} />;
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
                See what builders are working on
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
              {/* Roast my MVP Section */}
              <Suspense
                fallback={
                  <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4 animate-pulse">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-5 w-5 bg-zinc-800 rounded" />
                      <div className="h-5 w-32 bg-zinc-800 rounded" />
                    </div>
                    <div className="h-32 bg-zinc-800 rounded-lg" />
                  </div>
                }
              >
                <RoastMVPSection />
              </Suspense>

              {/* Product Hunt Badge */}
              <div className="flex justify-center">
                <ProductHuntBadge />
              </div>

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
