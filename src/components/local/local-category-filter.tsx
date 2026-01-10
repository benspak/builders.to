"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Users, Wrench, MessageSquare, Home, ShoppingBag, Briefcase, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { LocalListingCategory, CATEGORY_LABELS, CATEGORY_COLORS } from "./types";

const CategoryIcons = {
  COMMUNITY: Users,
  SERVICES: Wrench,
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
  { value: "SERVICES", label: CATEGORY_LABELS.SERVICES + " ($1)", color: CATEGORY_COLORS.SERVICES },
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
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const baseUrl = locationSlug
    ? `/local/${locationSlug}`
    : "/local";

  const getHref = (category: string | null) => {
    if (!category) {
      return baseUrl;
    }
    if (category === "JOBS" && locationSlug) {
      return `/local/${locationSlug}/jobs`;
    }
    return `${baseUrl}/${category.toLowerCase()}`;
  };

  const filteredCategories = includeJobs
    ? categories
    : categories.filter(c => c.value !== "JOBS");

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {/* All button */}
      <Link
        href={baseUrl}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium border transition-colors",
          !currentCategory
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
        const isActive = currentCategory?.toUpperCase() === cat.value;

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
