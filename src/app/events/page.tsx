import { Suspense } from "react";
import { Metadata } from "next";
import { CalendarDays, Plus } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { EventsList } from "./events-list";

export const metadata: Metadata = {
  title: "Events | Builders",
  description: "Discover meetups and events for builders in your community",
};

export default async function EventsPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-pink-500/20">
              <CalendarDays className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Events</h1>
              <p className="text-sm text-zinc-400">
                Meetups and gatherings for builders
              </p>
            </div>
          </div>

          {session?.user && (
            <Link
              href="/events/new"
              className="flex items-center gap-2 rounded-xl bg-orange-500/20 text-orange-400 px-4 py-2 text-sm font-medium hover:bg-orange-500/30 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Event
            </Link>
          )}
        </div>

        {/* Events List */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
            </div>
          }
        >
          <EventsList />
        </Suspense>
      </div>
    </div>
  );
}
