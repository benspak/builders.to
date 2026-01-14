import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CompanyForm } from "@/components/companies/company-form";
import { ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";
import { getCompanyUrl } from "@/lib/utils";

// Force dynamic rendering since this page fetches from database
export const dynamic = "force-dynamic";

interface EditCompanyPageProps {
  params: Promise<{ slug: string; companySlug: string }>;
}

export default async function EditCompanyPage({ params }: EditCompanyPageProps) {
  const { slug: locationSlug, companySlug } = await params;
  const session = await auth();

  // User must be authenticated
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const company = await prisma.company.findFirst({
    where: {
      slug: companySlug,
      locationSlug: locationSlug,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      logo: true,
      location: true,
      locationSlug: true,
      category: true,
      about: true,
      website: true,
      size: true,
      yearFounded: true,
      userId: true,
      // Fields for opportunity hub
      techStack: true,
      tools: true,
      customerCount: true,
      revenueRange: true,
      userCount: true,
      isBootstrapped: true,
      isProfitable: true,
      hasRaisedFunding: true,
      fundingStage: true,
      isHiring: true,
      acceptsContracts: true,
    },
  });

  if (!company) {
    notFound();
  }

  // Check if user is the original owner or a member with edit permissions
  const membership = await prisma.companyMember.findUnique({
    where: {
      companyId_userId: { companyId: company.id, userId: session.user.id },
    },
    select: { role: true },
  });

  const canEdit =
    company.userId === session.user.id ||
    membership?.role === "OWNER" ||
    membership?.role === "ADMIN";

  if (!canEdit) {
    redirect("/my-companies");
  }

  const backUrl = getCompanyUrl(company);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href={backUrl}
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to company
      </Link>

      <div className="card p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20">
              <Building2 className="h-5 w-5 text-orange-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Edit Company</h1>
          </div>
          <p className="text-zinc-400 mt-2">
            Update your company profile information.
          </p>
        </div>

        <CompanyForm initialData={company} />
      </div>
    </div>
  );
}
