import { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { AccountabilityDashboard } from "./dashboard";
import { RecentCheckInsFeed } from "@/components/accountability/recent-checkins-feed";

export const metadata: Metadata = {
  title: "Accountability Partners | Builders",
  description: "Find accountability partners and stay on track with your building goals.",
};

export const dynamic = "force-dynamic";

export default async function AccountabilityPage() {
  const session = await auth();
  const isAuthenticated = !!session?.user?.id;

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <AccountabilityDashboard userId={session.user.id} />
        {/* Public check-in feed below the dashboard */}
        <div className="max-w-6xl mx-auto px-4 pb-12">
          <div className="mt-8 pt-8 border-t border-white/10">
            <RecentCheckInsFeed />
          </div>
        </div>
      </div>
    );
  }

  // Public view for unauthenticated users
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
              <svg
                className="h-6 w-6 text-green-400"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Accountability Partners</h1>
              <p className="text-zinc-500">Stay on track with your building goals</p>
            </div>
          </div>
          <Link
            href="/sign-in?callbackUrl=/accountability"
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors text-sm font-medium"
          >
            Sign in to join
          </Link>
        </div>

        {/* Public check-in feed */}
        <RecentCheckInsFeed />
      </div>
    </div>
  );
}
