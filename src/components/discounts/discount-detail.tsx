"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Tag,
  Percent,
  DollarSign,
  Gift,
  User,
  Users,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Lock,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DiscountReportButton } from "./discount-report-button";

interface DiscountDetailProps {
  discount: {
    id: string;
    slug: string;
    title: string;
    description: string;
    productName: string;
    productUrl: string;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT" | "CUSTOM";
    discountValue: string;
    couponCode: string | null;
    discountUrl: string | null;
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
      headline: string | null;
    };
    _count: { claims: number };
  };
  hasClaimed: boolean;
  isOwner: boolean;
  isAuthenticated: boolean;
}

function getDiscountIcon(type: string) {
  switch (type) {
    case "PERCENTAGE":
      return <Percent className="h-6 w-6" />;
    case "FIXED_AMOUNT":
      return <DollarSign className="h-6 w-6" />;
    default:
      return <Gift className="h-6 w-6" />;
  }
}

export function DiscountDetail({
  discount,
  hasClaimed: initialClaimed,
  isOwner,
  isAuthenticated,
}: DiscountDetailProps) {
  const [hasClaimed, setHasClaimed] = useState(initialClaimed);
  const [couponCode, setCouponCode] = useState(discount.couponCode);
  const [discountUrl, setDiscountUrl] = useState(discount.discountUrl);
  const [claiming, setClaiming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const isExpired =
    discount.expiresAt && new Date(discount.expiresAt) < new Date();
  const isMaxedOut =
    discount.maxUses !== null && discount.claimCount >= discount.maxUses;
  const isUnavailable =
    isExpired || isMaxedOut || !discount.isActive;

  const canClaim = isAuthenticated && !hasClaimed && !isOwner && !isUnavailable;
  const showCode = hasClaimed || isOwner;

  const handleClaim = async () => {
    if (!canClaim) return;
    setClaiming(true);
    setError("");

    try {
      const res = await fetch(`/api/discounts/${discount.id}/claim`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to claim discount");
        return;
      }

      setCouponCode(data.couponCode);
      setDiscountUrl(data.discountUrl);
      setHasClaimed(true);
    } catch {
      setError("Failed to claim discount. Please try again.");
    } finally {
      setClaiming(false);
    }
  };

  const handleCopy = async () => {
    if (!couponCode) return;
    await navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card p-8">
        {/* Discount value hero */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-8 py-5">
            <span className="text-emerald-400">
              {getDiscountIcon(discount.discountType)}
            </span>
            <span className="text-3xl font-bold text-emerald-400">
              {discount.discountType === "PERCENTAGE"
                ? `${discount.discountValue}% OFF`
                : discount.discountType === "FIXED_AMOUNT"
                  ? `$${discount.discountValue} OFF`
                  : discount.discountValue}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <h1 className="text-2xl font-bold text-white text-center">
          {discount.title}
        </h1>
        <div className="mt-2 flex items-center justify-center gap-2">
          <Tag className="h-4 w-4 text-zinc-400" />
          <a
            href={discount.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white transition-colors inline-flex items-center gap-1"
          >
            {discount.productName}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <p className="mt-6 text-zinc-300 leading-relaxed text-center">
          {discount.description}
        </p>

        {/* Stats */}
        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {discount.claimCount} claimed
            {discount.maxUses !== null && ` / ${discount.maxUses}`}
          </span>
          {discount.expiresAt && (
            <span
              className={cn(
                "flex items-center gap-1.5",
                isExpired && "text-red-400"
              )}
            >
              <Clock className="h-4 w-4" />
              {isExpired
                ? "Expired"
                : `Expires ${new Date(discount.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
            </span>
          )}
        </div>

        {/* Code / Claim section */}
        <div className="mt-8 border-t border-zinc-800 pt-8">
          {!isAuthenticated ? (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-xl bg-zinc-800/50 border border-zinc-700/50 px-6 py-4 mb-4">
                <Lock className="h-5 w-5 text-zinc-400" />
                <span className="text-zinc-400 font-mono text-lg tracking-widest">
                  ****-****-****
                </span>
              </div>
              <p className="text-zinc-400 mb-4">
                Sign in to reveal this discount
              </p>
              <Link
                href={`/signin?callbackUrl=/discounts/${discount.slug}`}
                className="btn-primary inline-flex"
              >
                Sign in to Claim
              </Link>
            </div>
          ) : showCode ? (
            <div className="space-y-4">
              {couponCode && (
                <div>
                  <label className="block text-sm text-zinc-400 mb-2 text-center">
                    Coupon Code
                  </label>
                  <div className="flex items-center gap-2 justify-center">
                    <div className="inline-flex items-center gap-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 px-6 py-3">
                      <span className="font-mono text-xl font-bold text-emerald-400 tracking-wider">
                        {couponCode}
                      </span>
                      <button
                        onClick={handleCopy}
                        className="text-emerald-400/60 hover:text-emerald-400 transition-colors"
                        title="Copy code"
                      >
                        {copied ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <Copy className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {discountUrl && (
                <div className="text-center">
                  <label className="block text-sm text-zinc-400 mb-2">
                    Or use this link (discount auto-applied)
                  </label>
                  <a
                    href={discountUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Get the Deal
                  </a>
                </div>
              )}
            </div>
          ) : isUnavailable ? (
            <div className="text-center">
              <p className="text-zinc-400">
                {isExpired
                  ? "This discount has expired."
                  : isMaxedOut
                    ? "This discount has reached its maximum number of claims."
                    : "This discount is no longer available."}
              </p>
            </div>
          ) : (
            <div className="text-center">
              {error && (
                <p className="text-red-400 text-sm mb-4">{error}</p>
              )}
              <div className="inline-flex items-center gap-2 rounded-xl bg-zinc-800/50 border border-zinc-700/50 px-6 py-4 mb-4">
                <Lock className="h-5 w-5 text-zinc-400" />
                <span className="text-zinc-400 font-mono text-lg tracking-widest">
                  ****-****-****
                </span>
              </div>
              <p className="text-zinc-400 mb-4">
                Claim this discount to reveal the code
              </p>
              <button
                onClick={handleClaim}
                disabled={claiming}
                className="btn-primary"
              >
                {claiming ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Claiming...
                  </>
                ) : (
                  "Claim Discount"
                )}
              </button>
            </div>
          )}
        </div>

        {/* Creator info */}
        <div className="mt-8 border-t border-zinc-800 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {discount.user.slug ? (
                <Link href={`/${discount.user.slug}`}>
                  {discount.user.image ? (
                    <Image
                      src={discount.user.image}
                      alt={
                        discount.user.displayName ||
                        discount.user.name ||
                        "User"
                      }
                      width={40}
                      height={40}
                      className="rounded-full object-cover w-10 h-10"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700">
                      <User className="h-5 w-5 text-zinc-400" />
                    </div>
                  )}
                </Link>
              ) : discount.user.image ? (
                <Image
                  src={discount.user.image}
                  alt={
                    discount.user.displayName ||
                    discount.user.name ||
                    "User"
                  }
                  width={40}
                  height={40}
                  className="rounded-full object-cover w-10 h-10"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700">
                  <User className="h-5 w-5 text-zinc-400" />
                </div>
              )}
              <div>
                {discount.user.slug ? (
                  <Link
                    href={`/${discount.user.slug}`}
                    className="text-sm font-medium text-white hover:text-emerald-400 transition-colors"
                  >
                    {discount.user.displayName || discount.user.name}
                  </Link>
                ) : (
                  <p className="text-sm font-medium text-white">
                    {discount.user.displayName || discount.user.name}
                  </p>
                )}
                {discount.user.headline && (
                  <p className="text-xs text-zinc-500">
                    {discount.user.headline}
                  </p>
                )}
              </div>
            </div>

            {isAuthenticated && !isOwner && (
              <DiscountReportButton discountId={discount.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
