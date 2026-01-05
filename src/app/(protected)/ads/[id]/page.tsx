import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Megaphone,
  ArrowLeft,
  Edit2,
  ExternalLink,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { AdAnalytics } from "@/components/ads";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Ad Details - Builders.to",
  description: "View your advertisement details and analytics",
};

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusConfig = {
  DRAFT: {
    label: "Draft",
    color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
    icon: Edit2,
    description: "This ad is a draft. Complete payment to activate it."
  },
  PENDING_PAYMENT: {
    label: "Pending Payment",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    icon: Clock,
    description: "Payment is being processed. Your ad will be active soon."
  },
  ACTIVE: {
    label: "Active",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    icon: CheckCircle,
    description: "Your ad is currently running on the Builder Feed."
  },
  EXPIRED: {
    label: "Expired",
    color: "bg-zinc-500/10 text-zinc-500 border-zinc-500/30",
    icon: Clock,
    description: "This ad has expired. Create a new ad to continue advertising."
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-500/10 text-red-400 border-red-500/30",
    icon: XCircle,
    description: "This ad was cancelled."
  },
};

export default async function AdDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const ad = await prisma.advertisement.findUnique({
    where: { id },
    include: {
      _count: {
        select: { views: true },
      },
    },
  });

  if (!ad) {
    notFound();
  }

  if (ad.userId !== session.user.id) {
    notFound();
  }

  const status = statusConfig[ad.status];
  const StatusIcon = status.icon;
  const canEdit = ad.status === "DRAFT" || ad.status === "PENDING_PAYMENT";
  const canPay = ad.status === "DRAFT" || ad.status === "PENDING_PAYMENT";
  const canDelete = ad.status !== "ACTIVE";

  const getDaysRemaining = () => {
    if (!ad.endDate) return null;
    const now = new Date();
    const diffMs = ad.endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className="relative min-h-screen bg-zinc-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-teal-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/ads"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Ads
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div className="flex items-start gap-4">
            {ad.imageUrl ? (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden ring-2 ring-zinc-800 shrink-0">
                <Image
                  src={ad.imageUrl}
                  alt={ad.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-zinc-800 shrink-0">
                <AlertCircle className="h-8 w-8 text-zinc-600" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">{ad.title}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                  status.color
                )}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {status.label}
                </span>
                {ad.status === "ACTIVE" && daysRemaining !== null && (
                  <span className="text-sm text-zinc-400">
                    {daysRemaining} days remaining
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <Link
                href={`/ads/${ad.id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-300 rounded-lg border border-zinc-700/50 hover:bg-zinc-800 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </Link>
            )}
            {canDelete && (
              <form action={`/api/ads/${ad.id}`} method="DELETE">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 rounded-lg border border-red-500/30 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Status Message */}
        <div className={cn(
          "rounded-xl border p-4 mb-8",
          status.color.replace("text-", "border-").split(" ")[0] + "/20",
          status.color.split(" ")[0].replace("bg-", "bg-").replace("/10", "/5")
        )}>
          <div className="flex items-center gap-3">
            <StatusIcon className={cn("h-5 w-5", status.color.split(" ")[1])} />
            <p className="text-sm text-zinc-300">{status.description}</p>
          </div>
        </div>

        {/* Payment CTA */}
        {canPay && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Ready to Go Live?</h3>
                <p className="text-sm text-zinc-400">
                  Your ad will be displayed immediately after payment for 30 days.
                </p>
              </div>
              <form action={`/api/ads/${ad.id}/checkout`} method="POST">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap"
                >
                  <CreditCard className="h-4 w-4" />
                  Pay $50 to Activate
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Ad Preview */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Ad Preview</h2>
            <div className="max-w-xs">
              <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800/50 bg-zinc-900/80">
                  <Megaphone className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Sponsored</span>
                </div>
                <div className="p-4">
                  {ad.imageUrl && (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden mb-3 ring-1 ring-zinc-800/50">
                      <Image
                        src={ad.imageUrl}
                        alt={ad.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <h3 className="text-sm font-semibold text-white line-clamp-2 mb-1">
                    {ad.title}
                  </h3>
                  {ad.description && (
                    <p className="text-xs text-zinc-400 line-clamp-2 mb-3">
                      {ad.description}
                    </p>
                  )}
                  <span className="inline-flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500">
                    {ad.ctaText}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Ad Details */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Details</h2>
            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
                <div className="grid gap-4">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Destination URL</p>
                    <a
                      href={ad.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5"
                    >
                      {ad.linkUrl}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Button Text</p>
                    <p className="text-sm text-white">{ad.ctaText}</p>
                  </div>
                  {ad.startDate && (
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Start Date</p>
                      <p className="text-sm text-white">
                        {ad.startDate.toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {ad.endDate && (
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">End Date</p>
                      <p className="text-sm text-white">
                        {ad.endDate.toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Created</p>
                    <p className="text-sm text-white">
                      {ad.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics (only for active/expired ads with views) */}
        {(ad.status === "ACTIVE" || ad.status === "EXPIRED") && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white mb-4">Analytics</h2>
            <AdAnalytics adId={ad.id} />
          </div>
        )}
      </div>
    </div>
  );
}
