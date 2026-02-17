import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import crypto from "crypto";

/**
 * Initiates incremental GitHub OAuth authorization to add the `repo` scope.
 * Users are only sent through this flow when they explicitly want to import
 * repos — the default sign-in only requests `read:user user:email`.
 */
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "GitHub OAuth not configured" },
      { status: 500 }
    );
  }

  // Generate a CSRF state token and store it in a secure cookie
  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set("github_repo_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  const baseUrl = process.env.NEXTAUTH_URL || "https://builders.to";
  const redirectUri = `${baseUrl}/api/github/callback-repos`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "read:user user:email repo",
    state,
    allow_signup: "false",
  });

  const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

  return NextResponse.redirect(githubAuthUrl);
}
