"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { DiscountCard } from "./discount-card";
import { Loader2 } from "lucide-react";

interface DiscountUser {
  id: string;
  name: string | null;
  displayName: string | null;
  image: string | null;
  slug: string | null;
}

interface Discount {
  id: string;
  slug: string;
  title: string;
  description: string;
  productName: string;
  productUrl: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT" | "CUSTOM";
  discountValue: string;
  claimCount: number;
  maxUses: number | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  user: DiscountUser;
  _count: { claims: number };
}

interface DiscountGridProps {
  mine?: boolean;
  onEdit?: (id: string) => void;
  onToggle?: (id: string, active: boolean) => void;
  onDelete?: (id: string) => void;
}

export function DiscountGrid({
  mine,
  onEdit,
  onToggle,
  onDelete,
}: DiscountGridProps) {
  const searchParams = useSearchParams();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const sort = searchParams.get("sort") || "recent";
  const type = searchParams.get("type") || "";
  const search = searchParams.get("search") || "";

  const fetchDiscounts = useCallback(
    async (pageNum: number, reset = false) => {
      try {
        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: "12",
          sort,
          ...(type && { type }),
          ...(search && { search }),
          ...(mine && { mine: "true" }),
        });

        const response = await fetch(`/api/discounts?${params}`);
        const data = await response.json();

        if (reset) {
          setDiscounts(data.discounts);
        } else {
          setDiscounts((prev) => [...prev, ...data.discounts]);
        }

        setHasMore(data.page < data.totalPages);
      } catch (error) {
        console.error("Failed to fetch discounts:", error);
      }
    },
    [sort, type, search, mine]
  );

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchDiscounts(1, true).finally(() => setLoading(false));
  }, [sort, type, search, fetchDiscounts]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    await fetchDiscounts(nextPage);
    setPage(nextPage);
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (discounts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-zinc-400">
          {mine ? "You haven't created any discounts yet" : "No discounts found"}
        </p>
        <p className="text-zinc-500 mt-2">
          {mine
            ? "Offer a discount on your product to fellow builders!"
            : "Be the first to share a discount with the community!"}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {discounts.map((discount, index) => (
          <div
            key={discount.id}
            className="animate-fade-in opacity-0 min-w-0"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <DiscountCard
              discount={discount}
              showManage={mine}
              onEdit={onEdit}
              onToggle={onToggle}
              onDelete={onDelete}
            />
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
              "Load more discounts"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
