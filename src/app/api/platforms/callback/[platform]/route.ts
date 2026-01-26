import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SocialPlatform } from "@prisma/client";
import { cookies } from "next/headers";
import { connectTwitterAccount } from "@/lib/services/twitter.service";
import { connectLinkedInAccount } from "@/lib/services/linkedin.service";

// Get the base URL for redirects - use NEXTAUTH_URL in production to avoid proxy issues
function getBaseUrl(request: NextRequest): string {
  // In production, always use NEXTAUTH_URL to ensure correct domain
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  // Fallback to request URL for development
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

// GET /api/platforms/callback/[platform] - Handle OAuth callback
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const baseUrl = getBaseUrl(request);

  try {
    const session = await auth();

    if (!session?.user?.id) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(request.url);
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${returnUrl}`, baseUrl)
      );
    }

    const { platform } = await params;
    const platformUpper = platform.toUpperCase() as SocialPlatform;

    // Validate platform
    if (!Object.values(SocialPlatform).includes(platformUpper) || platformUpper === "BUILDERS") {
      return NextResponse.redirect(
        new URL("/settings/platforms?error=invalid_platform", baseUrl)
      );
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Check for OAuth error
    if (error) {
      const errorDescription = searchParams.get("error_description");
      console.error(`OAuth error for ${platform}:`, error, errorDescription);

      // Map common OAuth errors to user-friendly messages
      let errorCode = error;
      if (error === "access_denied") {
        errorCode = "access_denied";
      } else if (errorDescription?.includes("callback")) {
        errorCode = "callback_not_configured";
      }

      return NextResponse.redirect(
        new URL(`/settings/platforms?error=${errorCode}`, baseUrl)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/settings/platforms?error=no_code", baseUrl)
      );
    }

    // Verify state
    const cookieStore = await cookies();
    const storedState = cookieStore.get(`oauth_state_${platform}`)?.value;

    if (!state || state !== storedState) {
      return NextResponse.redirect(
        new URL("/settings/platforms?error=invalid_state", baseUrl)
      );
    }

    // Clear state cookie
    cookieStore.delete(`oauth_state_${platform}`);

    let success = false;

    switch (platformUpper) {
      case SocialPlatform.TWITTER: {
        // Get PKCE verifier
        const codeVerifier = cookieStore.get(`oauth_verifier_${platform}`)?.value;
        cookieStore.delete(`oauth_verifier_${platform}`);

        if (!codeVerifier) {
          return NextResponse.redirect(
            new URL("/settings/platforms?error=no_verifier", baseUrl)
          );
        }

        success = await connectTwitterAccount(session.user.id, code, codeVerifier);
        break;
      }

      case SocialPlatform.LINKEDIN:
        success = await connectLinkedInAccount(session.user.id, code);
        break;

      default:
        return NextResponse.redirect(
          new URL("/settings/platforms?error=unsupported", baseUrl)
        );
    }

    if (!success) {
      return NextResponse.redirect(
        new URL("/settings/platforms?error=connection_failed", baseUrl)
      );
    }

    return NextResponse.redirect(
      new URL(`/settings/platforms?success=${platform}`, baseUrl)
    );
  } catch (error) {
    console.error("Error handling OAuth callback:", error);
    return NextResponse.redirect(
      new URL("/settings/platforms?error=callback_error", baseUrl)
    );
  }
}
