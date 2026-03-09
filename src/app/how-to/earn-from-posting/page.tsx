import { redirect } from "next/navigation";

/**
 * Creator Rewards / Earn From Posting has been removed from the platform.
 * Redirect legacy links to the How To index.
 */
export default function EarnFromPostingRedirect() {
  redirect("/how-to");
}
