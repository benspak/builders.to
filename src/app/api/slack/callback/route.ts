import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID;
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET;
const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/login?callbackUrl=/settings/platforms", BASE_URL));
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      if (error === "access_denied") {
        return NextResponse.redirect(new URL("/settings/platforms?error=access_denied", BASE_URL));
      }
      return NextResponse.redirect(new URL("/settings/platforms?error=callback_error", BASE_URL));
    }

    if (!code) {
      return NextResponse.redirect(new URL("/settings/platforms?error=no_code", BASE_URL));
    }

    const cookieStore = await cookies();
    const storedState = cookieStore.get("oauth_state_slack")?.value;

    if (!state || state !== storedState) {
      return NextResponse.redirect(new URL("/settings/platforms?error=invalid_state", BASE_URL));
    }

    cookieStore.delete("oauth_state_slack");

    if (!SLACK_CLIENT_ID || !SLACK_CLIENT_SECRET) {
      return NextResponse.redirect(
        new URL("/settings/platforms?error=callback_not_configured", BASE_URL)
      );
    }

    const redirectUri = `${BASE_URL}/api/slack/callback`;
    const tokenRes = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: SLACK_CLIENT_ID,
        client_secret: SLACK_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = (await tokenRes.json()) as {
      ok?: boolean;
      team?: { id: string };
      authed_user?: { id: string };
      error?: string;
    };

    if (!tokenData.ok || !tokenData.team?.id || !tokenData.authed_user?.id) {
      console.error("[Slack callback] token exchange failed:", tokenData.error);
      return NextResponse.redirect(
        new URL("/settings/platforms?error=connection_failed", BASE_URL)
      );
    }

    const slackTeamId = tokenData.team.id;
    const slackUserId = tokenData.authed_user.id;
    const userId = session.user.id;

    await prisma.slackConnection.upsert({
      where: { userId },
      create: { userId, slackTeamId, slackUserId },
      update: { slackTeamId, slackUserId },
    });

    return NextResponse.redirect(new URL("/settings/platforms?success=Slack", BASE_URL));
  } catch (error) {
    console.error("[Slack callback] Error:", error);
    return NextResponse.redirect(
      new URL("/settings/platforms?error=connection_failed", BASE_URL)
    );
  }
}
