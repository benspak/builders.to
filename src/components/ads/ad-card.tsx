"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ExternalLink,
  Eye,
  MoreVertical,
  Edit2,
  Trash2,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

type AdStatus = "DRAFT" | "PENDING_PAYMENT" | "ACTIVE" | "EXPIRED" | "CANCELLED";

interface Advertisement {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  linkUrl: string;
  ctaText: string;
  status: AdStatus;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  _count: {
    views: number;
  };
}

interface AdCardProps {
  ad: Advertisement;
  onDelete?: (id: string) => void;
}

const statusConfig: Record<AdStatus, { label: string; color: string; icon: React.ElementType }> = {
  DRAFT: {
    label: "Draft",
    color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
    icon: Edit2
  },
  PENDING_PAYMENT: {
    label: "Pending Payment",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    icon: Clock
  },
  ACTIVE: {
    label: "Active",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    icon: CheckCircle
  },
  EXPIRED: {
    label: "Expired",
    color: "bg-zinc-500/10 text-zinc-500 border-zinc-500/30",
    icon: Clock
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-500/10 text-red-400 border-red-500/30",
    icon: XCircle
  },
};

export function AdCard({ ad, onDelete }: AdCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const status = statusConfig[ad.status];
  const StatusIcon = status.icon;

  const getDaysRemaining = () => {
    if (!ad.endDate) return null;
    const now = new Date();
    const end = new Date(ad.endDate);
    const diffMs = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this ad?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/ads/${ad.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete ad");
      }
      onDelete?.(ad.id);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete ad");
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const res = await fetch(`/api/ads/${ad.id}/checkout`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create checkout");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to start checkout");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const canEdit = ad.status === "DRAFT" || ad.status === "PENDING_PAYMENT";
  const canDelete = ad.status !== "ACTIVE";
  const canPay = ad.status === "DRAFT" || ad.status === "PENDING_PAYMENT";
  const daysRemaining = getDaysRemaining();

  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 overflow-hidden hover:border-zinc-700/50 transition-all">
      <div className="flex">
        {/* Image */}
        <div className="relative w-40 shrink-0 bg-zinc-800">
          {ad.imageUrl ? (
            <Image
              src={ad.imageUrl}
              alt={ad.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
              <AlertCircle className="h-8 w-8" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {/* Status Badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
                  status.color
                )}>
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </span>
                {ad.status === "ACTIVE" && daysRemaining !== null && (
                  <span className="text-xs text-zinc-500">
                    {daysRemaining} days left
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-sm font-semibold text-white truncate">
                {ad.title}
              </h3>

              {/* Stats */}
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{ad._count.views.toLocaleString()} views</span>
                </div>
                <a
                  href={ad.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[150px]">{new URL(ad.linkUrl).hostname}</span>
                </a>
              </div>
            </div>

            {/* Actions */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-zinc-700/50 bg-zinc-900 shadow-xl z-20">
                    <Link
                      href={`/ads/${ad.id}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                      onClick={() => setShowMenu(false)}
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Link>
                    {canEdit && (
                      <Link
                        href={`/ads/${ad.id}/edit`}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                        onClick={() => setShowMenu(false)}
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit Ad
                      </Link>
                    )}
                    {canDelete && (
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment CTA for draft/pending */}
          {canPay && (
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50"
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Pay $50 to Activate
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
