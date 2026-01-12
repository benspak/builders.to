"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, ExternalLink, ArrowUpRight, User, Sparkles } from "lucide-react";
import { cn, getStatusColor, getStatusLabel } from "@/lib/utils";

interface EditorsPickProject {
  id: string;
  slug: string | null;
  title: string;
  tagline: string | null;
  imageUrl: string | null;
  status: string;
  url: string | null;
  user: {
    id: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
    slug: string | null;
  };
  _count: {
    upvotes: number;
  };
}

interface EditorsPickProps {
  project: EditorsPickProject;
}

export function EditorsPick({ project }: EditorsPickProps) {
  const getDisplayName = (user: EditorsPickProject["user"]) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.name || "Anonymous Builder";
  };

  const projectUrl = project.slug ? `/projects/${project.slug}` : "#";

  return (
    <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-zinc-900/50 to-zinc-900/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-transparent">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25">
          <Star className="h-4 w-4 text-white fill-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Editor&apos;s Pick</h3>
          <p className="text-[10px] text-amber-400/70">Featured project</p>
        </div>
        <Sparkles className="h-3.5 w-3.5 text-amber-400/50 ml-auto" />
      </div>

      {/* Project Content */}
      <Link href={projectUrl} className="block group">
        {/* Project Image */}
        {project.imageUrl && (
          <div className="relative h-36 overflow-hidden">
            <Image
              src={project.imageUrl}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/30 to-transparent" />

            {/* Status Badge */}
            <div className="absolute top-3 left-3">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border backdrop-blur-sm",
                  getStatusColor(project.status)
                )}
              >
                {getStatusLabel(project.status)}
              </span>
            </div>

            {/* Upvotes Badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5 border border-white/10">
              <ArrowUpRight className="h-3 w-3 text-orange-400" />
              <span className="text-[10px] font-semibold text-white">{project._count.upvotes}</span>
            </div>
          </div>
        )}

        {/* Project Info */}
        <div className="p-4">
          <h4 className="text-base font-semibold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
            {project.title}
          </h4>
          {project.tagline && (
            <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
              {project.tagline}
            </p>
          )}

          {/* Builder Info */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {project.user.image ? (
                <Image
                  src={project.user.image}
                  alt={getDisplayName(project.user)}
                  width={20}
                  height={20}
                  className="rounded-full ring-1 ring-zinc-700"
                />
              ) : (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 ring-1 ring-zinc-700">
                  <User className="h-2.5 w-2.5 text-zinc-500" />
                </div>
              )}
              {project.user.slug ? (
                <span className="text-xs text-zinc-400 hover:text-white transition-colors">
                  {getDisplayName(project.user)}
                </span>
              ) : (
                <span className="text-xs text-zinc-500">
                  {getDisplayName(project.user)}
                </span>
              )}
            </div>

            {/* External Link */}
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-amber-400 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Visit
              </a>
            )}
          </div>
        </div>
      </Link>

      {/* View Project CTA */}
      <Link
        href={projectUrl}
        className="block px-4 py-2.5 text-center text-sm font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/5 border-t border-amber-500/20 transition-colors"
      >
        View Project →
      </Link>
    </div>
  );
}
