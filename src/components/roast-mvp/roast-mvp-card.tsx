"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Flame,
  Clock,
  ExternalLink,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  User,
  Sparkles,
  X,
  Loader2,
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

interface UserProject {
  id: string;
  title: string;
  slug: string | null;
}

interface RoastMVPCardProps {
  userProjects?: UserProject[];
  isAuthenticated?: boolean;
}

export function RoastMVPCard({ userProjects = [], isAuthenticated = false }: RoastMVPCardProps) {
  const [data, setData] = useState<RoastMVPData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSubmitPanel, setShowSubmitPanel] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRoastData();
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setShowSubmitPanel(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const handleSubmitForRoast = async () => {
    if (!selectedProject) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/roast-mvp/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProject }),
      });

      const json = await res.json();

      if (res.ok && json.url) {
        window.location.href = json.url;
      } else {
        alert(json.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error submitting for roast:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const featured = data?.featured;
  const projectUrl = featured
    ? `/projects/${featured.project.slug || featured.project.id}`
    : "";

  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 bg-zinc-900/80">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500 animate-pulse" />
          <div>
            <h2 className="text-sm font-semibold text-white">Roast my MVP</h2>
            <p className="text-[10px] text-zinc-500">Featured this week</p>
          </div>
        </div>
        <div className="relative" ref={panelRef}>
          {isAuthenticated ? (
            <button
              onClick={() => setShowSubmitPanel(!showSubmitPanel)}
              className="text-xs text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1"
            >
              Submit yours
              <ChevronDown className={cn("h-3 w-3 transition-transform", showSubmitPanel && "rotate-180")} />
            </button>
          ) : (
            <Link
              href="/signin"
              className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
            >
              Submit yours →
            </Link>
          )}

          {/* Submit Panel */}
          {showSubmitPanel && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-zinc-700/50 bg-zinc-900 shadow-2xl shadow-black/50 z-50">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">Submit for featuring</h3>
                  <button
                    onClick={() => setShowSubmitPanel(false)}
                    className="text-zinc-500 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-xs text-zinc-400 mb-4">
                  Get your MVP featured for 7 days. <span className="text-orange-400 font-medium">$20</span>
                </p>

                {userProjects.length > 0 ? (
                  <>
                    <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
                      {userProjects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => setSelectedProject(project.id)}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                            selectedProject === project.id
                              ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                              : "hover:bg-zinc-800 text-zinc-300 border border-transparent"
                          )}
                        >
                          {project.title}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleSubmitForRoast}
                      disabled={!selectedProject || submitting}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Pay $20 & Submit
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-xs text-zinc-500 mb-3">You need to create a project first</p>
                    <Link
                      href="/projects/new"
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-400 rounded-lg border border-orange-500/30 hover:bg-orange-500/10 transition-colors"
                    >
                      Create Project
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}

                {data && data.queueCount > 0 && (
                  <p className="text-[10px] text-zinc-500 mt-3 text-center">
                    {data.queueCount} project{data.queueCount !== 1 ? "s" : ""} currently in queue
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-5 animate-pulse">
          <div className="flex flex-col gap-4">
            <div className="w-full h-36 bg-zinc-800 rounded-lg" />
            <div className="space-y-2">
              <div className="h-5 w-3/4 bg-zinc-800 rounded" />
              <div className="h-4 w-full bg-zinc-800 rounded" />
              <div className="h-4 w-2/3 bg-zinc-800 rounded" />
            </div>
          </div>
        </div>
      ) : featured ? (
        <div className="p-5">
          <div className="relative">
            {/* Time remaining badge */}
            <div className="absolute -top-2 -right-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg z-10">
              <Clock className="h-3 w-3" />
              {getDaysRemaining(featured.expiresAt)}d left
            </div>

            {/* Project Image - Full width */}
            {featured.project.imageUrl && (
              <Link href={projectUrl} className="block mb-4">
                <div className="relative w-full h-36 rounded-lg overflow-hidden group/image ring-2 ring-orange-500/30">
                  <Image
                    src={featured.project.imageUrl}
                    alt={featured.project.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover/image:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 to-transparent" />
                </div>
              </Link>
            )}

            {/* Project Details */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Link href={projectUrl}>
                    <h3 className="text-base font-semibold text-white hover:text-orange-400 transition-colors line-clamp-1">
                      {featured.project.title}
                    </h3>
                  </Link>
                  <p className="mt-1 text-sm text-zinc-400 line-clamp-2">
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

              {/* Author & Status Row */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
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
                  <span className="text-xs text-zinc-400 truncate max-w-[80px]">
                    {featured.project.user.name}
                  </span>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
                      getStatusColor(featured.project.status)
                    )}
                  >
                    {getStatusLabel(featured.project.status)}
                  </span>

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
                      className="text-orange-400 hover:text-orange-300 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Roast CTA */}
              <Link
                href={projectUrl}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transition-all shadow-lg shadow-orange-500/20"
              >
                🔥 Roast This MVP
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* No featured project - show CTA to submit */
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500/10 flex items-center justify-center">
            <Flame className="h-8 w-8 text-orange-500/60" />
          </div>
          <h3 className="text-sm font-medium text-white mb-1">No MVP Featured</h3>
          <p className="text-xs text-zinc-500 mb-4">
            Be the first to get your project in the spotlight!
          </p>
          {isAuthenticated ? (
            <button
              onClick={() => setShowSubmitPanel(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transition-all shadow-lg shadow-orange-500/20"
            >
              <Sparkles className="h-4 w-4" />
              Submit Yours — $20
            </button>
          ) : (
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transition-all shadow-lg shadow-orange-500/20"
            >
              <Sparkles className="h-4 w-4" />
              Sign in to Submit
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
