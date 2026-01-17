import Link from "next/link";
import type { Metadata } from "next";
import {
  Crown,
  BadgeCheck,
  Coins,
  Globe,
  ArrowRight,
  CreditCard,
  Settings,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Link as LinkIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Become a Pro Member - How To - Builders.to",
  description: "Learn about Builders Pro membership benefits, pricing, and how to subscribe to unlock premium features.",
};

export default function BecomeAProMemberPage() {
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
          <span className="text-zinc-400">Become a Pro Member</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
              <Crown className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Become a Pro Member</h1>
              <p className="text-zinc-400 mt-1">3 min read</p>
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
              { href: "#what-is-pro", label: "What is Builders Pro?" },
              { href: "#benefits", label: "Pro Membership Benefits" },
              { href: "#pricing", label: "Pricing Plans" },
              { href: "#how-to-subscribe", label: "How to Subscribe" },
              { href: "#custom-domains", label: "Setting Up Custom Domains" },
              { href: "#managing-subscription", label: "Managing Your Subscription" },
              { href: "#faq", label: "Frequently Asked Questions" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-orange-400 transition-colors"
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

            {/* What is Builders Pro? */}
            <section id="what-is-pro">
              <h2 className="text-2xl font-semibold text-white mb-4">What is Builders Pro?</h2>
              <p className="leading-relaxed">
                <span className="text-amber-400 font-semibold">Builders Pro</span> is a premium membership
                tier that unlocks exclusive features and benefits on Builders.to. Pro members get a verified
                badge, monthly token grants, and the ability to use custom domains for their profiles.
              </p>
              <p className="leading-relaxed mt-4">
                By becoming a Pro member, you support the continued development of Builders.to while
                gaining access to powerful features that help you stand out in the community and promote
                your work more effectively.
              </p>
            </section>

            {/* Pro Membership Benefits */}
            <section id="benefits">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Pro Membership Benefits</h2>
              </div>

              <div className="space-y-6 mt-6">
                {/* Verified Badge */}
                <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20">
                      <BadgeCheck className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Verified Pro Badge</h3>
                      <p className="text-zinc-400 mt-2">
                        Display a distinctive Pro badge on your profile that signals your commitment to the
                        builder community. This badge appears next to your name throughout the platform,
                        helping you stand out and build trust with other members.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Monthly Tokens */}
                <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20">
                      <Coins className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">50 Tokens Per Month</h3>
                      <p className="text-zinc-400 mt-2">
                        Receive 50 tokens automatically credited to your account every month. Use these
                        tokens to:
                      </p>
                      <ul className="mt-3 space-y-2 text-zinc-400">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                          <span>Promote your projects with advertisements</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                          <span>List services in the marketplace</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                          <span>Post local classifieds</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                          <span>Gift tokens to other builders</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Custom Domains */}
                <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20">
                      <Globe className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Custom Domain Mapping</h3>
                      <p className="text-zinc-400 mt-2">
                        Map your own domain to your Builders.to profile. Instead of sharing
                        <span className="text-orange-400"> builders.to/your-username</span>, you can use
                        your own domain like <span className="text-amber-400">portfolio.yourdomain.com</span>.
                      </p>
                      <p className="text-zinc-500 text-sm mt-2">
                        This is perfect for creating a professional portfolio or personal brand presence.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Pricing Plans */}
            <section id="pricing">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                  <CreditCard className="h-5 w-5 text-amber-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Pricing Plans</h2>
              </div>

              <p className="leading-relaxed mb-6">
                Builders Pro is available in two billing options:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Monthly */}
                <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-6">
                  <h3 className="text-xl font-bold text-white">Monthly</h3>
                  <div className="mt-3">
                    <span className="text-3xl font-bold text-white">$3.99</span>
                    <span className="text-zinc-400">/month</span>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-zinc-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      All Pro benefits included
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Cancel anytime
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Flexible monthly billing
                    </li>
                  </ul>
                </div>

                {/* Yearly */}
                <div className="rounded-xl border border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-6 relative">
                  <span className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-amber-500 text-zinc-900 text-xs font-bold">
                    Save 17%
                  </span>
                  <h3 className="text-xl font-bold text-white">Yearly</h3>
                  <div className="mt-3">
                    <span className="text-3xl font-bold text-white">$39.99</span>
                    <span className="text-zinc-400">/year</span>
                  </div>
                  <p className="text-sm text-amber-400 mt-1">
                    That&apos;s just $3.33/month!
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-zinc-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      All Pro benefits included
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      2 months free
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Best value
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 text-sm text-zinc-500">
                All payments are processed securely through Stripe.
              </div>
            </section>

            {/* How to Subscribe */}
            <section id="how-to-subscribe">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                  <Settings className="h-5 w-5 text-amber-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">How to Subscribe</h2>
              </div>

              <p className="leading-relaxed">
                Follow these steps to become a Pro member:
              </p>

              <ol className="mt-6 space-y-4">
                <li className="flex items-start gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-sm font-bold text-amber-400 shrink-0">1</span>
                  <div>
                    <p className="font-medium text-white">Go to Settings</p>
                    <p className="text-zinc-400 text-sm mt-1">
                      Click on your profile picture in the top-right corner and select
                      <span className="text-orange-400"> Settings</span> from the menu, or visit
                      <span className="text-orange-400"> builders.to/settings</span> directly.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-sm font-bold text-amber-400 shrink-0">2</span>
                  <div>
                    <p className="font-medium text-white">Find the Pro Membership Section</p>
                    <p className="text-zinc-400 text-sm mt-1">
                      At the top of your settings page, you&apos;ll see the &quot;Pro Membership&quot; section
                      with the crown icon.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-sm font-bold text-amber-400 shrink-0">3</span>
                  <div>
                    <p className="font-medium text-white">Choose Your Plan</p>
                    <p className="text-zinc-400 text-sm mt-1">
                      Select either the Monthly ($3.99/month) or Yearly ($39.99/year) plan.
                      The yearly plan saves you 17% compared to monthly billing.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-sm font-bold text-amber-400 shrink-0">4</span>
                  <div>
                    <p className="font-medium text-white">Complete Payment</p>
                    <p className="text-zinc-400 text-sm mt-1">
                      You&apos;ll be redirected to Stripe&apos;s secure checkout page. Enter your payment
                      details and complete the subscription.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-sm font-bold text-amber-400 shrink-0">5</span>
                  <div>
                    <p className="font-medium text-white">Enjoy Pro Benefits!</p>
                    <p className="text-zinc-400 text-sm mt-1">
                      After successful payment, you&apos;ll be redirected back to Builders.to.
                      Your Pro badge will appear immediately, and your 50 tokens will be credited.
                    </p>
                  </div>
                </li>
              </ol>
            </section>

            {/* Setting Up Custom Domains */}
            <section id="custom-domains">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                  <LinkIcon className="h-5 w-5 text-amber-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Setting Up Custom Domains</h2>
              </div>

              <p className="leading-relaxed">
                Once you&apos;re a Pro member, you can map a custom domain to your profile:
              </p>

              <ol className="mt-6 space-y-4">
                <li className="flex items-start gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-cyan-400 shrink-0">1</span>
                  <div>
                    <p className="font-medium text-white">Add Your Domain</p>
                    <p className="text-zinc-400 text-sm mt-1">
                      In the Pro Membership section of your settings, scroll down to &quot;Custom Domains&quot;.
                      Enter your domain (e.g., <span className="text-amber-400">portfolio.yourdomain.com</span>)
                      and click &quot;Add&quot;.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-cyan-400 shrink-0">2</span>
                  <div>
                    <p className="font-medium text-white">Configure DNS</p>
                    <p className="text-zinc-400 text-sm mt-1">
                      Go to your domain registrar (Cloudflare, Namecheap, GoDaddy, etc.) and add a
                      CNAME record:
                    </p>
                    <div className="mt-3 rounded-lg bg-zinc-800/70 p-4 font-mono text-sm">
                      <p className="text-zinc-400">Type: <span className="text-amber-400">CNAME</span></p>
                      <p className="text-zinc-400">Name: <span className="text-amber-400">portfolio</span> (or your subdomain)</p>
                      <p className="text-zinc-400">Target: <span className="text-amber-400">builders.to</span></p>
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-cyan-400 shrink-0">3</span>
                  <div>
                    <p className="font-medium text-white">Verify Your Domain</p>
                    <p className="text-zinc-400 text-sm mt-1">
                      After DNS propagation (usually 5-30 minutes, but can take up to 48 hours),
                      click the &quot;Verify&quot; button next to your domain. Once verified, visitors to your
                      custom domain will see your Builders.to profile.
                    </p>
                  </div>
                </li>
              </ol>

              <div className="mt-6 rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-4">
                <p className="text-sm text-cyan-300">
                  <strong>Tip:</strong> Using a subdomain (like portfolio.yourdomain.com) is easier
                  to configure than a root domain. Most domain registrars have straightforward
                  CNAME setup guides.
                </p>
              </div>
            </section>

            {/* Managing Your Subscription */}
            <section id="managing-subscription">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                  <RefreshCw className="h-5 w-5 text-amber-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Managing Your Subscription</h2>
              </div>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">Viewing Your Subscription</h3>
              <p className="text-zinc-400">
                Once subscribed, the Pro Membership section will show your current plan and renewal date.
                You can see when your next billing cycle occurs and how much time remains.
              </p>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">Cancelling Your Subscription</h3>
              <p className="text-zinc-400">
                You can cancel your subscription at any time from the settings page. When you cancel:
              </p>
              <ul className="mt-3 space-y-2 text-zinc-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-zinc-500 mt-0.5 shrink-0" />
                  <span>You keep Pro benefits until the end of your current billing period</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-zinc-500 mt-0.5 shrink-0" />
                  <span>You won&apos;t be charged again after your current period ends</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-zinc-500 mt-0.5 shrink-0" />
                  <span>Any unused tokens remain in your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-zinc-500 mt-0.5 shrink-0" />
                  <span>Custom domains will stop working after your subscription ends</span>
                </li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">Reactivating Your Subscription</h3>
              <p className="text-zinc-400">
                Changed your mind? If you&apos;ve cancelled but your current period hasn&apos;t ended yet,
                you can click &quot;Keep My Subscription&quot; to reactivate. Your subscription will continue
                as normal with no interruption.
              </p>
            </section>

            {/* FAQ */}
            <section id="faq">
              <h2 className="text-2xl font-semibold text-white mb-6">Frequently Asked Questions</h2>

              <div className="space-y-6">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h3 className="font-medium text-white">When do I receive my monthly tokens?</h3>
                  <p className="text-zinc-400 text-sm mt-2">
                    Your 50 tokens are credited automatically at the start of each billing period.
                    For monthly subscribers, this happens every month on your subscription renewal date.
                    For yearly subscribers, tokens are granted monthly throughout your subscription year.
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h3 className="font-medium text-white">Can I switch from monthly to yearly (or vice versa)?</h3>
                  <p className="text-zinc-400 text-sm mt-2">
                    To switch plans, cancel your current subscription and wait for it to expire,
                    then subscribe to the new plan. Your Pro benefits continue until your current
                    period ends.
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h3 className="font-medium text-white">What happens to my custom domain if I cancel?</h3>
                  <p className="text-zinc-400 text-sm mt-2">
                    Your custom domain will continue working until your subscription period ends.
                    After that, visitors to your custom domain will no longer see your profile.
                    You can always resubscribe to restore custom domain functionality.
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h3 className="font-medium text-white">Do unused tokens roll over?</h3>
                  <p className="text-zinc-400 text-sm mt-2">
                    Yes! All tokens you earn or receive are permanently in your account and never
                    expire. You can accumulate tokens over time and use them whenever you want.
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h3 className="font-medium text-white">Is there a refund policy?</h3>
                  <p className="text-zinc-400 text-sm mt-2">
                    Subscription payments are generally non-refundable once your billing period begins.
                    However, if you have issues, please reach out to the community on Discord or X
                    and we&apos;ll do our best to help.
                  </p>
                </div>
              </div>
            </section>

            {/* CTA */}
            <div className="mt-12 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 p-8 text-center">
              <Crown className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Ready to go Pro?</h3>
              <p className="text-zinc-400 mb-6">
                Join Builders Pro and unlock all premium features today.
              </p>
              <Link
                href="/settings"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-semibold text-zinc-900 transition-all hover:from-amber-400 hover:to-orange-400"
              >
                Get Builders Pro
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
            href="/articles"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-400 transition-colors"
          >
            All Articles
          </Link>
        </div>
      </div>
    </div>
  );
}
