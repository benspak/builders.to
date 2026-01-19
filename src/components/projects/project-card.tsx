"use client";

import Link from "next/link";
import Image from "next/image";
import { MessageSquare, ExternalLink, Github, User, Play, FileText } from "lucide-react";
import { cn, formatRelativeTime, getStatusColor, getStatusLabel, getMilestoneLabel, getMilestoneColor } from "@/lib/utils";
import { UpvoteButton } from "./upvote-button";

interface Milestone {
  id: string;
  type: string;
  title?: string | null;
}

interface CoBuilderUser {
  id: string;
  name: string | null;
  firstName?: string | null;
  lastName?: string | null;
  image: string | null;
  slug?: string | null;
}

interface ProjectCardProps {
  project: {
    id: string;
    slug: string | null;
    title: string;
    tagline: string;
    url?: string | null;
    githubUrl?: string | null;
    imageUrl?: string | null;
    status: string;
    createdAt: string | Date;
    // Artifact fields
    demoUrl?: string | null;
    docsUrl?: string | null;
    changelogUrl?: string | null;
    user: {
      id: string;
      name: string | null;
      image: string | null;
      slug?: string | null;
    };
    coBuilders?: {
      user: CoBuilderUser;
    }[];
    _count: {
      upvotes: number;
      comments: number;
      milestones?: number;
    };
    milestones?: Milestone[];
    hasUpvoted?: boolean;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const projectUrl = `/projects/${project.slug || project.id}`;

  return (
    <div className="card card-hover group relative flex flex-col overflow-hidden">
      {/* Image */}
      {project.imageUrl && (
        <div className="relative h-48 aspect-video overflow-hidden">
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Link
              href={projectUrl}
              className="block group/title"
            >
              <h3 className="text-lg font-semibold text-white truncate group-hover/title:text-orange-400 transition-colors">
                {project.title}
              </h3>
            </Link>
            <p className="mt-1 text-sm text-zinc-400 line-clamp-2">
              {project.tagline}
            </p>
          </div>
          <UpvoteButton
            projectId={project.id}
            initialCount={project._count.upvotes}
            initialUpvoted={project.hasUpvoted || false}
          />
        </div>

        {/* Status badge and Milestones */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border",
              getStatusColor(project.status)
            )}
          >
            {getStatusLabel(project.status)}
          </span>

          {/* Milestone badges - show up to 2 */}
          {project.milestones && project.milestones.length > 0 && (
            <>
              {project.milestones.slice(0, 2).map((milestone) => (
                <span
                  key={milestone.id}
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
                    getMilestoneColor(milestone.type)
                  )}
                  title={milestone.type === "CUSTOM" && milestone.title
                    ? milestone.title
                    : getMilestoneLabel(milestone.type)}
                >
                  {getMilestoneLabel(milestone.type).split(" ")[0]}
                </span>
              ))}
              {project.milestones.length > 2 && (
                <span className="text-xs text-zinc-500">
                  +{project.milestones.length - 2}
                </span>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
          {/* Author & Co-Builders */}
          <div className="flex items-center gap-2">
            {/* Stacked Avatars */}
            <div className="flex items-center -space-x-2">
              {/* Main Author */}
              {project.user.slug ? (
                <Link
                  href={`/${project.user.slug}`}
                  className="relative z-10 block"
                  title={project.user.name || "User"}
                >
                  {project.user.image ? (
                    <Image
                      src={project.user.image}
                      alt={project.user.name || "User"}
                      width={20}
                      height={20}
                      className="rounded-full ring-2 ring-zinc-900 object-cover w-5 h-5"
                    />
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 ring-2 ring-zinc-900">
                      <User className="h-2.5 w-2.5 text-zinc-400" />
                    </div>
                  )}
                </Link>
              ) : (
                <div className="relative z-10" title={project.user.name || "User"}>
                  {project.user.image ? (
                    <Image
                      src={project.user.image}
                      alt={project.user.name || "User"}
                      width={20}
                      height={20}
                      className="rounded-full ring-2 ring-zinc-900 object-cover w-5 h-5"
                    />
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 ring-2 ring-zinc-900">
                      <User className="h-2.5 w-2.5 text-zinc-400" />
                    </div>
                  )}
                </div>
              )}

              {/* Co-Builders (show up to 3) */}
              {project.coBuilders?.slice(0, 3).map((cb, idx) => {
                const displayName = cb.user.firstName && cb.user.lastName
                  ? `${cb.user.firstName} ${cb.user.lastName}`
                  : cb.user.name || "Co-builder";

                return cb.user.slug ? (
                  <Link
                    key={cb.user.id}
                    href={`/${cb.user.slug}`}
                    className="relative block"
                    style={{ zIndex: 9 - idx }}
                    title={displayName}
                  >
                    {cb.user.image ? (
                      <Image
                        src={cb.user.image}
                        alt={displayName}
                        width={20}
                        height={20}
                        className="rounded-full ring-2 ring-zinc-900 object-cover w-5 h-5"
                      />
                    ) : (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 ring-2 ring-zinc-900">
                        <User className="h-2.5 w-2.5 text-zinc-400" />
                      </div>
                    )}
                  </Link>
                ) : (
                  <div
                    key={cb.user.id}
                    className="relative"
                    style={{ zIndex: 9 - idx }}
                    title={displayName}
                  >
                    {cb.user.image ? (
                      <Image
                        src={cb.user.image}
                        alt={displayName}
                        width={20}
                        height={20}
                        className="rounded-full ring-2 ring-zinc-900 object-cover w-5 h-5"
                      />
                    ) : (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 ring-2 ring-zinc-900">
                        <User className="h-2.5 w-2.5 text-zinc-400" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Show overflow count */}
              {project.coBuilders && project.coBuilders.length > 3 && (
                <div
                  className="relative flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 ring-2 ring-zinc-900 text-[10px] text-zinc-400"
                  style={{ zIndex: 5 }}
                >
                  +{project.coBuilders.length - 3}
                </div>
              )}
            </div>

            {/* Author name (only show if no co-builders to save space) */}
            {(!project.coBuilders || project.coBuilders.length === 0) && (
              project.user.slug ? (
                <Link
                  href={`/${project.user.slug}`}
                  className="text-sm text-zinc-400 hover:text-white transition-colors truncate max-w-[100px]"
                >
                  {project.user.name}
                </Link>
              ) : (
                <span className="text-sm text-zinc-400 truncate max-w-[100px]">{project.user.name}</span>
              )
            )}
          </div>

          {/* Stats & Links */}
          <div className="flex items-center gap-2">
            <Link
              href={`${projectUrl}#comments`}
              className="flex items-center gap-1 text-sm text-zinc-500 hover:text-white transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{project._count.comments}</span>
            </Link>

            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-cyan-400 transition-colors"
                title="Live Demo"
              >
                <Play className="h-4 w-4" />
              </a>
            )}

            {project.docsUrl && (
              <a
                href={project.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-blue-400 transition-colors"
                title="Documentation"
              >
                <FileText className="h-4 w-4" />
              </a>
            )}

            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white transition-colors"
                title="Visit Project"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}

            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white transition-colors"
                title="Source Code"
              >
                <Github className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {/* Time */}
        <div className="mt-2 text-xs text-zinc-600">
          {formatRelativeTime(project.createdAt)}
        </div>
      </div>
    </div>
  );
}
