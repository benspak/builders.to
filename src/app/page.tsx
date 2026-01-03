import Link from "next/link";
import { auth } from "@/lib/auth";
import { ArrowRight, Rocket, MessageSquare, TrendingUp, Users, Zap, Star } from "lucide-react";
import { RoastMVPWrapper } from "@/components/roast-mvp/roast-mvp-wrapper";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/30 rounded-full blur-[128px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="text-center">
            {/* Badges */}
            <div className="flex flex-col items-center gap-4 mb-8 animate-slide-up opacity-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 border border-orange-500/20 px-4 py-2 text-sm text-orange-400">
                <Zap className="h-4 w-4" />
                <a href="https://x.com/i/communities/1943895831322439993" target="_blank" rel="noopener noreferrer" className="hover:underline">Part of the Builders.to community on X</a>
              </div>
              <a href="https://www.producthunt.com/products/builders-to?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-builders-to" target="_blank" rel="noopener noreferrer" className="hover:opacity-90 transition-opacity">
                <img
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1057424&theme=light&t=1767474862338"
                  alt="Builders.to - Ship faster. Together. | Product Hunt"
                  width="250"
                  height="54"
                />
              </a>
            </div>

            {/* Headline */}
            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl animate-slide-up opacity-0 stagger-1">
              Ship faster.{" "}
              <span className="gradient-text">Together.</span>
            </h1>

            {/* Subheadline */}
            <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 sm:text-xl animate-slide-up opacity-0 stagger-2">
              Share your project, get feedback from real builders, and find your first users.
              A members-only launchpad for builders who ship.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-slide-up opacity-0 stagger-3">
              <Link
                href="/dashboard"
                className="btn-primary text-lg"
              >
                Browse Projects
                <ArrowRight className="h-5 w-5" />
              </Link>
              {session ? (
                <Link
                  href="/projects/new"
                  className="btn-secondary text-lg"
                >
                  Share Project
                </Link>
              ) : (
                <Link
                  href="/signin"
                  className="btn-secondary text-lg"
                >
                  Sign in to Share
                </Link>
              )}
            </div>

            {/* Social proof */}
            <div className="mt-16 flex items-center justify-center gap-8 text-zinc-500 animate-slide-up opacity-0 stagger-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-500" />
                <span>Builders</span>
              </div>
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-orange-500" />
                <span>Projects</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-orange-500" />
                <span>Growing daily</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Everything you need to{" "}
              <span className="gradient-text">launch</span>
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              Built by builders, for builders. Get the feedback and traction you need.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="card card-hover p-8 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25 mb-6 group-hover:scale-110 transition-transform">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Share Your Progress</h3>
              <p className="text-zinc-400">
                Post your work in progress at any stage — from idea to launched product.
                Get visibility from day one.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card card-hover p-8 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/25 mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Get Real Feedback</h3>
              <p className="text-zinc-400">
                Receive honest, constructive feedback from fellow builders who understand
                the journey of shipping.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card card-hover p-8 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg shadow-violet-500/25 mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Find Early Users</h3>
              <p className="text-zinc-400">
                Connect with builders who might become your first users, testers,
                or even collaborators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative py-24 sm:py-32 bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              Three simple steps to get started
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-orange-500/50 bg-zinc-900 text-2xl font-bold text-orange-500 mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Sign in</h3>
              <p className="text-zinc-400">
                Join using your X account. Members only — keeps the community focused.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-cyan-500/50 bg-zinc-900 text-2xl font-bold text-cyan-500 mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Share your project</h3>
              <p className="text-zinc-400">
                Post your project with a description, links, and current status. Screenshots welcome!
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-violet-500/50 bg-zinc-900 text-2xl font-bold text-violet-500 mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Engage & grow</h3>
              <p className="text-zinc-400">
                Get upvotes, receive feedback, and help other builders by commenting on their projects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roast my MVP Section */}
      <RoastMVPWrapper />

      {/* CTA Section */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="gradient-border p-12">
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
              Ready to share what you&apos;re building?
            </h2>
            <p className="text-lg text-zinc-400 mb-8">
              Join hundreds of builders shipping products and growing together.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="btn-primary text-lg">
                Browse Projects
                <ArrowRight className="h-5 w-5" />
              </Link>
              {session ? (
                <Link href="/projects/new" className="btn-secondary text-lg">
                  Share Your Project
                </Link>
              ) : (
                <Link href="/signin" className="btn-secondary text-lg">
                  Sign in to Share
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
