import Link from "next/link";
import { Building2, MapPin, ArrowLeft } from "lucide-react";

export default function CompanyNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6 lg:px-8 text-center">
      <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-12">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Building2 className="h-16 w-16 text-zinc-600" />
            <MapPin className="h-6 w-6 text-zinc-500 absolute -bottom-1 -right-1" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Company Not Found</h1>
        <p className="text-zinc-400 mb-8">
          The company you&apos;re looking for doesn&apos;t exist or may have been removed.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/companies"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-6 py-3 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            All Companies
          </Link>
        </div>
      </div>
    </div>
  );
}
