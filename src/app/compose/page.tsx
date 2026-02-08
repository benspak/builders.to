import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Loader2, Pen } from "lucide-react";
import { auth } from "@/lib/auth";
import { ComposerWithAI } from "./composer-with-ai";

export const metadata = {
  title: "Compose Post | Builders.to",
  description: "Create and schedule posts across Twitter, LinkedIn, and Builders.to",
};

export const dynamic = "force-dynamic";

function ComposerLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export default async function ComposePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/compose");
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Pen className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Compose Post</h1>
          <p className="text-muted-foreground">
            Create content for multiple platforms at once
          </p>
        </div>
      </div>

      <Suspense fallback={<ComposerLoading />}>
        <ComposerWithAI />
      </Suspense>

      {/* Tips */}
      <div className="mt-8 p-4 bg-muted rounded-lg max-w-xl">
        <h3 className="font-medium mb-2">Tips</h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• Cross-posting supports up to 3000 characters on external platforms</li>
          <li>• Use <strong>@mentions</strong> to tag other builders</li>
          <li>• Add images, GIFs, or polls to your Builders.to updates</li>
          <li>• <strong>Markdown</strong> is supported: **bold**, *italic*, `code`, and more</li>
          <li>• Press <kbd>⌘</kbd>+<kbd>Enter</kbd> to post quickly</li>
        </ul>
      </div>
    </div>
  );
}
