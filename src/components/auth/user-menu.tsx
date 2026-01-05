"use client";

import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogOut, User, ChevronDown, Settings, Rocket, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfile {
  slug: string | null;
}

export function UserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
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

  if (!session?.user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-white/5"
      >
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
        <span className="hidden text-sm font-medium text-zinc-200 sm:block">
          {session.user.name}
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 text-zinc-400 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-white/10 bg-zinc-900/95 p-2 shadow-xl backdrop-blur-xl">
            <div className="border-b border-white/10 px-3 py-2 mb-2">
              <p className="text-sm font-medium text-white">{session.user.name}</p>
              <p className="text-xs text-zinc-400">{session.user.email}</p>
            </div>

            {userSlug && (
              <Link
                href={`/profile/${userSlug}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                <User className="h-4 w-4" />
                My Profile
              </Link>
            )}

            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Rocket className="h-4 w-4" />
              Projects
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>

            <Link
              href="/ads"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Megaphone className="h-4 w-4" />
              My Ads
            </Link>

            <div className="border-t border-white/10 mt-2 pt-2">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
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
