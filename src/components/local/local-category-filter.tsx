"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Users, MessageSquare, Home, ShoppingBag, Briefcase, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { LocalListingCategory, CATEGORY_LABELS, CATEGORY_COLORS } from "./types";

const CategoryIcons = {
  COMMUNITY: Users,
  DISCUSSION: MessageSquare,
  COWORKING_HOUSING: Home,
  FOR_SALE: ShoppingBag,
  JOBS: Briefcase,
};

interface LocalCategoryFilterProps {
  locationSlug?: string;
  currentCategory?: string | null;
  includeJobs?: boolean;
  className?: string;
}

const categories: { value: LocalListingCategory | "JOBS"; label: string; color: string }[] = [
  { value: "COMMUNITY", label: CATEGORY_LABELS.COMMUNITY, color: CATEGORY_COLORS.COMMUNITY },
  { value: "DISCUSSION", label: CATEGORY_LABELS.DISCUSSION, color: CATEGORY_COLORS.DISCUSSION },
  { value: "COWORKING_HOUSING", label: CATEGORY_LABELS.COWORKING_HOUSING, color: CATEGORY_COLORS.COWORKING_HOUSING },
  { value: "FOR_SALE", label: CATEGORY_LABELS.FOR_SALE, color: CATEGORY_COLORS.FOR_SALE },
  { value: "JOBS", label: "Jobs (Free)", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
];

export function LocalCategoryFilter({
  locationSlug,
  currentCategory,
  includeJobs = true,
  className
}: LocalCategoryFilterProps) {
  const searchParams = useSearchParams();

  const getHref = (category: string | null) => {
    // When we have a locationSlug, use path-based routing
    if (locationSlug) {
      if (!category) {
        return `/${locationSlug}`;
      }
      return `/${locationSlug}/${category.toLowerCase()}`;
    }

    // Without a locationSlug, use query params for filtering on /local
    if (!category) {
      return "/local";
    }
    return `/local?category=${category.toLowerCase()}`;
  };

  // Determine active category from either prop or query params
  const activeCategory = currentCategory || searchParams.get("category");

  // Filter out JOBS if not on a location page (JOBS only works with locationSlug for CompanyRole filtering)
  const filteredCategories = locationSlug && includeJobs
    ? categories
    : categories.filter(c => c.value !== "JOBS");

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {/* All button */}
      <Link
        href={getHref(null)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium border transition-colors",
          !activeCategory
            ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
            : "bg-zinc-800/50 text-zinc-400 border-zinc-700/50 hover:bg-zinc-800 hover:text-white"
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        All
      </Link>

      {/* Category buttons */}
      {filteredCategories.map((cat) => {
        const Icon = CategoryIcons[cat.value];
        const isActive = activeCategory?.toUpperCase() === cat.value;

        return (
          <Link
            key={cat.value}
            href={getHref(cat.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium border transition-colors",
              isActive
                ? cat.color
                : "bg-zinc-800/50 text-zinc-400 border-zinc-700/50 hover:bg-zinc-800 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4" />
            {cat.label}
          </Link>
        );
      })}
    </div>
  );
}
