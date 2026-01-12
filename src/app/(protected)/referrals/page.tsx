"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  Coins,
  Copy,
  Check,
  Share2,
  Gift,
  ArrowLeft,
  ExternalLink
} from "lucide-react";
import { REFERRAL_REWARD_TOKENS } from "@/lib/tokens";

interface ReferralData {
  referralCode: string;
  referralLink: string;
  rewardPerReferral: number;
  stats: {
    totalReferrals: number;
    totalEarned: number;
    referrals: Array<{
      id: string;
      name: string | null;
      image: string | null;
      joinedAt: string;
    }>;
  };
}

export default function ReferralsPage() {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const response = await fetch("/api/referral");
        if (response.ok) {
          const data = await response.json();
          setReferralData(data);
        }
      } catch (error) {
        console.error("Failed to fetch referral data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, []);

  const copyToClipboard = async () => {
    if (referralData?.referralLink) {
      await navigator.clipboard.writeText(referralData.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOnTwitter = () => {
    if (referralData?.referralLink) {
      const text = `Join me on Builders.to - where builders share their projects and connect with the community! 🚀`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralData.referralLink)}`;
      window.open(url, "_blank");
    }
  };

  return (
    <div className="py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/tokens"
              className="inline-flex items-center gap-2 text-sm mb-4 transition-colors"
              style={{ color: "var(--foreground-muted)" }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to tokens
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20">
                <Gift className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                  Referral Program
                </h1>
                <p style={{ color: "var(--foreground-muted)" }}>
                  Invite friends and earn {REFERRAL_REWARD_TOKENS} tokens for each signup
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
          ) : referralData ? (
            <div className="space-y-6">
              {/* Referral Link Card */}
              <div
                className="rounded-xl border p-6"
                style={{
                  background: "var(--background-secondary)",
                  borderColor: "var(--card-border)"
                }}
              >
                <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--foreground)" }}>
                  Your Referral Link
                </h2>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div
                    className="flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border"
                    style={{
                      background: "var(--background)",
                      borderColor: "var(--card-border)"
                    }}
                  >
                    <span
                      className="flex-1 text-sm font-mono truncate"
                      style={{ color: "var(--foreground-muted)" }}
                    >
                      {referralData.referralLink}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </button>

                    <button
                      onClick={shareOnTwitter}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all border"
                      style={{
                        borderColor: "var(--card-border)",
                        color: "var(--foreground)"
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </button>
                  </div>
                </div>

                <div
                  className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                  style={{ background: "var(--background)" }}
                >
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
                    Code: {referralData.referralCode}
                  </span>
                  <span style={{ color: "var(--foreground-muted)" }}>
                    Share this code or the link above
                  </span>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  className="rounded-xl border p-6"
                  style={{
                    background: "var(--background-secondary)",
                    borderColor: "var(--card-border)"
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                      <Users className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                        Total Referrals
                      </p>
                      <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                        {referralData.stats.totalReferrals}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-xl border p-6"
                  style={{
                    background: "var(--background-secondary)",
                    borderColor: "var(--card-border)"
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
                      <Coins className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                        Tokens Earned
                      </p>
                      <p className="text-2xl font-bold text-amber-400">
                        {referralData.stats.totalEarned}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Referral List */}
              {referralData.stats.referrals.length > 0 && (
                <div
                  className="rounded-xl border"
                  style={{
                    background: "var(--background-secondary)",
                    borderColor: "var(--card-border)"
                  }}
                >
                  <div className="px-6 py-4 border-b" style={{ borderColor: "var(--card-border)" }}>
                    <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                      Your Referrals
                    </h2>
                  </div>

                  <div className="divide-y" style={{ borderColor: "var(--card-border)" }}>
                    {referralData.stats.referrals.map((referral) => (
                      <div
                        key={referral.id}
                        className="flex items-center gap-4 px-6 py-4"
                      >
                        {referral.image ? (
                          <Image
                            src={referral.image}
                            alt={referral.name || "User"}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div
                            className="h-10 w-10 rounded-full flex items-center justify-center"
                            style={{ background: "var(--background)" }}
                          >
                            <Users className="h-5 w-5" style={{ color: "var(--foreground-muted)" }} />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p
                            className="font-medium truncate"
                            style={{ color: "var(--foreground)" }}
                          >
                            {referral.name || "Anonymous"}
                          </p>
                          <p
                            className="text-sm"
                            style={{ color: "var(--foreground-muted)" }}
                          >
                            Joined {new Date(referral.joinedAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10">
                          <Coins className="h-3.5 w-3.5 text-amber-400" />
                          <span className="text-xs font-semibold text-amber-400">
                            +{REFERRAL_REWARD_TOKENS}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* How it works */}
              <div
                className="rounded-xl border p-6"
                style={{
                  background: "var(--background-secondary)",
                  borderColor: "var(--card-border)"
                }}
              >
                <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--foreground)" }}>
                  How it works
                </h2>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full shrink-0 text-sm font-bold"
                      style={{ background: "var(--background)" }}
                    >
                      1
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: "var(--foreground)" }}>
                        Share your referral link
                      </p>
                      <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                        Send your unique link to friends or share on social media
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full shrink-0 text-sm font-bold"
                      style={{ background: "var(--background)" }}
                    >
                      2
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: "var(--foreground)" }}>
                        They sign up
                      </p>
                      <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                        When someone uses your link to create an account
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full shrink-0 text-sm font-bold"
                      style={{ background: "var(--background)" }}
                    >
                      3
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: "var(--foreground)" }}>
                        You earn tokens
                      </p>
                      <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                        Receive {REFERRAL_REWARD_TOKENS} tokens instantly for each referral ($1 value)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="text-center py-12"
              style={{ color: "var(--foreground-muted)" }}
            >
              Failed to load referral data. Please try again.
            </div>
          )}
        </div>
      </div>
  );
}
