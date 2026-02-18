"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { UserMenu } from "@/components/auth/user-menu";
import { SearchCommand } from "@/components/ui/search-command";
import { Plus, Rocket, ChevronDown, Sparkles, Menu, X, Building2, Rss, FolderKanban, Globe, Compass, MessageSquare } from "lucide-react";
import { BuildersLogo } from "@/components/ui/builders-logo";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { data: session } = useSession();
  const [shareOpen, setShareOpen] = useState(false);
  const [mobileShareOpen, setMobileShareOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-xl transition-colors duration-300"
      style={{
        background: "var(--navbar-bg)",
        borderBottom: "1px solid var(--navbar-border)"
      }}
    >
      <nav className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side - Menu + Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <div className="relative sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 rounded-lg transition-colors active:scale-95"
              style={{ color: "var(--foreground-muted)" }}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMobileMenuOpen(false)}
                />
                <div
                  className="absolute left-0 top-full z-20 mt-2 w-48 rounded-xl border p-2 shadow-2xl"
                  style={{
                    background: "var(--background-secondary)",
                    borderColor: "var(--card-border)"
                  }}
                >
                  <Link
                    href="/feed"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    <Rss className="h-3.5 w-3.5 text-orange-400" />
                    Feed
                  </Link>
                  <Link
                    href="/projects"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    <FolderKanban className="h-3.5 w-3.5 text-sky-400" />
                    Projects
                  </Link>
                  <Link
                    href="/companies"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    <Building2 className="h-3.5 w-3.5 text-blue-400" />
                    Companies
                  </Link>
                  <Link
                    href="/map"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    <Globe className="h-3.5 w-3.5 text-cyan-400" />
                    Map
                  </Link>
                  <Link
                    href="/discover"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    <Compass className="h-3.5 w-3.5 text-cyan-400" />
                    Discover
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-shadow rounded-lg">
              <BuildersLogo size={32} className="sm:w-9 sm:h-9" />
            </div>
            <span className="hidden sm:inline text-xl font-bold" style={{ color: "var(--foreground)" }}>
              Builders<span className="text-orange-500">.to</span>
            </span>
          </Link>
        </div>

        {/* Desktop Search */}
        <div className="hidden sm:block flex-1 max-w-md mx-4">
          <SearchCommand inline />
        </div>

        {/* Right side items */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
          {/* Desktop Navigation links */}
          <Link
            href="/feed"
            className="hidden lg:flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color: "var(--foreground-muted)" }}
          >
            <Rss className="h-3.5 w-3.5 text-orange-400" />
            Feed
          </Link>
          <Link
            href="/projects"
            className="hidden lg:flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color: "var(--foreground-muted)" }}
          >
            <FolderKanban className="h-3.5 w-3.5 text-sky-400" />
            Projects
          </Link>

          <Link
            href="/map"
            className="hidden lg:flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color: "var(--foreground-muted)" }}
          >
            <Globe className="h-3.5 w-3.5 text-cyan-400" />
            Map
          </Link>

          <Link
            href="/companies"
            className="hidden lg:flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color: "var(--foreground-muted)" }}
          >
            <Building2 className="h-3.5 w-3.5 text-blue-400" />
            Companies
          </Link>

          <Link
            href="/discover"
            className="hidden lg:flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color: "var(--foreground-muted)" }}
          >
            <Compass className="h-3.5 w-3.5 text-cyan-400" />
            Discover
          </Link>
          {/* Mobile Search */}
          <div className="sm:hidden">
            <SearchCommand />
          </div>

          {session ? (
            <>
              {/* Mobile: Add Dropdown */}
              <div className="relative sm:hidden">
                <button
                  onClick={() => setMobileShareOpen(!mobileShareOpen)}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-orange-600 p-2.5 text-white transition-all hover:from-orange-600 hover:to-orange-700 active:scale-95 shadow-md shadow-orange-500/25"
                >
                  <Plus className="h-4 w-4" />
                </button>

                {mobileShareOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMobileShareOpen(false)}
                    />
                    <div
                      className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border p-2 shadow-2xl"
                      style={{
                        background: "var(--background-secondary)",
                        borderColor: "var(--card-border)"
                      }}
                    >
                      <Link
                        href="/projects/new"
                        onClick={() => setMobileShareOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-white/5"
                        style={{ color: "var(--foreground-muted)" }}
                      >
                        <Rocket className="h-4 w-4 text-orange-400" />
                        <span>Post Project</span>
                      </Link>
                      <Link
                        href="/updates/new"
                        onClick={() => setMobileShareOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-white/5"
                        style={{ color: "var(--foreground-muted)" }}
                      >
                        <Sparkles className="h-4 w-4 text-amber-400" />
                        <span>Post Update</span>
                      </Link>
                    </div>
                  </>
                )}
              </div>

              {/* Desktop: Share Dropdown */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setShareOpen(!shareOpen)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-1.5 text-sm font-semibold text-white transition-all hover:from-orange-600 hover:to-orange-700 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-orange-500/25"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Post</span>
                  <ChevronDown className={cn(
                    "h-3.5 w-3.5 transition-transform",
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
                          <div className="font-medium">Post Project</div>
                          <div className="text-xs text-zinc-500">Share what you're building</div>
                        </div>
                      </Link>

                      <Link
                        href="/updates/new"
                        onClick={() => setShareOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                          <Sparkles className="h-4 w-4 text-amber-400" />
                        </div>
                        <div>
                          <div className="font-medium">Post Update</div>
                          <div className="text-xs text-zinc-500">Share what you're working on</div>
                        </div>
                      </Link>

                    </div>
                  </>
                )}
              </div>

              {/* Chat */}
              <Link
                href="/messages"
                className="relative p-2 rounded-lg transition-colors hover:bg-white/5"
                style={{ color: "var(--foreground-muted)" }}
                title="Chat"
              >
                <MessageSquare className="h-5 w-5" />
              </Link>

              <UserMenu />
            </>
          ) : (
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 rounded-lg px-3 sm:px-4 py-2 text-sm font-semibold transition-all"
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
