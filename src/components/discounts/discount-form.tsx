"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Percent, DollarSign, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiscountFormProps {
  onClose: () => void;
  discount?: {
    id: string;
    title: string;
    description: string;
    productName: string;
    productUrl: string;
    discountType: string;
    discountValue: string;
    couponCode: string | null;
    discountUrl: string | null;
    maxUses: number | null;
    expiresAt: string | null;
  };
}

const discountTypes = [
  {
    value: "PERCENTAGE",
    label: "Percentage Off",
    icon: Percent,
    placeholder: "e.g. 20",
    suffix: "%",
  },
  {
    value: "FIXED_AMOUNT",
    label: "Fixed Amount",
    icon: DollarSign,
    placeholder: "e.g. 10",
    prefix: "$",
  },
  {
    value: "CUSTOM",
    label: "Custom Deal",
    icon: Gift,
    placeholder: 'e.g. "Free month trial"',
  },
];

export function DiscountForm({ onClose, discount }: DiscountFormProps) {
  const router = useRouter();
  const isEdit = !!discount;

  const [title, setTitle] = useState(discount?.title || "");
  const [description, setDescription] = useState(discount?.description || "");
  const [productName, setProductName] = useState(discount?.productName || "");
  const [productUrl, setProductUrl] = useState(discount?.productUrl || "");
  const [discountType, setDiscountType] = useState(
    discount?.discountType || "PERCENTAGE"
  );
  const [discountValue, setDiscountValue] = useState(
    discount?.discountValue || ""
  );
  const [couponCode, setCouponCode] = useState(discount?.couponCode || "");
  const [discountUrl, setDiscountUrl] = useState(discount?.discountUrl || "");
  const [maxUses, setMaxUses] = useState(
    discount?.maxUses?.toString() || ""
  );
  const [expiresAt, setExpiresAt] = useState(
    discount?.expiresAt
      ? new Date(discount.expiresAt).toISOString().split("T")[0]
      : ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedType = discountTypes.find((t) => t.value === discountType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!couponCode && !discountUrl) {
      setError("Please provide a coupon code or a discount URL (or both).");
      return;
    }

    setSubmitting(true);

    try {
      const url = isEdit ? `/api/discounts/${discount.id}` : "/api/discounts";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          productName,
          productUrl,
          discountType,
          discountValue,
          couponCode: couponCode || null,
          discountUrl: discountUrl || null,
          maxUses: maxUses || null,
          expiresAt: expiresAt || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      router.refresh();
      onClose();
    } catch {
      setError("Failed to save discount. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {isEdit ? "Edit Discount" : "Offer a Discount"}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Discount Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g. "50% off BuilderKit Pro"'
              className="input"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what the discount includes and any conditions..."
              className="textarea min-h-[80px]"
              required
              maxLength={500}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                Product Name
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. BuilderKit"
                className="input"
                required
                maxLength={60}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                Product URL
              </label>
              <input
                type="url"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://..."
                className="input"
                required
              />
            </div>
          </div>

          {/* Discount Type selector */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Discount Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {discountTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setDiscountType(type.value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-sm transition-all",
                    discountType === type.value
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "border-zinc-700/50 text-zinc-400 hover:border-zinc-600 hover:text-white"
                  )}
                >
                  <type.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Discount Value
            </label>
            <div className="relative">
              {selectedType?.prefix && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                  {selectedType.prefix}
                </span>
              )}
              <input
                type="text"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={selectedType?.placeholder || ""}
                className={cn("input", selectedType?.prefix && "pl-7")}
                required
              />
              {selectedType?.suffix && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
                  {selectedType.suffix}
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-5">
            <p className="text-sm font-medium text-zinc-300 mb-3">
              How do members redeem this discount?
            </p>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">
                Coupon Code
              </label>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="e.g. BUILDERS50"
                className="input font-mono"
                maxLength={50}
              />
            </div>
            <div className="mt-3">
              <label className="block text-sm text-zinc-400 mb-1.5">
                Discount URL (auto-applies discount)
              </label>
              <input
                type="url"
                value={discountUrl}
                onChange={(e) => setDiscountUrl(e.target.value)}
                placeholder="https://yourproduct.com/?promo=BUILDERS50"
                className="input"
              />
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              Provide at least one: a coupon code, a discount URL, or both.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">
                Max Claims (optional)
              </label>
              <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Unlimited"
                className="input"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">
                Expiration Date (optional)
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="input"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEdit ? "Saving..." : "Creating..."}
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create Discount"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
