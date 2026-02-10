import { ProUpgradePrompt } from "@/components/pro";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { isProMember } from "@/lib/stripe-subscription";
import { UpdateFormWrapper } from "./update-form-wrapper";

export default async function NewUpdatePage() {
  const session = await auth();
  
  // Check if user is a Pro member
  const isPro = session?.user?.id ? await isProMember(session.user.id) : false;
  
  // If not Pro, show upgrade prompt
  if (!isPro) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/feed"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to feed
        </Link>

        <ProUpgradePrompt
          feature="updates"
          variant="full-page"
          isAuthenticated={!!session}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/feed"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to feed
      </Link>

      <UpdateFormWrapper />
    </div>
  );
}
