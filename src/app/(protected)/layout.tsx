import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
  // Also fetch email and verification status
  let userEmail: string | null = null;
  let emailVerified = false;
  if (session.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorEnabled: true, email: true, emailVerified: true },
    });

    userEmail = user?.email || null;
    emailVerified = !!user?.emailVerified;

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
    <EmailCollectionWrapper 
      userId={session.user!.id} 
      userEmail={userEmail}
      emailVerified={emailVerified}
    >
      {children}
    </EmailCollectionWrapper>
  );
}
