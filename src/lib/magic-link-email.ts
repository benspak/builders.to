/**
 * Magic link email template for passwordless authentication
 * Matches the Builders.to visual design language
 */

interface MagicLinkEmailOptions {
  email: string;
  url: string;
  baseUrl: string;
}

export function generateMagicLinkEmail({
  url,
  baseUrl,
}: MagicLinkEmailOptions): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to Builders.to</title>
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
                      Sign in to Builders.to ✨
                    </h1>
                    <p style="margin: 8px 0 0; font-size: 16px; color: #a1a1aa;">
                      Click the button below to securely sign in to your account
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 32px; background-color: #18181b; border-left: 1px solid rgba(255,255,255,0.1); border-right: 1px solid rgba(255,255,255,0.1);">
              <table width="100%">
                <tr>
                  <td align="center">
                    <a href="${url}" style="display: inline-block; padding: 18px 48px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 14px 0 rgba(249, 115, 22, 0.39);">
                      Sign in to Builders.to
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 24px;">
                    <p style="margin: 0; font-size: 14px; color: #71717a; text-align: center;">
                      This link will expire in 24 hours for security.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td style="padding: 24px 32px; background-color: #18181b; border-left: 1px solid rgba(255,255,255,0.1); border-right: 1px solid rgba(255,255,255,0.1);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 16px; background-color: rgba(251, 191, 36, 0.1); border-radius: 12px; border: 1px solid rgba(251, 191, 36, 0.2);">
                    <p style="margin: 0; font-size: 13px; color: #fbbf24;">
                      🔒 If you didn't request this email, you can safely ignore it.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Alternative Link -->
          <tr>
            <td style="padding: 24px 32px; background-color: #18181b; border-left: 1px solid rgba(255,255,255,0.1); border-right: 1px solid rgba(255,255,255,0.1);">
              <p style="margin: 0; font-size: 13px; color: #71717a; text-align: center;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 12px 0 0; font-size: 12px; color: #52525b; text-align: center; word-break: break-all;">
                <a href="${url}" style="color: #f97316; text-decoration: underline;">
                  ${url}
                </a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #18181b; border-radius: 0 0 16px 16px; border: 1px solid rgba(255,255,255,0.1); border-top: none;">
              <table width="100%">
                <tr>
                  <td align="center">
                    <p style="margin: 0; font-size: 12px; color: #71717a;">
                      © ${new Date().getFullYear()} Builders.to — Where builders ship together
                    </p>
                    <p style="margin: 8px 0 0; font-size: 12px; color: #52525b;">
                      <a href="${baseUrl}" style="color: #52525b; text-decoration: underline;">
                        Visit Builders.to
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
Sign in to Builders.to

Click this link to sign in to your account:
${url}

This link will expire in 24 hours for security.

If you didn't request this email, you can safely ignore it.

---
© ${new Date().getFullYear()} Builders.to — Where builders ship together
  `.trim();

  return { html, text };
}
