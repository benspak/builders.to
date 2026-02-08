"use client";

import { ComposerWithAI } from "@/components/composer/composer-with-ai";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewUpdatePage() {
  const router = useRouter();

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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Post an Update</h1>
          <p className="text-zinc-400 mt-2">
            Share what you&apos;re working on with the community.
          </p>
        </div>

        <ComposerWithAI
          compact
          onSuccess={() => router.push("/feed")}
        />
      </div>
    </div>
  );
}
