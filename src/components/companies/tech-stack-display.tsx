"use client";

import { cn } from "@/lib/utils";
import { Code, Wrench } from "lucide-react";

interface TechStackDisplayProps {
  techStack: string[];
  tools?: string[];
  variant?: "full" | "compact" | "minimal";
  maxItems?: number;
  className?: string;
}

// Common tech/tool icons mapping (optional enhancement)
const techColors: Record<string, string> = {
  // Languages
  typescript: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  javascript: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  python: "bg-green-500/20 text-green-300 border-green-500/30",
  rust: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  go: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  ruby: "bg-red-500/20 text-red-300 border-red-500/30",
  java: "bg-amber-500/20 text-amber-300 border-amber-500/30",

  // Frontend
  react: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  vue: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  angular: "bg-red-500/20 text-red-300 border-red-500/30",
  nextjs: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  svelte: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  tailwind: "bg-teal-500/20 text-teal-300 border-teal-500/30",

  // Backend
  nodejs: "bg-green-500/20 text-green-300 border-green-500/30",
  django: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  rails: "bg-red-500/20 text-red-300 border-red-500/30",
  express: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  fastapi: "bg-teal-500/20 text-teal-300 border-teal-500/30",

  // Databases
  postgresql: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  postgres: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  mysql: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  mongodb: "bg-green-500/20 text-green-300 border-green-500/30",
  redis: "bg-red-500/20 text-red-300 border-red-500/30",
  supabase: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",

  // Cloud
  aws: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  gcp: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  azure: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  vercel: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  docker: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  kubernetes: "bg-blue-500/20 text-blue-300 border-blue-500/30",

  // AI
  openai: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  anthropic: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  langchain: "bg-green-500/20 text-green-300 border-green-500/30",
};

function getTechColor(tech: string): string {
  const normalized = tech.toLowerCase().replace(/[^a-z0-9]/g, "");
  return techColors[normalized] || "bg-zinc-800/50 text-zinc-400 border-white/5";
}

export function TechStackDisplay({
  techStack,
  tools = [],
  variant = "full",
  maxItems,
  className,
}: TechStackDisplayProps) {
  const allTech = techStack || [];
  const allTools = tools || [];
  const hasTech = allTech.length > 0;
  const hasTools = allTools.length > 0;

  if (!hasTech && !hasTools) {
    return null;
  }

  if (variant === "minimal") {
    const combined = [...allTech, ...allTools];
    const displayItems = maxItems ? combined.slice(0, maxItems) : combined;
    const remaining = combined.length - displayItems.length;

    return (
      <div className={cn("flex flex-wrap gap-1", className)}>
        {displayItems.map((item) => (
          <span
            key={item}
            className={cn(
              "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium border",
              getTechColor(item)
            )}
          >
            {item}
          </span>
        ))}
        {remaining > 0 && (
          <span className="text-xs text-zinc-500">+{remaining}</span>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    const displayTech = maxItems ? allTech.slice(0, maxItems) : allTech;
    const remainingTech = allTech.length - displayTech.length;

    return (
      <div className={cn("flex flex-wrap gap-1.5", className)}>
        {displayTech.map((item) => (
          <span
            key={item}
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
              getTechColor(item)
            )}
          >
            {item}
          </span>
        ))}
        {remainingTech > 0 && (
          <span className="text-xs text-zinc-500 flex items-center">
            +{remainingTech} more
          </span>
        )}
      </div>
    );
  }

  // Full variant - shows tech stack and tools separately
  return (
    <div className={cn("space-y-4", className)}>
      {hasTech && (
        <div>
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
            <Code className="h-4 w-4" />
            <span className="font-medium">Tech Stack</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allTech.map((item) => (
              <span
                key={item}
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium border",
                  getTechColor(item)
                )}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {hasTools && (
        <div>
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
            <Wrench className="h-4 w-4" />
            <span className="font-medium">Tools & Services</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allTools.map((item) => (
              <span
                key={item}
                className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium border bg-zinc-800/50 text-zinc-300 border-white/10"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
