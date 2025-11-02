import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

/**
 * Send a password reset email
 * @param {string} email - User's email address
 * @param {string} resetToken - The reset token
 * @returns {Promise<object>} - Result from Resend
 */
export const sendPasswordResetEmail = async (email, resetToken) => {
  // Check if Resend is configured
  if (!resend) {
    // In development, log the reset link to console instead
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    console.log('⚠️  Resend not configured. Password reset link for', email, ':', resetUrl);
    throw new Error('Email service not configured');
  }

  // Determine the frontend URL
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@builders.to',
      to: [email],
      subject: 'Reset Your Password - builders.to',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="color: #2c3e50; margin: 0;">builders.to</h1>
            </div>

            <div style="background: white; padding: 30px; border-radius: 8px; border: 1px solid #ddd;">
              <h2 style="color: #2c3e50; margin-top: 0;">Reset Your Password</h2>

              <p>We received a request to reset your password for your builders.to account.</p>

              <p>Click the button below to reset your password. This link will expire in 1 hour.</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}"
                   style="display: inline-block; background: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Reset Password
                </a>
              </div>

              <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
              <p style="font-size: 12px; word-break: break-all; color: #999;">${resetUrl}</p>

              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

              <p style="font-size: 14px; color: #666;">
                If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
              </p>
            </div>

            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} builders.to. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
      text: `
        Reset Your Password - builders.to

        We received a request to reset your password for your builders.to account.

        Click the link below to reset your password. This link will expire in 1 hour.

        ${resetUrl}

        If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.

        © ${new Date().getFullYear()} builders.to
      `
    });

    return { success: true, data };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

/**
 * Send a contact request notification email to listing owner
 * @param {string} ownerEmail - Listing owner's email address
 * @param {string} listingTitle - The listing title
 * @param {string} listingSlug - The listing slug
 * @param {string} senderName - Sender's name
 * @param {string} senderEmail - Sender's email
 * @param {string} message - The message content
 * @returns {Promise<object>} - Result from Resend
 */
export const sendContactRequestEmail = async (ownerEmail, listingTitle, listingSlug, senderName, senderEmail, message) => {
  // Check if Resend is configured
  if (!resend) {
    // In development, log to console instead
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const listingUrl = `${frontendUrl}/listing/${listingSlug}`;
    console.log('⚠️  Resend not configured. Contact request from', senderEmail, 'for listing:', listingUrl);
    console.log('   Message:', message);
    // Don't throw error, just log it since this is optional
    return { success: false, message: 'Email service not configured' };
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const listingUrl = `${frontendUrl}/listing/${listingSlug}`;
  const dashboardUrl = `${frontendUrl}/dashboard`;

  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@builders.to',
      to: [ownerEmail],
      subject: `New Contact Request: ${listingTitle} - builders.to`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Contact Request</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="color: #2c3e50; margin: 0;">builders.to</h1>
            </div>

            <div style="background: white; padding: 30px; border-radius: 8px; border: 1px solid #ddd;">
              <h2 style="color: #2c3e50; margin-top: 0;">You've Received a New Contact Request</h2>

              <p>Someone is interested in your listing!</p>

              <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">Listing: ${listingTitle}</h3>
                <a href="${listingUrl}" style="color: #3498db; text-decoration: none;">View Listing →</a>
              </div>

              <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">From:</h3>
                <p style="margin: 5px 0;"><strong>Name:</strong> ${senderName}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${senderEmail}" style="color: #3498db; text-decoration: none;">${senderEmail}</a></p>
              </div>

              <div style="background: #fff; border-left: 3px solid #3498db; padding: 15px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">Message:</h3>
                <p style="white-space: pre-wrap; margin: 0;">${message}</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="mailto:${senderEmail}"
                   style="display: inline-block; background: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">
                  Reply via Email
                </a>
                <a href="${dashboardUrl}"
                   style="display: inline-block; background: #95a5a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  View Dashboard
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

              <p style="font-size: 14px; color: #666;">
                You can view and manage all contact requests in your <a href="${dashboardUrl}" style="color: #3498db;">dashboard</a>.
              </p>
            </div>

            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} builders.to. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
      text: `
        New Contact Request - builders.to

        You've received a new contact request for your listing: ${listingTitle}

        From: ${senderName} (${senderEmail})

        Message:
        ${message}

        View your dashboard: ${dashboardUrl}
        View listing: ${listingUrl}

        © ${new Date().getFullYear()} builders.to
      `
    });

    return { success: true, data };
  } catch (error) {
    console.error('Error sending contact request email:', error);
    // Don't throw error, just log it since email is optional
    return { success: false, error: error.message };
  }
};

