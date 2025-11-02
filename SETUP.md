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

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5555
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

**Note**: Frontend now uses Next.js, so environment variables must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser. Environment variables should be in `.env.local`, not `.env`.

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
3. **Test Token System**:
   - Go to the Tokens page and purchase tokens (e.g., 25 tokens for $25)
   - Create a listing using tokens (5 tokens per listing)
   - Verify the "buy 5 get 1 free" promotion works
4. **Test Direct Payment**:
   - Create a listing
   - Pay $5 directly to publish the listing
5. **Test Referral System**:
   - Go to the Referrals page and copy your referral code
   - Register a new account using the referral link: `/register?ref=YOUR_CODE`
   - Verify the original user received 5 tokens as reward when the new user sets their username
6. **Test Featured Listing** (Optional):
   - Pay $50 to feature a listing

## Common Issues

### Database not found
Run: `node backend/database/init.js` (automatically created on first run)

### Stripe payment not working
- Ensure your Stripe keys are correctly configured (both secret and publishable keys)
- Check that webhook URL is configured in Stripe dashboard for production: `https://your-backend-url/api/payments/webhook`
- For local testing, use Stripe CLI: `stripe listen --forward-to localhost:5555/api/payments/webhook`
- Copy the webhook secret from Stripe CLI output and add it to your backend `.env` as `STRIPE_WEBHOOK_SECRET`

### Token purchase not working
- Verify Stripe webhook is receiving events (check Stripe dashboard → Webhooks → Events)
- Check backend logs for webhook processing errors
- Ensure token purchase webhook events include `payment_intent.succeeded`

## Deployment

### Backend Deployment (Render.com)

1. Create new Web Service
2. Connect your GitHub repository
3. Set:
   - Build Command: `cd backend && npm ci`
   - Start Command: `cd backend && npm start`
   - Node Version: `18.20.8` or higher
4. Add environment variables from your `.env` file:
   - `PORT`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DATABASE_URL`, `NODE_ENV`
   - `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `FRONTEND_URL`

**Note**: Token system and referral program require no additional environment variables - they're automatically configured once Stripe is set up.

### Frontend Deployment (Render.com)

1. Create new Web Service (not Static Site - Next.js requires Node.js)
2. Connect your GitHub repository
3. Set:
   - Build Command: `cd frontend && npm ci && npm run build`
   - Start Command: `cd frontend && npm start`
   - Node Version: `18.20.8` or higher
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL` (should auto-set if using render.yaml)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## Support

For issues or questions, please open an issue on GitHub.
