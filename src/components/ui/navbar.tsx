"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { UserMenu } from "@/components/auth/user-menu";
import { NotificationDropdown } from "@/components/notifications";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SearchCommand } from "@/components/ui/search-command";
import { Plus, Rocket, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfile {
  slug: string | null;
}

export function Navbar() {
  const { data: session } = useSession();
  const [shareOpen, setShareOpen] = useState(false);
  const [userSlug, setUserSlug] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserSlug() {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/users/${session.user.id}`);
          if (response.ok) {
            const data: UserProfile = await response.json();
            setUserSlug(data.slug);
          }
        } catch (error) {
          console.error("Failed to fetch user slug:", error);
        }
      }
    }
    fetchUserSlug();
  }, [session?.user?.id]);

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-xl transition-colors duration-300"
      style={{
        background: "var(--navbar-bg)",
        borderBottom: "1px solid var(--navbar-border)"
      }}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-shadow">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
              Builders<span className="text-orange-500">.to</span>
            </span>
          </Link>
          <div className="hidden sm:block">
            <SearchCommand inline />
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Navigation links */}
          <Link
            href="/feed"
            className="hidden text-sm font-medium transition-colors sm:block"
            style={{ color: "var(--foreground-muted)" }}
          >
            Feed
          </Link>
          <Link
            href="/dashboard"
            className="hidden text-sm font-medium transition-colors sm:block"
            style={{ color: "var(--foreground-muted)" }}
          >
            Projects
          </Link>
          {/* Theme Toggle */}
          <ThemeToggle />

          {session ? (
            <>
              {/* Share Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShareOpen(!shareOpen)}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-orange-600 hover:to-orange-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/25"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform",
                    shareOpen && "rotate-180"
                  )} />
                </button>

                {shareOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShareOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-20 mt-2 w-52 rounded-xl border border-white/10 bg-zinc-900/95 p-2 shadow-xl backdrop-blur-xl">
                      <Link
                        href="/projects/new"
                        onClick={() => setShareOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                          <Rocket className="h-4 w-4 text-orange-400" />
                        </div>
                        <div>
                          <div className="font-medium">Share a Project</div>
                          <div className="text-xs text-zinc-500">Add a new project</div>
                        </div>
                      </Link>

                      {userSlug && (
                        <Link
                          href={`/profile/${userSlug}#daily-updates`}
                          onClick={() => setShareOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                            <Sparkles className="h-4 w-4 text-amber-400" />
                          </div>
                          <div>
                            <div className="font-medium">Share an Update</div>
                            <div className="text-xs text-zinc-500">Post a daily update</div>
                          </div>
                        </Link>
                      )}
                    </div>
                  </>
                )}
              </div>
              <NotificationDropdown />
              <UserMenu />
            </>
          ) : (
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all"
              style={{
                background: "var(--background-tertiary)",
                color: "var(--foreground)"
              }}
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
