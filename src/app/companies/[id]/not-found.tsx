import Link from "next/link";
import { Building2 } from "lucide-react";

export default function CompanyNotFound() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 text-center">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800/50 mb-6">
        <Building2 className="h-10 w-10 text-zinc-500" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-4">Company Not Found</h1>
      <p className="text-zinc-400 mb-8">
        The company you&apos;re looking for doesn&apos;t exist or may have been removed.
      </p>
      <Link href="/companies" className="btn-primary">
        Browse Companies
      </Link>
    </div>
  );
}
