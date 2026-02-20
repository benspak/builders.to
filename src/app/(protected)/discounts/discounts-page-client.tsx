"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { DiscountForm } from "@/components/discounts/discount-form";
import { DiscountGrid } from "@/components/discounts/discount-grid";
import { cn } from "@/lib/utils";

interface DiscountsPageClientProps {
  canCreateMore: boolean;
  isPro: boolean;
  userDiscountCount: number;
  freeLimit: number;
  showGrid?: boolean;
}

export function DiscountsPageClient({
  canCreateMore,
  isPro,
  userDiscountCount,
  freeLimit,
  showGrid,
}: DiscountsPageClientProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editDiscount, setEditDiscount] = useState<
    Parameters<typeof DiscountForm>[0]["discount"] | undefined
  >(undefined);
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");

  const handleEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/discounts/${id}`);
      const data = await res.json();
      if (data.discount) {
        setEditDiscount(data.discount);
        setShowForm(true);
      }
    } catch (err) {
      console.error("Failed to fetch discount for edit:", err);
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      await fetch(`/api/discounts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: active }),
      });
      router.refresh();
    } catch (err) {
      console.error("Failed to toggle discount:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this discount?")) return;
    try {
      await fetch(`/api/discounts/${id}`, { method: "DELETE" });
      router.refresh();
    } catch (err) {
      console.error("Failed to delete discount:", err);
    }
  };

  if (!showGrid) {
    return (
      <>
        {canCreateMore ? (
          <button
            onClick={() => {
              setEditDiscount(undefined);
              setShowForm(true);
            }}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" />
            Offer a Discount
            {!isPro && (
              <span className="text-xs opacity-70">
                ({userDiscountCount}/{freeLimit})
              </span>
            )}
          </button>
        ) : (
          <span className="text-sm text-zinc-500">
            Upgrade to Pro for more discount slots
          </span>
        )}

        {showForm && (
          <DiscountForm
            onClose={() => {
              setShowForm(false);
              setEditDiscount(undefined);
            }}
            discount={editDiscount}
          />
        )}
      </>
    );
  }

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("all")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === "all"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800 hover:text-white"
          )}
        >
          All Discounts
        </button>
        <button
          onClick={() => setActiveTab("mine")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === "mine"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800 hover:text-white"
          )}
        >
          My Discounts
        </button>
      </div>

      <DiscountGrid
        mine={activeTab === "mine"}
        onEdit={activeTab === "mine" ? handleEdit : undefined}
        onToggle={activeTab === "mine" ? handleToggle : undefined}
        onDelete={activeTab === "mine" ? handleDelete : undefined}
      />

      {showForm && (
        <DiscountForm
          onClose={() => {
            setShowForm(false);
            setEditDiscount(undefined);
          }}
          discount={editDiscount}
        />
      )}
    </>
  );
}
