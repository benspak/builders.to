import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AccountabilityDashboard } from "./dashboard";

export const metadata: Metadata = {
  title: "Accountability Partners | Builders",
  description: "Find accountability partners and stay on track with your building goals.",
};

export const dynamic = "force-dynamic";

export default async function AccountabilityPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/accountability");
  }

  return <AccountabilityDashboard userId={session.user.id} />;
}
