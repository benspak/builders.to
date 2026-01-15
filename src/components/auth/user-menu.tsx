"use client";

import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogOut, User, ChevronDown, Settings, Megaphone, Bell, Building2, MapPin, Coins, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ui/theme-provider";

interface UserProfile {
  slug: string | null;
  email: string | null;
}

export function UserMenu() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [userSlug, setUserSlug] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);

  useEffect(() => {
    async function fetchUserProfile() {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/users/${session.user.id}`);
          if (response.ok) {
            const data: UserProfile = await response.json();
            setUserSlug(data.slug);
            setUserEmail(data.email);
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
      }
    }
    fetchUserProfile();
  }, [session?.user?.id]);

  useEffect(() => {
    async function fetchUnreadCount() {
      if (session?.user?.id) {
        try {
          const response = await fetch("/api/notifications?limit=1");
          if (response.ok) {
            const data = await response.json();
            setUnreadCount(data.unreadCount);
          }
        } catch (error) {
          console.error("Failed to fetch unread count:", error);
        }
      }
    }
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  useEffect(() => {
    async function fetchTokenBalance() {
      if (session?.user?.id) {
        try {
          const response = await fetch("/api/tokens");
          if (response.ok) {
            const data = await response.json();
            setTokenBalance(data.balance);
          }
        } catch (error) {
          console.error("Failed to fetch token balance:", error);
        }
      }
    }
    fetchTokenBalance();
  }, [session?.user?.id]);

  if (!session?.user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full p-1 sm:p-1.5 sm:pr-3 transition-colors hover:bg-white/5 active:scale-95"
        style={{ background: "var(--background-tertiary)" }}
      >
        <div className="relative">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || "User"}
              width={32}
              height={32}
              className="rounded-full ring-2 ring-white/10"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500">
              <User className="h-4 w-4 text-white" />
            </div>
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white ring-2 ring-zinc-900 sm:hidden">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
        <span className="hidden text-sm font-medium text-zinc-200 sm:block">
          {session.user.name}
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 text-zinc-400 transition-transform mr-1 sm:mr-0",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border p-2 shadow-2xl"
            style={{
              background: "var(--background-secondary)",
              borderColor: "var(--card-border)"
            }}
          >
            <div className="border-b px-3 py-2 mb-2" style={{ borderColor: "var(--card-border)" }}>
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{session.user.name}</p>
              <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>{userEmail || session.user.email}</p>
            </div>

            {/* Token Balance */}
            <div className="border-b pb-2 mb-2" style={{ borderColor: "var(--card-border)" }}>
              <Link
                href="/tokens"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-amber-500/20">
                    <Coins className="h-3 w-3 text-amber-400" />
                  </div>
                  <span className="text-amber-400 font-medium">Tokens</span>
                </div>
                <span className="font-semibold text-amber-400">
                  {tokenBalance !== null ? tokenBalance : "..."}
                </span>
              </Link>

              {/* Notifications */}
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ color: "var(--foreground-muted)" }}
              >
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </div>
                {unreadCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              {/* Theme Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTheme();
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ color: "var(--foreground-muted)" }}
              >
                <div className="flex items-center gap-2">
                  {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  {theme === "dark" ? "Dark Mode" : "Light Mode"}
                </div>
                <div
                  className="relative h-5 w-9 rounded-full transition-colors"
                  style={{ background: theme === "dark" ? "var(--accent)" : "var(--background-tertiary)" }}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                      theme === "dark" ? "translate-x-4" : "translate-x-0.5"
                    )}
                  />
                </div>
              </button>
            </div>

            {userSlug && (
              <Link
                href={`/${userSlug}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ color: "var(--foreground-muted)" }}
              >
                <User className="h-4 w-4" />
                My Profile
              </Link>
            )}

            <Link
              href="/my-companies"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: "var(--foreground-muted)" }}
            >
              <Building2 className="h-4 w-4" />
              My Company
            </Link>

            <Link
              href="/my-listings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: "var(--foreground-muted)" }}
            >
              <MapPin className="h-4 w-4" />
              My Listings
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: "var(--foreground-muted)" }}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>

            <Link
              href="/ads"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: "var(--foreground-muted)" }}
            >
              <Megaphone className="h-4 w-4" />
              My Ads
            </Link>

            <div className="border-t mt-2 pt-2" style={{ borderColor: "var(--card-border)" }}>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ color: "var(--foreground-muted)" }}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
