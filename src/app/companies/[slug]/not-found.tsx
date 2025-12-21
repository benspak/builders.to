import Link from "next/link";
import { Building2, ArrowLeft } from "lucide-react";

export default function CompanyNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-800/50 border border-white/10">
            <Building2 className="h-10 w-10 text-zinc-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Company Not Found</h1>
        <p className="text-zinc-400 mb-8 max-w-md">
          The company you&apos;re looking for doesn&apos;t exist or may have been removed.
        </p>
        <Link
          href="/companies"
          className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Companies
        </Link>
      </div>
    </div>
  );
}
