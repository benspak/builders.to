import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Loader2, Link2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { ConnectedPlatforms } from "@/components/settings/connected-platforms";

export const metadata = {
  title: "Connected Platforms | Builders.to",
  description: "Manage your connected social media platforms for cross-posting",
};

export const dynamic = "force-dynamic";

function PlatformsLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export default async function PlatformsSettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/settings/platforms");
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Link2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Connected Platforms</h1>
          <p className="text-muted-foreground">
            Manage your social media connections
          </p>
        </div>
      </div>

      {/* Back link */}
      <a
        href="/settings"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        ← Back to Settings
      </a>

      <Suspense fallback={<PlatformsLoading />}>
        <ConnectedPlatforms />
      </Suspense>
    </div>
  );
}
