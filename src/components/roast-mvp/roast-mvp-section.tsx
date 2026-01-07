"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Flame,
  Clock,
  Users,
  ExternalLink,
  MessageSquare,
  ChevronRight,
  Sparkles,
  User
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

interface RoastMVPSectionProps {
  isAuthenticated: boolean;
  userProjects?: Array<{ id: string; title: string; slug: string | null }>;
}

export function RoastMVPSection({ isAuthenticated, userProjects = [] }: RoastMVPSectionProps) {
  const [data, setData] = useState<RoastMVPData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

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
  const projectUrl = featured ? `/projects/${featured.project.slug || featured.project.id}` : "";

  return (
    <section id="roast-mvp" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Fiery background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-orange-900/10 to-transparent" />
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-red-500/20 via-orange-500/10 to-transparent blur-[100px]" />

      {/* Animated flame particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-400 rounded-full animate-float opacity-60" style={{ animationDelay: "0s" }} />
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-red-400 rounded-full animate-float opacity-50" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-400 rounded-full animate-float opacity-40" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-orange-300 rounded-full animate-float opacity-70" style={{ animationDelay: "0.5s" }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm text-red-400 mb-6">
            <Flame className="h-4 w-4 animate-pulse" />
            <span className="font-semibold">Featured MVP of the Week</span>
            <Flame className="h-4 w-4 animate-pulse" />
          </div>

          <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
            🔥 Roast my{" "}
            <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              MVP
            </span>
          </h2>

          <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
            Put your MVP in the spotlight. Get brutally honest feedback from the community.
            <span className="text-orange-400 font-medium"> $20 for 1 week of featured exposure.</span>
          </p>
        </div>

        {/* Featured Project Card */}
        {loading ? (
          <div className="max-w-3xl mx-auto">
            <div className="card p-8 animate-pulse">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-64 h-48 bg-zinc-800 rounded-xl" />
                <div className="flex-1 space-y-4">
                  <div className="h-8 w-3/4 bg-zinc-800 rounded" />
                  <div className="h-4 w-full bg-zinc-800 rounded" />
                  <div className="h-4 w-2/3 bg-zinc-800 rounded" />
                  <div className="h-10 w-32 bg-zinc-800 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        ) : featured ? (
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              {/* Glowing border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-2xl opacity-50 group-hover:opacity-75 blur transition-opacity" />

              <div className="relative card bg-zinc-900/90 p-6 md:p-8">
                {/* Time remaining badge */}
                <div className="absolute -top-3 right-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                  <Clock className="h-3 w-3" />
                  {getDaysRemaining(featured.expiresAt)} days left
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Project Image */}
                  {featured.project.imageUrl && (
                    <Link href={projectUrl} className="shrink-0">
                      <div className="relative w-full md:w-64 h-48 rounded-xl overflow-hidden group/image">
                        <Image
                          src={featured.project.imageUrl}
                          alt={featured.project.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover/image:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent" />
                      </div>
                    </Link>
                  )}

                  {/* Project Details */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link href={projectUrl}>
                          <h3 className="text-2xl font-bold text-white hover:text-orange-400 transition-colors">
                            {featured.project.title}
                          </h3>
                        </Link>
                        <p className="mt-2 text-zinc-400 line-clamp-2">
                          {featured.project.tagline}
                        </p>
                      </div>
                      <UpvoteButton
                        projectId={featured.project.id}
                        initialCount={featured.project._count.upvotes}
                        initialUpvoted={featured.project.hasUpvoted || false}
                      />
                    </div>

                    {/* Status badge */}
                    <div className="mt-4">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border",
                          getStatusColor(featured.project.status)
                        )}
                      >
                        {getStatusLabel(featured.project.status)}
                      </span>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto pt-4 flex items-center justify-between">
                      {/* Author */}
                      {featured.project.user.slug ? (
                        <Link
                          href={`/${featured.project.user.slug}`}
                          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                        >
                          {featured.project.user.image ? (
                            <Image
                              src={featured.project.user.image}
                              alt={featured.project.user.name || "User"}
                              width={28}
                              height={28}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-700">
                              <User className="h-3.5 w-3.5 text-zinc-400" />
                            </div>
                          )}
                          <span>{featured.project.user.name}</span>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          {featured.project.user.image ? (
                            <Image
                              src={featured.project.user.image}
                              alt={featured.project.user.name || "User"}
                              width={28}
                              height={28}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-700">
                              <User className="h-3.5 w-3.5 text-zinc-400" />
                            </div>
                          )}
                          <span>{featured.project.user.name}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-4">
                        <Link
                          href={`${projectUrl}#comments`}
                          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-orange-400 transition-colors"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>{featured.project._count.comments} roasts</span>
                        </Link>

                        {featured.project.url && (
                          <a
                            href={featured.project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-orange-400 hover:text-orange-300 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Visit
                          </a>
                        )}
                      </div>
                    </div>

                    {/* CTA to view project */}
                    <Link
                      href={projectUrl}
                      className="mt-4 inline-flex items-center justify-center gap-2 px-5 py-2.5 font-semibold text-white rounded-xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/25"
                    >
                      🔥 Roast This MVP
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* No featured project - show empty state */
          <div className="max-w-3xl mx-auto">
            <div className="card p-8 text-center border-dashed border-orange-500/30">
              <Flame className="h-12 w-12 text-orange-500/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No MVP Currently Featured
              </h3>
              <p className="text-zinc-400 mb-6">
                Be the first to put your MVP in the hot seat!
              </p>
            </div>
          </div>
        )}

        {/* Queue Info & Submit CTA */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-6">
          {data && data.queueCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Users className="h-4 w-4 text-orange-500" />
              <span>
                <span className="text-white font-semibold">{data.queueCount}</span> project{data.queueCount !== 1 ? "s" : ""} in queue
              </span>
            </div>
          )}

          {isAuthenticated ? (
            <div className="relative">
              {showProjectPicker && userProjects.length > 0 && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 card p-4 z-10 shadow-2xl">
                  <p className="text-sm text-zinc-400 mb-3">Select a project to submit:</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {userProjects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => setSelectedProject(project.id)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                          selectedProject === project.id
                            ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                            : "hover:bg-zinc-800 text-white"
                        )}
                      >
                        {project.title}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleSubmitForRoast}
                    disabled={!selectedProject || submitting}
                    className="mt-4 w-full btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Processing..." : "Pay $20 & Submit"}
                  </button>
                </div>
              )}

              {userProjects.length > 0 ? (
                <button
                  onClick={() => setShowProjectPicker(!showProjectPicker)}
                  className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white rounded-xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/25"
                >
                  <Sparkles className="h-5 w-5" />
                  Submit Your MVP — $20
                </button>
              ) : (
                <Link
                  href="/projects/new"
                  className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white rounded-xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/25"
                >
                  <Sparkles className="h-5 w-5" />
                  Create a Project First
                </Link>
              )}
            </div>
          ) : (
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white rounded-xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/25"
            >
              <Sparkles className="h-5 w-5" />
              Sign in to Submit — $20
            </Link>
          )}
        </div>

        {/* How it works */}
        <div className="mt-16 text-center">
          <p className="text-sm text-zinc-500">
            📌 Projects are featured one at a time for 7 days. Queue position is first-come, first-served after payment.
          </p>
        </div>
      </div>
    </section>
  );
}
