"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight } from "lucide-react";

type VerificationStatus = "verifying" | "success" | "error" | "expired";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>("verifying");
  const [errorMessage, setErrorMessage] = useState("");

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      setStatus("error");
      setErrorMessage("Invalid verification link. Please request a new verification email.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/email/verify/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, email }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.error?.includes("expired")) {
            setStatus("expired");
          } else {
            setStatus("error");
          }
          setErrorMessage(data.error || "Failed to verify email");
          return;
        }

        setStatus("success");
        
        // Redirect to feed after 3 seconds
        setTimeout(() => {
          router.push("/feed");
        }, 3000);
      } catch {
        setStatus("error");
        setErrorMessage("An error occurred while verifying your email. Please try again.");
      }
    };

    verifyEmail();
  }, [token, email, router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {status === "verifying" && (
          <div className="text-center">
            <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 mb-6">
              <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Verifying Your Email
            </h1>
            <p className="text-zinc-400">
              Please wait while we verify your email address...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 mb-6">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Email Verified! 🎉
            </h1>
            <p className="text-zinc-400 mb-6">
              Your email has been successfully verified. You now have full access to Builders.to.
            </p>
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 mb-6">
              <p className="text-sm text-emerald-400">
                Redirecting you to your feed in a few seconds...
              </p>
            </div>
            <Link
              href="/feed"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 py-3 px-6 font-semibold text-white hover:from-orange-600 hover:to-pink-600 transition-all"
            >
              Go to Feed
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-500/20 mb-6">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Verification Failed
            </h1>
            <p className="text-zinc-400 mb-6">
              {errorMessage}
            </p>
            <div className="space-y-3">
              <Link
                href="/feed"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 py-3 px-6 font-semibold text-white hover:from-orange-600 hover:to-pink-600 transition-all"
              >
                Go to Feed
                <ArrowRight className="h-5 w-5" />
              </Link>
              <p className="text-xs text-zinc-500">
                You can request a new verification email from your profile settings.
              </p>
            </div>
          </div>
        )}

        {status === "expired" && (
          <div className="text-center">
            <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 mb-6">
              <Mail className="h-10 w-10 text-yellow-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Link Expired
            </h1>
            <p className="text-zinc-400 mb-6">
              This verification link has expired. Please request a new verification email.
            </p>
            <div className="space-y-3">
              <Link
                href="/feed"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 py-3 px-6 font-semibold text-white hover:from-orange-600 hover:to-pink-600 transition-all"
              >
                Go to Feed
                <ArrowRight className="h-5 w-5" />
              </Link>
              <p className="text-xs text-zinc-500">
                You'll be prompted to verify your email when you visit the app.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 mb-6">
              <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Loading...
            </h1>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
