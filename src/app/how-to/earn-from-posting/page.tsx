import Link from "next/link";
import type { Metadata } from "next";
import {
  DollarSign,
  BadgeCheck,
  ArrowRight,
  Settings,
  CheckCircle2,
  Wallet,
  TrendingUp,
  Crown,
  Shield,
  Clock,
  AlertCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Earn From Posting - How To - Builders.to",
  description: "Learn how Pro members can earn real money for posting quality content on Builders.to. Understand the reward structure, eligibility, and payout system.",
};

export default function EarnFromPostingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm">
          <Link
            href="/articles"
            className="text-orange-500 hover:text-orange-400 transition-colors"
          >
            Articles
          </Link>
          <span className="text-zinc-600">/</span>
          <Link
            href="/how-to"
            className="text-orange-500 hover:text-orange-400 transition-colors"
          >
            How To
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400">Earn From Posting</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg shadow-emerald-500/25">
              <DollarSign className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Earn From Posting</h1>
              <p className="text-zinc-400 mt-1">3 min read</p>
            </div>
          </div>
        </div>

        {/* Highlight Box */}
        <div className="mb-12 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">Creator Rewards Program</h2>
              <p className="text-zinc-300">
                Pro members can earn <strong className="text-white">$0.05-$0.07</strong> per qualifying post.
                Post daily, build your streak, and get paid automatically when you hit $5.
              </p>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="mb-12 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">
            In this guide
          </h2>
          <nav className="space-y-2">
            {[
              { href: "#overview", label: "How Creator Rewards Work" },
              { href: "#eligibility", label: "Eligibility Requirements" },
              { href: "#rewards", label: "Reward Structure" },
              { href: "#payouts", label: "Getting Paid" },
              { href: "#setup", label: "How to Set Up" },
              { href: "#faq", label: "Frequently Asked Questions" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 transition-colors"
              >
                <ArrowRight className="h-3 w-3" />
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-zinc max-w-none">
          <div className="space-y-12 text-zinc-300">

            {/* Overview */}
            <section id="overview">
              <h2 className="text-2xl font-semibold text-white mb-4">How Creator Rewards Work</h2>
              <p className="leading-relaxed">
                <span className="text-emerald-400 font-semibold">Creator Rewards</span> is a program that pays
                Pro members for creating quality content on Builders.to. When you post updates to the feed,
                you earn real money that gets deposited directly to your bank account.
              </p>
              <p className="leading-relaxed mt-4">
                The system is designed to reward consistent, quality contributions to the community. Each
                qualifying post earns a base reward, with additional bonuses based on engagement (likes)
                your post receives.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-400">$0.05</p>
                  <p className="text-sm text-zinc-500">Base reward</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
                  <p className="text-2xl font-bold text-cyan-400">+$0.02</p>
                  <p className="text-sm text-zinc-500">Max bonus</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
                  <p className="text-2xl font-bold text-white">$0.07</p>
                  <p className="text-sm text-zinc-500">Max per post</p>
                </div>
              </div>
            </section>

            {/* Eligibility */}
            <section id="eligibility">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                  <Shield className="h-5 w-5 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Eligibility Requirements</h2>
              </div>

              <p className="leading-relaxed mb-6">
                To earn rewards from posting, you must meet the following requirements:
              </p>

              <div className="space-y-4">
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <Crown className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Active Pro Membership</p>
                      <p className="text-sm text-zinc-400 mt-1">
                        You must have an active Builders Pro subscription ($3.99/month or $39.99/year).
                        <Link href="/how-to/become-a-pro-member" className="text-amber-400 hover:text-amber-300 ml-1">
                          Learn how to become Pro →
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <Wallet className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Stripe Connect Account</p>
                      <p className="text-sm text-zinc-400 mt-1">
                        Set up Stripe Connect to receive payouts. This takes about 5 minutes and requires
                        basic identity verification.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Post Requirements</p>
                      <ul className="text-sm text-zinc-400 mt-2 space-y-1">
                        <li>• Minimum 100 characters</li>
                        <li>• Must be published to Builders.to feed</li>
                        <li>• Cannot be a duplicate of any previous post</li>
                        <li>• Maximum 1 rewarded post per day</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Reward Structure */}
            <section id="rewards">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Reward Structure</h2>
              </div>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">Base Reward</h3>
              <p className="text-zinc-400">
                Every qualifying post earns a base reward of <strong className="text-white">$0.05</strong> (5 cents).
                This is credited immediately when your post is published.
              </p>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">Engagement Bonus</h3>
              <p className="text-zinc-400 mb-4">
                Earn additional rewards based on how many likes your post receives. The bonus increases
                gradually as your post gets more engagement:
              </p>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-zinc-300">Likes</th>
                      <th className="px-4 py-3 text-left font-medium text-zinc-300">Bonus</th>
                      <th className="px-4 py-3 text-left font-medium text-zinc-300">Total Earnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    <tr>
                      <td className="px-4 py-3 text-zinc-400">0-4 likes</td>
                      <td className="px-4 py-3 text-zinc-400">$0.00</td>
                      <td className="px-4 py-3 text-white font-medium">$0.05</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-zinc-400">5-9 likes</td>
                      <td className="px-4 py-3 text-emerald-400">+$0.005</td>
                      <td className="px-4 py-3 text-white font-medium">$0.055</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-zinc-400">10-14 likes</td>
                      <td className="px-4 py-3 text-emerald-400">+$0.01</td>
                      <td className="px-4 py-3 text-white font-medium">$0.06</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-zinc-400">15-19 likes</td>
                      <td className="px-4 py-3 text-emerald-400">+$0.015</td>
                      <td className="px-4 py-3 text-white font-medium">$0.065</td>
                    </tr>
                    <tr className="bg-emerald-500/5">
                      <td className="px-4 py-3 text-zinc-400">20+ likes</td>
                      <td className="px-4 py-3 text-emerald-400">+$0.02 (max)</td>
                      <td className="px-4 py-3 text-white font-medium">$0.07</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">Monthly Earning Potential</h3>
              <p className="text-zinc-400 mb-4">
                Here&apos;s what you can earn with consistent posting:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <p className="text-sm text-zinc-500 mb-1">Casual (12 posts/month)</p>
                  <p className="text-xl font-bold text-white">$0.60 - $0.84</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <p className="text-sm text-zinc-500 mb-1">Regular (20 posts/month)</p>
                  <p className="text-xl font-bold text-white">$1.00 - $1.40</p>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <p className="text-sm text-emerald-400 mb-1">Daily (30 posts/month)</p>
                  <p className="text-xl font-bold text-white">$1.50 - $2.10</p>
                </div>
              </div>
            </section>

            {/* Payouts */}
            <section id="payouts">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                  <Wallet className="h-5 w-5 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Getting Paid</h2>
              </div>

              <p className="leading-relaxed mb-6">
                Payouts are processed automatically through Stripe when your balance reaches the minimum threshold.
              </p>

              <div className="space-y-4">
                <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Minimum Payout: $5.00</p>
                      <p className="text-sm text-zinc-400 mt-1">
                        When your pending balance reaches $5, a payout is automatically initiated.
                        This typically happens within 70-100 days of consistent daily posting.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Payout Timing</p>
                      <p className="text-sm text-zinc-400 mt-1">
                        Once a payout is initiated, funds typically arrive in your bank account within
                        2-7 business days, depending on your country and bank.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                  <div className="flex items-start gap-3">
                    <BadgeCheck className="h-5 w-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Track Your Earnings</p>
                      <p className="text-sm text-zinc-400 mt-1">
                        View your pending balance, lifetime earnings, and payout history anytime in
                        <Link href="/settings" className="text-emerald-400 hover:text-emerald-300 ml-1">
                          Settings → Creator Rewards
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Setup */}
            <section id="setup">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                  <Settings className="h-5 w-5 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">How to Set Up</h2>
              </div>

              <p className="leading-relaxed mb-6">
                Follow these steps to start earning from your posts:
              </p>

              <ol className="space-y-4">
                <li className="flex items-start gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-400 shrink-0">1</span>
                  <div>
                    <p className="font-medium text-white">Get Builders Pro</p>
                    <p className="text-zinc-400 text-sm mt-1">
                      If you&apos;re not already a Pro member, subscribe to unlock Creator Rewards.
                      Go to <Link href="/settings" className="text-emerald-400">Settings</Link> and
                      choose Monthly ($3.99) or Yearly ($39.99).
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-400 shrink-0">2</span>
                  <div>
                    <p className="font-medium text-white">Set Up Stripe Connect</p>
                    <p className="text-zinc-400 text-sm mt-1">
                      In your Settings page, find the &quot;Creator Rewards&quot; section and click
                      &quot;Set Up Payouts&quot;. Complete the Stripe Connect onboarding (takes ~5 minutes).
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-400 shrink-0">3</span>
                  <div>
                    <p className="font-medium text-white">Start Posting</p>
                    <p className="text-zinc-400 text-sm mt-1">
                      Post quality updates to the Builders.to feed. Remember: 100+ characters,
                      unique content, and you can earn on 1 post per day.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-400 shrink-0">4</span>
                  <div>
                    <p className="font-medium text-white">Watch Your Balance Grow</p>
                    <p className="text-zinc-400 text-sm mt-1">
                      Track your earnings in real-time from the Settings page. When you hit $5,
                      your payout is processed automatically!
                    </p>
                  </div>
                </li>
              </ol>
            </section>

            {/* FAQ */}
            <section id="faq">
              <h2 className="text-2xl font-semibold text-white mb-6">Frequently Asked Questions</h2>

              <div className="space-y-6">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h3 className="font-medium text-white">What counts as a &quot;qualifying post&quot;?</h3>
                  <p className="text-zinc-400 text-sm mt-2">
                    A qualifying post must be at least 100 characters long, published to the Builders.to feed
                    (not just cross-posted to other platforms), and cannot be a duplicate of any previous post
                    you&apos;ve made.
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h3 className="font-medium text-white">Can I post multiple times a day?</h3>
                  <p className="text-zinc-400 text-sm mt-2">
                    Yes, you can post as much as you want! However, only 1 post per day is eligible for
                    rewards. This encourages quality over quantity.
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h3 className="font-medium text-white">What happens if I cancel my Pro subscription?</h3>
                  <p className="text-zinc-400 text-sm mt-2">
                    If you cancel Pro, you&apos;ll stop earning new rewards. However, any pending balance
                    you&apos;ve accumulated will still be paid out once it reaches the $5 threshold.
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h3 className="font-medium text-white">When do engagement bonuses update?</h3>
                  <p className="text-zinc-400 text-sm mt-2">
                    Engagement bonuses update in real-time as your post receives likes. You&apos;ll see
                    your earnings increase automatically in your dashboard.
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h3 className="font-medium text-white">Which countries are supported?</h3>
                  <p className="text-zinc-400 text-sm mt-2">
                    Stripe Connect supports payouts to bank accounts in most countries. Check
                    Stripe&apos;s supported countries list during the onboarding process.
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h3 className="font-medium text-white">Do I need to report this income?</h3>
                  <p className="text-zinc-400 text-sm mt-2">
                    Creator rewards are considered taxable income in most jurisdictions. Please consult
                    with a tax professional for guidance specific to your situation. If you earn over $600
                    in a calendar year (US), you may receive a 1099 form.
                  </p>
                </div>
              </div>
            </section>

            {/* CTA */}
            <div className="mt-12 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 p-8 text-center">
              <DollarSign className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Ready to start earning?</h3>
              <p className="text-zinc-400 mb-6">
                Set up Creator Rewards and get paid for your contributions.
              </p>
              <Link
                href="/settings"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:from-emerald-400 hover:to-cyan-400"
              >
                Set Up Creator Rewards
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-16 pt-8 border-t border-zinc-800 flex items-center justify-between">
          <Link
            href="/how-to"
            className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors"
          >
            ← Back to How To
          </Link>
          <Link
            href="/how-to/become-a-pro-member"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-400 transition-colors"
          >
            Become a Pro Member →
          </Link>
        </div>
      </div>
    </div>
  );
}
