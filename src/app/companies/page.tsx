import { Suspense } from "react";
import Link from "next/link";
import { Plus, Loader2, Building2 } from "lucide-react";
import { CompanyFilters } from "@/components/companies/company-filters";
import { CompanyGrid } from "@/components/companies/company-grid";
import { ProUpgradePrompt } from "@/components/pro";
import { auth } from "@/lib/auth";
import { isProMember } from "@/lib/stripe-subscription";

interface CompaniesPageProps {
  searchParams: Promise<{
    category?: string;
    size?: string;
    search?: string;
    hiring?: string;
    contracts?: string;
  }>;
}

export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
  const params = await searchParams;
  const session = await auth();

  // Check if user is a Pro member
  const isPro = session?.user?.id ? await isProMember(session.user.id) : false;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Building2 className="h-8 w-8 text-orange-500" />
            Companies
          </h1>
          <p className="text-zinc-400 mt-1">
            Discover companies building amazing products
          </p>
        </div>
        {session && isPro ? (
          <Link href="/companies/new" className="btn-primary">
            <Plus className="h-4 w-4" />
            Add Company
          </Link>
        ) : !session ? (
          <Link href="/signin?callbackUrl=/companies/new" className="btn-primary">
            <Plus className="h-4 w-4" />
            Sign in to Add
          </Link>
        ) : null}
      </div>

      {/* Pro Upgrade Banner for logged-in non-Pro users */}
      {session && !isPro && (
        <div className="mb-8">
          <ProUpgradePrompt
            feature="companies"
            variant="banner"
            isAuthenticated={true}
          />
        </div>
      )}

      {/* Filters */}
      <div className="mb-8">
        <Suspense fallback={<div className="h-[88px]" />}>
          <CompanyFilters />
        </Suspense>
      </div>

      {/* Companies Grid */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        }
      >
        <CompanyGrid
          category={params.category}
          size={params.size}
          search={params.search}
          hiring={params.hiring === "true"}
          contracts={params.contracts === "true"}
        />
      </Suspense>
    </div>
  );
}
