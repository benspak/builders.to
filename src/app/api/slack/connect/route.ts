import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import crypto from "crypto";
import { cookies } from "next/headers";

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID;
const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/login?callbackUrl=/settings/platforms", BASE_URL));
    }

    if (!SLACK_CLIENT_ID) {
      return NextResponse.redirect(
        new URL("/settings/platforms?error=callback_not_configured", BASE_URL)
      );
    }

    const state = crypto.randomBytes(16).toString("hex");
    const cookieStore = await cookies();
    cookieStore.set("oauth_state_slack", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    const redirectUri = `${BASE_URL}/api/slack/callback`;
    const scope = "chat:write,commands";
    const authUrl = new URL("https://slack.com/oauth/v2/authorize");
    authUrl.searchParams.set("client_id", SLACK_CLIENT_ID);
    authUrl.searchParams.set("scope", scope);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("state", state);

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error("[Slack connect] Error:", error);
    return NextResponse.redirect(
      new URL("/settings/platforms?error=callback_error", BASE_URL)
    );
  }
}
