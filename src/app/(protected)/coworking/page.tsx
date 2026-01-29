import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Coffee, Plus } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { SessionsList } from "./sessions-list";

export const metadata: Metadata = {
  title: "Coworking Buddies | Builders",
  description: "Find builders to cowork with at cafes and spaces near you",
};

export default async function CoworkingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
              <Coffee className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Coworking Buddies</h1>
              <p className="text-sm text-zinc-400">
                Find builders to work alongside at cafes and spaces
              </p>
            </div>
          </div>

          <Link
            href="/coworking/new"
            className="flex items-center gap-2 rounded-xl bg-emerald-500/20 text-emerald-400 px-4 py-2 text-sm font-medium hover:bg-emerald-500/30 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Host Session
          </Link>
        </div>

        {/* Sessions List */}
        <SessionsList />
      </div>
    </div>
  );
}
