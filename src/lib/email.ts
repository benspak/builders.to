/**
 * Email utility for sending transactional emails via Resend
 *
 * Required environment variables:
 * - RESEND_API_KEY: Your Resend API key
 * - EMAIL_FROM: The "from" email address (e.g., "Builders.to <noreply@builders.to>")
 *
 * Optional:
 * - EMAIL_DEV_MODE: Set to "true" to log emails instead of sending (for development)
 */

import { Resend } from "resend";

// Initialize Resend client (lazy initialization)
let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const from = process.env.EMAIL_FROM || "Builders.to <onboarding@resend.dev>";
  const devMode = process.env.EMAIL_DEV_MODE === "true";

  // Development mode - just log the email
  if (devMode) {
    console.log("📧 [DEV MODE] Email would be sent:");
    console.log("  From:", from);
    console.log("  To:", options.to);
    console.log("  Subject:", options.subject);
    console.log("  HTML Preview:", options.html.substring(0, 300) + "...");
    return true;
  }

  const resend = getResendClient();

  if (!resend) {
    console.error("RESEND_API_KEY is not configured");
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    });

    if (error) {
      console.error("Resend error:", error);
      return false;
    }

    console.log("✅ Email sent successfully:", data?.id);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

// Batch send emails (Resend supports up to 100 emails per batch)
export async function sendBatchEmails(
  emails: Array<{
    to: string;
    subject: string;
    html: string;
    text?: string;
  }>
): Promise<{ success: number; failed: number }> {
  const from = process.env.EMAIL_FROM || "Builders.to <onboarding@resend.dev>";
  const devMode = process.env.EMAIL_DEV_MODE === "true";

  if (devMode) {
    console.log(`📧 [DEV MODE] Would send ${emails.length} emails`);
    return { success: emails.length, failed: 0 };
  }

  const resend = getResendClient();

  if (!resend) {
    console.error("RESEND_API_KEY is not configured");
    return { success: 0, failed: emails.length };
  }

  let success = 0;
  let failed = 0;

  // Resend batch API supports up to 100 emails
  const batchSize = 100;
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);

    try {
      const { data, error } = await resend.batch.send(
        batch.map((email) => ({
          from,
          to: [email.to],
          subject: email.subject,
          html: email.html,
          text: email.text,
        }))
      );

      if (error) {
        console.error("Batch send error:", error);
        failed += batch.length;
      } else {
        success += data?.data?.length || batch.length;
        console.log(`✅ Batch sent: ${data?.data?.length || batch.length} emails`);
      }
    } catch (error) {
      console.error("Batch send failed:", error);
      failed += batch.length;
    }
  }

  return { success, failed };
}

