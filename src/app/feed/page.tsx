import { Suspense } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CombinedFeed } from "@/components/feed";

export const metadata = {
  title: "Feed - Builders.to",
  description: "See what builders are working on",
};

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

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
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

        {/* Feed content */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          }
        >
          <FeedContent />
        </Suspense>
      </div>
    </div>
  );
}
