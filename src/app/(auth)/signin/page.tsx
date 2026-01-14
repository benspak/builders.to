import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignInButtons } from "@/components/auth/sign-in-buttons";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function SignInPage() {
  const session = await auth();

  if (session) {
    redirect("/settings");
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      {/* Background effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/20 via-transparent to-transparent" />
      <div className="fixed inset-0 bg-grid opacity-30" />

      <div className="relative flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm transition-colors mb-8"
            style={{ color: "var(--foreground-muted)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="rounded-2xl p-8 backdrop-blur-xl card">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--foreground)" }}>Welcome to Builders.to</h1>
              <p style={{ color: "var(--foreground-muted)" }}>
                Sign in to join the launch pad and builder network — share progress, meet collaborators, and find early users
              </p>
            </div>

            <SignInButtons />

            <p className="mt-8 text-center text-xs" style={{ color: "var(--foreground-subtle)" }}>
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-orange-500 hover:text-orange-400">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-orange-500 hover:text-orange-400">
                Privacy Policy
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: "var(--foreground-subtle)" }}>
              Part of the{" "}
              <a
                href="https://x.com/i/communities/1943895831322439993"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500 hover:text-orange-400"
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
