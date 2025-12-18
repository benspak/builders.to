"use client";

import { useEffect, useState, useCallback } from "react";
import { ProjectCard } from "./project-card";
import { Loader2 } from "lucide-react";

interface Project {
  id: string;
  slug: string | null;
  title: string;
  tagline: string;
  url: string | null;
  githubUrl: string | null;
  imageUrl: string | null;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count: {
    upvotes: number;
    comments: number;
  };
  hasUpvoted: boolean;
}

interface ProjectGridProps {
  initialProjects?: Project[];
  sort?: string;
  status?: string;
  search?: string;
}

export function ProjectGrid({
  initialProjects = [],
  sort = "recent",
  status,
  search,
}: ProjectGridProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [loading, setLoading] = useState(initialProjects.length === 0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchProjects = useCallback(async (pageNum: number, reset = false) => {
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "12",
        sort,
        ...(status && { status }),
        ...(search && { search }),
      });

      const response = await fetch(`/api/projects?${params}`);
      const data = await response.json();

      if (reset) {
        setProjects(data.projects);
      } else {
        setProjects((prev) => [...prev, ...data.projects]);
      }

      setHasMore(data.pagination.page < data.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  }, [sort, status, search]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchProjects(1, true).finally(() => setLoading(false));
  }, [sort, status, search, fetchProjects]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    await fetchProjects(nextPage);
    setPage(nextPage);
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-zinc-400">No projects found</p>
        <p className="text-zinc-500 mt-2">
          Be the first to share your project!
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => (
          <div
            key={project.id}
            className="animate-fade-in opacity-0"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <ProjectCard project={project} />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-12 text-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="btn-secondary"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load more projects"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
