import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { MapPin, ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LocalListingForm } from "@/components/local/local-listing-form";

export const metadata = {
  title: "Edit Listing - Builders.to",
  description: "Edit your local listing",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const { id } = await params;

  // Fetch the listing
  const listing = await prisma.localListing.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!listing) {
    notFound();
  }

  // Check ownership
  if (listing.userId !== session.user.id) {
    redirect("/my-listings");
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
            href={`/listing/${listing.slug}`}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Listing
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg shadow-emerald-500/25">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Edit Listing</h1>
              <p className="text-zinc-400 text-sm">
                Update your listing details
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6">
          <LocalListingForm
            mode="edit"
            initialData={{
              id: listing.id,
              slug: listing.slug,
              title: listing.title,
              description: listing.description,
              category: listing.category,
              status: listing.status,
              locationSlug: listing.locationSlug,
              city: listing.city,
              state: listing.state,
              zipCode: listing.zipCode,
              contactUrl: listing.contactUrl,
              priceInCents: listing.priceInCents,
              images: listing.images.map(img => ({
                id: img.id,
                url: img.url,
                caption: img.caption,
                order: img.order,
              })),
              activatedAt: listing.activatedAt?.toISOString() || null,
              expiresAt: listing.expiresAt?.toISOString() || null,
              createdAt: listing.createdAt.toISOString(),
              updatedAt: listing.updatedAt.toISOString(),
            }}
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
