import { redirect } from "next/navigation";
import Link from "next/link";
import { Store, ArrowLeft, AlertCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MIN_LAUNCHED_PROJECTS_FOR_LISTING } from "@/lib/stripe";
import { ServiceForm } from "@/components/services/service-form";

export const metadata = {
  title: "Create Service Listing - Builders.to",
  description: "Sell your builder services to other builders",
};

export default async function NewServicePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  // Check eligibility
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      stripeConnectOnboarded: true,
      _count: {
        select: {
          projects: { where: { status: "LAUNCHED" } },
        },
      },
      projects: {
        where: { status: "LAUNCHED" },
        select: {
          id: true,
          title: true,
          slug: true,
          imageUrl: true,
          status: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/signin");
  }

  // Check requirements
  const isEligible = user._count.projects >= MIN_LAUNCHED_PROJECTS_FOR_LISTING;
  const isOnboarded = user.stripeConnectOnboarded;

  if (!isEligible || !isOnboarded) {
    return (
      <div className="relative min-h-screen bg-zinc-950">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-8 text-center">
            <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">
              Complete Setup First
            </h1>
            <p className="text-zinc-400 mb-6">
              {!isEligible
                ? `You need at least ${MIN_LAUNCHED_PROJECTS_FOR_LISTING} launched projects to sell services.`
                : "You need to complete Stripe Connect onboarding first."}
            </p>
            <Link
              href="/services/seller"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-900 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 transition-all"
            >
              Go to Seller Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-zinc-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/services/seller"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Create Service Listing</h1>
              <p className="text-zinc-400 text-sm">
                Sell your skills to other builders
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 shrink-0">
              <Store className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-amber-400 mb-1">
                $5 Listing Fee
              </h3>
              <p className="text-xs text-zinc-400">
                Your listing will be active for 90 days. Platform fee is 5% on successful transactions.
                You&apos;ll be redirected to checkout after creating your listing.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6">
          <ServiceForm projects={user.projects} />
        </div>
      </div>
    </div>
  );
}
