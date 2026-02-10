import { GitHubReposList } from "@/components/github/github-repos-list";
import { ProUpgradePrompt } from "@/components/pro";
import { ArrowLeft, Github } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { isProMember } from "@/lib/stripe-subscription";

export default async function ImportFromGitHubPage() {
  const session = await auth();
  
  // Check if user is a Pro member
  const isPro = session?.user?.id ? await isProMember(session.user.id) : false;
  
  // If not Pro, show upgrade prompt
  if (!isPro) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>

        <ProUpgradePrompt
          feature="projects"
          variant="full-page"
          isAuthenticated={!!session}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Github className="h-8 w-8 text-white" />
          <h1 className="text-2xl font-bold text-white">Import from GitHub</h1>
        </div>
        <p className="text-zinc-400">
          Select a repository to import as a project. We&apos;ll pre-fill the details for you.
        </p>
      </div>

      <GitHubReposList />
    </div>
  );
}
