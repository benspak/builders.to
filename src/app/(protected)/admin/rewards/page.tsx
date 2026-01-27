import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminRewardsDashboard } from "@/components/admin/rewards-dashboard";

// Admin email whitelist
const ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL,
].filter(Boolean);

export const metadata = {
  title: "Rewards Admin - Builders.to",
  description: "Manage creator rewards system",
};

export default async function AdminRewardsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/signin");
  }

  if (!ADMIN_EMAILS.includes(session.user.email)) {
    redirect("/");
  }

  return (
    <div className="relative min-h-screen bg-zinc-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <AdminRewardsDashboard />
      </div>
    </div>
  );
}
