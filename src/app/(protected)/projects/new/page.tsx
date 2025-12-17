import { ProjectForm } from "@/components/projects/project-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface NewProjectPageProps {
  searchParams: Promise<{
    company?: string;
  }>;
}

export default async function NewProjectPage({ searchParams }: NewProjectPageProps) {
  const params = await searchParams;
  const companyId = params.company;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div className="card p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Share Your Project</h1>
          <p className="text-zinc-400 mt-2">
            Tell the community what you&apos;re building. Get feedback, find users, and grow together.
          </p>
        </div>

        <ProjectForm initialCompanyId={companyId} />
      </div>
    </div>
  );
}
