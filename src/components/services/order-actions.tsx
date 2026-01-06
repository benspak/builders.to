"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, Play, Package, AlertTriangle } from "lucide-react";
import type { ServiceOrderStatus } from "@prisma/client";

interface OrderActionsProps {
  orderId: string;
  status: ServiceOrderStatus;
  isSeller: boolean;
}

export function OrderActions({ orderId, status, isSeller }: OrderActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performAction = async (action: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Action failed");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // No actions for final states
  if (["COMPLETED", "CANCELLED", "REFUNDED"].includes(status)) {
    return (
      <div className="text-sm text-zinc-500 py-2">
        {status === "COMPLETED" && (
          <span className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            Order completed successfully
          </span>
        )}
        {status === "CANCELLED" && (
          <span className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Order was cancelled
          </span>
        )}
        {status === "REFUNDED" && (
          <span className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Order was refunded
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {/* Seller Actions */}
        {isSeller && (
          <>
            {status === "PENDING_ACCEPTANCE" && (
              <>
                <button
                  onClick={() => performAction("accept")}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-900 rounded-lg bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 disabled:opacity-50 transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Accept Order
                </button>
                <button
                  onClick={() => performAction("cancel")}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-300 rounded-lg border border-zinc-700 hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  Decline
                </button>
              </>
            )}

            {status === "ACCEPTED" && (
              <>
                <button
                  onClick={() => performAction("start")}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-900 rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 disabled:opacity-50 transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Start Working
                </button>
                <button
                  onClick={() => performAction("cancel")}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-300 rounded-lg border border-zinc-700 hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel
                </button>
              </>
            )}

            {(status === "ACCEPTED" || status === "IN_PROGRESS") && (
              <button
                onClick={() => performAction("deliver")}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-900 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 disabled:opacity-50 transition-all"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Package className="h-4 w-4" />
                )}
                Mark Delivered
              </button>
            )}
          </>
        )}

        {/* Buyer Actions */}
        {!isSeller && (
          <>
            {status === "DELIVERED" && (
              <>
                <button
                  onClick={() => performAction("complete")}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-900 rounded-lg bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 disabled:opacity-50 transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Confirm & Release Payment
                </button>
                <button
                  onClick={() => performAction("dispute")}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 rounded-lg border border-red-500/30 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Dispute
                </button>
              </>
            )}

            {status === "PENDING_ACCEPTANCE" && (
              <button
                onClick={() => performAction("cancel")}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-300 rounded-lg border border-zinc-700 hover:bg-zinc-800 disabled:opacity-50 transition-colors"
              >
                <XCircle className="h-4 w-4" />
                Cancel Order
              </button>
            )}
          </>
        )}

        {/* Status Info */}
        {status === "IN_PROGRESS" && !isSeller && (
          <span className="inline-flex items-center gap-2 px-4 py-2 text-sm text-violet-400">
            <Play className="h-4 w-4" />
            Seller is working on your order
          </span>
        )}

        {status === "DISPUTED" && (
          <span className="inline-flex items-center gap-2 px-4 py-2 text-sm text-red-400">
            <AlertTriangle className="h-4 w-4" />
            Under review - we&apos;ll contact both parties
          </span>
        )}
      </div>
    </div>
  );
}
