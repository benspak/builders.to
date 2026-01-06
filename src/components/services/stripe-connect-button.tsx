"use client";

import { useState } from "react";
import { CreditCard, Loader2, ExternalLink } from "lucide-react";

export function StripeConnectButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe-connect/onboard", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start onboarding");
      }

      if (data.alreadyOnboarded) {
        // Refresh the page to show the updated state
        window.location.reload();
        return;
      }

      if (data.url) {
        // Redirect to Stripe Connect onboarding
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/20 shrink-0">
          <CreditCard className="h-5 w-5 text-violet-400" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-white">Connect Your Stripe Account</h4>
          <p className="text-sm text-zinc-400 mt-1 mb-4">
            To receive payments for your services, you need to connect a Stripe account.
            This is a secure process powered by Stripe Express.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                Connect with Stripe
                <ExternalLink className="h-3 w-3 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
