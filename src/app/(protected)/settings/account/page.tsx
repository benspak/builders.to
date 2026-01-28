import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotificationSettings } from "@/components/pwa";
import { TwoFactorSettings } from "@/components/auth/two-factor";
import { DeleteAccount } from "@/components/settings/delete-account";
import { ProSubscription } from "@/components/settings/pro-subscription";
import { EarningsDashboard } from "@/components/settings/earnings-dashboard";
import { Settings, ArrowLeft, Bell, Crown, DollarSign } from "lucide-react";

export const metadata = {
  title: "Account Settings - Builders.to",
  description: "Manage your account settings, subscription, and security",
};

export default async function AccountSettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      slug: true,
    },
  });

  if (!user) {
    redirect("/signin");
  }

  return (
    <div className="relative min-h-screen bg-zinc-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile Settings
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Account Settings</h1>
            <p className="text-zinc-400">
              Manage your subscription, notifications, and security
            </p>
          </div>
        </div>

        {/* Pro Membership Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Pro Membership</h2>
          </div>
          <ProSubscription />
        </div>

        {/* Creator Rewards Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Creator Rewards</h2>
          </div>
          <EarningsDashboard />
        </div>

        {/* Push Notifications Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-white">Push Notifications</h2>
          </div>
          <NotificationSettings />
        </div>

        {/* Two-Factor Authentication Section */}
        <div className="mb-8">
          <TwoFactorSettings />
        </div>

        {/* Danger Zone Section */}
        <div className="mt-12">
          <DeleteAccount userId={user.id} />
        </div>
      </div>
    </div>
  );
}
