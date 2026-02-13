import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPartnershipRequest } from "@/lib/services/accountability.service";
import { sendUserPushNotification } from "@/lib/push-notifications";
import { sendEmail } from "@/lib/email";
import { CheckInFrequency } from "@prisma/client";

// POST /api/accountability/request - Send a partnership request
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { partnerId, goal, checkInFrequency, endDate } = body;

    if (!partnerId) {
      return NextResponse.json(
        { error: "Partner ID is required" },
        { status: 400 }
      );
    }

    // Validate checkInFrequency if provided
    if (checkInFrequency && !["DAILY", "WEEKDAYS", "WEEKLY"].includes(checkInFrequency)) {
      return NextResponse.json(
        { error: "Invalid check-in frequency" },
        { status: 400 }
      );
    }

    const result = await createPartnershipRequest({
      requesterId: session.user.id,
      partnerId,
      goal: goal || undefined,
      checkInFrequency: checkInFrequency as CheckInFrequency | undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Create notification for the partner
    const requester = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, firstName: true, lastName: true, image: true, slug: true },
    });

    const requesterName = requester?.firstName && requester?.lastName
      ? `${requester.firstName} ${requester.lastName}`
      : requester?.name || "Someone";

    await prisma.notification.create({
      data: {
        type: "ACCOUNTABILITY_REQUEST",
        title: "New accountability partner request",
        message: `${requesterName} wants to be your accountability partner${goal ? `: "${goal}"` : ""}`,
        userId: partnerId,
        actorId: session.user.id,
        actorName: requesterName,
        actorImage: requester?.image,
      },
    });

    // Send push notification
    sendUserPushNotification(partnerId, {
      title: "Accountability Partner Request",
      body: `${requesterName} wants to be your accountability partner`,
      url: "/accountability",
      tag: "accountability-request",
    }).catch(console.error);

    // Send email notification to the partner
    const partner = await prisma.user.findUnique({
      where: { id: partnerId },
      select: { email: true, name: true, firstName: true },
    });

    if (partner?.email) {
      const partnerDisplayName = partner.firstName || partner.name || "there";
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://builders.to";
      const goalText = goal ? `\n\nGoal: "${goal}"` : "";

      sendEmail({
        to: partner.email,
        subject: `${requesterName} wants to be your accountability partner on Builders.to`,
        html: generateAccountabilityRequestEmail({
          partnerName: partnerDisplayName,
          requesterName,
          requesterImage: requester?.image || null,
          goal: goal || null,
          baseUrl,
        }),
        text: `Hi ${partnerDisplayName},\n\n${requesterName} wants to be your accountability partner on Builders.to!${goalText}\n\nView and respond to this request: ${baseUrl}/accountability\n\n—\nBuilders.to`,
      }).catch((err) => console.error("Failed to send accountability request email:", err));
    }

    return NextResponse.json({
      success: true,
      partnershipId: result.partnershipId,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating partnership request:", error);
    return NextResponse.json(
      { error: "Failed to create partnership request" },
      { status: 500 }
    );
  }
}

// Generate HTML email for accountability partner request
function generateAccountabilityRequestEmail(data: {
  partnerName: string;
  requesterName: string;
  requesterImage: string | null;
  goal: string | null;
  baseUrl: string;
}): string {
  const { partnerName, requesterName, requesterImage, goal, baseUrl } = data;

  const avatarHtml = requesterImage
    ? `<img src="${requesterImage}" alt="${requesterName}" width="64" height="64" style="border-radius: 50%; border: 2px solid rgba(249, 115, 22, 0.3);">`
    : `<div style="width: 64px; height: 64px; border-radius: 50%; background-color: #27272a; border: 2px solid rgba(249, 115, 22, 0.3); display: flex; align-items: center; justify-content: center; font-size: 28px; color: #f97316; font-weight: 700; line-height: 64px; text-align: center;">${requesterName.charAt(0).toUpperCase()}</div>`;

  const goalHtml = goal
    ? `
          <tr>
            <td style="padding: 16px; background-color: #27272a; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); margin-top: 16px;">
              <p style="margin: 0; font-size: 12px; font-weight: 600; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.05em;">Shared Goal</p>
              <p style="margin: 8px 0 0; font-size: 15px; color: #ffffff; font-style: italic;">"${goal}"</p>
            </td>
          </tr>`
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Accountability Partner Request</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #09090b;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Header -->
          <tr>
            <td style="padding: 32px; background: linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(20, 184, 166, 0.05) 100%); border-radius: 16px 16px 0 0;">
              <table width="100%">
                <tr>
                  <td>
                    <img src="${baseUrl}/favicon.ico" alt="Builders.to" width="40" height="40" style="border-radius: 8px;">
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 24px;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff;">
                      New Accountability Partner Request
                    </h1>
                    <p style="margin: 8px 0 0; font-size: 16px; color: #a1a1aa;">
                      Hi ${partnerName}, someone wants to build with you!
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Request Details -->
          <tr>
            <td style="padding: 32px; background-color: #18181b; border-left: 1px solid rgba(255,255,255,0.1); border-right: 1px solid rgba(255,255,255,0.1);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    ${avatarHtml}
                    <p style="margin: 16px 0 0; font-size: 20px; font-weight: 600; color: #ffffff;">
                      ${requesterName}
                    </p>
                    <p style="margin: 4px 0 0; font-size: 15px; color: #a1a1aa;">
                      wants to be your accountability partner
                    </p>
                  </td>
                </tr>
                ${goalHtml}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 24px 32px; background-color: #18181b; border-left: 1px solid rgba(255,255,255,0.1); border-right: 1px solid rgba(255,255,255,0.1);">
              <table width="100%">
                <tr>
                  <td align="center">
                    <a href="${baseUrl}/accountability" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 10px;">
                      View Request
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
                      You're receiving this because someone sent you an accountability partner request on Builders.to
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
}
