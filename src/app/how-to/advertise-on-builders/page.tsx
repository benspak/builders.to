import Link from "next/link";
import type { Metadata } from "next";
import {
  Megaphone,
  ArrowRight,
  CreditCard,
  Settings,
  CheckCircle2,
  Edit2,
  Clock,
  XCircle,
  Image as ImageIcon,
  ExternalLink,
  BarChart3,
  Eye,
  MousePointer,
  Percent,
  Users,
  Coins,
  AlertTriangle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Advertise on Builders.to - How To - Builders.to",
  description: "Learn how to create and manage ads on Builders.to. Reach thousands of builders with affordable sidebar advertisements.",
};

export default function AdvertiseOnBuildersPage() {
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
          <span className="text-zinc-400">Advertise on Builders.to</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
              <Megaphone className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Advertise on Builders.to</h1>
              <p className="text-zinc-400 mt-1">5 min read</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">$5</p>
            <p className="text-xs text-zinc-500 mt-1">Per Month</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">30</p>
            <p className="text-xs text-zinc-500 mt-1">Days Duration</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">Feed</p>
            <p className="text-xs text-zinc-500 mt-1">Sidebar Placement</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">Real-time</p>
            <p className="text-xs text-zinc-500 mt-1">Analytics</p>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="mb-12 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">
            In this guide
          </h2>
          <nav className="space-y-2">
            {[
              { href: "#overview", label: "Overview" },
              { href: "#getting-started", label: "Getting Started" },
              { href: "#creating-your-ad", label: "Creating Your Ad" },
              { href: "#ad-statuses", label: "Ad Statuses Explained" },
              { href: "#payment", label: "Paying for Your Ad" },
              { href: "#managing-ads", label: "Managing Your Ads" },
              { href: "#analytics", label: "Analytics & Tracking" },
              { href: "#best-practices", label: "Best Practices" },
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
              <h2 className="text-2xl font-semibold text-white mb-4">Overview</h2>
              <p className="leading-relaxed">
                Builders.to offers a simple, affordable way to get your product, service, or project
                in front of thousands of active builders. Your ad will be displayed in the Builder Feed
                sidebar and banner areas, reaching developers, indie hackers, and startup founders who
                are actively engaged in the community.
              </p>

              <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
                <h3 className="text-lg font-semibold text-white mb-3">What You Get</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong className="text-white">$5 flat fee</strong> for 30 days of exposure (non-refundable once active)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong className="text-white">Prime placement</strong> in the feed sidebar and banner areas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong className="text-white">Real-time analytics</strong> with views, clicks, and CTR tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong className="text-white">Instant activation</strong> &mdash; no review process, goes live immediately after payment</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Getting Started */}
            <section id="getting-started">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                  <Settings className="h-5 w-5 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Getting Started</h2>
              </div>

              <ol className="mt-6 space-y-4">
                <li className="flex items-start gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-400 shrink-0">1</span>
                  <div>
                    <p className="font-medium text-white">Sign In</p>
                    <p className="text-zinc-400 text-sm mt-1">
                      You need a Builders.to account to create ads. Go to{" "}
                      <Link href="/signin" className="text-emerald-400 hover:text-emerald-300">
                        builders.to/signin
                      </Link>{" "}
                      and sign in with your preferred method (email magic link, GitHub, etc.).
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-400 shrink-0">2</span>
                  <div>
                    <p className="font-medium text-white">Navigate to the Ads Dashboard</p>
                    <p className="text-zinc-400 text-sm mt-1">
                      Go to{" "}
                      <Link href="/ads" className="text-emerald-400 hover:text-emerald-300">
                        builders.to/ads
                      </Link>{" "}
                      &mdash; this is your &quot;My Ads&quot; dashboard where you can manage all your advertisements.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-400 shrink-0">3</span>
                  <div>
                    <p className="font-medium text-white">Create a New Ad</p>
                    <p className="text-zinc-400 text-sm mt-1">
                      Click the <span className="text-emerald-400">&quot;Create Ad&quot;</span> button to start designing your advertisement.
                    </p>
                  </div>
                </li>
              </ol>
            </section>

            {/* Creating Your Ad */}
            <section id="creating-your-ad">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                  <Edit2 className="h-5 w-5 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Creating Your Ad</h2>
              </div>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">Required Fields</h3>

              <div className="space-y-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h4 className="font-medium text-white flex items-center gap-2">
                    Headline <span className="text-red-400 text-sm">*Required</span>
                  </h4>
                  <p className="text-zinc-400 text-sm mt-2">
                    This is the main attention-grabbing text for your ad (max 100 characters). Make it
                    compelling and action-oriented.
                  </p>
                  <p className="text-zinc-500 text-sm mt-2 italic">
                    Examples: &quot;Ship faster with our AI code assistant&quot;, &quot;The database built for builders&quot;
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <div className="flex items-start gap-3">
                    <ExternalLink className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-medium text-white flex items-center gap-2">
                        Destination URL <span className="text-red-400 text-sm">*Required</span>
                      </h4>
                      <p className="text-zinc-400 text-sm mt-2">
                        The link where users will be directed when they click your ad. Must be a valid URL.
                      </p>
                      <div className="mt-3 rounded-lg bg-zinc-800/70 p-3 font-mono text-sm">
                        <p className="text-zinc-400">https://your-product.com?utm_source=builders.to&utm_medium=ad</p>
                      </div>
                      <p className="text-zinc-500 text-sm mt-2">
                        Tip: Use UTM parameters to track traffic from your Builders.to ads.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">Optional Fields</h3>

              <div className="space-y-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h4 className="font-medium text-white">Description</h4>
                  <p className="text-zinc-400 text-sm mt-2">
                    Brief text explaining your product or service (max 200 characters). Use this to add
                    context to your headline.
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <div className="flex items-start gap-3">
                    <ImageIcon className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-medium text-white">Ad Image</h4>
                      <p className="text-zinc-400 text-sm mt-2">
                        Upload an eye-catching image for your ad. Recommended size: <span className="text-emerald-400">600x300px</span> (2:1 aspect ratio).
                        Supported formats: JPEG, PNG, WebP.
                      </p>
                      <p className="text-zinc-500 text-sm mt-2">
                        High-quality, relevant images significantly improve ad performance.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h4 className="font-medium text-white">Button Text (CTA)</h4>
                  <p className="text-zinc-400 text-sm mt-2">
                    Customizable call-to-action button text (max 30 characters). Default: &quot;Learn More&quot;
                  </p>
                  <p className="text-zinc-500 text-sm mt-2 italic">
                    Examples: &quot;Get Started&quot;, &quot;Try Free&quot;, &quot;Shop Now&quot;, &quot;Sign Up&quot;
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                <p className="text-sm text-emerald-300">
                  <strong>Live Preview:</strong> As you fill in the form, you&apos;ll see a real-time preview
                  of how your ad will appear in the sidebar. This helps you fine-tune the design before submission.
                </p>
              </div>
            </section>

            {/* Ad Statuses */}
            <section id="ad-statuses">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                  <Clock className="h-5 w-5 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Ad Statuses Explained</h2>
              </div>

              <p className="leading-relaxed mb-6">
                Your ad can have one of these statuses:
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-500/20">
                    <Edit2 className="h-4 w-4 text-zinc-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Draft</h4>
                    <p className="text-zinc-400 text-sm mt-1">
                      Ad created but not yet paid. You can edit freely.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
                    <Clock className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Pending Payment</h4>
                    <p className="text-zinc-400 text-sm mt-1">
                      Checkout started but payment not completed.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Active</h4>
                    <p className="text-zinc-400 text-sm mt-1">
                      Paid and currently running on the feed. Your ad is live!
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-500/20">
                    <Clock className="h-4 w-4 text-zinc-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Expired</h4>
                    <p className="text-zinc-400 text-sm mt-1">
                      The 30-day period has ended. Create a new ad to continue advertising.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20">
                    <XCircle className="h-4 w-4 text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Cancelled</h4>
                    <p className="text-zinc-400 text-sm mt-1">
                      Payment was refunded or cancelled.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Payment */}
            <section id="payment">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                  <CreditCard className="h-5 w-5 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Paying for Your Ad</h2>
              </div>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">Payment Options</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <CreditCard className="h-5 w-5 text-emerald-400" />
                    <h4 className="font-medium text-white">Pay with Card</h4>
                  </div>
                  <p className="text-2xl font-bold text-white">$5</p>
                  <p className="text-zinc-400 text-sm mt-2">
                    Standard Stripe checkout with credit/debit card
                  </p>
                </div>

                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Coins className="h-5 w-5 text-amber-400" />
                    <h4 className="font-medium text-white">Pay with Tokens</h4>
                  </div>
                  <p className="text-2xl font-bold text-white">50 tokens</p>
                  <p className="text-zinc-400 text-sm mt-2">
                    Use tokens earned through referrals, engagement, or purchases
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">Checkout Process</h3>
              <ol className="space-y-2 text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-medium">1.</span>
                  After creating your ad draft, click the <span className="text-emerald-400">&quot;Pay $5 to Activate&quot;</span> button
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-medium">2.</span>
                  Complete payment securely via Stripe
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-medium">3.</span>
                  Your ad becomes active immediately after successful payment
                </li>
              </ol>

              <div className="mt-6 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-400">Ad Limits & Surcharges</h4>
                    <p className="text-zinc-400 text-sm mt-1">
                      You can have up to <span className="text-white">10 active ads</span> at the standard $5 rate.
                      Each additional ad beyond 10 incurs a $5 surcharge ($10 total per ad).
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Managing Ads */}
            <section id="managing-ads">
              <h2 className="text-2xl font-semibold text-white mb-4">Managing Your Ads</h2>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">Viewing Ad Details</h3>
              <p className="text-zinc-400">
                Click on any ad in your dashboard to see:
              </p>
              <ul className="mt-3 space-y-2 text-zinc-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-zinc-500 mt-0.5 shrink-0" />
                  <span>Ad preview showing how it appears to visitors</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-zinc-500 mt-0.5 shrink-0" />
                  <span>Current status and days remaining</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-zinc-500 mt-0.5 shrink-0" />
                  <span>Start and end dates</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-zinc-500 mt-0.5 shrink-0" />
                  <span>Analytics data (for active/expired ads)</span>
                </li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">Editing Ads</h3>
              <p className="text-zinc-400">
                You can edit ads while they&apos;re in <span className="text-emerald-400">Draft</span> or{" "}
                <span className="text-amber-400">Pending Payment</span> status. Simply click the ad,
                then click <span className="text-white">&quot;Edit&quot;</span>, make your changes, and save.
              </p>
              <p className="text-zinc-500 text-sm mt-2">
                Note: Active ads cannot be edited. To change an active ad, you&apos;ll need to create a new one.
              </p>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">Deleting Ads</h3>
              <p className="text-zinc-400">
                You can delete ads that are in Draft, Pending Payment, Expired, or Cancelled status.
                Active ads cannot be deleted &mdash; they will naturally expire after 30 days.
              </p>
            </section>

            {/* Analytics */}
            <section id="analytics">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                  <BarChart3 className="h-5 w-5 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Analytics & Tracking</h2>
              </div>

              <p className="leading-relaxed mb-6">
                Once your ad is active, you&apos;ll have access to detailed analytics:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-medium text-white">Total Views</span>
                  </div>
                  <p className="text-xs text-zinc-500">Times your ad was displayed</p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-white">Unique Visitors</span>
                  </div>
                  <p className="text-xs text-zinc-500">Individual users who saw your ad</p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MousePointer className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium text-white">Total Clicks</span>
                  </div>
                  <p className="text-xs text-zinc-500">Times users clicked your ad</p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Percent className="h-4 w-4 text-rose-400" />
                    <span className="text-sm font-medium text-white">CTR</span>
                  </div>
                  <p className="text-xs text-zinc-500">Click-through rate percentage</p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-amber-400" />
                    <span className="text-sm font-medium text-white">Today&apos;s Stats</span>
                  </div>
                  <p className="text-xs text-zinc-500">Views and clicks today</p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm font-medium text-white">Daily Chart</span>
                  </div>
                  <p className="text-xs text-zinc-500">14-day performance trend</p>
                </div>
              </div>
            </section>

            {/* Best Practices */}
            <section id="best-practices">
              <h2 className="text-2xl font-semibold text-white mb-4">Best Practices</h2>

              <div className="space-y-6">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h3 className="font-medium text-white mb-3">Headlines That Work</h3>
                  <ul className="space-y-2 text-zinc-400 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span>Be specific about what you offer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span>Lead with the benefit to the builder</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span>Use action words</span>
                    </li>
                  </ul>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                      <p className="text-emerald-400 font-medium">Good</p>
                      <p className="text-zinc-400 mt-1">&quot;Cut your deployment time by 80%&quot;</p>
                    </div>
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                      <p className="text-red-400 font-medium">Not as good</p>
                      <p className="text-zinc-400 mt-1">&quot;Our deployment tool&quot;</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h3 className="font-medium text-white mb-3">Images That Convert</h3>
                  <ul className="space-y-2 text-zinc-400 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span>Use product screenshots or clean graphics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span>Ensure text is readable at small sizes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span>Maintain the 2:1 aspect ratio (600x300px)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span>Avoid cluttered or busy images</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h3 className="font-medium text-white mb-3">CTA Button Tips</h3>
                  <ul className="space-y-2 text-zinc-400 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span><span className="text-white">&quot;Try Free&quot;</span> &mdash; great for freemium products</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span><span className="text-white">&quot;Get Started&quot;</span> &mdash; perfect for SaaS tools</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span><span className="text-white">&quot;Learn More&quot;</span> &mdash; best for informational content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span><span className="text-white">&quot;Shop Now&quot;</span> &mdash; ideal for e-commerce</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section id="faq">
              <h2 className="text-2xl font-semibold text-white mb-6">Frequently Asked Questions</h2>

              <div className="space-y-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h3 className="font-medium text-white">How long until my ad goes live?</h3>
                  <p className="text-zinc-400 text-sm mt-2">
                    Immediately after successful payment. There&apos;s no review process.
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h3 className="font-medium text-white">Can I renew my ad?</h3>
                  <p className="text-zinc-400 text-sm mt-2">
                    Yes! Simply create a new ad (you can use the same content) and pay for another
                    30-day period. There&apos;s no automatic renewal.
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h3 className="font-medium text-white">What&apos;s the refund policy?</h3>
                  <p className="text-zinc-400 text-sm mt-2">
                    Ads are non-refundable once active. Make sure to preview your ad carefully before payment.
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h3 className="font-medium text-white">Can I run multiple ads at once?</h3>
                  <p className="text-zinc-400 text-sm mt-2">
                    Yes! You can have multiple active ads. The first 10 ads are $5 each. Additional
                    ads incur a $5 surcharge ($10 total per ad).
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h3 className="font-medium text-white">How are ads rotated?</h3>
                  <p className="text-zinc-400 text-sm mt-2">
                    If multiple ads are active, they&apos;re randomly selected to display to each visitor,
                    giving fair exposure to all advertisers.
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h3 className="font-medium text-white">Can I target specific audiences?</h3>
                  <p className="text-zinc-400 text-sm mt-2">
                    Currently, ads are shown to all Builders.to feed visitors. There&apos;s no targeting
                    based on user attributes.
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h3 className="font-medium text-white">What content is not allowed?</h3>
                  <p className="text-zinc-400 text-sm mt-2">
                    No misleading or deceptive content, no adult or inappropriate material,
                    no malware or harmful links.
                  </p>
                </div>
              </div>
            </section>

            {/* CTA */}
            <div className="mt-12 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 p-8 text-center">
              <Megaphone className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Ready to reach thousands of builders?</h3>
              <p className="text-zinc-400 mb-6">
                Create your first ad and get in front of active developers, indie hackers, and startup founders.
              </p>
              <Link
                href="/ads/new"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:from-emerald-600 hover:to-teal-600"
              >
                Create Your Ad &mdash; $5/mo
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
