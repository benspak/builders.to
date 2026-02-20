"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const discountTypes = [
  { value: "", label: "All" },
  { value: "PERCENTAGE", label: "% Off" },
  { value: "FIXED_AMOUNT", label: "$ Off" },
  { value: "CUSTOM", label: "Special" },
];

const sorts = [
  { value: "recent", label: "Recent" },
  { value: "popular", label: "Popular" },
  { value: "expiring", label: "Expiring Soon" },
];

export function DiscountFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || ""
  );
  const [showFilters, setShowFilters] = useState(false);

  const currentSort = searchParams.get("sort") || "recent";
  const currentType = searchParams.get("type") || "";

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
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams("search", searchValue);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search discounts..."
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

      <div
        className={cn(
          "flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between",
          !showFilters && "hidden sm:flex"
        )}
      >
        <div className="flex flex-wrap gap-2">
          {discountTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => updateParams("type", type.value)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                currentType === type.value
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800 hover:text-white"
              )}
            >
              {type.label}
            </button>
          ))}
        </div>

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
