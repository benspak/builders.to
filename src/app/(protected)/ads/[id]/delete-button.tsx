"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

type AdStatus = "DRAFT" | "PENDING_PAYMENT" | "ACTIVE" | "EXPIRED" | "CANCELLED";

interface DeleteAdButtonProps {
  adId: string;
  status?: AdStatus;
  daysRemaining?: number | null;
}

export function DeleteAdButton({ adId, status, daysRemaining }: DeleteAdButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const isActiveAd = status === "ACTIVE" && daysRemaining !== null && daysRemaining !== undefined && daysRemaining > 0;
    const confirmMessage = isActiveAd
      ? `This will remove your ad content. Your ad slot is still valid for ${daysRemaining} more days - you can create a new ad to use it. Continue?`
      : "Are you sure you want to delete this ad?";

    if (!window.confirm(confirmMessage)) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/ads/${adId}`, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete ad");
      }

      router.push("/ads");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete ad");
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 rounded-lg border border-red-500/30 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      Delete
    </button>
  );
}
