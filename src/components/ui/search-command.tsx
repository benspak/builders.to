"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Loader2,
  Rocket,
  ArrowRight,
  User,

  Briefcase,
  FileText
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type SearchResultType = "user" | "project" | "service" | "update";

interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  url: string;
  meta?: {
    status?: string;
    category?: string;
    author?: {
      name: string | null;
      image: string | null;
      slug: string | null;
    };
  };
}

interface SearchResponse {
  results: SearchResult[];
  grouped: Record<SearchResultType, SearchResult[]>;
  counts: {
    user: number;
    project: number;
    service: number;
    update: number;
    total: number;
  };
}

interface SearchCommandProps {
  inline?: boolean;
}

const TYPE_CONFIG: Record<SearchResultType, { label: string; icon: typeof User; color: string }> = {
  user: { label: "Builders", icon: User, color: "text-blue-400" },
  project: { label: "Projects", icon: Rocket, color: "text-orange-400" },
  service: { label: "Services", icon: Briefcase, color: "text-purple-400" },
  update: { label: "Updates", icon: FileText, color: "text-yellow-400" },
};

const TYPE_ORDER: SearchResultType[] = ["user", "project", "service", "update"];

export function SearchCommand({ inline = false }: SearchCommandProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState<SearchResultType | "all">("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const getFilteredResults = useCallback((): SearchResult[] => {
    if (!response) return [];
    if (activeFilter === "all") {
      const ordered: SearchResult[] = [];
      TYPE_ORDER.forEach((type) => {
        ordered.push(...response.grouped[type].slice(0, 3));
      });
      return ordered;
    }
    return response.grouped[activeFilter];
  }, [response, activeFilter]);

  const filteredResults = getFilteredResults();

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

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
      setQuery("");
      setResponse(null);
      setSelectedIndex(0);
      setActiveFilter("all");
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [activeFilter]);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResponse(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        setResponse(data);
        setSelectedIndex(0);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      search(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    if (resultsRef.current) {
      const selectedItem = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selectedItem?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && filteredResults[selectedIndex]) {
      e.preventDefault();
      navigateToResult(filteredResults[selectedIndex]);
    } else if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const filterOrder: (SearchResultType | "all")[] = ["all", ...TYPE_ORDER];
      const currentIdx = filterOrder.indexOf(activeFilter);
      const nextIdx = (currentIdx + 1) % filterOrder.length;
      setActiveFilter(filterOrder[nextIdx]);
    }
  };

  const navigateToResult = (result: SearchResult) => {
    setOpen(false);
    router.push(result.url);
  };

  const getTypeIcon = (type: SearchResultType) => {
    const config = TYPE_CONFIG[type];
    const Icon = config.icon;
    return <Icon className={cn("h-4 w-4", config.color)} />;
  };

  const getResultImage = (result: SearchResult) => {
    if (result.imageUrl) {
      return (
        <Image
          src={result.imageUrl}
          alt={result.title}
          width={40}
          height={40}
          className={cn(
            "object-cover",
            result.type === "user" ? "rounded-full" : "rounded-lg"
          )}
        />
      );
    }

    const Icon = TYPE_CONFIG[result.type].icon;
    return (
      <div
        className={cn(
          "w-10 h-10 flex items-center justify-center",
          result.type === "user" ? "rounded-full" : "rounded-lg"
        )}
        style={{ background: "var(--background-tertiary)" }}
      >
        <Icon className="h-5 w-5" style={{ color: "var(--foreground-muted)" }} />
      </div>
    );
  };

  return (
    <>
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
            Command+K
          </kbd>
        </button>

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

      {open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div
            className="fixed left-1/2 top-[12vh] z-50 w-full max-w-xl -translate-x-1/2 px-4"
          >
            <div
              className="w-full rounded-2xl border shadow-2xl overflow-hidden"
              style={{
                background: "var(--background)",
                borderColor: "var(--card-border)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)",
              }}
            >
              <div
                className="flex items-center gap-3 px-4 py-4 border-b"
                style={{ borderColor: "var(--card-border)" }}
              >
                <Search className="h-5 w-5 flex-shrink-0 text-orange-500" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search builders, projects, services..."
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

              {response && response.counts.total > 0 && (
                <div
                  className="flex items-center gap-1 px-3 py-2 border-b overflow-x-auto"
                  style={{ borderColor: "var(--card-border)" }}
                >
                  <button
                    onClick={() => setActiveFilter("all")}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap",
                      activeFilter === "all"
                        ? "bg-orange-500 text-white"
                        : "hover:bg-zinc-700/50"
                    )}
                    style={activeFilter !== "all" ? { color: "var(--foreground-muted)" } : {}}
                  >
                    All ({response.counts.total})
                  </button>
                  {TYPE_ORDER.map((type) => {
                    const count = response.counts[type];
                    if (count === 0) return null;
                    const config = TYPE_CONFIG[type];
                    return (
                      <button
                        key={type}
                        onClick={() => setActiveFilter(type)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap",
                          activeFilter === type
                            ? "bg-orange-500 text-white"
                            : "hover:bg-zinc-700/50"
                        )}
                        style={activeFilter !== type ? { color: "var(--foreground-muted)" } : {}}
                      >
                        <config.icon className={cn("h-3 w-3", activeFilter === type ? "" : config.color)} />
                        {config.label} ({count})
                      </button>
                    );
                  })}
                </div>
              )}

              <div ref={resultsRef} className="max-h-80 overflow-y-auto">
                {filteredResults.length > 0 ? (
                  <div className="p-2">
                    {activeFilter === "all" ? (
                      TYPE_ORDER.map((type) => {
                        const typeResults = response?.grouped[type].slice(0, 3) || [];
                        if (typeResults.length === 0) return null;
                        const config = TYPE_CONFIG[type];
                        return (
                          <div key={type} className="mb-2">
                            <div
                              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium uppercase tracking-wider"
                              style={{ color: "var(--foreground-subtle)" }}
                            >
                              <config.icon className={cn("h-3 w-3", config.color)} />
                              {config.label}
                            </div>
                            {typeResults.map((result) => {
                              const globalIndex = filteredResults.indexOf(result);
                              return (
                                <ResultItem
                                  key={result.id}
                                  result={result}
                                  index={globalIndex}
                                  selectedIndex={selectedIndex}
                                  onSelect={() => navigateToResult(result)}
                                  getResultImage={getResultImage}
                                  getTypeIcon={getTypeIcon}
                                />
                              );
                            })}
                          </div>
                        );
                      })
                    ) : (
                      filteredResults.map((result, index) => (
                        <ResultItem
                          key={result.id}
                          result={result}
                          index={index}
                          selectedIndex={selectedIndex}
                          onSelect={() => navigateToResult(result)}
                          getResultImage={getResultImage}
                          getTypeIcon={getTypeIcon}
                        />
                      ))
                    )}
                  </div>
                ) : query && query.length >= 2 && !loading ? (
                  <div className="p-8 text-center">
                    <p style={{ color: "var(--foreground-muted)" }}>
                      No results found for &ldquo;{query}&rdquo;
                    </p>
                    <p className="text-sm mt-1" style={{ color: "var(--foreground-subtle)" }}>
                      Try searching for builders, projects, or services
                    </p>
                  </div>
                ) : !query || query.length < 2 ? (
                  <div className="p-8 text-center space-y-3">
                    <p style={{ color: "var(--foreground-muted)" }}>
                      Search across the platform
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {TYPE_ORDER.map((type) => {
                        const config = TYPE_CONFIG[type];
                        return (
                          <span
                            key={type}
                            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full"
                            style={{
                              background: "var(--background-tertiary)",
                              color: "var(--foreground-muted)"
                            }}
                          >
                            <config.icon className={cn("h-3 w-3", config.color)} />
                            {config.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>

              <div
                className="flex items-center justify-center gap-4 px-4 py-2.5 text-xs border-t"
                style={{
                  borderColor: "var(--card-border)",
                  color: "var(--foreground-subtle)",
                  background: "var(--background-secondary)",
                }}
              >
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded border" style={{ background: "var(--background-tertiary)", borderColor: "var(--input-border)" }}>Up</kbd>
                  <kbd className="px-1.5 py-0.5 rounded border" style={{ background: "var(--background-tertiary)", borderColor: "var(--input-border)" }}>Down</kbd>
                  <span className="ml-1">navigate</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded border" style={{ background: "var(--background-tertiary)", borderColor: "var(--input-border)" }}>Tab</kbd>
                  <span className="ml-1">filter</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded border" style={{ background: "var(--background-tertiary)", borderColor: "var(--input-border)" }}>Enter</kbd>
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

function ResultItem({
  result,
  index,
  selectedIndex,
  onSelect,
  getResultImage,
  getTypeIcon,
}: {
  result: SearchResult;
  index: number;
  selectedIndex: number;
  onSelect: () => void;
  getResultImage: (result: SearchResult) => React.ReactNode;
  getTypeIcon: (type: SearchResultType) => React.ReactNode;
}) {
  return (
    <button
      data-index={index}
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
        index === selectedIndex
          ? "bg-orange-500/10"
          : "hover:bg-zinc-800/50"
      )}
    >
      <div className="flex-shrink-0 relative">
        {getResultImage(result)}
        <div
          className="absolute -bottom-1 -right-1 p-0.5 rounded-full"
          style={{ background: "var(--background)" }}
        >
          {getTypeIcon(result.type)}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="font-medium truncate"
          style={{ color: "var(--foreground)" }}
        >
          {result.title}
        </p>
        {result.subtitle && (
          <p
            className="text-sm truncate"
            style={{ color: "var(--foreground-muted)" }}
          >
            {result.subtitle}
          </p>
        )}
      </div>
      {index === selectedIndex && (
        <ArrowRight className="h-4 w-4 flex-shrink-0 text-orange-500" />
      )}
    </button>
  );
}