/**
 * Send a purchase confirmation email to user after successful token purchase
 * @param {string} email - User's email address
 * @param {number} tokens - Number of tokens purchased
 * @param {number} amount - Amount paid in dollars
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {Promise<object>} - Result from Resend
 */
export const sendPurchaseConfirmationEmail = async (email, tokens, amount, paymentIntentId) => {
  // Check if Resend is configured
  if (!resend) {
    // In development, log to console instead
    console.log('⚠️  Resend not configured. Purchase confirmation for', email, ':', {
      tokens,
      amount,
      paymentIntentId
    });
    // Don't throw error, just log it since email is optional
    return { success: false, message: 'Email service not configured' };
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const tokensUrl = `${frontendUrl}/tokens`;
  const dashboardUrl = `${frontendUrl}/dashboard`;
  const formattedDate = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@builders.to',
      to: [email],
      subject: `Token Purchase Confirmation - ${tokens} tokens - builders.to`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Purchase Confirmation</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="color: #2c3e50; margin: 0;">builders.to</h1>
            </div>

            <div style="background: white; padding: 30px; border-radius: 8px; border: 1px solid #ddd;">
              <h2 style="color: #2c3e50; margin-top: 0;">Thank You For Your Purchase! 🎉</h2>

              <p>Your token purchase has been successfully processed and your account has been credited.</p>

              <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #27ae60;">
                <h3 style="color: #2c3e50; margin-top: 0;">Purchase Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Tokens Purchased:</strong></td>
                    <td style="padding: 8px 0; text-align: right; font-size: 1.2em; color: #27ae60; font-weight: bold;">${tokens} tokens</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Amount Paid:</strong></td>
                    <td style="padding: 8px 0; text-align: right; font-size: 1.2em; font-weight: bold;">$${amount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Date:</strong></td>
                    <td style="padding: 8px 0; text-align: right;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Transaction ID:</strong></td>
                    <td style="padding: 8px 0; text-align: right; font-size: 0.9em; font-family: monospace; word-break: break-all;">${paymentIntentId}</td>
                  </tr>
                </table>
              </div>

              <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #27ae60;">
                <p style="margin: 0; color: #2c3e50;">
                  <strong>💡 Did you know?</strong> You can create ${Math.floor(tokens / 5)} post${Math.floor(tokens / 5) !== 1 ? 's' : ''} with ${tokens} tokens. Plus, you'll get 1 free post for every 5 posts you purchase!
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${tokensUrl}"
                   style="display: inline-block; background: #27ae60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">
                  View My Tokens
                </a>
                <a href="${dashboardUrl}"
                   style="display: inline-block; background: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Go to Dashboard
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

              <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
                <p style="margin: 0; color: #856404; font-size: 14px;">
                  <strong>Receipt:</strong> This email serves as your receipt for this transaction. Please save this email for your records.
                </p>
              </div>

              <p style="font-size: 14px; color: #666; margin-top: 20px;">
                If you have any questions about this purchase, please contact our support team or visit your <a href="${tokensUrl}" style="color: #3498db;">token transactions page</a>.
              </p>
            </div>

            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} builders.to. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
      text: `
        Thank You For Your Purchase! - builders.to

        Your token purchase has been successfully processed and your account has been credited.

        Purchase Details:
        - Tokens Purchased: ${tokens} tokens
        - Amount Paid: $${amount.toFixed(2)}
        - Date: ${formattedDate}
        - Transaction ID: ${paymentIntentId}

        You can create ${Math.floor(tokens / 5)} post${Math.floor(tokens / 5) !== 1 ? 's' : ''} with ${tokens} tokens. Plus, you'll get 1 free post for every 5 posts you purchase!

        View your tokens: ${tokensUrl}
        Go to dashboard: ${dashboardUrl}

        This email serves as your receipt for this transaction. Please save this email for your records.

        If you have any questions about this purchase, please contact our support team.

        © ${new Date().getFullYear()} builders.to. All rights reserved.
      `
    });

    return { success: true, data };
  } catch (error) {
    console.error('Error sending purchase confirmation email:', error);
    // Don't throw error, just log it since email is optional
    return { success: false, error: error.message };
  }
};
