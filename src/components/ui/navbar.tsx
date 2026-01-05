"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserMenu } from "@/components/auth/user-menu";
import { NotificationDropdown } from "@/components/notifications";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Plus, Rocket } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header 
      className="sticky top-0 z-50 backdrop-blur-xl transition-colors duration-300"
      style={{ 
        background: "var(--navbar-bg)", 
        borderBottom: "1px solid var(--navbar-border)" 
      }}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-shadow">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
            Builders<span className="text-orange-500">.to</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
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
          <Link
            href="/companies"
            className="hidden text-sm font-medium transition-colors sm:block"
            style={{ color: "var(--foreground-muted)" }}
          >
            Companies
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />

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
