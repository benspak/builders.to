import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Application submission endpoint
app.post('/api/applications', async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      moveInDate,
      project,
      builderHours,
      work,
      budget
    } = req.body;

    // Validate required fields
    if (!name || !phone || !email || !moveInDate || !project || !builderHours || !work || !budget) {
      return res.status(400).json({
        error: 'All fields are required',
        success: false
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        success: false
      });
    }

    // Create email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a202c; border-bottom: 3px solid #3182ce; padding-bottom: 10px;">
          New Builder Application - builders.to
        </h2>

        <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2d3748; margin-top: 0;">Applicant Information</h3>

          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Expected Move-in Date:</strong> ${moveInDate}</p>
          <p><strong>Monthly Budget:</strong> ${budget}</p>
        </div>

        <div style="background-color: #edf2f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2d3748; margin-top: 0;">Builder Details</h3>

          <p><strong>Current Project:</strong></p>
          <p style="padding-left: 20px; color: #4a5568;">${project}</p>

          <p><strong>Builder Hours:</strong></p>
          <p style="padding-left: 20px; color: #4a5568;">${builderHours}</p>

          <p><strong>What They Do for Work:</strong></p>
          <p style="padding-left: 20px; color: #4a5568;">${work}</p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 12px;">
          <p>This application was submitted via builders.to</p>
          <p>Timestamp: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET</p>
        </div>
      </div>
    `;

    const emailText = `
New Builder Application - builders.to

APPLICANT INFORMATION
Name: ${name}
Phone: ${phone}
Email: ${email}
Expected Move-in Date: ${moveInDate}
Monthly Budget: ${budget}

BUILDER DETAILS
Current Project: ${project}
Builder Hours: ${builderHours}
What They Do for Work: ${work}

---
Submitted: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET
    `;

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'builders.to <onboarding@resend.dev>', // Update this with your verified domain
      to: [process.env.RECIPIENT_EMAIL || 'benvspak@gmail.com'],
      subject: `New Builder Application: ${name}`,
      html: emailHtml,
      text: emailText,
      replyTo: email
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({
        error: 'Failed to send application',
        success: false
      });
    }

    console.log('Application submitted successfully:', data);
    res.status(200).json({
      message: 'Application submitted successfully',
      success: true,
      id: data.id
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      error: 'Internal server error',
      success: false
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
