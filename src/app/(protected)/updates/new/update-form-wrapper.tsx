"use client";

import { ComposerWithAI } from "@/components/composer/composer-with-ai";
import { useRouter } from "next/navigation";

export function UpdateFormWrapper() {
  const router = useRouter();

  return (
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
  );
}
