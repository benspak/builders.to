import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "@/components/projects/project-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface EditProjectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: { order: "asc" },
      },
      coBuilders: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              image: true,
              slug: true,
              headline: true,
            },
          },
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  if (project.userId !== session.user.id) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href={`/projects/${slug}`}
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to project
      </Link>

      <div className="card p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Edit Project</h1>
          <p className="text-zinc-400 mt-2">
            Update your project details
          </p>
        </div>

        <ProjectForm initialData={project} />
      </div>
    </div>
  );
}
