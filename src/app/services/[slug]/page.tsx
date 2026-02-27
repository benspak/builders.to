import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  User,
  Clock,
  Calendar,
  FolderKanban,
  ExternalLink,
} from "lucide-react";
import { OrderWithTokens } from "@/components/services/order-with-tokens";
import { getServiceCategoryLabel, getServiceCategoryColor } from "@/lib/utils";
import { ReportButton } from "@/components/ui/report-button";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ServicePageProps) {
  const { slug } = await params;
  const now = new Date();
  const service = await prisma.serviceListing.findFirst({
    where: {
      AND: [
        { OR: [{ slug }, { id: slug }] },
        { status: "ACTIVE" },
        { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
      ],
    },
    select: { title: true, description: true, category: true, priceInCents: true },
  });
  if (!service) return { title: "Service | Builders" };
  const categoryLabel = getServiceCategoryLabel(service.category);
  return {
    title: `${service.title} | ${categoryLabel} | Builders`,
    description:
      service.description.slice(0, 155) +
      (service.description.length > 155 ? "…" : ""),
  };
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const session = await auth();
  const now = new Date();

  const service = await prisma.serviceListing.findFirst({
    where: {
      AND: [
        { OR: [{ slug }, { id: slug }] },
        { status: "ACTIVE" },
        {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: now } },
          ],
        },
      ],
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
      portfolioProjects: {
        include: {
          project: {
            select: {
              id: true,
              slug: true,
              title: true,
              tagline: true,
              imageUrl: true,
              url: true,
            },
          },
        },
      },
    },
  });

  if (!service) {
    notFound();
  }

  const isOwner = session?.user?.id === service.userId;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/services"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to services
      </Link>

      <article className="space-y-8">
        <header className="card p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium border",
                  getServiceCategoryColor(service.category)
                )}
              >
                {getServiceCategoryLabel(service.category)}
              </span>
              <h1 className="mt-4 text-3xl font-bold text-white">
                {service.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-6">
                <span className="text-2xl font-semibold text-white">
                  {formatPrice(service.priceInCents)}
                </span>
                <span className="flex items-center gap-2 text-zinc-400">
                  <Clock className="h-5 w-5" />
                  {service.deliveryDays} day{service.deliveryDays !== 1 ? "s" : ""} delivery
                </span>
                {service.expiresAt && (
                  <span className="flex items-center gap-2 text-zinc-500 text-sm">
                    <Calendar className="h-4 w-4" />
                    Listed until{" "}
                    {new Date(service.expiresAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {!isOwner && session?.user && (
              <ReportButton
                contentType="SERVICE_LISTING"
                contentId={service.id}
                variant="icon"
              />
            )}
          </div>

          {/* Builder */}
          <div className="mt-8 pt-8 border-t border-white/10">
            {service.user.slug ? (
              <Link
                href={`/${service.user.slug}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors w-fit"
              >
                {service.user.image ? (
                  <Image
                    src={service.user.image}
                    alt={service.user.name || "Builder"}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-700">
                    <User className="h-6 w-6 text-zinc-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-white">
                    {service.user.name || "Builder"}
                  </p>
                  <p className="text-sm text-zinc-400">View profile</p>
                </div>
                <ExternalLink className="h-4 w-4 text-zinc-500" />
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                {service.user.image ? (
                  <Image
                    src={service.user.image}
                    alt={service.user.name || "Builder"}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-700">
                    <User className="h-6 w-6 text-zinc-400" />
                  </div>
                )}
                <span className="font-medium text-white">
                  {service.user.name || "Builder"}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Description */}
        <section className="card p-8">
          <h2 className="text-lg font-semibold text-white mb-4">Description</h2>
          <div className="prose prose-invert prose-zinc max-w-none">
            <ReactMarkdown>{service.description}</ReactMarkdown>
          </div>
        </section>

        {/* Portfolio / Proof of work */}
        {service.portfolioProjects.length > 0 && (
          <section className="card p-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-violet-400" />
              Proof of work
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {service.portfolioProjects.map(({ id, project, description }) => (
                <Link
                  key={id}
                  href={`/projects/${project.slug || project.id}`}
                  className="flex gap-4 p-4 rounded-xl border border-white/10 hover:border-violet-500/30 hover:bg-white/5 transition-colors"
                >
                  {project.imageUrl && (
                    <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={project.imageUrl}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white truncate">
                      {project.title}
                    </p>
                    {project.tagline && (
                      <p className="text-sm text-zinc-400 line-clamp-2 mt-0.5">
                        {project.tagline}
                      </p>
                    )}
                    {description && (
                      <p className="text-xs text-zinc-500 mt-1">{description}</p>
                    )}
                  </div>
                  <ExternalLink className="h-4 w-4 text-zinc-500 shrink-0 self-center" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA - Order with tokens or view profile */}
        {!isOwner && session?.user && (
          <OrderWithTokens
            serviceId={service.id}
            priceInCents={service.priceInCents}
            serviceTitle={service.title}
            sellerName={service.user.name || "this builder"}
            sellerSlug={service.user.slug}
          />
        )}
        {!isOwner && !session?.user && (
          <div className="card p-8 text-center">
            <p className="text-zinc-400 mb-4">
              Want to hire {service.user.name || "this builder"} for this service?
            </p>
            <Link
              href="/signin"
              className="btn-primary inline-flex items-center gap-2"
            >
              Sign in to order with tokens
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        )}
      </article>
    </div>
  );
}
