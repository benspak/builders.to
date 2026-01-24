import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SocialPlatform } from "@prisma/client";
import crypto from "crypto";
import { cookies } from "next/headers";
import { getTwitterAuthUrl } from "@/lib/services/twitter.service";
import { getLinkedInAuthUrl } from "@/lib/services/linkedin.service";

// Helper to generate PKCE code verifier and challenge
function generatePKCE(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");
  return { codeVerifier, codeChallenge };
}

// GET /api/platforms/connect/[platform] - Initiate OAuth connection
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { platform } = await params;
    const platformUpper = platform.toUpperCase() as SocialPlatform;

    // Validate platform
    if (!Object.values(SocialPlatform).includes(platformUpper) || platformUpper === "BUILDERS") {
      return NextResponse.json(
        { error: "Invalid platform" },
        { status: 400 }
      );
    }

    // Generate state for CSRF protection
    const state = crypto.randomBytes(16).toString("hex");
    
    // Store state in cookie for verification
    const cookieStore = await cookies();
    cookieStore.set(`oauth_state_${platform}`, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    });

    let authUrl: string;

    switch (platformUpper) {
      case SocialPlatform.TWITTER: {
        // Twitter uses PKCE
        const { codeVerifier, codeChallenge } = generatePKCE();
        cookieStore.set(`oauth_verifier_${platform}`, codeVerifier, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 600,
          path: "/",
        });
        authUrl = getTwitterAuthUrl(state, codeChallenge);
        break;
      }

      case SocialPlatform.LINKEDIN:
        authUrl = getLinkedInAuthUrl(state);
        break;

      default:
        return NextResponse.json(
          { error: "Platform not supported" },
          { status: 400 }
        );
    }

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Error initiating OAuth:", error);
    return NextResponse.json(
      { error: "Failed to initiate OAuth" },
      { status: 500 }
    );
  }
}
