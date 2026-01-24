import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SocialPlatform } from "@prisma/client";
import { cookies } from "next/headers";
import { connectTwitterAccount } from "@/lib/services/twitter.service";
import { connectLinkedInAccount } from "@/lib/services/linkedin.service";

// GET /api/platforms/callback/[platform] - Handle OAuth callback
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(request.url);
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${returnUrl}`, request.url)
      );
    }

    const { platform } = await params;
    const platformUpper = platform.toUpperCase() as SocialPlatform;

    // Validate platform
    if (!Object.values(SocialPlatform).includes(platformUpper) || platformUpper === "BUILDERS") {
      return NextResponse.redirect(
        new URL("/settings/platforms?error=invalid_platform", request.url)
      );
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Check for OAuth error
    if (error) {
      console.error(`OAuth error for ${platform}:`, error);
      return NextResponse.redirect(
        new URL(`/settings/platforms?error=${error}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/settings/platforms?error=no_code", request.url)
      );
    }

    // Verify state
    const cookieStore = await cookies();
    const storedState = cookieStore.get(`oauth_state_${platform}`)?.value;

    if (!state || state !== storedState) {
      return NextResponse.redirect(
        new URL("/settings/platforms?error=invalid_state", request.url)
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
            new URL("/settings/platforms?error=no_verifier", request.url)
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
          new URL("/settings/platforms?error=unsupported", request.url)
        );
    }

    if (!success) {
      return NextResponse.redirect(
        new URL("/settings/platforms?error=connection_failed", request.url)
      );
    }

    return NextResponse.redirect(
      new URL(`/settings/platforms?success=${platform}`, request.url)
    );
  } catch (error) {
    console.error("Error handling OAuth callback:", error);
    return NextResponse.redirect(
      new URL("/settings/platforms?error=callback_error", request.url)
    );
  }
}
