import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/profile/profile-form";
import { Settings, User, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Settings - Builders.to",
  description: "Manage your profile settings",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      slug: true,
      username: true,
      displayName: true,
      firstName: true,
      lastName: true,
      zipCode: true,
      city: true,
      state: true,
      headline: true,
      bio: true,
      websiteUrl: true,
      twitterUrl: true,
      youtubeUrl: true,
      linkedinUrl: true,
      image: true,
      // Status
      status: true,
      statusUpdatedAt: true,
      // Intent flags
      openToWork: true,
      lookingForCofounder: true,
      availableForContract: true,
      // Email preferences
      emailPreferences: {
        select: {
          weeklyDigest: true,
          dailyDigest: true,
          milestoneNotifications: true,
        },
      },
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
          href={user.slug ? `/${user.slug}` : "/dashboard"}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          {user.slug ? "View Profile" : "Back to Dashboard"}
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
            <p className="text-zinc-400">
              Customize your public profile
            </p>
          </div>
        </div>

        {/* Settings Card */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
            <User className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-white">Personal Information</h2>
          </div>

          <ProfileForm user={user} />
        </div>
      </div>
    </div>
  );
}
