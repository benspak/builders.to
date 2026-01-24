import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { SuggestionsPanel } from "@/components/suggestions";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "AI Suggestions | Builders.to",
  description: "Review and approve AI-generated content suggestions",
};

export const dynamic = "force-dynamic";

function SuggestionsLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export default async function SuggestionsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/suggestions");
  }

  // Check if user has Pro subscription
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { proSubscription: true },
  });

  const hasProSubscription = user?.proSubscription?.status === "ACTIVE";

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-purple-500/10 rounded-lg">
          <Sparkles className="w-6 h-6 text-purple-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Suggestions</h1>
          <p className="text-muted-foreground">
            Review and approve AI-generated content
          </p>
        </div>
      </div>

      {hasProSubscription ? (
        <Suspense fallback={<SuggestionsLoading />}>
          <SuggestionsPanel />
        </Suspense>
      ) : (
        <div className="bg-card border rounded-xl p-8 text-center">
          <Sparkles className="w-12 h-12 mx-auto text-purple-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Pro Feature</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            AI-powered suggestions with agentic workflows are available with a Pro subscription.
            Get personalized content ideas that learn from your preferences.
          </p>
          <a
            href="/settings"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Upgrade to Pro
          </a>
        </div>
      )}
    </div>
  );
}
