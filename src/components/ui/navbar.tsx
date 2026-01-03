"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserMenu } from "@/components/auth/user-menu";
import { NotificationDropdown } from "@/components/notifications";
import { Plus, Rocket } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-shadow">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">
            Builders<span className="text-orange-500">.to</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {/* Navigation links */}
          <Link
            href="/feed"
            className="hidden text-sm font-medium text-zinc-400 hover:text-white transition-colors sm:block"
          >
            Feed
          </Link>
          <Link
            href="/dashboard"
            className="hidden text-sm font-medium text-zinc-400 hover:text-white transition-colors sm:block"
          >
            Projects
          </Link>
          <Link
            href="/companies"
            className="hidden text-sm font-medium text-zinc-400 hover:text-white transition-colors sm:block"
          >
            Companies
          </Link>

          {session ? (
            <>
              <Link
                href="/projects/new"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-orange-600 hover:to-orange-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/25"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Share Project</span>
              </Link>
              <NotificationDropdown />
              <UserMenu />
            </>
          ) : (
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/20"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
