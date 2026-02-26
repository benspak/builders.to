import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getUserIdBySlackConnection } from "@/lib/slack";
import { createDailyUpdateForUser } from "@/lib/services/updates.service";

const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;
const BASE_URL = process.env.NEXTAUTH_URL || "https://builders.to";

function verifySlackRequest(
  rawBody: string,
  signature: string | null,
  timestamp: string | null
): boolean {
  if (!SLACK_SIGNING_SECRET || !signature?.startsWith("v0=") || !timestamp) return false;
  const now = Math.floor(Date.now() / 1000);
  const ts = parseInt(timestamp, 10);
  if (Math.abs(now - ts) > 60 * 5) return false; // 5 min replay window
  const base = `v0:${timestamp}:${rawBody}`;
  const expected =
    "v0=" + crypto.createHmac("sha256", SLACK_SIGNING_SECRET).update(base).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature, "utf8"), Buffer.from(expected, "utf8"));
  } catch {
    return false;
  }
}

function parseFormBody(body: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of body.split("&")) {
    const [k, v] = part.split("=");
    if (k && v !== undefined)
      out[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, " "));
  }
  return out;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-slack-signature");
  const timestamp = request.headers.get("x-slack-request-timestamp");

  if (!verifySlackRequest(rawBody, signature, timestamp)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const params = parseFormBody(rawBody);

  if (params.payload) {
    let payload: {
      type?: string;
      view?: {
        private_metadata?: string;
        state?: { values?: Record<string, Record<string, { value?: string }>> };
      };
    };
    try {
      payload = JSON.parse(params.payload);
    } catch {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (payload.type === "view_submission" && payload.view) {
      const userId = payload.view.private_metadata;
      if (!userId) {
        return NextResponse.json({ response_action: "errors", errors: {} }, { status: 200 });
      }
      const values = payload.view.state?.values ?? {};
      const content = (values.content as Record<string, { value?: string }> | undefined)?.content?.value?.trim() ?? "";
      if (!content || content.length > 10000) {
        return NextResponse.json(
          {
            response_action: "errors",
            errors: {
              content: content.length > 10000 ? "Max 10,000 characters" : "Content is required",
            },
          },
          { status: 200 }
        );
      }
      try {
        await createDailyUpdateForUser(userId, content);
        return NextResponse.json({ response_action: "clear" });
      } catch (err) {
        console.error("[Slack modal] createDailyUpdateForUser error:", err);
        return NextResponse.json(
          { response_action: "errors", errors: { content: "Failed to post. Try again." } },
          { status: 200 }
        );
      }
    }
  }

  const teamId = params.team_id;
  const userIdSlack = params.user_id;
  const text = (params.text ?? "").trim();

  if (!teamId || !userIdSlack) {
    return NextResponse.json(
      { text: "Missing team or user. Connect Slack in Settings first." },
      { status: 200 }
    );
  }

  const userId = await getUserIdBySlackConnection(teamId, userIdSlack);
  if (!userId) {
    return NextResponse.json(
      {
        response_type: "ephemeral",
        text: `Connect your Slack in Builders.to first: ${BASE_URL}/settings/platforms`,
      },
      { status: 200 }
    );
  }

  if (!text) {
    const modal = {
      type: "modal",
      callback_id: "builders_post_modal",
      title: { type: "plain_text", text: "Post daily update" },
      submit: { type: "plain_text", text: "Post" },
      private_metadata: userId,
      blocks: [
        {
          type: "input",
          block_id: "content",
          element: {
            type: "plain_text_input",
            action_id: "content",
            multiline: true,
            placeholder: { type: "plain_text", text: "What did you ship today?" },
          },
          label: { type: "plain_text", text: "Update" },
        },
      ],
    };
    return NextResponse.json({ response_action: "push", view: modal }, { status: 200 });
  }

  if (text.length > 10000) {
    return NextResponse.json(
      { response_type: "ephemeral", text: "Update must be 10,000 characters or less." },
      { status: 200 }
    );
  }

  try {
    const { url } = await createDailyUpdateForUser(userId, text);
    return NextResponse.json(
      { response_type: "ephemeral", text: `Posted! <${url}|View on Builders.to>` },
      { status: 200 }
    );
  } catch (err) {
    console.error("[Slack command] createDailyUpdateForUser error:", err);
    return NextResponse.json(
      { response_type: "ephemeral", text: "Failed to post. Try again later." },
      { status: 200 }
    );
  }
}
