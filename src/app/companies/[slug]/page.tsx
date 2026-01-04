import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProjectCard } from "@/components/projects/project-card";
import { DeleteCompanyButton } from "@/components/companies/delete-company-button";
import { CompanyUpdateForm } from "@/components/companies/company-update-form";
import { CompanyUpdateList } from "@/components/companies/company-update-list";
import { CompanyRoleList } from "@/components/companies/company-role-list";
import { TractionBadges } from "@/components/companies/traction-badges";
import { TechStackDisplay } from "@/components/companies/tech-stack-display";
import {
  cn,
  formatRelativeTime,
  getCategoryLabel,
  getCategoryColor,
  getSizeLabel,
} from "@/lib/utils";
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
  params: Promise<{ slug: string }>;
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { slug } = await params;
  const session = await auth();

  const company = await prisma.company.findUnique({
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
      _count: {
        select: {
          projects: true,
          updates: true,
          roles: true,
        },
      },
    },
  });

  if (!company) {
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

  const isOwner = session?.user?.id === company.userId;

  // Check for traction data
  const hasTraction = company.customerCount || company.revenueRange || company.userCount ||
    company.isBootstrapped || company.isProfitable || company.hasRaisedFunding;

  // Check for tech stack
  const hasTechStack = (company.techStack && company.techStack.length > 0) ||
    (company.tools && company.tools.length > 0);

  // Active open roles count
  const activeRolesCount = company.roles.filter(r => r.isActive).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/companies"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to companies
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
                    <div className="mt-2 flex items-center gap-2 text-zinc-400">
                      <MapPin className="h-4 w-4" />
                      <span>{company.location}</span>
                    </div>
                  )}
                </div>

                {/* Owner Actions */}
                {isOwner && (
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/companies/${company.slug}/edit`}
                      className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                      title="Edit company"
                    >
                      <Pencil className="h-5 w-5" />
                    </Link>
                    <DeleteCompanyButton companyId={company.id} />
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
                    href={`/profile/${company.user.slug}`}
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

        {/* Active Projects */}
        <section className="card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Active Projects ({company._count.projects})
            </h2>
            {isOwner && (
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
              No projects yet. {isOwner && "Add your first project!"}
            </p>
          )}
        </section>

        {/* Open Roles */}
        {(company.roles.length > 0 || isOwner) && (
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
              isOwner={isOwner}
              emptyMessage={isOwner ? "Post your first role to start hiring" : "No open positions right now"}
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

          {isOwner && (
            <div className="mb-6">
              <CompanyUpdateForm companyId={company.id} />
            </div>
          )}

          <CompanyUpdateList
            updates={company.updates}
            isOwner={isOwner}
            emptyMessage={isOwner ? "Share your first company update" : "No updates yet"}
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
