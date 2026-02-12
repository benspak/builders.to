import { ProjectForm } from "@/components/projects/project-form";
import { ProUpgradePrompt } from "@/components/pro";
import { ArrowLeft, Github, UserCircle } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isProMember } from "@/lib/stripe-subscription";

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
  const session = await auth();
  
  // Check if user can create more projects (free users get 3, Pro gets unlimited)
  const isPro = session?.user?.id ? await isProMember(session.user.id) : false;
  
  if (!isPro && session?.user?.id) {
    const projectCount = await prisma.project.count({
      where: { userId: session.user.id },
    });
    
    // Free users who have reached 3 projects must upgrade
    if (projectCount >= 3) {
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
            projectCount={projectCount}
          />
        </div>
      );
    }
  }
  
  // Check if user has completed their profile (username and image required)
  const user = session?.user?.id 
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { username: true, image: true },
      })
    : null;

  const hasUsername = !!user?.username;
  const hasImage = !!user?.image;
  const profileComplete = hasUsername && hasImage;

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

  // Show profile completion prompt if profile is incomplete
  if (!profileComplete) {
    const missingItems = [];
    if (!hasUsername) missingItems.push("username");
    if (!hasImage) missingItems.push("profile image");

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
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-6">
              <UserCircle className="h-8 w-8 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">
              Complete Your Profile First
            </h1>
            <p className="text-zinc-400 mb-6 max-w-md mx-auto">
              Before sharing a project, please complete your profile by adding a{" "}
              <span className="text-white font-medium">{missingItems.join(" and ")}</span>.
              This helps the community know who&apos;s behind the project.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/settings"
                className="btn-primary"
              >
                Complete Profile
              </Link>
              <Link
                href="/projects"
                className="btn-secondary"
              >
                Back to Projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  : "Tell the community what you’re building and launching. Get feedback, meet collaborators, and find early users."}
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
