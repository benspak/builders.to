git a# Environment Setup Guide

This guide will help you set up the environment variables needed to run LaunchKit locally and in production.

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your actual values** in `.env.local`

3. **Never commit `.env.local`** to version control

## Required Services

### 🔥 Firebase (Optional)
- **Purpose**: Database and authentication
- **Setup**: Create a Firebase project at https://console.firebase.google.com
- **Required Variables**: All `NEXT_PUBLIC_FIREBASE_*` variables
- **Note**: The app works without Firebase, but you'll lose data persistence

### 📧 Resend (Required for Email)
- **Purpose**: Send emails (contact forms, notifications)
- **Setup**: Sign up at https://resend.com and get your API key
- **Required Variable**: `RESEND_API_KEY`

## Optional Services

### 📊 Google Sheets Integration
- **Purpose**: Store form submissions in Google Sheets
- **Setup**: Create a Google Apps Script webhook
- **Variable**: `GOOGLE_SHEETS_WEBHOOK_URL`

### 📈 Google Analytics
- **Purpose**: Track website analytics
- **Setup**: Create GA4 property
- **Variable**: `NEXT_PUBLIC_GA_TRACKING_ID`

## Development vs Production

### Development
- Use `.env.local` file
- Most services can use test/sandbox keys
- Firebase is optional

### Production (Render.com)
- Set environment variables in Render dashboard
- Use production API keys
- All required services should be configured

## Testing Your Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Check the console for any missing environment variable warnings

3. Test the client intake form at `http://localhost:3000/client-intake`

## Troubleshooting

### "Firebase environment variables not configured"
- This is normal if you haven't set up Firebase
- The app will work without it

### "500 Internal Server Error" on form submission
- Check that required services (Resend) are configured
- Check the server console for specific error messages

### Email not sending
- Verify your Resend API key is correct
- Check Resend dashboard for delivery status

## Security Notes

- Never commit `.env.local` or any file with real API keys
- Use different API keys for development and production
- Rotate your API keys regularly
- Use environment-specific keys (test vs live)

## Need Help?

- Check the individual service documentation
- Review the console logs for specific error messages
- Ensure all required variables are set correctly
