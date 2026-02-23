"use client";

import { useEffect, useState, useCallback } from "react";
import { ServiceCard, type ServiceListingCard } from "./service-card";
import { Loader2 } from "lucide-react";

interface ServiceGridProps {
  category?: string;
  search?: string;
}

export function ServiceGrid({ category, search }: ServiceGridProps) {
  const [services, setServices] = useState<ServiceListingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchServices = useCallback(
    async (pageNum: number, reset = false) => {
      try {
        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: "12",
          ...(category && { category }),
          ...(search && { search }),
        });

        const response = await fetch(`/api/services?${params}`);
        const data = await response.json();

        if (reset) {
          setServices(data.services);
        } else {
          setServices((prev) => [...prev, ...data.services]);
        }

        setHasMore(data.pagination.page < data.pagination.totalPages);
      } catch (error) {
        console.error("Failed to fetch services:", error);
      }
    },
    [category, search]
  );

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchServices(1, true).finally(() => setLoading(false));
  }, [category, search, fetchServices]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    await fetchServices(nextPage);
    setPage(nextPage);
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-zinc-400">No services found</p>
        <p className="text-zinc-500 mt-2">
          Try adjusting your filters or check back later for new listings.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) => (
          <div
            key={service.id}
            className="animate-fade-in opacity-0 min-w-0"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <ServiceCard service={service} />
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
              "Load more services"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
