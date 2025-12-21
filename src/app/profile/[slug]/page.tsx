import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  User,
  Calendar,
  Link as LinkIcon,
  MapPin,
  Building2,
  Rocket,
  Settings,
} from "lucide-react";
import { formatRelativeTime, getStatusColor, getStatusLabel, getCategoryColor, getCategoryLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

// Social icons
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

interface ProfilePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const user = await prisma.user.findUnique({
    where: { slug },
    select: { name: true, firstName: true, lastName: true, headline: true },
  });

  if (!user) {
    return { title: "User Not Found - Builders.to" };
  }

  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.name || "Builder";

  return {
    title: `${displayName} - Builders.to`,
    description: user.headline || `${displayName}'s profile on Builders.to`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params;
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      firstName: true,
      lastName: true,
      zipCode: true,
      city: true,
      state: true,
      headline: true,
      bio: true,
      websiteUrl: true,
      twitterUrl: true,
      youtubeUrl: true,
      linkedinUrl: true,
      image: true,
      createdAt: true,
      projects: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          slug: true,
          title: true,
          tagline: true,
          status: true,
          imageUrl: true,
          createdAt: true,
          _count: {
            select: { upvotes: true, comments: true },
          },
        },
      },
      companies: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          slug: true,
          name: true,
          logo: true,
          location: true,
          category: true,
          about: true,
          createdAt: true,
          _count: {
            select: { projects: true },
          },
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const isOwnProfile = session?.user?.id === user.id;
  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.name || "Builder";

  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const socialLinks = [
    { url: user.twitterUrl, icon: XIcon, label: "X" },
    { url: user.youtubeUrl, icon: YouTubeIcon, label: "YouTube" },
    { url: user.linkedinUrl, icon: LinkedInIcon, label: "LinkedIn" },
  ].filter(link => link.url);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      {/* Hero Section */}
      <div className="relative border-b border-white/5">
        {/* Gradient banner */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-orange-600/20 via-orange-500/10 to-cyan-500/10" />

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 sm:-mt-20 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:gap-6">
              {/* Avatar */}
              <div className="relative">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={displayName}
                    width={128}
                    height={128}
                    className="h-28 w-28 sm:h-36 sm:w-36 rounded-2xl border-4 border-zinc-950 object-cover shadow-2xl"
                  />
                ) : (
                  <div className="flex h-28 w-28 sm:h-36 sm:w-36 items-center justify-center rounded-2xl border-4 border-zinc-950 bg-gradient-to-br from-orange-500 to-pink-500 shadow-2xl">
                    <User className="h-14 w-14 sm:h-16 sm:w-16 text-white" />
                  </div>
                )}
              </div>

              {/* Name and info */}
              <div className="mt-4 sm:mt-0 sm:pb-2 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                      {displayName}
                    </h1>
                    {user.headline && (
                      <p className="mt-1 text-zinc-400 text-sm sm:text-base max-w-xl">
                        {user.headline}
                      </p>
                    )}
                  </div>

                  {isOwnProfile && (
                    <Link
                      href="/settings"
                      className="inline-flex items-center gap-2 rounded-xl bg-zinc-800/50 border border-zinc-700/50 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
                    >
                      <Settings className="h-4 w-4" />
                      Edit Profile
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Meta info card */}
            <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6">
              <div className="space-y-4">
                {/* Joined date */}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-zinc-500" />
                  <span className="text-zinc-400">
                    Joined <span className="text-white">{joinedDate}</span>
                  </span>
                </div>

                {/* Location */}
                {(user.city || user.state) && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-300">
                      {user.city && user.state
                        ? `${user.city}, ${user.state}`
                        : user.city || user.state}
                    </span>
                  </div>
                )}

                {/* Website */}
                {user.websiteUrl && (
                  <div className="flex items-center gap-3 text-sm">
                    <LinkIcon className="h-4 w-4 text-zinc-500" />
                    <a
                      href={user.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-400 hover:text-orange-300 transition-colors truncate"
                    >
                      {user.websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </a>
                  </div>
                )}

                {/* Stats */}
                <div className="pt-4 border-t border-white/5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-xl bg-zinc-800/30">
                      <div className="text-2xl font-bold text-white">{user.projects.length}</div>
                      <div className="text-xs text-zinc-400">Projects</div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-zinc-800/30">
                      <div className="text-2xl font-bold text-white">{user.companies.length}</div>
                      <div className="text-xs text-zinc-400">Companies</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6">
                <h3 className="text-sm font-semibold text-white mb-4">Connect</h3>
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map(({ url, icon: Icon, label }) => (
                    <a
                      key={label}
                      href={url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-zinc-800/50 border border-zinc-700/50 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-orange-500/30 transition-all"
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            {user.bio && (
              <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6">
                <h3 className="text-sm font-semibold text-white mb-3">About</h3>
                <p className="text-sm text-zinc-400 whitespace-pre-wrap leading-relaxed">
                  {user.bio}
                </p>
              </div>
            )}
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Projects */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Rocket className="h-5 w-5 text-orange-500" />
                <h2 className="text-xl font-semibold text-white">Projects</h2>
                <span className="text-sm text-zinc-500">({user.projects.length})</span>
              </div>

              {user.projects.length > 0 ? (
                <div className="space-y-4">
                  {user.projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.slug || project.id}`}
                      className="block rounded-xl border border-white/10 bg-zinc-900/50 p-4 hover:border-orange-500/30 hover:bg-zinc-900/70 transition-all group"
                    >
                      <div className="flex gap-4">
                        {/* Thumbnail */}
                        <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                          {project.imageUrl ? (
                            <Image
                              src={project.imageUrl}
                              alt={project.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Rocket className="h-6 w-6 text-zinc-600" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-white group-hover:text-orange-400 transition-colors truncate">
                              {project.title}
                            </h3>
                            <span
                              className={cn(
                                "flex-shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
                                getStatusColor(project.status)
                              )}
                            >
                              {getStatusLabel(project.status)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-zinc-400 line-clamp-2">
                            {project.tagline}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500">
                            <span>👍 {project._count.upvotes}</span>
                            <span>💬 {project._count.comments}</span>
                            <span>{formatRelativeTime(project.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-zinc-900/30 p-8 text-center">
                  <Rocket className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-500">No projects yet</p>
                </div>
              )}
            </section>

            {/* Companies */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="h-5 w-5 text-cyan-500" />
                <h2 className="text-xl font-semibold text-white">Companies</h2>
                <span className="text-sm text-zinc-500">({user.companies.length})</span>
              </div>

              {user.companies.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.companies.map((company) => (
                    <Link
                      key={company.id}
                      href={`/companies/${company.slug || company.id}`}
                      className="block rounded-xl border border-white/10 bg-zinc-900/50 p-4 hover:border-cyan-500/30 hover:bg-zinc-900/70 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        {/* Logo */}
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-800/50 border border-white/10">
                          {company.logo ? (
                            <Image
                              src={company.logo}
                              alt={company.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Building2 className="h-5 w-5 text-zinc-600" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors truncate">
                            {company.name}
                          </h3>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
                                getCategoryColor(company.category)
                              )}
                            >
                              {getCategoryLabel(company.category)}
                            </span>
                            {company.location && (
                              <span className="text-xs text-zinc-500 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {company.location}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 text-xs text-zinc-500">
                            {company._count.projects} project{company._count.projects !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-zinc-900/30 p-8 text-center">
                  <Building2 className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-500">No companies yet</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
