"use client";

import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogOut, User, ChevronDown, Settings, Rocket, Megaphone, Building2, Store, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfile {
  slug: string | null;
}

export function UserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [userSlug, setUserSlug] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

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
              <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>{session.user.email}</p>
            </div>

            <div className="sm:hidden border-b pb-2 mb-2" style={{ borderColor: "var(--card-border)" }}>
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
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: "var(--foreground-muted)" }}
            >
              <Rocket className="h-4 w-4" />
              Projects
            </Link>

            <Link
              href="/companies"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: "var(--foreground-muted)" }}
            >
              <Building2 className="h-4 w-4" />
              Companies
            </Link>

            <Link
              href="/services"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: "var(--foreground-muted)" }}
            >
              <Store className="h-4 w-4" />
              Services
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
