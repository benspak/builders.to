import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProjectCard } from "@/components/projects/project-card";
import { DeleteCompanyButton } from "@/components/companies/delete-company-button";
import { CompanyUpdateForm } from "@/components/companies/company-update-form";
import { CompanyUpdateList } from "@/components/companies/company-update-list";
import { CompanyRoleList } from "@/components/companies/company-role-list";
import { CompanyMembers } from "@/components/companies/company-members";
import { TractionBadges } from "@/components/companies/traction-badges";
import { TechStackDisplay } from "@/components/companies/tech-stack-display";
import {
  cn,
  formatRelativeTime,
  getCategoryLabel,
  getCategoryColor,
  getSizeLabel,
  getCompanyUrl,
  getCompanyEditUrl,
  formatLocationSlug,
} from "@/lib/utils";

// Force dynamic rendering since this page fetches from database
export const dynamic = "force-dynamic";

import {
  ArrowLeft,
  ExternalLink,
  Building2,
  MapPin,
  Users,
  Calendar,
  Pencil,
  Briefcase,
  User,
  MessageSquare,
  Code,
  Zap,
} from "lucide-react";

interface CompanyPageProps {
  params: Promise<{ slug: string; companySlug: string }>;
}

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const { slug: locationSlug, companySlug } = await params;

  // Check if this is a jobs page
  if (companySlug.toLowerCase() === "jobs") {
    const locationName = formatLocationSlug(locationSlug);
    return {
      title: `Jobs in ${locationName} | Builders.to`,
      description: `Find job openings in ${locationName}. Connect with local companies hiring.`,
    };
  }

  const company = await prisma.company.findFirst({
    where: {
      slug: companySlug,
      locationSlug: locationSlug,
    },
    select: { name: true, about: true, location: true },
  });

  if (!company) {
    return { title: "Company Not Found - Builders.to" };
  }

  return {
    title: `${company.name} - ${company.location || "Builders Local"} | Builders.to`,
    description: company.about || `${company.name} on Builders.to`,
  };
}

