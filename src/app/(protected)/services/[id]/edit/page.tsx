import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Store, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ServiceForm } from "@/components/services/service-form";

export const metadata = {
  title: "Edit Service Listing - Builders.to",
  description: "Update your service listing",
};

interface EditServicePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    redirect("/signin");
  }

  // Get the service listing
  const service = await prisma.serviceListing.findUnique({
    where: { id },
    include: {
      portfolioProjects: {
        select: { projectId: true },
      },
    },
  });

  if (!service) {
    notFound();
  }

  // Verify ownership
  if (service.userId !== session.user.id) {
    redirect("/services/seller");
  }

  // Get user's launched projects for the form
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
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
              <h1 className="text-2xl font-bold text-white">Edit Service Listing</h1>
              <p className="text-zinc-400 text-sm">
                Update your listing details
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6">
          <ServiceForm
            projects={user.projects}
            initialData={{
              id: service.id,
              title: service.title,
              description: service.description,
              category: service.category,
              priceInCents: service.priceInCents,
              deliveryDays: service.deliveryDays,
              portfolioProjectIds: service.portfolioProjects.map(p => p.projectId),
            }}
            isEditing={true}
          />
        </div>
      </div>
    </div>
  );
}
