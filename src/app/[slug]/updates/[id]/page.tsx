import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  User,
  ArrowLeft,
  Heart,
  MessageCircle,
  Calendar,
  Share2,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { UpdateActions } from "./update-actions";
import { UpdateComments } from "@/components/updates/update-comments";

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

export default async function UpdatePage({ params }: UpdatePageProps) {
  const { slug, id } = await params;
  const session = await auth();

  const update = await prisma.dailyUpdate.findUnique({
    where: { id },
    select: {
      id: true,
      content: true,
      imageUrl: true,
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
    <div className="relative min-h-screen bg-zinc-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link
          href={`/${slug}`}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to profile
        </Link>

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

          {/* Content */}
          <div className="p-6">
            <div className="prose prose-invert prose-zinc max-w-none">
              <p className="text-zinc-200 whitespace-pre-wrap text-base leading-relaxed">
                {update.content}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Stats */}
              <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                <Heart className="h-4 w-4" />
                <span>{update._count.likes}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                <MessageCircle className="h-4 w-4" />
                <span>{update._count.comments}</span>
              </div>
            </div>

            {/* Action buttons */}
            <UpdateActions
              updateId={update.id}
              userSlug={slug}
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
      </div>
    </div>
  );
}
