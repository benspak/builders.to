import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { rateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

// Admin email for report notifications
const ADMIN_EMAIL = "benvspak@gmail.com";

// Valid content types and their respective tables
const CONTENT_TYPE_CONFIG = {
  USER: { table: "user", idField: "id" },
  PROJECT: { table: "project", idField: "id" },
  SERVICE_LISTING: { table: "serviceListing", idField: "id" },
  LOCAL_LISTING: { table: "localListing", idField: "id" },
  DAILY_UPDATE: { table: "dailyUpdate", idField: "id" },
  COMMENT: { table: "feedEventComment", idField: "id" },
} as const;

const REASON_LABELS: Record<string, string> = {
  SPAM: "Spam or misleading content",
  INAPPROPRIATE: "Inappropriate or offensive content",
  HARASSMENT: "Harassment or bullying",
  IMPERSONATION: "Fake identity or impersonation",
  SCAM: "Fraudulent or scam content",
  COPYRIGHT: "Copyright violation",
  OTHER: "Other",
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
  USER: "User Profile",
  PROJECT: "Project",
  SERVICE_LISTING: "Service Listing",
  LOCAL_LISTING: "Local Listing",
  DAILY_UPDATE: "Daily Update",
  COMMENT: "Comment",
};

/**
 * POST /api/reports
 * Submit a content report
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit check
    const { success, reset } = rateLimit(request, RATE_LIMITS.comment);
    if (!success) {
      return rateLimitResponse(reset);
    }

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to report content" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { contentType, contentId, reason, description } = body;

    // Validate content type
    if (!contentType || !Object.keys(CONTENT_TYPE_CONFIG).includes(contentType)) {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400 }
      );
    }

    // Validate reason
    const validReasons = ["SPAM", "INAPPROPRIATE", "HARASSMENT", "IMPERSONATION", "SCAM", "COPYRIGHT", "OTHER"];
    if (!reason || !validReasons.includes(reason)) {
      return NextResponse.json(
        { error: "Valid reason is required" },
        { status: 400 }
      );
    }

    // Require description for "OTHER" reason
    if (reason === "OTHER" && (!description || description.trim().length < 10)) {
      return NextResponse.json(
        { error: "Please provide a description (at least 10 characters) for your report" },
        { status: 400 }
      );
    }

    if (!contentId) {
      return NextResponse.json(
        { error: "Content ID is required" },
        { status: 400 }
      );
    }

    // Verify the content exists
    const config = CONTENT_TYPE_CONFIG[contentType as keyof typeof CONTENT_TYPE_CONFIG];
    let content: { id: string; userId?: string; title?: string; name?: string; content?: string } | null = null;

    try {
      // Use dynamic table access
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      content = await (prisma as any)[config.table].findUnique({
        where: { [config.idField]: contentId },
        select: {
          id: true,
          ...(config.table !== "user" ? { userId: true } : {}),
          ...(config.table === "user" ? { name: true } : {}),
          ...(config.table === "project" || config.table === "serviceListing" || config.table === "localListing" ? { title: true } : {}),
          ...(config.table === "dailyUpdate" || config.table === "feedEventComment" ? { content: true } : {}),
        },
      });
    } catch {
      // Table access error
    }

    if (!content) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }

    // Can't report your own content
    const isOwnContent =
      (contentType === "USER" && contentId === session.user.id) ||
      (content.userId === session.user.id);

    if (isOwnContent) {
      return NextResponse.json(
        { error: "You cannot report your own content" },
        { status: 403 }
      );
    }

    // Check if user already reported this content
    const existingReport = await prisma.report.findUnique({
      where: {
        reporterId_contentType_contentId: {
          reporterId: session.user.id,
          contentType,
          contentId,
        },
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this content" },
        { status: 409 }
      );
    }

    // Create the report
    const report = await prisma.report.create({
      data: {
        contentType,
        contentId,
        reason,
        description: description?.trim() || null,
        reporterId: session.user.id,
        reporterEmail: session.user.email || null,
      },
    });

    // Send email notification to admin
    const contentTitle = content.title || content.name || content.content?.slice(0, 50) || contentId;
    const baseUrl = process.env.NEXTAUTH_URL || "https://builders.to";

    const emailSent = await sendEmail({
      to: ADMIN_EMAIL,
      subject: `[Report] ${CONTENT_TYPE_LABELS[contentType]}: ${REASON_LABELS[reason]}`,
      html: generateReportEmailHtml({
        contentType,
        contentId,
        contentTitle,
        reason,
        reasonLabel: REASON_LABELS[reason],
        description: description || null,
        reporterEmail: session.user.email || "Unknown",
        reporterName: session.user.name || "Unknown",
        baseUrl,
        reportId: report.id,
      }),
      text: generateReportEmailText({
        contentType,
        contentId,
        contentTitle,
        reason,
        reasonLabel: REASON_LABELS[reason],
        description: description || null,
        reporterEmail: session.user.email || "Unknown",
        reporterName: session.user.name || "Unknown",
        baseUrl,
        reportId: report.id,
      }),
    });

    if (!emailSent) {
      console.error("Failed to send report notification email");
    }

    return NextResponse.json({
      success: true,
      reportId: report.id,
      message: "Thank you for your report. We will review it shortly.",
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reports
 * Get reports (admin only - for future admin dashboard)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // For now, only allow checking if user has reported specific content
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get("contentType");
    const contentId = searchParams.get("contentId");

    if (contentType && contentId) {
      const existingReport = await prisma.report.findUnique({
        where: {
          reporterId_contentType_contentId: {
            reporterId: session.user.id,
            contentType,
            contentId,
          },
        },
        select: { id: true },
      });

      return NextResponse.json({
        hasReported: !!existingReport,
      });
    }

    return NextResponse.json(
      { error: "Missing parameters" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

// Email template for report notifications
function generateReportEmailHtml(data: {
  contentType: string;
  contentId: string;
  contentTitle: string;
  reason: string;
  reasonLabel: string;
  description: string | null;
  reporterEmail: string;
  reporterName: string;
  baseUrl: string;
  reportId: string;
}): string {
  const { contentType, contentId, contentTitle, reasonLabel, description, reporterEmail, reporterName, baseUrl, reportId } = data;

  // Generate URL to the reported content
  let contentUrl = baseUrl;
  switch (contentType) {
    case "USER":
      contentUrl = `${baseUrl}/profile/${contentId}`;
      break;
    case "PROJECT":
      contentUrl = `${baseUrl}/projects/${contentId}`;
      break;
    case "SERVICE_LISTING":
      contentUrl = `${baseUrl}/services/${contentId}`;
      break;
    case "LOCAL_LISTING":
      contentUrl = `${baseUrl}/listing/${contentId}`;
      break;
    case "DAILY_UPDATE":
      contentUrl = `${baseUrl}/feed`;
      break;
    default:
      contentUrl = baseUrl;
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Content Report</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #09090b;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Header -->
          <tr>
            <td style="padding: 32px; background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ef4444;">
                🚨 Content Report
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #a1a1aa;">
                Report ID: ${reportId}
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 24px 32px; background-color: #18181b; border-left: 1px solid rgba(255,255,255,0.1); border-right: 1px solid rgba(255,255,255,0.1);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 16px;">
                    <p style="margin: 0; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em;">
                      Content Type
                    </p>
                    <p style="margin: 4px 0 0; font-size: 16px; color: #ffffff; font-weight: 600;">
                      ${CONTENT_TYPE_LABELS[contentType] || contentType}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 16px;">
                    <p style="margin: 0; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em;">
                      Content
                    </p>
                    <p style="margin: 4px 0 0; font-size: 16px; color: #ffffff;">
                      ${contentTitle}
                    </p>
                    <a href="${contentUrl}" style="display: inline-block; margin-top: 8px; font-size: 13px; color: #f97316; text-decoration: none;">
                      View Content →
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 16px;">
                    <p style="margin: 0; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em;">
                      Reason
                    </p>
                    <p style="margin: 4px 0 0; font-size: 16px; color: #ef4444; font-weight: 500;">
                      ${reasonLabel}
                    </p>
                  </td>
                </tr>
                ${description ? `
                <tr>
                  <td style="padding-bottom: 16px;">
                    <p style="margin: 0; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em;">
                      Additional Details
                    </p>
                    <p style="margin: 4px 0 0; font-size: 14px; color: #ffffff; background-color: #27272a; padding: 12px; border-radius: 8px;">
                      ${description}
                    </p>
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em;">
                      Reported By
                    </p>
                    <p style="margin: 4px 0 0; font-size: 14px; color: #ffffff;">
                      ${reporterName} (${reporterEmail})
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #18181b; border-radius: 0 0 16px 16px; border: 1px solid rgba(255,255,255,0.1); border-top: none;">
              <p style="margin: 0; font-size: 12px; color: #71717a; text-align: center;">
                This is an automated report notification from Builders.to
              </p>
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

function generateReportEmailText(data: {
  contentType: string;
  contentId: string;
  contentTitle: string;
  reason: string;
  reasonLabel: string;
  description: string | null;
  reporterEmail: string;
  reporterName: string;
  baseUrl: string;
  reportId: string;
}): string {
  const { contentType, contentTitle, reasonLabel, description, reporterEmail, reporterName, reportId } = data;

  return `
Content Report - Builders.to
Report ID: ${reportId}

Content Type: ${CONTENT_TYPE_LABELS[contentType] || contentType}
Content: ${contentTitle}
Reason: ${reasonLabel}
${description ? `\nAdditional Details:\n${description}` : ''}

Reported By: ${reporterName} (${reporterEmail})

---
This is an automated report notification from Builders.to
  `.trim();
}