// Email template for daily activity digest
export function generateDailyDigestEmail(data: {
  userName: string;
  updateLikes: Array<{
    updatePreview: string;
    likerNames: string[];
    totalLikes: number;
  }>;
  projectUpvotes: Array<{
    projectTitle: string;
    projectSlug: string;
    voterNames: string[];
    totalUpvotes: number;
  }>;
  milestoneCelebrations: Array<{
    projectTitle: string;
    projectSlug: string;
    milestoneTitle: string;
    celebratorNames: string[];
    totalCelebrations: number;
  }>;
  baseUrl: string;
}): { html: string; text: string } {
  const { userName, updateLikes, projectUpvotes, milestoneCelebrations, baseUrl } = data;

  const totalActivity = updateLikes.length + projectUpvotes.length + milestoneCelebrations.length;

  // Helper to format names list
  const formatNames = (names: string[], total: number) => {
    if (names.length === 0) return "Someone";
    if (names.length === 1) return names[0];
    if (total <= 2) return names.join(" and ");
    return `${names.slice(0, 2).join(", ")} and ${total - 2} other${total - 2 > 1 ? 's' : ''}`;
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Daily Activity Summary</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #09090b;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Header -->
          <tr>
            <td style="padding: 32px; background: linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(249, 115, 22, 0.05) 100%); border-radius: 16px 16px 0 0;">
              <table width="100%">
                <tr>
                  <td>
                    <img src="${baseUrl}/favicon.ico" alt="Builders.to" width="40" height="40" style="border-radius: 8px;">
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 24px;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">
                      ✨ Your Daily Activity Summary
                    </h1>
                    <p style="margin: 8px 0 0; font-size: 16px; color: #a1a1aa;">
                      Hi ${userName}, here's what happened today!
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Stats Summary -->
          <tr>
            <td style="padding: 24px 32px; background-color: #18181b; border-left: 1px solid rgba(255,255,255,0.1); border-right: 1px solid rgba(255,255,255,0.1);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 16px; background-color: rgba(249, 115, 22, 0.1); border-radius: 12px; border: 1px solid rgba(249, 115, 22, 0.2);">
                    <p style="margin: 0; font-size: 36px; font-weight: 700; color: #f97316;">
                      ${totalActivity}
                    </p>
                    <p style="margin: 4px 0 0; font-size: 14px; color: #a1a1aa;">
                      interaction${totalActivity !== 1 ? 's' : ''} today! 🔥
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${updateLikes.length > 0 ? `
          <!-- Update Likes Section -->
          <tr>
            <td style="padding: 24px 32px; background-color: #18181b; border-left: 1px solid rgba(255,255,255,0.1); border-right: 1px solid rgba(255,255,255,0.1);">
              <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #ffffff;">
                ❤️ Status Likes
              </h2>

              ${updateLikes.map(u => `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                <tr>
                  <td style="padding: 16px; background-color: #27272a; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                    <p style="margin: 0; font-size: 14px; color: #a1a1aa; font-style: italic;">
                      "${u.updatePreview}"
                    </p>
                    <p style="margin: 8px 0 0; font-size: 13px; color: #ef4444;">
                      ❤️ ${formatNames(u.likerNames, u.totalLikes)} liked this
                    </p>
                  </td>
                </tr>
              </table>
              `).join('')}
            </td>
          </tr>
          ` : ''}

          ${projectUpvotes.length > 0 ? `
          <!-- Project Upvotes Section -->
          <tr>
            <td style="padding: 24px 32px; background-color: #18181b; border-left: 1px solid rgba(255,255,255,0.1); border-right: 1px solid rgba(255,255,255,0.1);">
              <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #ffffff;">
                👍 Project Upvotes
              </h2>

              ${projectUpvotes.map(p => `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                <tr>
                  <td style="padding: 16px; background-color: #27272a; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                    <table width="100%">
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 16px; font-weight: 600; color: #ffffff;">
                            ${p.projectTitle}
                          </p>
                          <p style="margin: 8px 0 0; font-size: 13px; color: #22c55e;">
                            👍 ${formatNames(p.voterNames, p.totalUpvotes)} upvoted
                          </p>
                        </td>
                        <td align="right" valign="top">
                          <a href="${baseUrl}/projects/${p.projectSlug}" style="display: inline-block; padding: 8px 16px; background-color: rgba(249, 115, 22, 0.1); color: #f97316; font-size: 13px; font-weight: 500; text-decoration: none; border-radius: 8px; border: 1px solid rgba(249, 115, 22, 0.3);">
                            View →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              `).join('')}
            </td>
          </tr>
          ` : ''}

          ${milestoneCelebrations.length > 0 ? `
          <!-- Milestone Celebrations Section -->
          <tr>
            <td style="padding: 24px 32px; background-color: #18181b; border-left: 1px solid rgba(255,255,255,0.1); border-right: 1px solid rgba(255,255,255,0.1);">
              <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #ffffff;">
                🎉 Milestone Celebrations
              </h2>

              ${milestoneCelebrations.map(m => `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                <tr>
                  <td style="padding: 16px; background-color: #27272a; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                    <table width="100%">
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 16px; font-weight: 600; color: #ffffff;">
                            ${m.projectTitle}
                          </p>
                          <p style="margin: 4px 0 0; font-size: 14px; color: #fbbf24;">
                            ${m.milestoneTitle}
                          </p>
                          <p style="margin: 8px 0 0; font-size: 13px; color: #a78bfa;">
                            🎉 ${formatNames(m.celebratorNames, m.totalCelebrations)} celebrated
                          </p>
                        </td>
                        <td align="right" valign="top">
                          <a href="${baseUrl}/projects/${m.projectSlug}" style="display: inline-block; padding: 8px 16px; background-color: rgba(249, 115, 22, 0.1); color: #f97316; font-size: 13px; font-weight: 500; text-decoration: none; border-radius: 8px; border: 1px solid rgba(249, 115, 22, 0.3);">
                            View →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              `).join('')}
            </td>
          </tr>
          ` : ''}

          <!-- CTA -->
          <tr>
            <td style="padding: 24px 32px; background-color: #18181b; border-left: 1px solid rgba(255,255,255,0.1); border-right: 1px solid rgba(255,255,255,0.1);">
              <table width="100%">
                <tr>
                  <td align="center">
                    <a href="${baseUrl}/feed" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 10px;">
                      View Builder Feed →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #18181b; border-radius: 0 0 16px 16px; border: 1px solid rgba(255,255,255,0.1); border-top: none;">
              <table width="100%">
                <tr>
                  <td align="center">
                    <p style="margin: 0; font-size: 12px; color: #71717a;">
                      You're receiving this because you're subscribed to daily activity digests on Builders.to
                    </p>
                    <p style="margin: 8px 0 0; font-size: 12px; color: #71717a;">
                      <a href="${baseUrl}/settings" style="color: #71717a; text-decoration: underline;">
                        Manage email preferences
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  // Plain text version
  const textSections: string[] = [];

  if (updateLikes.length > 0) {
    textSections.push("❤️ Status Likes:");
    updateLikes.forEach(u => {
      textSections.push(`  - "${u.updatePreview}" - ${formatNames(u.likerNames, u.totalLikes)} liked this`);
    });
    textSections.push("");
  }

  if (projectUpvotes.length > 0) {
    textSections.push("👍 Project Upvotes:");
    projectUpvotes.forEach(p => {
      textSections.push(`  - ${p.projectTitle} - ${formatNames(p.voterNames, p.totalUpvotes)} upvoted`);
    });
    textSections.push("");
  }

  if (milestoneCelebrations.length > 0) {
    textSections.push("🎉 Milestone Celebrations:");
    milestoneCelebrations.forEach(m => {
      textSections.push(`  - ${m.projectTitle}: ${m.milestoneTitle} - ${formatNames(m.celebratorNames, m.totalCelebrations)} celebrated`);
    });
    textSections.push("");
  }

  const text = `
Your Daily Activity Summary - Builders.to

Hi ${userName}!

You had ${totalActivity} interaction${totalActivity !== 1 ? 's' : ''} today! 🔥

${textSections.join('\n')}
View the full feed: ${baseUrl}/feed

---
Manage email preferences: ${baseUrl}/settings
  `.trim();

  return { html, text };
}

// Email template for daily accountability update reminder
export function generateAccountabilityReminderEmail(data: {
  userName: string;
  partnerNames: string[];
  currentStreak: number;
  baseUrl: string;
}): { html: string; text: string } {
  const { userName, partnerNames, currentStreak, baseUrl } = data;

  const partnerList = partnerNames.length === 1
    ? partnerNames[0]
    : partnerNames.length === 2
      ? partnerNames.join(" and ")
      : `${partnerNames.slice(0, -1).join(", ")}, and ${partnerNames[partnerNames.length - 1]}`;

  const streakMessage = currentStreak > 0
    ? `You're on a <strong style="color: #f97316;">${currentStreak}-day streak</strong> — don't break it!`
    : "Start a new streak today by posting your update!";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Time to Check In!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #09090b;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Header -->
          <tr>
            <td style="padding: 32px; background: linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(249, 115, 22, 0.05) 100%); border-radius: 16px 16px 0 0;">
              <table width="100%">
                <tr>
                  <td>
                    <img src="${baseUrl}/favicon.ico" alt="Builders.to" width="40" height="40" style="border-radius: 8px;">
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 24px;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">
                      Time to Check In!
                    </h1>
                    <p style="margin: 8px 0 0; font-size: 16px; color: #a1a1aa;">
                      Hi ${userName}, your accountability partner${partnerNames.length > 1 ? 's are' : ' is'} counting on you.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Streak & Partner Info -->
          <tr>
            <td style="padding: 24px 32px; background-color: #18181b; border-left: 1px solid rgba(255,255,255,0.1); border-right: 1px solid rgba(255,255,255,0.1);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px; background-color: rgba(249, 115, 22, 0.1); border-radius: 12px; border: 1px solid rgba(249, 115, 22, 0.2);">
                    <p style="margin: 0; font-size: 14px; color: #a1a1aa;">
                      ${streakMessage}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Partner Section -->
          <tr>
            <td style="padding: 24px 32px; background-color: #18181b; border-left: 1px solid rgba(255,255,255,0.1); border-right: 1px solid rgba(255,255,255,0.1);">
              <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #ffffff;">
                Your Accountability Partner${partnerNames.length > 1 ? 's' : ''}
              </h2>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 16px; background-color: #27272a; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                    <p style="margin: 0; font-size: 14px; color: #e4e4e7;">
                      ${partnerList}
                    </p>
                    <p style="margin: 8px 0 0; font-size: 13px; color: #a1a1aa;">
                      Share what you worked on today — even small progress counts.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 24px 32px; background-color: #18181b; border-left: 1px solid rgba(255,255,255,0.1); border-right: 1px solid rgba(255,255,255,0.1);">
              <table width="100%">
                <tr>
                  <td align="center">
                    <a href="${baseUrl}/accountability" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 10px;">
                      Post Your Update
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #18181b; border-radius: 0 0 16px 16px; border: 1px solid rgba(255,255,255,0.1); border-top: none;">
              <table width="100%">
                <tr>
                  <td align="center">
                    <p style="margin: 0; font-size: 12px; color: #71717a;">
                      You're receiving this because you have active accountability partnerships on Builders.to
                    </p>
                    <p style="margin: 8px 0 0; font-size: 12px; color: #71717a;">
                      <a href="${baseUrl}/settings" style="color: #71717a; text-decoration: underline;">
                        Manage email preferences
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Time to Check In! - Builders.to

Hi ${userName}!

Your accountability partner${partnerNames.length > 1 ? 's are' : ' is'} counting on you.

${currentStreak > 0 ? `You're on a ${currentStreak}-day streak — don't break it!` : 'Start a new streak today by posting your update!'}

Your partner${partnerNames.length > 1 ? 's' : ''}: ${partnerList}

Share what you worked on today — even small progress counts.

Post your update: ${baseUrl}/accountability

---
Manage email preferences: ${baseUrl}/settings
  `.trim();

  return { html, text };
}