export default async function LocalCompanyPage({ params }: CompanyPageProps) {
  const { slug: locationSlug, companySlug } = await params;
  const session = await auth();

  // Check if this is a jobs page
  if (companySlug.toLowerCase() === "jobs") {
    const locationName = formatLocationSlug(locationSlug);

    {
      const jobs = await prisma.companyRole.findMany({
        where: {
          isActive: true,
          company: {
            locationSlug: locationSlug,
          },
        },
        orderBy: { createdAt: "desc" },
        include: {
          company: {
            select: {
              id: true,
              slug: true,
              name: true,
              logo: true,
              location: true,
              locationSlug: true,
            },
          },
        },
      });

      return (
        <div className="relative min-h-screen bg-zinc-950">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <Link
              href={`/${locationSlug}`}
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {locationName}
            </Link>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/30">
                  <Briefcase className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Jobs in {locationName}</h1>
                  <p className="text-zinc-400">{jobs.length} open position{jobs.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
            </div>

            {jobs.length === 0 ? (
              <div className="text-center py-20">
                <Briefcase className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">
                  No job listings in {locationName}
                </h2>
                <p className="text-zinc-400">
                  Check back later for new opportunities!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((role) => (
                  <Link
                    key={role.id}
                    href={`/${role.company.locationSlug}/${role.company.slug}`}
                    className="block rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6 hover:border-cyan-500/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800/50 border border-white/10">
                        {role.company.logo ? (
                          <Image src={role.company.logo} alt={role.company.name} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Building2 className="h-6 w-6 text-zinc-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white">{role.title}</h3>
                        <p className="text-sm text-cyan-400">{role.company.name}</p>
                        {role.company.location && (
                          <p className="text-sm text-zinc-500 flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {role.company.location}
                          </p>
                        )}
                        {role.description && (
                          <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{role.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-3 text-xs text-zinc-500">
                          <span className="px-2 py-1 rounded-full bg-zinc-800">{role.type}</span>
                          {role.salaryRange && <span>{role.salaryRange}</span>}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
  }

  // Otherwise, this is a company page
  const company = await prisma.company.findFirst({
    where: {
      slug: companySlug,
      locationSlug: locationSlug,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          slug: true,
        },
      },
      projects: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              upvotes: true,
              comments: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      updates: {
        orderBy: [
          { isPinned: "desc" },
          { createdAt: "desc" },
        ],
        take: 10,
      },
      roles: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              slug: true,
              headline: true,
            },
          },
        },
        orderBy: [
          { role: "asc" },
          { createdAt: "asc" },
        ],
      },
      _count: {
        select: {
          projects: true,
          updates: true,
          roles: true,
          members: true,
        },
      },
    },
  });

  if (!company) {
    // Try to find by slug only and redirect if locationSlug doesn't match
    const companyBySlug = await prisma.company.findUnique({
      where: { slug: companySlug },
      select: { slug: true, locationSlug: true, id: true },
    });

    if (companyBySlug) {
      // Redirect to the correct URL
      const correctUrl = getCompanyUrl(companyBySlug);
      redirect(correctUrl);
    }

    notFound();
  }

  // Get user upvotes for projects
  let userUpvotes: string[] = [];
  if (session?.user?.id) {
    const upvotes = await prisma.upvote.findMany({
      where: {
        userId: session.user.id,
        projectId: { in: company.projects.map((p) => p.id) },
      },
      select: { projectId: true },
    });
    userUpvotes = upvotes.map((u) => u.projectId);
  }

  // Check user permissions
  const isOriginalOwner = session?.user?.id === company.userId;
  const userMembership = session?.user?.id
    ? company.members.find((m) => m.user.id === session.user.id)
    : null;
  const isOwner = isOriginalOwner || userMembership?.role === "OWNER";
  const isAdmin = userMembership?.role === "ADMIN";
  const isMember = !!userMembership;
  const canEdit = isOwner || isAdmin;

  // Check for traction data
  const hasTraction = company.customerCount || company.revenueRange || company.userCount ||
    company.isBootstrapped || company.isProfitable || company.hasRaisedFunding;

  // Check for tech stack
  const hasTechStack = (company.techStack && company.techStack.length > 0) ||
    (company.tools && company.tools.length > 0);

  // Active open roles count
  const activeRolesCount = company.roles.filter(r => r.isActive).length;

  const editUrl = getCompanyEditUrl(company);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href={`/${locationSlug}`}
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {company.location}
      </Link>

      <article className="space-y-8">
        {/* Header */}
        <header className="card p-8">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Logo */}
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-zinc-800/50 border border-white/10">
              {company.logo ? (
                <Image
                  src={company.logo}
                  alt={company.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Building2 className="h-12 w-12 text-zinc-600" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white">{company.name}</h1>
                  {company.location && (
                    <Link
                      href={`/${locationSlug}`}
                      className="mt-2 flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <MapPin className="h-4 w-4" />
                      <span>{company.location}</span>
                    </Link>
                  )}
                </div>

                {/* Owner/Admin Actions */}
                {canEdit && (
                  <div className="flex items-center gap-2">
                    <Link
                      href={editUrl}
                      className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                      title="Edit company"
                    >
                      <Pencil className="h-5 w-5" />
                    </Link>
                    {isOriginalOwner && (
                      <DeleteCompanyButton companyId={company.id} />
                    )}
                  </div>
                )}
              </div>

              {/* Category & Status badges */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium border",
                    getCategoryColor(company.category)
                  )}
                >
                  {getCategoryLabel(company.category)}
                </span>

                {company.isHiring && (
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium border bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                    <Briefcase className="h-3.5 w-3.5" />
                    Hiring
                  </span>
                )}

                {company.acceptsContracts && (
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium border bg-purple-500/20 text-purple-300 border-purple-500/30">
                    <Code className="h-3.5 w-3.5" />
                    Open for Contracts
                  </span>
                )}
              </div>

              {/* Meta info */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-400">
                {company.size && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{getSizeLabel(company.size)}</span>
                  </div>
                )}
                {company.yearFounded && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Founded {company.yearFounded}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span>{company._count.projects} project{company._count.projects !== 1 ? "s" : ""}</span>
                </div>
                {activeRolesCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">{activeRolesCount} open role{activeRolesCount !== 1 ? "s" : ""}</span>
                  </div>
                )}
              </div>

              {/* Traction Badges */}
              {hasTraction && (
                <div className="mt-4">
                  <TractionBadges
                    customerCount={company.customerCount}
                    revenueRange={company.revenueRange}
                    userCount={company.userCount}
                    isBootstrapped={company.isBootstrapped}
                    isProfitable={company.isProfitable}
                    hasRaisedFunding={company.hasRaisedFunding}
                    fundingStage={company.fundingStage}
                  />
                </div>
              )}

              {/* Created by */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <span className="text-sm text-zinc-500">Created by </span>
                {company.user.slug ? (
                  <Link
                    href={`/${company.user.slug}`}
                    className="inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors"
                  >
                    {company.user.image ? (
                      <Image
                        src={company.user.image}
                        alt={company.user.name || "User"}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700">
                        <User className="h-2.5 w-2.5 text-zinc-400" />
                      </div>
                    )}
                    <span className="font-medium">{company.user.name}</span>
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-2 text-sm text-zinc-300">
                    {company.user.image ? (
                      <Image
                        src={company.user.image}
                        alt={company.user.name || "User"}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700">
                        <User className="h-2.5 w-2.5 text-zinc-400" />
                      </div>
                    )}
                    <span className="font-medium">{company.user.name}</span>
                  </span>
                )}
              </div>

              {/* Website link */}
              {company.website && (
                <div className="mt-6">
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* About */}
        {company.about && (
          <section className="card p-8">
            <h2 className="text-xl font-semibold text-white mb-4">About</h2>
            <div className="prose prose-invert prose-zinc max-w-none">
              <p className="text-zinc-300 whitespace-pre-wrap">{company.about}</p>
            </div>
          </section>
        )}

        {/* Tech Stack & Tools */}
        {hasTechStack && (
          <section className="card p-8">
            <h2 className="text-xl font-semibold text-white mb-6">Tech Stack & Tools</h2>
            <TechStackDisplay
              techStack={company.techStack || []}
              tools={company.tools || []}
            />
          </section>
        )}

        {/* Team Members */}
        {(company.members.length > 0 || canEdit) && (
          <section className="card p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-violet-400" />
                Team
                {company._count.members > 0 && (
                  <span className="ml-2 text-sm font-normal text-zinc-400">
                    ({company._count.members} member{company._count.members !== 1 ? "s" : ""})
                  </span>
                )}
              </h2>
            </div>

            <CompanyMembers
              companyId={company.id}
              members={company.members.map((m) => ({
                ...m,
                createdAt: m.createdAt.toISOString(),
              }))}
              isOwner={isOwner}
              isAdmin={isAdmin}
              originalOwnerId={company.userId}
            />
          </section>
        )}

        {/* Active Projects */}
        <section className="card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Active Projects ({company._count.projects})
            </h2>
            {canEdit && (
              <Link
                href={`/projects/new?company=${company.id}`}
                className="btn-secondary text-sm"
              >
                Add Project
              </Link>
            )}
          </div>

          {company.projects.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {company.projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={{
                    ...project,
                    createdAt: project.createdAt.toISOString(),
                    hasUpvoted: userUpvotes.includes(project.id),
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-center py-8">
              No projects yet. {canEdit && "Add your first project!"}
            </p>
          )}
        </section>

        {/* Open Roles */}
        {(company.roles.length > 0 || canEdit) && (
          <section className="card p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-emerald-400" />
                Open Roles
                {activeRolesCount > 0 && (
                  <span className="ml-2 text-sm font-normal text-zinc-400">
                    ({activeRolesCount} position{activeRolesCount !== 1 ? "s" : ""})
                  </span>
                )}
              </h2>
            </div>

            <CompanyRoleList
              roles={company.roles}
              companyId={company.id}
              isOwner={canEdit}
              emptyMessage={canEdit ? "Post your first role to start hiring" : "No open positions right now"}
            />
          </section>
        )}

        {/* Company Updates */}
        <section className="card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-orange-400" />
              Company Updates
              {company._count.updates > 0 && (
                <span className="ml-2 text-sm font-normal text-zinc-400">
                  ({company._count.updates})
                </span>
              )}
            </h2>
          </div>

          {isMember && (
            <div className="mb-6">
              <CompanyUpdateForm companyId={company.id} />
            </div>
          )}

          <CompanyUpdateList
            updates={company.updates}
            isOwner={canEdit}
            emptyMessage={isMember ? "Share your first company update" : "No updates yet"}
          />
        </section>

        {/* Footer info */}
        <div className="text-sm text-zinc-500 text-center">
          Added {formatRelativeTime(company.createdAt)}
        </div>
      </article>
    </div>
  );
}
