"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteAdButtonProps {
  adId: string;
}

export function DeleteAdButton({ adId }: DeleteAdButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this ad?")) return;

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
