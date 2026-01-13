import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  User,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { UpdateActions } from "./update-actions";
import { UpdateComments } from "@/components/updates/update-comments";
import { TopBuilders, OpenJobs } from "@/components/feed";
import { SidebarAd } from "@/components/ads";

interface UpdatePageProps {
  params: Promise<{ slug: string; id: string }>;
}

export async function generateMetadata({ params }: UpdatePageProps): Promise<Metadata> {
  const { slug, id } = await params;

  const update = await prisma.dailyUpdate.findUnique({
    where: { id },
    select: {
      content: true,
      user: {
        select: {
          name: true,
          displayName: true,
          firstName: true,
          lastName: true,
          slug: true,
        },
      },
    },
  });

  if (!update || update.user.slug !== slug) {
    return { title: "Update Not Found - Builders.to" };
  }

  const displayName = update.user.displayName
    || (update.user.firstName && update.user.lastName
      ? `${update.user.firstName} ${update.user.lastName}`
      : null)
    || update.user.name
    || "Builder";

  // Truncate content for description
  const description = update.content.length > 160
    ? update.content.slice(0, 157) + "..."
    : update.content;

  return {
    title: `${displayName} on Builders.to`,
    description,
    openGraph: {
      title: `${displayName} on Builders.to`,
      description,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} on Builders.to`,
      description,
    },
  };
}

async function TopBuildersSection() {
  // Fetch top builders with ranking based on:
  // 1. LAUNCHED projects (owned) - highest weight
  // 2. LAUNCHED projects (co-built) - medium weight
  // 3. Lifetime tokens earned - rewards engagement & profile completion
  const buildersWithStats = await prisma.user.findMany({
    where: {
      OR: [
        { projects: { some: {} } },
        { coBuilderOn: { some: {} } },
        { lifetimeTokensEarned: { gt: 0 } },
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
      lifetimeTokensEarned: true,
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
  const topBuilders = buildersWithStats
    .map(builder => {
      const launchedProjects = builder.projects.length;
      const coLaunchedProjects = builder.coBuilderOn.length;
      const rankingScore =
        (launchedProjects * 10) +
        (coLaunchedProjects * 5) +
        builder.lifetimeTokensEarned;

      return {
        id: builder.id,
        name: builder.name,
        firstName: builder.firstName,
        lastName: builder.lastName,
        image: builder.image,
        slug: builder.slug,
        headline: builder.headline,
        lifetimeTokensEarned: builder.lifetimeTokensEarned,
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
}

async function OpenJobsSection() {
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

export default async function UpdatePage({ params }: UpdatePageProps) {
  const { slug, id } = await params;
  const session = await auth();

  const update = await prisma.dailyUpdate.findUnique({
    where: { id },
    select: {
      id: true,
      content: true,
      imageUrl: true,
      gifUrl: true,
      createdAt: true,
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
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
      likes: session?.user?.id
        ? {
            where: { userId: session.user.id },
            select: { id: true },
          }
        : false,
    },
  });

  // Verify the update exists and belongs to the user with this slug
  if (!update || update.user.slug !== slug) {
    notFound();
  }

  const displayName = update.user.displayName
    || (update.user.firstName && update.user.lastName
      ? `${update.user.firstName} ${update.user.lastName}`
      : null)
    || update.user.name
    || "Builder";

  const isLiked = session?.user?.id && update.likes
    ? (Array.isArray(update.likes) ? update.likes.length > 0 : false)
    : false;

  const isOwner = session?.user?.id === update.user.id;

  return (
    <div className="relative min-h-screen" style={{ background: "var(--background)" }}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link
          href={`/${slug}`}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to profile
        </Link>

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

          {/* Main Content */}
          <main className="flex-1 min-w-0 max-w-2xl order-3 xl:order-2">
            {/* Main content card */}
            <article className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
              {/* Author header */}
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <Link href={`/${slug}`} className="flex-shrink-0">
                    {update.user.image ? (
                      <Image
                        src={update.user.image}
                        alt={displayName}
                        width={48}
                        height={48}
                        className="rounded-xl ring-2 ring-white/10 hover:ring-orange-500/30 transition-all"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-500">
                        <User className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/${slug}`}
                      className="font-semibold text-white hover:text-orange-400 transition-colors"
                    >
                      {displayName}
                    </Link>
                    {update.user.headline && (
                      <p className="text-sm text-zinc-500 truncate">{update.user.headline}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={update.createdAt.toISOString()}>
                      {formatRelativeTime(update.createdAt)}
                    </time>
                  </div>
                </div>
              </div>

              {/* Image attachment */}
              {update.imageUrl && (
                <div className="relative aspect-video bg-zinc-900">
                  <Image
                    src={update.imageUrl}
                    alt="Update image"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              {/* GIF attachment */}
              {update.gifUrl && (
                <div className="relative max-h-96 bg-zinc-900 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={update.gifUrl}
                    alt="GIF"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 text-xs text-fuchsia-300 font-medium">
                    GIF
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                <div className="prose prose-invert prose-zinc max-w-none">
                  <p className="text-zinc-200 whitespace-pre-wrap text-base leading-relaxed">
                    {update.content}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 border-t border-white/5">
                {/* Action buttons */}
                <UpdateActions
                  updateId={update.id}
                  userSlug={slug}
                  content={update.content}
                  isLiked={isLiked}
                  likesCount={update._count.likes}
                  currentUserId={session?.user?.id}
                  isOwner={isOwner}
                />
              </div>

              {/* Comments section */}
              <div className="px-6 pb-6">
                <UpdateComments
                  updateId={update.id}
                  currentUserId={session?.user?.id}
                  initialCommentsCount={update._count.comments}
                />
              </div>
            </article>
          </main>

          {/* Right Sidebar */}
          <aside className="xl:w-72 shrink-0 order-2 xl:order-3">
            <div className="xl:sticky xl:top-24 xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto space-y-6 xl:pb-4">
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
