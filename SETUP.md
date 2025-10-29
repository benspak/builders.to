# Setup Guide for Builders.to

This guide will help you set up and run the Builders.to marketplace locally.

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- A Stripe account (for payments)
- A Resend account (for password reset emails)

## Quick Start

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

**Backend (.env):**
```env
PORT=5555
JWT_SECRET=your_super_secret_jwt_key_change_this
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
DATABASE_URL=your_postgres_database_url
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=noreply@builders.to
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5555
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 3. Get API Keys

**Stripe Keys:**
1. Go to https://stripe.com and create an account
2. Navigate to Developers > API keys
3. Copy your test keys
4. Add them to your `.env` files

**Resend API Key (for password reset emails):**
1. Go to https://resend.com and create an account
2. Navigate to API Keys
3. Create a new API key
4. Add it to your `.env` file as `RESEND_API_KEY`
5. Verify your domain or use a verified domain for `RESEND_FROM_EMAIL`

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access the App

- Frontend: http://localhost:3000
- Backend API: http://localhost:5555

## Testing

1. Register a new account
2. Create a profile
3. Create a listing
4. Pay $5 to publish the listing
5. (Optional) Pay $50 to feature the listing

## Common Issues

### Database not found
Run: `node backend/database/init.js` (automatically created on first run)

### Stripe payment not working
- Ensure your Stripe keys are correctly configured
- Check that webhook URL is configured in Stripe dashboard
- Use Stripe CLI for local webhook testing: `stripe listen --forward-to localhost:5555/api/payments/webhook`

## Deployment

### Backend Deployment (Render.com)

1. Create new Web Service
2. Connect your GitHub repository
3. Set:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
4. Add environment variables from your `.env` file:
   - PORT, JWT_SECRET, STRIPE_SECRET_KEY, DATABASE_URL, NODE_ENV
   - RESEND_API_KEY, RESEND_FROM_EMAIL, FRONTEND_URL

### Frontend Deployment (Render.com)

1. Create new Static Site
2. Connect your GitHub repository
3. Set:
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`

## Support

For issues or questions, please open an issue on GitHub.
