"use client";

import { PollForm } from "@/components/polls";
import { ArrowLeft, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewPollPage() {
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
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 border border-violet-500/30">
              <BarChart3 className="h-5 w-5 text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Create a Poll</h1>
          </div>
          <p className="text-zinc-400 mt-2">
            Ask the community a question and let them vote. Polls run for 7 days.
          </p>
        </div>

        <PollForm onSuccess={() => router.push("/feed")} />
      </div>
    </div>
  );
}
