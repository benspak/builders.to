import { prisma } from "@/lib/prisma";

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_API_BASE = "https://slack.com/api";

export interface SlackBlock {
  type: string;
  text?: { type: string; text: string };
  elements?: Array<{
    type: string;
    text?: { type: string; text: string };
    url?: string;
    action_id?: string;
  }>;
  block_id?: string;
}

/**
 * Get Slack connection for a Builders.to user (if any).
 */
export async function getSlackConnectionByUserId(
  userId: string
): Promise<{ slackUserId: string; slackTeamId: string } | null> {
  const conn = await prisma.slackConnection.findUnique({
    where: { userId },
    select: { slackUserId: true, slackTeamId: true },
  });
  return conn;
}

/**
 * Get Builders.to userId for a Slack (team_id, user_id). Used by slash command handler.
 */
export async function getUserIdBySlackConnection(
  slackTeamId: string,
  slackUserId: string
): Promise<string | null> {
  const conn = await prisma.slackConnection.findUnique({
    where: {
      slackTeamId_slackUserId: { slackTeamId, slackUserId },
    },
    select: { userId: true },
  });
  return conn?.userId ?? null;
}

/**
 * Open or get existing DM channel with a user, then post a message.
 * Returns true if sent, false if token missing or API error.
 */
export async function sendSlackDM(
  slackUserId: string,
  text: string,
  blocks?: SlackBlock[]
): Promise<boolean> {
  if (!SLACK_BOT_TOKEN) {
    return false;
  }

  try {
    const openRes = await fetch(`${SLACK_API_BASE}/conversations.open`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
      },
      body: JSON.stringify({ users: slackUserId }),
    });

    const openData = (await openRes.json()) as {
      ok?: boolean;
      channel?: { id: string };
      error?: string;
    };

    if (!openData.ok || !openData.channel?.id) {
      console.error(
        "[Slack] conversations.open failed:",
        openData.error ?? openRes.status,
        "- Add Bot Token Scope im:write and enable App Home Messages tab. See docs/SLACK_APP_SETUP.md"
      );
      return false;
    }

    const channelId = openData.channel.id;

    const postBody: { channel: string; text: string; blocks?: SlackBlock[] } = {
      channel: channelId,
      text,
    };
    if (blocks && blocks.length > 0) {
      postBody.blocks = blocks;
    }

    const postRes = await fetch(`${SLACK_API_BASE}/chat.postMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
      },
      body: JSON.stringify(postBody),
    });

    const postData = (await postRes.json()) as { ok?: boolean; error?: string };

    if (!postData.ok) {
      console.error(
        "[Slack] chat.postMessage failed:",
        postData.error ?? postRes.status,
        postData.error === "messages_tab_disabled"
          ? "- In Slack app: App Home → enable Messages tab. See docs/SLACK_APP_SETUP.md"
          : ""
      );
      return false;
    }

    return true;
  } catch (err) {
    console.error("[Slack] sendSlackDM error:", err);
    return false;
  }
}

/**
 * Build a simple Block Kit message with optional "View" link button.
 */
export function buildSlackBlocks(title: string, body: string, url?: string): SlackBlock[] {
  const blocks: SlackBlock[] = [
    {
      type: "section",
      text: { type: "mrkdwn", text: `*${title}*\n${body}` },
    },
  ];
  if (url) {
    blocks.push({
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "View" },
          url,
          action_id: "view_link",
        },
      ],
    });
  }
  return blocks;
}
