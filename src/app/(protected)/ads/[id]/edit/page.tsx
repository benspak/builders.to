import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Megaphone, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { AdForm } from "@/components/ads";

export const metadata = {
  title: "Edit Ad - Builders.to",
  description: "Edit your sidebar advertisement",
};

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAdPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const ad = await prisma.advertisement.findUnique({
    where: { id },
  });

  if (!ad) {
    notFound();
  }

  if (ad.userId !== session.user.id) {
    notFound();
  }

  // Check if within paid period for active/expired ads
  const now = new Date();
  const isWithinPaidPeriod = ad.endDate && ad.endDate > now;

  // Can edit if: draft/pending OR (active/expired but still within paid period)
  const canEdit = ad.status === "DRAFT" ||
    ad.status === "PENDING_PAYMENT" ||
    ((ad.status === "ACTIVE" || ad.status === "EXPIRED") && isWithinPaidPeriod);

  if (!canEdit) {
    redirect(`/ads/${id}`);
  }

  return (
    <div className="relative min-h-screen bg-zinc-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-teal-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href={`/ads/${id}`}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Ad Details
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
            <Megaphone className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Ad</h1>
            <p className="text-zinc-400 text-sm">
              Update your advertisement details
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6">
          <AdForm
            initialData={{
              id: ad.id,
              title: ad.title,
              description: ad.description || "",
              imageUrl: ad.imageUrl || "",
              linkUrl: ad.linkUrl,
              ctaText: ad.ctaText,
            }}
            isEditing
          />
        </div>
      </div>
    </div>
  );
}
