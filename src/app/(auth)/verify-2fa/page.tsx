import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TwoFactorVerifyPage } from "./TwoFactorVerifyPage";

export const metadata = {
  title: "Verify 2FA - Builders.to",
  description: "Enter your two-factor authentication code to continue",
};

export default async function Verify2FAPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  // Check if user has 2FA enabled
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      twoFactorEnabled: true,
    },
  });

  if (!user) {
    redirect("/signin");
  }

  // If 2FA is not enabled, redirect to projects
  if (!user.twoFactorEnabled) {
    redirect("/projects");
  }

  // Check if 2FA has already been verified for this session
  const cookieStore = await cookies();
  const twoFactorVerified = cookieStore.get("2fa_verified");

  if (twoFactorVerified && twoFactorVerified.value === user.id) {
    redirect("/projects");
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
            <TwoFactorVerifyPage
              userId={user.id}
              signOutAction={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
