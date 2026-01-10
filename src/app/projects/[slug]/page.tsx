import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CommentList } from "@/components/comments/comment-list";
import { UpvoteButton } from "@/components/projects/upvote-button";
import { ImageGallery } from "@/components/ui/image-gallery";
import { MilestoneSectionWrapper } from "@/components/projects/milestone-section-wrapper";
import { cn, formatRelativeTime, getStatusColor, getStatusLabel } from "@/lib/utils";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  User,
  Calendar,
  Pencil,
  Images,
  Play,
  FileText,
  ScrollText,
  Users
} from "lucide-react";
import { DeleteProjectButton } from "@/components/projects/delete-project-button";
import ReactMarkdown from "react-markdown";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const session = await auth();

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          slug: true,
        },
      },
      coBuilders: {
        include: {
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
      images: {
        orderBy: { order: "asc" },
      },
      milestones: {
        orderBy: { achievedAt: "desc" },
      },
      _count: {
        select: {
          upvotes: true,
          comments: true,
          milestones: true,
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Check if user has upvoted
  let hasUpvoted = false;
  if (session?.user?.id) {
    const upvote = await prisma.upvote.findUnique({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId: project.id,
        },
      },
    });
    hasUpvoted = !!upvote;
  }

  const isOwner = session?.user?.id === project.userId;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>

      <article className="space-y-8">
        {/* Header */}
        <header className="card p-8">
          {/* Cover Image */}
          {project.imageUrl && (
            <div className="relative -mx-8 -mt-8 mb-8 h-64 sm:h-80 overflow-hidden rounded-t-2xl">
              <Image
                src={project.imageUrl}
                alt={project.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent" />
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            {/* Upvote */}
            <div className="order-2 sm:order-1">
              <UpvoteButton
                projectId={project.id}
                initialCount={project._count.upvotes}
                initialUpvoted={hasUpvoted}
                size="lg"
              />
            </div>

            {/* Info */}
            <div className="flex-1 order-1 sm:order-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white">{project.title}</h1>
                  <p className="mt-2 text-lg text-zinc-400">{project.tagline}</p>
                </div>

                {/* Owner Actions */}
                {isOwner && (
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/projects/${project.slug}/edit`}
                      className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                      title="Edit project"
                    >
                      <Pencil className="h-5 w-5" />
                    </Link>
                    <DeleteProjectButton projectId={project.id} />
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium border",
                    getStatusColor(project.status)
                  )}
                >
                  {getStatusLabel(project.status)}
                </span>

                {/* Author */}
                {project.user.slug ? (
                  <Link
                    href={`/${project.user.slug}`}
                    className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    {project.user.image ? (
                      <Image
                        src={project.user.image}
                        alt={project.user.name || "User"}
                        width={20}
                        height={20}
                        className="rounded-full object-cover w-5 h-5"
                      />
                    ) : (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700">
                        <User className="h-2.5 w-2.5 text-zinc-400" />
                      </div>
                    )}
                    <span>{project.user.name}</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    {project.user.image ? (
                      <Image
                        src={project.user.image}
                        alt={project.user.name || "User"}
                        width={20}
                        height={20}
                        className="rounded-full object-cover w-5 h-5"
                      />
                    ) : (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700">
                        <User className="h-2.5 w-2.5 text-zinc-400" />
                      </div>
                    )}
                    <span>{project.user.name}</span>
                  </div>
                )}

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Calendar className="h-4 w-4" />
                  <span>{formatRelativeTime(project.createdAt)}</span>
                </div>
              </div>

              {/* Co-Builders */}
              {project.coBuilders && project.coBuilders.length > 0 && (
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                    <Users className="h-4 w-4" />
                    <span>Co-Builders:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {project.coBuilders.map((cb) => {
                      const displayName = cb.user.firstName && cb.user.lastName
                        ? `${cb.user.firstName} ${cb.user.lastName}`
                        : cb.user.name || "Unknown";

                      return cb.user.slug ? (
                        <Link
                          key={cb.user.id}
                          href={`/${cb.user.slug}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 px-2.5 py-1 text-sm text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors"
                        >
                          {cb.user.image ? (
                            <Image
                              src={cb.user.image}
                              alt={displayName}
                              width={16}
                              height={16}
                              className="rounded-full object-cover w-4 h-4"
                            />
                          ) : (
                            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-700">
                              <User className="h-2 w-2 text-zinc-400" />
                            </div>
                          )}
                          <span>{displayName}</span>
                        </Link>
                      ) : (
                        <div
                          key={cb.user.id}
                          className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 px-2.5 py-1 text-sm text-zinc-400"
                        >
                          {cb.user.image ? (
                            <Image
                              src={cb.user.image}
                              alt={displayName}
                              width={16}
                              height={16}
                              className="rounded-full object-cover w-4 h-4"
                            />
                          ) : (
                            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-700">
                              <User className="h-2 w-2 text-zinc-400" />
                            </div>
                          )}
                          <span>{displayName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="mt-6 flex flex-wrap gap-3">
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit Project
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    View Source
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 transition-colors"
                  >
                    <Play className="h-4 w-4" />
                    Live Demo
                  </a>
                )}
                {project.docsUrl && (
                  <a
                    href={project.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    Documentation
                  </a>
                )}
                {project.changelogUrl && (
                  <a
                    href={project.changelogUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-zinc-700 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-600 transition-colors"
                  >
                    <ScrollText className="h-4 w-4" />
                    Changelog
                  </a>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Description */}
        {project.description && (
          <section className="card p-8">
            <h2 className="text-xl font-semibold text-white mb-4">About</h2>
            <div className="prose prose-invert prose-zinc max-w-none prose-headings:text-white prose-p:text-zinc-300 prose-strong:text-white prose-a:text-orange-400 hover:prose-a:text-orange-300 prose-code:text-orange-300 prose-code:bg-zinc-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-zinc-800/50 prose-pre:border prose-pre:border-zinc-700/50 prose-ul:text-zinc-300 prose-ol:text-zinc-300 prose-li:marker:text-zinc-500">
              <ReactMarkdown>{project.description}</ReactMarkdown>
            </div>
          </section>
        )}

        {/* Gallery */}
        {project.images && project.images.length > 0 && (
          <section className="card p-8">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Images className="h-5 w-5 text-zinc-400" />
              Screenshots
            </h2>
            <ImageGallery images={project.images} />
          </section>
        )}

        {/* Milestones - Longitudinal Record of Execution */}
        <section className="card p-8">
          <MilestoneSectionWrapper
            projectId={project.id}
            initialMilestones={project.milestones}
            isOwner={isOwner}
          />
        </section>

        {/* Comments */}
        <section className="card p-8">
          <CommentList
            projectId={project.id}
            initialCommentCount={project._count.comments}
          />
        </section>
      </article>
    </div>
  );
}
