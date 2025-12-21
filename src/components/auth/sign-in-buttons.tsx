"use client";

import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";

interface SignInButtonsProps {
  className?: string;
  callbackUrl?: string;
}

export function SignInButtons({ className, callbackUrl = "/dashboard" }: SignInButtonsProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <button
        onClick={() => signIn("twitter", { callbackUrl })}
        className="group relative flex items-center justify-center gap-3 rounded-xl bg-black px-6 py-4 font-semibold text-white transition-all hover:bg-zinc-900 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/25 border border-zinc-800"
      >
        <XIcon className="h-5 w-5" />
        <span>Continue with X</span>
        <div className="absolute inset-0 rounded-xl ring-2 ring-white/10 ring-inset" />
      </button>
    </div>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
