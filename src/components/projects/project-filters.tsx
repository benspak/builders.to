"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const statuses = [
  { value: "", label: "All" },
  { value: "IDEA", label: "💡 Ideas" },
  { value: "BUILDING", label: "🔨 Building" },
  { value: "BETA", label: "🧪 Beta" },
  { value: "LAUNCHED", label: "🚀 Launched" },
  { value: "PAUSED", label: "⏸️ Paused" },
  { value: "ACQUIRED", label: "🏆 Acquired" },
];

const sorts = [
  { value: "recent", label: "Recent" },
  { value: "popular", label: "Popular" },
];

export function ProjectFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
  const [showFilters, setShowFilters] = useState(false);

  const currentSort = searchParams.get("sort") || "recent";
  const currentStatus = searchParams.get("status") || "";

  useEffect(() => {
    setSearchValue(searchParams.get("search") || "");
  }, [searchParams]);

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams("search", searchValue);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="input pl-11"
            />
          </div>
        </form>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "btn-secondary sm:hidden",
            showFilters && "bg-zinc-800"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Filters */}
      <div className={cn(
        "flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between",
        !showFilters && "hidden sm:flex"
      )}>
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => updateParams("status", status.value)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                currentStatus === status.value
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                  : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800 hover:text-white"
              )}
            >
              {status.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">Sort by:</span>
          <div className="flex rounded-lg border border-zinc-700/50 overflow-hidden">
            {sorts.map((sort) => (
              <button
                key={sort.value}
                onClick={() => updateParams("sort", sort.value)}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors",
                  currentSort === sort.value
                    ? "bg-zinc-800 text-white"
                    : "bg-zinc-900/50 text-zinc-400 hover:text-white"
                )}
              >
                {sort.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
