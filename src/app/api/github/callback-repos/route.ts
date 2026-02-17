import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

/**
 * Callback handler for incremental GitHub OAuth (repo scope).
 * Exchanges the authorization code for a new access token that includes
 * the `repo` scope, then updates the stored Account record.
 */
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    const baseUrl = process.env.NEXTAUTH_URL || "https://builders.to";
    return NextResponse.redirect(`${baseUrl}/signin`);
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXTAUTH_URL || "https://builders.to";
  const importUrl = `${baseUrl}/projects/import`;

  // Handle user denying access
  if (error) {
    return NextResponse.redirect(
      `${importUrl}?github_error=${encodeURIComponent(error)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${importUrl}?github_error=missing_params`
    );
  }

  // Verify CSRF state token
  const cookieStore = await cookies();
  const storedState = cookieStore.get("github_repo_oauth_state")?.value;
  cookieStore.delete("github_repo_oauth_state");

  if (!storedState || storedState !== state) {
    return NextResponse.redirect(
      `${importUrl}?github_error=invalid_state`
    );
  }

  // Exchange code for access token
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${importUrl}?github_error=not_configured`
    );
  }

  try {
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: `${baseUrl}/api/github/callback-repos`,
        }),
      }
    );

    if (!tokenResponse.ok) {
      console.error(
        "GitHub token exchange failed:",
        await tokenResponse.text()
      );
      return NextResponse.redirect(
        `${importUrl}?github_error=token_exchange_failed`
      );
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("GitHub token error:", tokenData.error);
      return NextResponse.redirect(
        `${importUrl}?github_error=${encodeURIComponent(tokenData.error)}`
      );
    }

    // Update the existing GitHub Account record with the new token and scopes
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "github",
      },
    });

    if (!account) {
      return NextResponse.redirect(
        `${importUrl}?github_error=no_github_account`
      );
    }

    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token: tokenData.access_token,
        token_type: tokenData.token_type || "bearer",
        scope: tokenData.scope || "read:user,user:email,repo",
      },
    });

    return NextResponse.redirect(
      `${importUrl}?github_repos_authorized=true`
    );
  } catch (err) {
    console.error("Error during GitHub repo authorization:", err);
    return NextResponse.redirect(
      `${importUrl}?github_error=unexpected_error`
    );
  }
}
