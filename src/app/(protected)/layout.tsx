import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReferralProcessor } from "@/components/auth/referral-processor";
import { EmailCollectionWrapper } from "@/components/profile/email-collection-wrapper";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/signin");
  }

  // Check if user has 2FA enabled and needs verification
  // Also fetch email to check if we need to collect it
  let userEmail: string | null = null;
  if (session.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorEnabled: true, email: true },
    });

    userEmail = user?.email || null;

    if (user?.twoFactorEnabled) {
      // Check if 2FA has been verified for this session
      const cookieStore = await cookies();
      const twoFactorVerified = cookieStore.get("2fa_verified");

      if (!twoFactorVerified || twoFactorVerified.value !== session.user.id) {
        redirect("/verify-2fa");
      }
    }
  }

  return (
    <>
      <ReferralProcessor />
      <EmailCollectionWrapper userId={session.user!.id} userEmail={userEmail}>
        {children}
      </EmailCollectionWrapper>
    </>
  );
}
