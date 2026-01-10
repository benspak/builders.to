import Link from "next/link";
import { UserX, ArrowLeft, Home } from "lucide-react";

export default function ProfileNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        {/* Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800/50 border border-zinc-700/50 mb-6">
          <UserX className="h-10 w-10 text-zinc-500" />
        </div>

        {/* Text */}
        <h1 className="text-2xl font-bold text-white mb-2">Profile Not Found</h1>
        <p className="text-zinc-400 mb-8 max-w-md">
          The profile you&apos;re looking for doesn&apos;t exist or may have been removed.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-800/50 border border-zinc-700/50 px-6 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse Projects
          </Link>
          <Link href="/" className="btn-primary">
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
