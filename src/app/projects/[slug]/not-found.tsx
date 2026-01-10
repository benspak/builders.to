import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function ProjectNotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 text-center">
      <FileQuestion className="h-16 w-16 mx-auto text-zinc-600 mb-6" />
      <h1 className="text-3xl font-bold text-white mb-4">Project Not Found</h1>
      <p className="text-zinc-400 mb-8">
        The project you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Link href="/projects" className="btn-primary">
        Back to Projects
      </Link>
    </div>
  );
}
