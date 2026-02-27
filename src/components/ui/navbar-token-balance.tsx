"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Coins } from "lucide-react";

export function NavbarTokenBalance() {
  const { data: session } = useSession();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/tokens/balance")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.balance === "number") setBalance(data.balance);
      })
      .catch(() => {});
  }, [session?.user?.id]);

  if (!session) return null;

  return (
    <Link
      href="/tokens"
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-white/5"
      style={{ color: "var(--foreground-muted)" }}
      title="Token balance"
    >
      <Coins className="h-4 w-4 text-amber-400" />
      <span>{balance !== null ? balance : "—"}</span>
    </Link>
  );
}
