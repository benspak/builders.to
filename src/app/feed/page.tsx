import { Suspense } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CombinedFeed, TopBuilders } from "@/components/feed";
import { RoastMVPCard } from "@/components/roast-mvp/roast-mvp-card";

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
      // For project status change events, fetch the project info
      const projectStatusChangeEvents = events.filter(e => e.type === "PROJECT_STATUS_CHANGE");

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

      // Fetch projects for project status changes
      let projectMap = new Map<string, { id: string; slug: string | null; title: string; imageUrl: string | null; status: string; user: { id: string; name: string | null; firstName: string | null; lastName: string | null; image: string | null; slug: string | null } }>();
      if (projectStatusChangeEvents.length > 0) {
        const projectIds = Array.from(new Set(projectStatusChangeEvents.map(e => e.projectId).filter(Boolean))) as string[];
        const projects = await prisma.project.findMany({
          where: { id: { in: projectIds } },
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
        });
        projectMap = new Map(projects.map(p => [p.id, p]));
      }

      return events.map(event => ({
        ...event,
        user: event.type === "STATUS_UPDATE" ? userMap.get(event.userId) || null : null,
        project: event.type === "PROJECT_STATUS_CHANGE" && event.projectId ? projectMap.get(event.projectId) || null : null,
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
  // Fetch top 5 builders by project count
  const topBuilders = await prisma.user.findMany({
    where: {
      projects: {
        some: {}, // Must have at least one project
      },
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
        },
      },
    },
    orderBy: {
      projects: {
        _count: "desc",
      },
    },
    take: 5,
  });

  return <TopBuilders builders={topBuilders} />;
}

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
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

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Sticky on desktop */}
          <aside className="lg:w-80 shrink-0 order-2 lg:order-1">
            <div className="lg:sticky lg:top-24 space-y-6">
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
          <main className="flex-1 min-w-0 max-w-2xl order-1 lg:order-2">
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
        </div>
      </div>
    </div>
  );
}
