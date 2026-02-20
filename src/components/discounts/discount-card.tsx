"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Tag,
  Percent,
  DollarSign,
  Gift,
  User,
  Users,
  Clock,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DiscountCardProps {
  discount: {
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
    user: {
      id: string;
      name: string | null;
      displayName: string | null;
      image: string | null;
      slug: string | null;
    };
    _count: { claims: number };
  };
  showManage?: boolean;
  onEdit?: (id: string) => void;
  onToggle?: (id: string, active: boolean) => void;
  onDelete?: (id: string) => void;
}

function getDiscountIcon(type: string) {
  switch (type) {
    case "PERCENTAGE":
      return <Percent className="h-4 w-4" />;
    case "FIXED_AMOUNT":
      return <DollarSign className="h-4 w-4" />;
    default:
      return <Gift className="h-4 w-4" />;
  }
}

function getDiscountBadgeColor(type: string) {
  switch (type) {
    case "PERCENTAGE":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    case "FIXED_AMOUNT":
      return "bg-blue-500/10 text-blue-400 border-blue-500/30";
    default:
      return "bg-purple-500/10 text-purple-400 border-purple-500/30";
  }
}

function getDiscountLabel(type: string) {
  switch (type) {
    case "PERCENTAGE":
      return "Percentage Off";
    case "FIXED_AMOUNT":
      return "Fixed Amount";
    default:
      return "Special Deal";
  }
}

function formatExpiryDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return "Expired";
  if (days === 0) return "Expires today";
  if (days === 1) return "Expires tomorrow";
  if (days <= 7) return `Expires in ${days} days`;
  return `Expires ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

export function DiscountCard({
  discount,
  showManage,
  onEdit,
  onToggle,
  onDelete,
}: DiscountCardProps) {
  const isExpired =
    discount.expiresAt && new Date(discount.expiresAt) < new Date();
  const isMaxedOut =
    discount.maxUses !== null && discount.claimCount >= discount.maxUses;
  const isUnavailable = isExpired || isMaxedOut || !discount.isActive;

  return (
    <div
      className={cn(
        "card card-hover group relative flex flex-col overflow-hidden",
        isUnavailable && "opacity-60"
      )}
    >
      <div className="flex flex-1 flex-col p-6">
        {/* Header: Badge + Value */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Link
              href={`/discounts/${discount.slug}`}
              className="block group/title"
            >
              <h3 className="text-lg font-semibold text-white truncate group-hover/title:text-emerald-400 transition-colors">
                {discount.title}
              </h3>
            </Link>
            <p className="mt-1 text-sm text-zinc-400 line-clamp-2">
              {discount.description}
            </p>
          </div>
          <div className="shrink-0 flex items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
            <span className="text-lg font-bold text-emerald-400">
              {discount.discountType === "PERCENTAGE"
                ? `${discount.discountValue}%`
                : discount.discountType === "FIXED_AMOUNT"
                  ? `$${discount.discountValue}`
                  : discount.discountValue}
            </span>
          </div>
        </div>

        {/* Product name + type badge */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border",
              getDiscountBadgeColor(discount.discountType)
            )}
          >
            {getDiscountIcon(discount.discountType)}
            {getDiscountLabel(discount.discountType)}
          </span>
          <a
            href={discount.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <Tag className="h-3 w-3" />
            {discount.productName}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Expiry / Usage info */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {discount.claimCount} claimed
            {discount.maxUses !== null && ` / ${discount.maxUses} max`}
          </span>
          {discount.expiresAt && (
            <span
              className={cn(
                "flex items-center gap-1",
                isExpired && "text-red-400"
              )}
            >
              <Clock className="h-3 w-3" />
              {formatExpiryDate(discount.expiresAt)}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
          <div className="flex items-center gap-2">
            {discount.user.slug ? (
              <Link
                href={`/${discount.user.slug}`}
                className="flex items-center gap-2"
              >
                {discount.user.image ? (
                  <Image
                    src={discount.user.image}
                    alt={
                      discount.user.displayName ||
                      discount.user.name ||
                      "User"
                    }
                    width={20}
                    height={20}
                    className="rounded-full object-cover w-5 h-5"
                  />
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700">
                    <User className="h-2.5 w-2.5 text-zinc-400" />
                  </div>
                )}
                <span className="text-sm text-zinc-400 hover:text-white transition-colors truncate max-w-[120px]">
                  {discount.user.displayName || discount.user.name}
                </span>
              </Link>
            ) : (
              <span className="text-sm text-zinc-400 truncate max-w-[120px]">
                {discount.user.displayName || discount.user.name}
              </span>
            )}
          </div>

          {showManage && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit?.(discount.id)}
                className="text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onToggle?.(discount.id, !discount.isActive)}
                className="text-xs text-zinc-400 hover:text-white transition-colors"
              >
                {discount.isActive ? "Pause" : "Activate"}
              </button>
              <button
                onClick={() => onDelete?.(discount.id)}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
