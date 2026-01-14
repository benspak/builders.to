import { redirect } from "next/navigation";
import Link from "next/link";
import { MapPin, ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LocalListingForm } from "@/components/local/local-listing-form";

export const metadata = {
  title: "Create Local Listing - Builders.to",
  description: "Post a listing to your local builder network on Builders.to",
};

export default async function NewListingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  // Get user's location for default
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      city: true,
      state: true,
      locationSlug: true,
      zipCode: true,
    },
  });

  return (
    <div className="relative min-h-screen bg-zinc-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/my-listings"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Listings
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg shadow-emerald-500/25">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Create Local Listing</h1>
              <p className="text-zinc-400 text-sm">
                Post to your local builder community
              </p>
            </div>
          </div>
        </div>

        {/* Location Warning */}
        {!user?.city && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 shrink-0">
                <MapPin className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-amber-400 mb-1">
                  No Location Set
                </h3>
                <p className="text-xs text-zinc-400">
                  You haven&apos;t set your location in your profile. You&apos;ll need to enter a location for this listing.
                  <Link href="/settings" className="text-amber-400 hover:underline ml-1">
                    Set your default location
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6">
          <LocalListingForm
            userLocation={user ? {
              city: user.city,
              state: user.state,
              locationSlug: user.locationSlug,
              zipCode: user.zipCode,
            } : undefined}
          />
        </div>
      </div>
    </div>
  );
}
