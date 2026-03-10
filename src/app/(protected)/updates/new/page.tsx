import { ArrowLeft, Crown, UserCircle } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { isProMember } from "@/lib/stripe-subscription";
import { prisma } from "@/lib/prisma";
import { UpdateFormWrapper } from "./update-form-wrapper";

export default async function NewUpdatePage() {
  const session = await auth();

  // Check if user has completed their profile (username and image required)
  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { username: true, image: true },
      })
    : null;

  const hasUsername = !!user?.username;
  const hasImage = !!user?.image;
  const profileComplete = hasUsername && hasImage;

  // Show profile completion prompt if profile is incomplete
  if (!profileComplete) {
    const missingItems = [];
    if (!hasUsername) missingItems.push("username");
    if (!hasImage) missingItems.push("profile image");

    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/feed"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to feed
        </Link>

        <div className="card p-8">
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-6">
              <UserCircle className="h-8 w-8 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">
              Complete Your Profile First
            </h1>
            <p className="text-zinc-400 mb-6 max-w-md mx-auto">
              Before posting, please complete your profile by adding a{" "}
              <span className="text-white font-medium">{missingItems.join(" and ")}</span>.
              This helps the community know who&apos;s behind the post.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/settings"
                className="btn-primary"
              >
                Complete Profile
              </Link>
              <Link
                href="/feed"
                className="btn-secondary"
              >
                Back to Feed
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check membership tier and daily usage
  const isPro = session?.user?.id ? await isProMember(session.user.id) : false;
  const dailyPostLimit = isPro ? 20 : 3;

  // Count today's posts
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todayPostCount = session?.user?.id
    ? await prisma.dailyUpdate.count({
        where: {
          userId: session.user.id,
          createdAt: { gte: startOfDay },
        },
      })
    : 0;

  const postsRemaining = Math.max(0, dailyPostLimit - todayPostCount);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/feed"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to feed
      </Link>

      {/* Daily post limit indicator */}
      <div className="mb-4 flex items-center justify-between rounded-xl border border-white/10 bg-zinc-900/50 px-4 py-3">
        <div className="text-sm text-zinc-400">
          <span className="text-white font-medium">{postsRemaining}</span> of{" "}
          <span className="text-white font-medium">{dailyPostLimit}</span>{" "}
          posts remaining today
        </div>
        {!isPro && (
          <Link
            href="/settings/account"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
          >
            <Crown className="h-3.5 w-3.5" />
            Upgrade for 20/day
          </Link>
        )}
      </div>

      <UpdateFormWrapper />
    </div>
  );
}
