"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, Rocket, ArrowRight } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  slug: string | null;
  title: string;
  tagline: string;
  imageUrl: string | null;
  status: string;
  user: {
    name: string | null;
    image: string | null;
  };
}

interface SearchCommandProps {
  inline?: boolean; // show trigger in navbar as elongated pill
}

export function SearchCommand({ inline = false }: SearchCommandProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Handle Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  // Search projects
  const searchProjects = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/projects?search=${encodeURIComponent(searchQuery)}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.projects || []);
        setSelectedIndex(0);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProjects(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, searchProjects]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      navigateToProject(results[selectedIndex]);
    }
  };

  const navigateToProject = (project: SearchResult) => {
    setOpen(false);
    router.push(`/projects/${project.slug || project.id}`);
  };

  return (
    <>
      {/* Search Trigger Button */}
      <div className="flex items-center">
        <button
          onClick={() => setOpen(true)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm rounded-full border transition-colors justify-start w-[240px]",
            inline ? "" : "hidden sm:flex"
          )}
          style={{
            background: "var(--background-secondary)",
            borderColor: "var(--input-border)",
            color: "var(--foreground-muted)",
          }}
        >
          <Search className="h-4 w-4" />
          <span className="truncate">Search</span>
          <kbd
            className="ml-auto px-1.5 py-0.5 text-[10px] font-medium rounded"
            style={{
              background: "var(--background-tertiary)",
              color: "var(--foreground-subtle)",
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Mobile Search Icon - Circular */}
        {!inline && (
          <button
            onClick={() => setOpen(true)}
            className="sm:hidden p-2.5 rounded-full transition-colors"
            style={{ 
              background: "var(--background-tertiary)",
              color: "var(--foreground-muted)" 
            }}
          >
            <Search className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Modal */}
      {open && (
        <>
          {/* Click outside overlay */}
          <div 
            className="fixed inset-0 z-50"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div 
            className="fixed left-1/2 top-[12vh] z-50 w-full max-w-lg -translate-x-1/2 px-4"
          >
            <div 
              className="w-full rounded-2xl border shadow-2xl overflow-hidden"
              style={{
                background: "var(--background)",
                borderColor: "var(--card-border)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)",
              }}
            >
              {/* Search Input */}
              <div
                className="flex items-center gap-3 px-4 py-4 border-b"
                style={{ borderColor: "var(--card-border)" }}
              >
                <Search className="h-5 w-5 flex-shrink-0 text-orange-500" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search projects..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent outline-none text-base placeholder:text-zinc-500"
                  style={{ color: "var(--foreground)" }}
                />
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                ) : query && (
                  <button
                    onClick={() => setQuery("")}
                    className="p-1 rounded-md hover:bg-zinc-700/50 transition-colors"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <kbd
                  className="px-2 py-1 text-[10px] font-medium rounded-md border"
                  style={{
                    background: "var(--background-tertiary)",
                    borderColor: "var(--input-border)",
                    color: "var(--foreground-subtle)",
                  }}
                >
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto">
                {results.length > 0 ? (
                  <div className="p-2">
                    {results.map((project, index) => (
                      <button
                        key={project.id}
                        onClick={() => navigateToProject(project)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                          index === selectedIndex
                            ? "bg-orange-500/10"
                            : "hover:bg-zinc-800/50"
                        )}
                      >
                        {project.imageUrl ? (
                          <Image
                            src={project.imageUrl}
                            alt={project.title}
                            width={40}
                            height={40}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ background: "var(--background-tertiary)" }}
                          >
                            <Rocket className="h-5 w-5" style={{ color: "var(--foreground-muted)" }} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-medium truncate"
                            style={{ color: "var(--foreground)" }}
                          >
                            {project.title}
                          </p>
                          <p
                            className="text-sm truncate"
                            style={{ color: "var(--foreground-muted)" }}
                          >
                            {project.tagline}
                          </p>
                        </div>
                        {index === selectedIndex && (
                          <ArrowRight className="h-4 w-4 flex-shrink-0 text-orange-500" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : query && !loading ? (
                  <div className="p-8 text-center">
                    <p style={{ color: "var(--foreground-muted)" }}>
                      No projects found for &ldquo;{query}&rdquo;
                    </p>
                  </div>
                ) : !query ? (
                  <div className="p-8 text-center">
                    <p style={{ color: "var(--foreground-muted)" }}>
                      Start typing to search projects...
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Footer */}
              <div
                className="flex items-center justify-center gap-4 px-4 py-2.5 text-xs border-t"
                style={{
                  borderColor: "var(--card-border)",
                  color: "var(--foreground-subtle)",
                  background: "var(--background-secondary)",
                }}
              >
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded border" style={{ background: "var(--background-tertiary)", borderColor: "var(--input-border)" }}>↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded border" style={{ background: "var(--background-tertiary)", borderColor: "var(--input-border)" }}>↓</kbd>
                  <span className="ml-1">navigate</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded border" style={{ background: "var(--background-tertiary)", borderColor: "var(--input-border)" }}>↵</kbd>
                  <span className="ml-1">select</span>
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

