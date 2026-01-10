import { Megaphone, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AdForm } from "@/components/ads";

export const metadata = {
  title: "Create Ad - Builders.to",
  description: "Create a new sidebar advertisement",
};

export default function NewAdPage() {
  return (
    <div className="relative min-h-screen bg-zinc-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-teal-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/ads"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Ads
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
            <Megaphone className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Create Ad</h1>
            <p className="text-zinc-400 text-sm">
              Design your sidebar advertisement
            </p>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-emerald-400">Sidebar Ad - 30 Days</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Displayed on the Builder Feed to thousands of daily visitors
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-white">$5</span>
              <span className="text-sm text-zinc-500">/month</span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6">
          <AdForm />
        </div>
      </div>
    </div>
  );
}
