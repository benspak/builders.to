import { Suspense } from "react";
import Link from "next/link";
import { Store, Plus, Loader2, Rocket, AlertCircle, ExternalLink, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MIN_LAUNCHED_PROJECTS_FOR_LISTING } from "@/lib/stripe";
import { ServiceCard } from "@/components/services/service-card";
import { StripeConnectButton } from "@/components/services/stripe-connect-button";

export const metadata = {
  title: "Seller Dashboard - Builders.to",
  description: "Manage your service listings",
};

export const dynamic = "force-dynamic";

async function SellerDashboard() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      stripeConnectId: true,
      stripeConnectOnboarded: true,
      _count: {
        select: {
          projects: {
            where: { status: "LAUNCHED" },
          },
        },
      },
      serviceListings: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { orders: true },
          },
          portfolioProjects: {
            include: {
              project: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const launchedProjects = user._count.projects;
  const isEligible = launchedProjects >= MIN_LAUNCHED_PROJECTS_FOR_LISTING;
  const isOnboarded = user.stripeConnectOnboarded;

  // Step indicator
  const steps = [
    {
      title: "Launch Projects",
      description: `${launchedProjects}/${MIN_LAUNCHED_PROJECTS_FOR_LISTING} launched projects`,
      completed: isEligible,
    },
    {
      title: "Connect Stripe",
      description: "Set up payments",
      completed: isOnboarded,
    },
    {
      title: "Create Listings",
      description: "Start selling",
      completed: user.serviceListings.length > 0,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Onboarding Steps */}
      {(!isEligible || !isOnboarded) && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Get Started as a Seller</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={`relative rounded-lg border p-4 ${
                  step.completed
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-zinc-700/50 bg-zinc-800/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                      step.completed
                        ? "bg-emerald-500 text-white"
                        : "bg-zinc-700 text-zinc-400"
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div>
                    <h4
                      className={`font-medium ${
                        step.completed ? "text-emerald-400" : "text-white"
                      }`}
                    >
                      {step.title}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action based on current step */}
          {!isEligible && (
            <div className="mt-6 p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-zinc-300">
                    You need at least <strong>{MIN_LAUNCHED_PROJECTS_FOR_LISTING} launched projects</strong> to sell services.
                    This ensures buyers can see proof of your work.
                  </p>
                  <Link
                    href="/projects/new"
                    className="inline-flex items-center gap-2 mt-3 text-sm text-amber-400 hover:text-amber-300"
                  >
                    <Rocket className="h-4 w-4" />
                    Add a Project
                  </Link>
                </div>
              </div>
            </div>
          )}

          {isEligible && !isOnboarded && (
            <div className="mt-6">
              <StripeConnectButton />
            </div>
          )}
        </div>
      )}

      {/* Ready to Create Listing */}
      {isEligible && isOnboarded && user.serviceListings.length === 0 && (
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Store className="h-8 w-8 text-amber-500/60" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Ready to Sell!</h3>
          <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
            Your Stripe account is connected. Create your first service listing
            to start earning from your builder skills.
          </p>
          <Link
            href="/services/new"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-900 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/20"
          >
            <Plus className="h-4 w-4" />
            Create Your First Listing
          </Link>
        </div>
      )}

      {/* Service Listings */}
      {user.serviceListings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Your Listings</h3>
            <Link
              href="/services/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-900 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 transition-all"
            >
              <Plus className="h-4 w-4" />
              New Listing
            </Link>
          </div>
          <div className="grid gap-4">
            {user.serviceListings.map((listing) => (
              <ServiceCard
                key={listing.id}
                listing={{
                  ...listing,
                  activatedAt: listing.activatedAt?.toISOString() || null,
                  expiresAt: listing.expiresAt?.toISOString() || null,
                  createdAt: listing.createdAt.toISOString(),
                  updatedAt: listing.updatedAt.toISOString(),
                }}
                isOwner={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Stripe Dashboard Link */}
      {isOnboarded && (
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Stripe Dashboard</h4>
              <p className="text-sm text-zinc-500">View payouts and manage your account</p>
            </div>
            <a
              href="/api/stripe-connect/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-300 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors"
            >
              Open Dashboard
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SellerPage() {
  return (
    <div className="relative min-h-screen bg-zinc-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Seller Dashboard</h1>
              <p className="text-zinc-400 text-sm">
                Manage your service listings
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
                Services Marketplace
              </h3>
              <p className="text-xs text-zinc-400">
                Sell your builder skills to other builders. Each listing costs $5 for 90 days.
                Platform fee is 5% on successful transactions.
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          }
        >
          <SellerDashboard />
        </Suspense>
      </div>
    </div>
  );
}
