import Link from "next/link";
import type { Metadata } from "next";
import {
  User,
  Settings,
  MessageCircle,
  Camera,
  ImageIcon,
  MapPin,
  FileText,
  Link as LinkIcon,
  Calendar,
  Briefcase,
  Users,
  Code,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Complete Your Profile - How To - Builders.to",
  description: "Learn how to set up and optimize your Builders.to profile to connect with other builders and showcase your work.",
};

export default function CompleteYourProfilePage() {
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
          <span className="text-zinc-400">Complete Your Profile</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25">
              <User className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Complete Your Profile</h1>
              <p className="text-zinc-400 mt-1">5 min read</p>
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
              { href: "#introduction", label: "Introduction" },
              { href: "#access-settings", label: "Step 1: Access Settings" },
              { href: "#status-update", label: "Step 2: Status Update" },
              { href: "#profile-photo", label: "Step 3: Profile Photo & Background" },
              { href: "#basic-info", label: "Step 4: Basic Information" },
              { href: "#headline-bio", label: "Step 5: Headline & Bio" },
              { href: "#social-profiles", label: "Step 6: Social Profiles" },
              { href: "#featured-content", label: "Step 7: Featured Content" },
              { href: "#intent-flags", label: "Step 8: Intent Flags" },
              { href: "#calendar-link", label: "Step 9: Calendar Link" },
              { href: "#completeness-tips", label: "Profile Completeness Tips" },
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

            {/* Introduction */}
            <section id="introduction">
              <h2 className="text-2xl font-semibold text-white mb-4">Introduction</h2>
              <p className="leading-relaxed">
                Your Builders.to profile is your digital identity in the builder community. A complete
                profile helps you connect with other entrepreneurs, attract collaborators, and showcase
                your work effectively.
              </p>
              <p className="leading-relaxed mt-4">
                Builders.to tracks your <span className="text-orange-400">Profile Completeness Score</span> to
                help you understand how well your profile represents you. A complete profile can earn you
                bonus tokens and increases your visibility in the community.
              </p>
              <div className="mt-6 rounded-xl bg-orange-500/10 border border-orange-500/20 p-4">
                <p className="text-sm text-orange-300">
                  <strong>Tip:</strong> Profiles with a completeness score of 100% appear higher in search
                  results and are more likely to attract connections.
                </p>
              </div>
            </section>

            {/* Step 1: Access Settings */}
            <section id="access-settings">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                  <Settings className="h-5 w-5 text-orange-500" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Step 1: Access Settings</h2>
              </div>
              <p className="leading-relaxed">
                To edit your profile, you need to access your Profile Settings page:
              </p>
              <ol className="mt-4 space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20 text-xs font-bold text-orange-400">1</span>
                  <span>Click on your profile picture in the top-right corner of the navigation bar</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20 text-xs font-bold text-orange-400">2</span>
                  <span>Select <span className="text-orange-400 font-medium">Settings</span> from the dropdown menu</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20 text-xs font-bold text-orange-400">3</span>
                  <span>You&apos;ll see the Profile Settings page with all editable fields</span>
                </li>
              </ol>
              <p className="mt-4 text-sm text-zinc-500">
                You can also access settings directly by visiting <span className="text-orange-400">builders.to/settings</span>
              </p>
            </section>

            {/* Step 2: Status Update */}
            <section id="status-update">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                  <MessageCircle className="h-5 w-5 text-orange-500" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Step 2: Status Update</h2>
              </div>
              <p className="leading-relaxed">
                The <span className="text-orange-400">&quot;What are you working on?&quot;</span> field is
                prominently displayed at the top of your profile. It&apos;s a great way to share your
                current focus with the community.
              </p>
              <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <p className="text-sm font-medium text-zinc-300 mb-2">Good status examples:</p>
                <ul className="space-y-1 text-sm text-zinc-400">
                  <li>• &quot;Building a new AI-powered writing tool 🚀&quot;</li>
                  <li>• &quot;Launching my SaaS next week!&quot;</li>
                  <li>• &quot;Learning Rust and loving it&quot;</li>
                  <li>• &quot;Open to freelance projects&quot;</li>
                </ul>
              </div>
              <p className="mt-4 text-sm text-zinc-500">
                Maximum 100 characters. Update it regularly to keep your profile fresh!
              </p>
            </section>

            {/* Step 3: Profile Photo & Background */}
            <section id="profile-photo">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                  <Camera className="h-5 w-5 text-orange-500" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Step 3: Profile Photo & Background</h2>
              </div>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">Profile Photo</h3>
              <p className="leading-relaxed">
                Your profile photo is imported from your sign-in provider (X, GitHub, or Google) by default.
                You can upload a custom photo if you prefer:
              </p>
              <ol className="mt-4 space-y-2">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20 text-xs font-bold text-orange-400">1</span>
                  <span>Click the <span className="text-orange-400">Upload new photo</span> button</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20 text-xs font-bold text-orange-400">2</span>
                  <span>Select an image from your device (JPG, PNG, or WebP)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20 text-xs font-bold text-orange-400">3</span>
                  <span>The photo will be automatically cropped to a circle</span>
                </li>
              </ol>

              <h3 className="text-lg font-medium text-white mt-8 mb-3 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-cyan-500" />
                Profile Background
              </h3>
              <p className="leading-relaxed">
                Add a custom background image to make your profile header stand out:
              </p>
              <ol className="mt-4 space-y-2">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-400">1</span>
                  <span>Click <span className="text-cyan-400">Upload background</span> in the Profile Background section</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-400">2</span>
                  <span>Choose a wide image (recommended: 1500x500 pixels or similar aspect ratio)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-400">3</span>
                  <span>The image will appear as your profile header background</span>
                </li>
              </ol>
            </section>

            {/* Step 4: Basic Information */}
            <section id="basic-info">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                  <User className="h-5 w-5 text-orange-500" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Step 4: Basic Information</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Display Name</h3>
                  <p className="text-zinc-400">
                    This is the name shown on your profile. If left empty, your name from the sign-in
                    provider will be used. Maximum 50 characters.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Email Address</h3>
                  <p className="text-zinc-400">
                    Used for notifications and Stripe Connect payouts. Your email is <strong>not</strong> displayed
                    publicly on your profile.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Profile URL (Slug)</h3>
                  <p className="text-zinc-400">
                    Your unique profile URL will be <span className="text-orange-400">builders.to/your-username</span>.
                    Only lowercase letters, numbers, and hyphens are allowed.
                  </p>
                  <div className="mt-2 rounded-lg bg-zinc-800/50 p-3 text-sm">
                    <p className="text-zinc-300"><strong>Example:</strong> If you enter &quot;john-doe&quot;, your profile will be at builders.to/john-doe</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-orange-500" />
                    Location
                  </h3>
                  <p className="text-zinc-400">
                    Enter your city and country. This helps other builders in your area find and connect
                    with you. The location is displayed on your profile (e.g., &quot;San Francisco, USA&quot;).
                  </p>
                </div>
              </div>
            </section>

            {/* Step 5: Headline & Bio */}
            <section id="headline-bio">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                  <FileText className="h-5 w-5 text-orange-500" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Step 5: Headline & Bio</h2>
              </div>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">Headline (120 characters max)</h3>
              <p className="leading-relaxed">
                Your headline is a short tagline that appears below your name. Make it memorable and
                descriptive of what you do.
              </p>
              <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <p className="text-sm font-medium text-zinc-300 mb-2">Good headline examples:</p>
                <ul className="space-y-1 text-sm text-zinc-400">
                  <li>• &quot;Founder & Builder | Creating awesome products&quot;</li>
                  <li>• &quot;Full-stack developer building in public&quot;</li>
                  <li>• &quot;Designer turned entrepreneur | Building design tools&quot;</li>
                  <li>• &quot;Serial entrepreneur | 3x founder | Angel investor&quot;</li>
                </ul>
              </div>

              <h3 className="text-lg font-medium text-white mt-8 mb-3">Bio (2000 characters max)</h3>
              <p className="leading-relaxed">
                Your bio is where you can tell your story. Include:
              </p>
              <ul className="mt-3 space-y-2 text-zinc-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                  <span>What you&apos;re currently building or working on</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Your background and experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Your interests and passions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                  <span>What kind of connections you&apos;re looking for</span>
                </li>
              </ul>
              <div className="mt-4 rounded-xl bg-orange-500/10 border border-orange-500/20 p-4">
                <p className="text-sm text-orange-300">
                  <strong>Note:</strong> Your bio needs to be at least 20 characters to count toward
                  your profile completeness score.
                </p>
              </div>
            </section>

            {/* Step 6: Social Profiles */}
            <section id="social-profiles">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                  <LinkIcon className="h-5 w-5 text-orange-500" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Step 6: Social Profiles</h2>
              </div>
              <p className="leading-relaxed">
                Connect your social media profiles to make it easy for others to find and follow you.
                You can add links to:
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { name: "X (Twitter)", example: "https://x.com/username" },
                  { name: "YouTube", example: "https://youtube.com/@channel" },
                  { name: "LinkedIn", example: "https://linkedin.com/in/username" },
                  { name: "Twitch", example: "https://twitch.tv/username" },
                  { name: "GitHub", example: "https://github.com/username" },
                  { name: "Product Hunt", example: "https://producthunt.com/@username" },
                ].map((social) => (
                  <div key={social.name} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                    <p className="font-medium text-white text-sm">{social.name}</p>
                    <p className="text-xs text-zinc-500 mt-1">{social.example}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                <p className="text-sm text-emerald-300">
                  <strong>Tip:</strong> Adding at least one social link is required for a complete profile.
                  Social links appear as icons on your profile, making it easy for visitors to connect.
                </p>
              </div>
            </section>

            {/* Step 7: Featured Content */}
            <section id="featured-content">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-purple-600">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-white">Step 7: Featured Content</h2>
              </div>
              <p className="leading-relaxed">
                Showcase a video on your profile by adding a YouTube or Twitch video URL. This is a
                great way to share:
              </p>
              <ul className="mt-3 space-y-2 text-zinc-400">
                <li>• A product demo or walkthrough</li>
                <li>• A personal introduction video</li>
                <li>• Your latest livestream or content</li>
                <li>• A project showcase or pitch</li>
              </ul>
              <p className="mt-4 text-sm text-zinc-500">
                The video will be embedded in your profile sidebar for visitors to watch.
              </p>
            </section>

            {/* Step 8: Intent Flags */}
            <section id="intent-flags">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                  <Briefcase className="h-5 w-5 text-orange-500" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Step 8: Intent Flags</h2>
              </div>
              <p className="leading-relaxed">
                Let the community know what you&apos;re looking for by enabling one or more intent flags.
                These appear as badges on your profile:
              </p>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <Briefcase className="h-6 w-6 text-emerald-400 shrink-0" />
                  <div>
                    <h3 className="font-medium text-emerald-400">Open to Work</h3>
                    <p className="text-sm text-zinc-400 mt-1">
                      Enable this if you&apos;re looking for job opportunities. Great for getting noticed by
                      hiring companies.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-xl border border-violet-500/30 bg-violet-500/10 p-4">
                  <Users className="h-6 w-6 text-violet-400 shrink-0" />
                  <div>
                    <h3 className="font-medium text-violet-400">Looking for Co-founder</h3>
                    <p className="text-sm text-zinc-400 mt-1">
                      Enable this if you&apos;re seeking a partner to build something together.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
                  <Code className="h-6 w-6 text-cyan-400 shrink-0" />
                  <div>
                    <h3 className="font-medium text-cyan-400">Available for Contract</h3>
                    <p className="text-sm text-zinc-400 mt-1">
                      Enable this if you&apos;re open to freelance or contract work opportunities.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <Calendar className="h-6 w-6 text-amber-400 shrink-0" />
                  <div>
                    <h3 className="font-medium text-amber-400">Open to Meeting</h3>
                    <p className="text-sm text-zinc-400 mt-1">
                      Enable this if you&apos;re happy to chat with other builders. Your calendar link
                      (if set) will be displayed.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 9: Calendar Link */}
            <section id="calendar-link">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                  <Calendar className="h-5 w-5 text-orange-500" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Step 9: Calendar Link</h2>
              </div>
              <p className="leading-relaxed">
                Add your Calendly, Cal.com, or other booking link to make it easy for others to
                schedule time with you.
              </p>
              <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <p className="text-sm font-medium text-zinc-300 mb-2">Supported calendar services:</p>
                <ul className="space-y-1 text-sm text-zinc-400">
                  <li>• Calendly: <span className="text-orange-400">https://calendly.com/your-link</span></li>
                  <li>• Cal.com: <span className="text-orange-400">https://cal.com/your-link</span></li>
                  <li>• Any other booking/scheduling URL</li>
                </ul>
              </div>
              <p className="mt-4 text-sm text-zinc-500">
                The calendar link is displayed on your profile when the &quot;Open to Meeting&quot; flag is enabled.
              </p>
            </section>

            {/* Profile Completeness Tips */}
            <section id="completeness-tips">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Profile Completeness Tips</h2>
              </div>
              <p className="leading-relaxed">
                Your profile completeness score is calculated based on key fields. Here&apos;s how to
                maximize your score:
              </p>

              <h3 className="text-lg font-medium text-white mt-8 mb-4">Essential Fields (80 points)</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-orange-500" />
                    <span className="text-zinc-300">Headline</span>
                  </div>
                  <span className="text-orange-400 font-medium">20 points</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-orange-500" />
                    <span className="text-zinc-300">Bio (min 20 characters)</span>
                  </div>
                  <span className="text-orange-400 font-medium">20 points</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-orange-500" />
                    <span className="text-zinc-300">Location (City)</span>
                  </div>
                  <span className="text-orange-400 font-medium">20 points</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  <div className="flex items-center gap-3">
                    <LinkIcon className="h-5 w-5 text-orange-500" />
                    <span className="text-zinc-300">At least one social link</span>
                  </div>
                  <span className="text-orange-400 font-medium">20 points</span>
                </div>
              </div>

              <h3 className="text-lg font-medium text-white mt-8 mb-4">Important Fields (20 points)</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-cyan-500" />
                    <span className="text-zinc-300">Display Name</span>
                  </div>
                  <span className="text-cyan-400 font-medium">10 points</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  <div className="flex items-center gap-3">
                    <LinkIcon className="h-5 w-5 text-cyan-500" />
                    <span className="text-zinc-300">Website URL</span>
                  </div>
                  <span className="text-cyan-400 font-medium">5 points</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-cyan-500" />
                    <span className="text-zinc-300">Status</span>
                  </div>
                  <span className="text-cyan-400 font-medium">5 points</span>
                </div>
              </div>

              <div className="mt-8 rounded-xl bg-gradient-to-r from-orange-500/10 to-cyan-500/10 border border-orange-500/20 p-6">
                <h3 className="font-semibold text-white mb-2">Ready to complete your profile?</h3>
                <p className="text-zinc-400 text-sm mb-4">
                  Head to your settings page and fill out all the fields to achieve 100% profile completeness!
                </p>
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                >
                  Go to Settings
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </section>

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
