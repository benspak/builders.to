import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DiscoverDashboard } from "./discover-dashboard";

export const metadata: Metadata = {
  title: "Discover Builders | Builders",
  description: "Find builders near you, connect with those building similar things, and find accountability partners.",
};

export const dynamic = "force-dynamic";

export default async function DiscoverPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/discover");
  }

  return <DiscoverDashboard userId={session.user.id} />;
}
