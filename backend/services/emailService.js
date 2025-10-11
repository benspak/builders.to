import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const sendSchedulingEmail = async ({ to, meetingId, meetingTitle, meetingTime, type }) => {
  if (!resend) {
    console.log('Resend API key not configured - skipping email');
    return;
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const meetingLink = `${frontendUrl}/meeting/${meetingId}`;

  let subject, html;

  switch (type) {
    case 'created':
      subject = `You created a Builders.to coworking session`;
      html = `
        <h2>Your Coworking Session is Ready!</h2>
        <p>You've created a new coworking session: <strong>${meetingTitle}</strong></p>
        <p>Share this link with others to let them vote on the best time:</p>
        <p><a href="${meetingLink}">${meetingLink}</a></p>
        <hr>
        <p><strong>Session Structure:</strong></p>
        <ul>
          <li>5 minutes: Getting to know each other</li>
          <li>30 minutes: Heads down focused work</li>
          <li>10 minutes: Recap and share progress</li>
        </ul>
        <p>Keep building,<br>The Builders.to Team</p>
      `;
      break;

    case 'scheduled':
      const formattedTime = new Date(meetingTime).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
      });

      subject = `Builders.to session scheduled: ${meetingTitle}`;
      html = `
        <h2>Your Coworking Session is Scheduled!</h2>
        <p><strong>${meetingTitle}</strong></p>
        <p><strong>When:</strong> ${formattedTime}</p>
        <p><a href="${meetingLink}">View meeting details and get Zoom link</a></p>
        <hr>
        <p><strong>Session Structure:</strong></p>
        <ul>
          <li>5 minutes: Getting to know each other</li>
          <li>30 minutes: Heads down focused work</li>
          <li>10 minutes: Recap and share progress</li>
        </ul>
        <p>See you there!<br>The Builders.to Team</p>
      `;
      break;

    case 'reminder':
      subject = `Starting soon: ${meetingTitle}`;
      html = `
        <h2>Your Coworking Session Starts in 15 Minutes!</h2>
        <p><strong>${meetingTitle}</strong></p>
        <p><a href="${meetingLink}">Join the session</a></p>
        <p>Keep building,<br>The Builders.to Team</p>
      `;
      break;

    default:
      return;
  }

  try {
    await resend.emails.send({
      from: 'Builders.to <hello@builders.to>',
      to,
      subject,
      html
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
