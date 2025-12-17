import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignInButtons } from "@/components/auth/sign-in-buttons";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function SignInPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Background effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/20 via-transparent to-transparent" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      <div className="relative flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-8 backdrop-blur-xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Welcome to Builders</h1>
              <p className="text-zinc-400">
                Sign in to share your projects and connect with fellow builders
              </p>
            </div>

            <SignInButtons />

            <p className="mt-8 text-center text-xs text-zinc-500">
              By signing in, you agree to our{" "}
              <Link href="#" className="text-orange-400 hover:text-orange-300">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-orange-400 hover:text-orange-300">
                Privacy Policy
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-500">
              Part of the{" "}
              <a
                href="https://x.com/i/communities/1943895831322439993"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-orange-300"
              >
                Builders.to community on X
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
