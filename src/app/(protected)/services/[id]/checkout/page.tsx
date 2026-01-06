"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Store, ArrowLeft, Loader2, DollarSign, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default function ServiceCheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [service, setService] = useState<{
    id: string;
    title: string;
    description: string;
    status: string;
  } | null>(null);

  const cancelled = searchParams.get("cancelled") === "true";
  const serviceId = params.id as string;

  // Fetch service details
  useEffect(() => {
    async function fetchService() {
      try {
        const response = await fetch(`/api/services/${serviceId}`);
        if (response.ok) {
          const data = await response.json();
          setService(data);
        }
      } catch {
        // Ignore fetch errors
      }
    }
    fetchService();
  }, [serviceId]);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/services/${serviceId}/checkout`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start checkout");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-zinc-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/services/seller"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Activate Listing</h1>
              <p className="text-zinc-400 text-sm">
                Pay the listing fee to go live
              </p>
            </div>
          </div>
        </div>

        {/* Cancelled Message */}
        {cancelled && (
          <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-400" />
              <p className="text-sm text-amber-200">
                Payment was cancelled. You can try again when you&apos;re ready.
              </p>
            </div>
          </div>
        )}

        {/* Service Summary */}
        {service && (
          <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6 mb-6">
            <h3 className="font-semibold text-white mb-2">{service.title}</h3>
            <p className="text-sm text-zinc-400 line-clamp-2">{service.description}</p>
          </div>
        )}

        {/* Checkout Card */}
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Listing Fee</h2>

            {/* Benefits */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="text-zinc-300">Listed on the public marketplace</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="text-zinc-300">Shown on your profile</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="text-zinc-300">Receive orders from other builders</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-5 w-5 text-amber-400" />
                <span className="text-zinc-300">Active for 90 days</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Price */}
            <div className="flex items-center justify-between py-4 border-t border-zinc-800">
              <span className="text-zinc-400">Listing fee</span>
              <span className="text-2xl font-bold text-white">$5</span>
            </div>

            {/* CTA */}
            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-900 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4" />
                  Pay $5 & Activate
                </>
              )}
            </button>

            <p className="text-xs text-zinc-500 text-center mt-3">
              Secure payment powered by Stripe
            </p>
          </div>
        </div>

        {/* Terms */}
        <p className="text-xs text-zinc-500 text-center mt-6">
          By activating your listing, you agree to our terms of service.
          Listing fees are non-refundable.
        </p>
      </div>
    </div>
  );
}
