"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const categories = [
  { value: "", label: "All" },
  { value: "SAAS", label: "SaaS" },
  { value: "AGENCY", label: "Agency" },
  { value: "FINTECH", label: "Fintech" },
  { value: "ECOMMERCE", label: "E-commerce" },
  { value: "HEALTHTECH", label: "Healthtech" },
  { value: "EDTECH", label: "Edtech" },
  { value: "AI_ML", label: "AI / ML" },
  { value: "DEVTOOLS", label: "Dev Tools" },
  { value: "MEDIA", label: "Media" },
  { value: "MARKETPLACE", label: "Marketplace" },
  { value: "OTHER", label: "Other" },
];

const sizes = [
  { value: "", label: "Any Size" },
  { value: "SIZE_1_10", label: "1-10" },
  { value: "SIZE_11_50", label: "11-50" },
  { value: "SIZE_51_200", label: "51-200" },
  { value: "SIZE_201_500", label: "201-500" },
  { value: "SIZE_500_PLUS", label: "500+" },
];

export function CompanyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
  const [showFilters, setShowFilters] = useState(false);

  const currentCategory = searchParams.get("category") || "";
  const currentSize = searchParams.get("size") || "";

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
              placeholder="Search companies..."
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
        "flex flex-col gap-4",
        !showFilters && "hidden sm:flex"
      )}>
        {/* Category Tabs */}
        <div>
          <span className="text-sm text-zinc-500 mb-2 block">Category:</span>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => updateParams("category", category.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  currentCategory === category.value
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800 hover:text-white"
                )}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Size Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-zinc-500">Company Size:</span>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size.value}
                onClick={() => updateParams("size", size.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  currentSize === size.value
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800 hover:text-white"
                )}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
