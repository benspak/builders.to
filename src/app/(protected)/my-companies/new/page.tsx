import { CompanyForm } from "@/components/companies/company-form";
import { ProUpgradePrompt } from "@/components/pro";
import { ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { isProMember } from "@/lib/stripe-subscription";

export default async function NewCompanyPage() {
  const session = await auth();
  
  // Check if user is a Pro member
  const isPro = session?.user?.id ? await isProMember(session.user.id) : false;
  
  // If not Pro, show upgrade prompt
  if (!isPro) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/companies"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Companies
        </Link>

        <ProUpgradePrompt
          feature="companies"
          variant="full-page"
          isAuthenticated={!!session}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/my-companies"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Companies
      </Link>

      <div className="card p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20">
              <Building2 className="h-5 w-5 text-orange-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Add Your Company</h1>
          </div>
          <p className="text-zinc-400 mt-2">
            Create a company profile to showcase your team and link your projects.
          </p>
        </div>

        <CompanyForm />
      </div>
    </div>
  );
}
