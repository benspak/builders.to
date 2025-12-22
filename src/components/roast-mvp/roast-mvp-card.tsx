"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Flame,
  Clock,
  ExternalLink,
  MessageSquare,
  ChevronRight,
  User,
} from "lucide-react";
import { cn, getStatusColor, getStatusLabel } from "@/lib/utils";
import { UpvoteButton } from "@/components/projects/upvote-button";

interface FeaturedProject {
  id: string;
  slug: string | null;
  title: string;
  tagline: string;
  description?: string | null;
  url?: string | null;
  imageUrl?: string | null;
  status: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    slug?: string | null;
  };
  _count: {
    upvotes: number;
    comments: number;
  };
  hasUpvoted?: boolean;
}

interface RoastMVPData {
  featured: {
    project: FeaturedProject;
    featuredAt: string;
    expiresAt: string;
  } | null;
  queueCount: number;
}

export function RoastMVPCard() {
  const [data, setData] = useState<RoastMVPData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoastData();
  }, []);

  const fetchRoastData = async () => {
    try {
      const res = await fetch("/api/roast-mvp");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Failed to fetch roast MVP data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Don't render anything if there's no featured project
  if (!loading && !data?.featured) {
    return null;
  }

  const featured = data?.featured;
  const projectUrl = featured
    ? `/projects/${featured.project.slug || featured.project.id}`
    : "";

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500 animate-pulse" />
          <h2 className="text-lg font-semibold text-white">Roast my MVP</h2>
          <span className="text-xs text-zinc-500">Featured this week</span>
        </div>
        <Link
          href="/#roast-mvp"
          className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
        >
          Submit yours →
        </Link>
      </div>

      {loading ? (
        <div className="card p-4 animate-pulse">
          <div className="flex gap-4">
            <div className="w-24 h-24 bg-zinc-800 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-3/4 bg-zinc-800 rounded" />
              <div className="h-4 w-full bg-zinc-800 rounded" />
              <div className="h-4 w-1/2 bg-zinc-800 rounded" />
            </div>
          </div>
        </div>
      ) : featured ? (
        <div className="relative group">
          {/* Glowing border effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-xl opacity-30 group-hover:opacity-50 blur transition-opacity" />

          <div className="relative card bg-zinc-900/90 p-4">
            {/* Time remaining badge */}
            <div className="absolute -top-2.5 right-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-2 py-0.5 text-xs font-bold text-white shadow-lg">
              <Clock className="h-3 w-3" />
              {getDaysRemaining(featured.expiresAt)}d left
            </div>

            <div className="flex gap-4">
              {/* Project Image */}
              {featured.project.imageUrl && (
                <Link href={projectUrl} className="shrink-0">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden group/image">
                    <Image
                      src={featured.project.imageUrl}
                      alt={featured.project.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover/image:scale-105"
                    />
                  </div>
                </Link>
              )}

              {/* Project Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link href={projectUrl}>
                      <h3 className="text-base font-semibold text-white hover:text-orange-400 transition-colors truncate">
                        {featured.project.title}
                      </h3>
                    </Link>
                    <p className="mt-0.5 text-sm text-zinc-400 line-clamp-2">
                      {featured.project.tagline}
                    </p>
                  </div>
                  <UpvoteButton
                    projectId={featured.project.id}
                    initialCount={featured.project._count.upvotes}
                    initialUpvoted={featured.project.hasUpvoted || false}
                    size="sm"
                  />
                </div>

                {/* Footer */}
                <div className="mt-3 flex items-center justify-between">
                  {/* Author */}
                  <div className="flex items-center gap-2">
                    {featured.project.user.image ? (
                      <Image
                        src={featured.project.user.image}
                        alt={featured.project.user.name || "User"}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700">
                        <User className="h-2.5 w-2.5 text-zinc-400" />
                      </div>
                    )}
                    <span className="text-xs text-zinc-500">
                      {featured.project.user.name}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
                        getStatusColor(featured.project.status)
                      )}
                    >
                      {getStatusLabel(featured.project.status)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <Link
                      href={`${projectUrl}#comments`}
                      className="flex items-center gap-1 text-xs text-zinc-500 hover:text-orange-400 transition-colors"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>{featured.project._count.comments}</span>
                    </Link>

                    {featured.project.url && (
                      <a
                        href={featured.project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}

                    <Link
                      href={projectUrl}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white rounded-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transition-all"
                    >
                      🔥 Roast
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
