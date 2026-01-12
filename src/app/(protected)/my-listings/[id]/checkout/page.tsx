"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, ArrowLeft, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { TokenCheckout } from "@/components/ui/token-checkout";
import { LOCAL_LISTING_REDEMPTION_COST } from "@/lib/tokens";
import { LOCAL_LISTING_FEE_CENTS } from "@/lib/stripe";

export default function LocalListingCheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [listing, setListing] = useState<{
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const cancelled = searchParams.get("cancelled") === "true";
  const listingId = params.id as string;

  // Fetch listing details
  useEffect(() => {
    async function fetchListing() {
      try {
        const response = await fetch(`/api/local-listings/${listingId}`);
        if (response.ok) {
          const data = await response.json();
          setListing(data);
        }
      } catch {
        // Ignore fetch errors
      } finally {
        setLoading(false);
      }
    }
    fetchListing();
  }, [listingId]);

  const handleSuccess = () => {
    // Redirect to my listings after successful activation
    router.push("/my-listings?activated=true");
  };

  return (
    <div className="relative min-h-screen bg-zinc-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-teal-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/my-listings"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Listings
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
              <MapPin className="h-6 w-6 text-white" />
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

        {/* Listing Summary */}
        {listing && (
          <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6 mb-6">
            <h3 className="font-semibold text-white mb-2">{listing.title}</h3>
            <p className="text-sm text-zinc-400 line-clamp-2">{listing.description}</p>
            <span className="inline-flex items-center gap-1 mt-3 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
              <MapPin className="h-3 w-3" />
              Services Listing
            </span>
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
                <span className="text-zinc-300">Listed in your local area</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="text-zinc-300">Visible to local builders</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="text-zinc-300">Contact info displayed to interested users</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-5 w-5 text-amber-400" />
                <span className="text-zinc-300">Active for 90 days</span>
              </div>
            </div>

            {/* Payment Options */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
              </div>
            ) : (
              <TokenCheckout
                itemId={listingId}
                itemType="local-listing"
                itemTitle={listing?.title || "Local Listing"}
                priceCents={LOCAL_LISTING_FEE_CENTS}
                tokenCost={LOCAL_LISTING_REDEMPTION_COST}
                onSuccess={handleSuccess}
              />
            )}
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
