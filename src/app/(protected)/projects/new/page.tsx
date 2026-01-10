import { ProjectForm } from "@/components/projects/project-form";
import { ArrowLeft, Github } from "lucide-react";
import Link from "next/link";

interface NewProjectPageProps {
  searchParams: Promise<{
    company?: string;
    title?: string;
    tagline?: string;
    githubUrl?: string;
    url?: string;
  }>;
}

export default async function NewProjectPage({ searchParams }: NewProjectPageProps) {
  const params = await searchParams;
  const companyId = params.company;
  const isGitHubImport = !!params.githubUrl;

  // Build initial data from GitHub import params
  const githubPrefill = isGitHubImport
    ? {
        title: params.title || "",
        tagline: params.tagline || "",
        githubUrl: params.githubUrl || "",
        url: params.url || "",
      }
    : undefined;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>

      <div className="card p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {isGitHubImport ? "Import from GitHub" : "Share Your Project"}
              </h1>
              <p className="text-zinc-400 mt-2">
                {isGitHubImport
                  ? "Review and customize the imported details before publishing."
                  : "Tell the community what you're building. Get feedback, find users, and grow together."}
              </p>
            </div>
            {!isGitHubImport && (
              <Link
                href="/projects/import"
                className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
              >
                <Github className="h-4 w-4" />
                Import
              </Link>
            )}
          </div>
        </div>

        <ProjectForm initialCompanyId={companyId} githubPrefill={githubPrefill} />
      </div>
    </div>
  );
}
