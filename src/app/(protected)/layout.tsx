import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ReferralProcessor } from "@/components/auth/referral-processor";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/signin");
  }

  return (
    <>
      <ReferralProcessor />
      {children}
    </>
  );
}
