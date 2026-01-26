/**
 * Welcome email template for new user signups
 * Sent automatically when a new user joins Builders.to
 * Matches the Builders.to visual design language
 */

interface WelcomeEmailOptions {
  userName: string;
  userSlug: string;
  baseUrl: string;
}

export function generateWelcomeEmail({
  userName,
  userSlug,
  baseUrl,
}: WelcomeEmailOptions): { html: string; text: string } {
  const profileUrl = `${baseUrl}/${userSlug}`;
  const feedUrl = `${baseUrl}/feed`;
  const settingsUrl = `${baseUrl}/settings`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Builders.to!</title>
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
                    <img src="${baseUrl}/icons/icon-96x96.png" alt="Builders.to" width="40" height="40" style="border-radius: 8px;">
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 24px;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">
                      Welcome to Builders.to! 🎉
                    </h1>
                    <p style="margin: 8px 0 0; font-size: 16px; color: #a1a1aa;">
                      Hey ${userName}, you're now part of a community of builders shipping together!
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Getting Started -->
          <tr>
            <td style="padding: 32px; background-color: #18181b; border-left: 1px solid rgba(255,255,255,0.1); border-right: 1px solid rgba(255,255,255,0.1);">
              <h2 style="margin: 0 0 20px; font-size: 20px; font-weight: 600; color: #ffffff;">
                Here's how to get started:
              </h2>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <!-- Step 1 -->
                <tr>
                  <td style="padding: 16px; background-color: #27272a; border-radius: 12px; margin-bottom: 12px;">
                    <table width="100%">
                      <tr>
                        <td width="40" valign="top">
                          <span style="display: inline-block; width: 28px; height: 28px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 50%; text-align: center; line-height: 28px; font-size: 14px; font-weight: 600; color: #ffffff;">1</span>
                        </td>
                        <td>
                          <p style="margin: 0; font-size: 15px; font-weight: 600; color: #ffffff;">
                            Complete your profile
                          </p>
                          <p style="margin: 4px 0 0; font-size: 13px; color: #a1a1aa;">
                            Add a bio, your skills, and social links to let other builders know what you're working on.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height: 12px;"></td></tr>
                
                <!-- Step 2 -->
                <tr>
                  <td style="padding: 16px; background-color: #27272a; border-radius: 12px;">
                    <table width="100%">
                      <tr>
                        <td width="40" valign="top">
                          <span style="display: inline-block; width: 28px; height: 28px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 50%; text-align: center; line-height: 28px; font-size: 14px; font-weight: 600; color: #ffffff;">2</span>
                        </td>
                        <td>
                          <p style="margin: 0; font-size: 15px; font-weight: 600; color: #ffffff;">
                            Add your first project
                          </p>
                          <p style="margin: 4px 0 0; font-size: 13px; color: #a1a1aa;">
                            Share what you're building with the community. It can be a side project, startup, or anything you're excited about!
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height: 12px;"></td></tr>
                
                <!-- Step 3 -->
                <tr>
                  <td style="padding: 16px; background-color: #27272a; border-radius: 12px;">
                    <table width="100%">
                      <tr>
                        <td width="40" valign="top">
                          <span style="display: inline-block; width: 28px; height: 28px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 50%; text-align: center; line-height: 28px; font-size: 14px; font-weight: 600; color: #ffffff;">3</span>
                        </td>
                        <td>
                          <p style="margin: 0; font-size: 15px; font-weight: 600; color: #ffffff;">
                            Post your first status update
                          </p>
                          <p style="margin: 4px 0 0; font-size: 13px; color: #a1a1aa;">
                            Share your progress, wins, or just say hello. The community loves to celebrate with you!
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Buttons -->
          <tr>
            <td style="padding: 24px 32px; background-color: #18181b; border-left: 1px solid rgba(255,255,255,0.1); border-right: 1px solid rgba(255,255,255,0.1);">
              <table width="100%">
                <tr>
                  <td align="center">
                    <a href="${profileUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 14px 0 rgba(249, 115, 22, 0.39);">
                      View Your Profile
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 16px;">
                    <a href="${feedUrl}" style="display: inline-block; padding: 14px 28px; background-color: #27272a; color: #ffffff; font-size: 14px; font-weight: 500; text-decoration: none; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);">
                      Explore the Builder Feed
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Community Highlight -->
          <tr>
            <td style="padding: 24px 32px; background-color: #18181b; border-left: 1px solid rgba(255,255,255,0.1); border-right: 1px solid rgba(255,255,255,0.1);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 20px; background-color: rgba(249, 115, 22, 0.1); border-radius: 12px; border: 1px solid rgba(249, 115, 22, 0.2);">
                    <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #f97316;">
                      🔥 What makes Builders.to special
                    </p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #a1a1aa;">
                      <li style="margin-bottom: 8px;">Build in public with a supportive community</li>
                      <li style="margin-bottom: 8px;">Track your projects with milestones and progress updates</li>
                      <li style="margin-bottom: 8px;">Get feedback and celebrate wins with fellow builders</li>
                      <li>Stay motivated by seeing others ship every day</li>
                    </ul>
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
                    <p style="margin: 0; font-size: 13px; color: #a1a1aa;">
                      Questions? Just reply to this email — we'd love to hear from you!
                    </p>
                    <p style="margin: 16px 0 0; font-size: 12px; color: #71717a;">
                      © ${new Date().getFullYear()} Builders.to — Where builders ship together
                    </p>
                    <p style="margin: 8px 0 0; font-size: 12px; color: #52525b;">
                      <a href="${settingsUrl}" style="color: #52525b; text-decoration: underline;">
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
Welcome to Builders.to! 🎉

Hey ${userName}, you're now part of a community of builders shipping together!

Here's how to get started:

1. Complete your profile
   Add a bio, your skills, and social links to let other builders know what you're working on.

2. Add your first project
   Share what you're building with the community. It can be a side project, startup, or anything you're excited about!

3. Post your first status update
   Share your progress, wins, or just say hello. The community loves to celebrate with you!

View your profile: ${profileUrl}
Explore the builder feed: ${feedUrl}

🔥 What makes Builders.to special:
- Build in public with a supportive community
- Track your projects with milestones and progress updates
- Get feedback and celebrate wins with fellow builders
- Stay motivated by seeing others ship every day

Questions? Just reply to this email — we'd love to hear from you!

---
© ${new Date().getFullYear()} Builders.to — Where builders ship together
Manage email preferences: ${settingsUrl}
  `.trim();

  return { html, text };
}
