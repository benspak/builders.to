"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { getServiceCategoryLabel } from "@/lib/utils";

const CATEGORIES = [
  { value: "", label: "All categories" },
  { value: "MVP_BUILD", label: getServiceCategoryLabel("MVP_BUILD") },
  { value: "DESIGN", label: getServiceCategoryLabel("DESIGN") },
  { value: "MARKETING", label: getServiceCategoryLabel("MARKETING") },
  { value: "AI_INTEGRATION", label: getServiceCategoryLabel("AI_INTEGRATION") },
  { value: "DEVOPS", label: getServiceCategoryLabel("DEVOPS") },
  { value: "AUDIT", label: getServiceCategoryLabel("AUDIT") },
  { value: "OTHER", label: getServiceCategoryLabel("OTHER") },
];

export function ServiceFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
  const currentCategory = searchParams.get("category") || "";

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
    router.push(`/services?${params.toString()}`);
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
              placeholder="Search services..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
            />
          </div>
        </form>
        <select
          value={currentCategory}
          onChange={(e) => updateParams("category", e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 sm:w-48"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value || "all"} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
