import { redirect } from "next/navigation";

interface ProfileRedirectProps {
  params: Promise<{ slug: string }>;
}

// Redirect old /profile/[slug] URLs to new /[slug] URLs
export default async function ProfileRedirect({ params }: ProfileRedirectProps) {
  const { slug } = await params;
  redirect(`/${slug}`);
}
