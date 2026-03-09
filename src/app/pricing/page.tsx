import type { Metadata } from "next";
import Link from "next/link";
import { Crown, Zap, Flame, Gem, Check, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing — Founders Edition | Builders.to",
  description: "Build in public. Free, Pro, Premium, and Founder's Circle tiers. Start at $0 or upgrade for more posts, ad credits, and accountability.",
};

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Build in public. Start earning from day one.",
    icon: Crown,
    features: [
      "Post up to 3x per day to the feed",
      "Earn karma for community engagement",
      "Earn advertising credits for posting",
      "Access to public founder community content",
    ],
    cta: "Get started",
    href: "/",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$3.99",
    period: "/month",
    description: "Stay consistent and get your work seen.",
    icon: Zap,
    features: [
      "Post up to 20x per day to the feed",
      "50 monthly ad credits ($5 value)",
      "Access to the private Pro Slack",
      "Weekly sprint check-ins via Slack",
      "Everything in Free",
    ],
    cta: "Subscribe to Pro",
    href: "/settings/account",
    highlighted: true,
  },
  {
    name: "Premium",
    price: "$19.99",
    period: "/month",
    description: "Accountability infrastructure for founders who ship.",
    icon: Flame,
    features: [
      "Daily accountability check-ins via chat",
      "Weekly Sit Rep meetings over Zoom",
      "100 monthly ad credits ($10 value)",
      "Priority feed visibility",
      "Everything in Pro",
    ],
    cta: "Subscribe to Premium",
    href: "/settings/account",
    highlighted: false,
  },
  {
    name: "Founder's Circle",
    price: "$49.99",
    period: "/month",
    description: "Direct coaching access and a seat at the inner table.",
    icon: Gem,
    features: [
      "Monthly 1-on-1 coaching call (30 min)",
      "Unlimited daily posts to the feed",
      "250 monthly ad credits ($25 value)",
      "Private Founder's Circle channel",
      "Featured member spotlight",
      "Early access to platform features",
      "Everything in Premium",
    ],
    cta: "Subscribe to Founder's Circle",
    href: "/settings/account",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Founders Edition
          </h1>
          <p className="mt-3 text-lg text-zinc-400 max-w-2xl mx-auto">
            Build in public, earn karma, and level up with the tier that fits your pace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.name}
                className={`rounded-2xl border overflow-hidden flex flex-col ${
                  tier.highlighted
                    ? "border-amber-500/50 bg-gradient-to-b from-amber-500/10 to-transparent"
                    : "border-white/10 bg-zinc-900/50"
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        tier.highlighted ? "bg-amber-500/20" : "bg-zinc-800"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          tier.highlighted ? "text-amber-400" : "text-zinc-400"
                        }`}
                      />
                    </div>
                    <h2 className="text-xl font-bold text-white">{tier.name}</h2>
                  </div>
                  <p className="text-zinc-400 text-sm mb-4">{tier.description}</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-bold text-white">{tier.price}</span>
                    <span className="text-zinc-500">{tier.period}</span>
                  </div>
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-zinc-300"
                      >
                        <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto p-6 pt-0">
                  <Link
                    href={tier.href}
                    className={`inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-medium transition-colors ${
                      tier.highlighted
                        ? "bg-amber-500 text-zinc-900 hover:bg-amber-400"
                        : "bg-zinc-800 text-white hover:bg-zinc-700 border border-white/10"
                    }`}
                  >
                    {tier.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-zinc-500">
            Already have an account?{" "}
            <Link href="/settings/account" className="text-amber-400 hover:text-amber-300">
              Manage subscription in settings
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
