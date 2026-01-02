import { Suspense } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { UpdateTimeline } from "@/components/updates";

export const metadata = {
  title: "Feed - Builders.to",
  description: "See what builders are working on",
};

async function FeedContent() {
  const session = await auth();

  const updates = await prisma.dailyUpdate.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
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
        },
      },
    },
  });

  // Transform updates to include like info
  const updatesWithLikes = updates.map(update => ({
    ...update,
    likesCount: update._count.likes,
    isLiked: session?.user?.id
      ? update.likes.some(like => like.userId === session.user.id)
      : false,
  }));

  return (
    <UpdateTimeline
      updates={updatesWithLikes}
      currentUserId={session?.user?.id}
      showAuthor={true}
      emptyMessage="No updates yet. Be the first to share what you're working on!"
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
