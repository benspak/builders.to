import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBalance } from "@/lib/services/tokens.service";
import { TokensClient } from "./tokens-client";
import { ArrowLeft, Coins, Copy, Megaphone, Gift, Link2 } from "lucide-react";

export const metadata = {
  title: "Tokens - Builders.to",
  description: "Your token balance, referral link, and ways to earn and spend",
};

interface TokensPageProps {
  searchParams: Promise<{ ref?: string }>;
}

export default async function TokensPage({ searchParams }: TokensPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const { ref: refCode } = await searchParams;

  const [balance, user] = await Promise.all([
    getBalance(session.user.id),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referralCode: true },
    }),
  ]);

  const baseUrl = process.env.NEXTAUTH_URL || "https://builders.to";
  const referralLink = user?.referralCode
    ? `${baseUrl}/signin?ref=${user.referralCode}`
    : null;

  return (
    <div className="relative min-h-screen bg-zinc-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30">
            <Coins className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Tokens</h1>
            <p className="text-zinc-400">
              Earn by posting, referrals, streaks, and Pro. Spend on ads, services, or gifts.
            </p>
          </div>
        </div>

        {/* Balance */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 mb-6">
          <p className="text-sm text-zinc-400 mb-1">Your balance</p>
          <p className="text-3xl font-bold text-white">{balance} tokens</p>
          <p className="text-xs text-zinc-500 mt-2">10 tokens = $1</p>
        </div>

        {/* Referral */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Link2 className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Referral link</h2>
          </div>
          <p className="text-sm text-zinc-400 mb-3">
            Share your link. When someone signs up with it, you both get tokens.
          </p>
          <TokensClient
            code={user?.referralCode ?? undefined}
            link={referralLink ?? undefined}
            initialApplyCode={refCode ?? null}
          />
        </div>

        {/* Earn & Spend */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5">
            <h3 className="font-semibold text-white mb-2">Earn tokens</h3>
            <ul className="text-sm text-zinc-400 space-y-1">
              <li>• Post updates & engage (karma)</li>
              <li>• Refer friends (see above)</li>
              <li>• Streak milestones (7/30/100 days)</li>
              <li>• Pro membership (monthly grant)</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5">
            <h3 className="font-semibold text-white mb-2">Spend tokens</h3>
            <ul className="text-sm text-zinc-400 space-y-2">
              <li>
                <Link href="/ads" className="inline-flex items-center gap-1.5 text-amber-400 hover:underline">
                  <Megaphone className="h-4 w-4" />
                  Sidebar ads
                </Link>
              </li>
              <li>
                <Link href="/services" className="inline-flex items-center gap-1.5 text-amber-400 hover:underline">
                  Services
                </Link>
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 text-zinc-400">
                  <Gift className="h-4 w-4" />
                  Gift to another builder (from their profile)
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
