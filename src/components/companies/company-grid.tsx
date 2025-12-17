"use client";

import { useEffect, useState, useCallback } from "react";
import { CompanyCard } from "./company-card";
import { Loader2 } from "lucide-react";

interface Company {
  id: string;
  name: string;
  logo: string | null;
  location: string | null;
  category: string;
  about: string | null;
  website: string | null;
  size: string | null;
  yearFounded: number | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count: {
    projects: number;
  };
}

interface CompanyGridProps {
  initialCompanies?: Company[];
  category?: string;
  size?: string;
  search?: string;
}

export function CompanyGrid({
  initialCompanies = [],
  category,
  size,
  search,
}: CompanyGridProps) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [loading, setLoading] = useState(initialCompanies.length === 0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchCompanies = useCallback(async (pageNum: number, reset = false) => {
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "12",
        ...(category && { category }),
        ...(size && { size }),
        ...(search && { search }),
      });

      const response = await fetch(`/api/companies?${params}`);
      const data = await response.json();

      if (reset) {
        setCompanies(data.companies);
      } else {
        setCompanies((prev) => [...prev, ...data.companies]);
      }

      setHasMore(data.pagination.page < data.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    }
  }, [category, size, search]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchCompanies(1, true).finally(() => setLoading(false));
  }, [category, size, search, fetchCompanies]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    await fetchCompanies(nextPage);
    setPage(nextPage);
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-zinc-400">No companies found</p>
        <p className="text-zinc-500 mt-2">
          Be the first to add your company!
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((company, index) => (
          <div
            key={company.id}
            className="animate-fade-in opacity-0"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CompanyCard company={company} />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-12 text-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="btn-secondary"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load more companies"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
