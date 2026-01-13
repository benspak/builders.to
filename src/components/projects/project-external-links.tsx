"use client";

import { ExternalLink, Github, Play, FileText, ScrollText } from "lucide-react";
import { useClickTracker } from "@/components/analytics/entity-view-tracker";

interface ProjectExternalLinksProps {
  projectId: string;
  url?: string | null;
  githubUrl?: string | null;
  demoUrl?: string | null;
  docsUrl?: string | null;
  changelogUrl?: string | null;
}

export function ProjectExternalLinks({
  projectId,
  url,
  githubUrl,
  demoUrl,
  docsUrl,
  changelogUrl,
}: ProjectExternalLinksProps) {
  const { trackClick } = useClickTracker("project", projectId);

  const handleClick = (clickType: string) => {
    trackClick(clickType);
  };

  const hasAnyLink = url || githubUrl || demoUrl || docsUrl || changelogUrl;

  if (!hasAnyLink) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleClick("url")}
          className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Visit Project
        </a>
      )}
      {githubUrl && (
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleClick("github")}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
        >
          <Github className="h-4 w-4" />
          View Source
        </a>
      )}
      {demoUrl && (
        <a
          href={demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleClick("demo")}
          className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 transition-colors"
        >
          <Play className="h-4 w-4" />
          Live Demo
        </a>
      )}
      {docsUrl && (
        <a
          href={docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleClick("docs")}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
        >
          <FileText className="h-4 w-4" />
          Documentation
        </a>
      )}
      {changelogUrl && (
        <a
          href={changelogUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleClick("changelog")}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-700 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-600 transition-colors"
        >
          <ScrollText className="h-4 w-4" />
          Changelog
        </a>
      )}
    </div>
  );
}
