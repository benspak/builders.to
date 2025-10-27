# Deployment Guide for Builders.to

This guide will help you deploy Builders.to to production using Render.com.

## Prerequisites

- GitHub account with your repository
- Stripe account with production API keys
- Render.com account

## Step 1: Backend Deployment

### 1.1 Create Backend Service on Render

1. Go to https://render.com and sign in
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `builders-backend`
   - **Environment**: Node
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: (leave empty)
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`

### 1.2 Add Environment Variables

In the Environment tab, add:

```
NODE_ENV=production
PORT=5555
JWT_SECRET=<generate a strong random string>
STRIPE_SECRET_KEY=<your production stripe secret key>
STRIPE_PUBLISHABLE_KEY=<your production stripe publishable key>
STRIPE_WEBHOOK_SECRET=<your webhook secret>
DATABASE_PATH=./builders.db
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 1.3 Get Backend URL

After deployment, note your backend URL (e.g., `https://builders-backend.onrender.com`)

## Step 2: Frontend Deployment

### 2.1 Create Frontend Service on Render

1. Click "New +" and select "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `builders-frontend`
   - **Branch**: `main`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`

### 2.2 Add Environment Variables

```
VITE_API_URL=<your backend URL>
VITE_STRIPE_PUBLISHABLE_KEY=<your production stripe publishable key>
```

## Step 3: Configure Stripe Webhooks

1. Go to Stripe Dashboard > Developers > Webhooks
2. Click "Add endpoint"
3. Enter your backend URL: `https://your-backend-url/api/payments/webhook`
4. Select events to listen to: `payment_intent.succeeded`
5. Copy the webhook signing secret
6. Add it to your backend environment variables as `STRIPE_WEBHOOK_SECRET`

## Step 4: Database Persistence

**Important**: SQLite files on Render are ephemeral and will be lost on every deploy. For production, consider:

1. Using Render PostgreSQL (recommended)
2. Using external file storage (S3, etc.)
3. Running periodic backups

### Option A: PostgreSQL on Render

1. Create a PostgreSQL database on Render
2. Update your backend to use PostgreSQL instead of SQLite
3. Update environment variables with PostgreSQL connection string

### Option B: Keep SQLite (for MVP)

- Data will persist between deploys if using persistent disk
- Consider adding a backup script

## Step 5: DNS and Custom Domain (Optional)

1. Add your domain in Render dashboard
2. Update DNS records as instructed
3. SSL certificate is automatically provisioned

## Post-Deployment Checklist

- [ ] Test user registration
- [ ] Test profile creation
- [ ] Test listing creation
- [ ] Test payment processing
- [ ] Test webhook delivery
- [ ] Test featured listings
- [ ] Monitor logs for errors

## Monitoring

Render provides:
- Automatic HTTPS
- Health checks
- Log viewing
- Metrics dashboard

## Troubleshooting

### Build failures
- Check build logs in Render dashboard
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

### Payment issues
- Verify Stripe keys are correct
- Check webhook is properly configured
- Test with Stripe test cards

### Database issues
- Check database path is correct
- Verify file permissions
- Consider switching to PostgreSQL for production

## Security Recommendations

1. Use strong JWT secrets
2. Enable rate limiting (already configured)
3. Use HTTPS only (Render provides automatically)
4. Regularly update dependencies
5. Monitor for security vulnerabilities

## Backup Strategy

For production, implement:
1. Automated database backups
2. Off-site backup storage
3. Regular restore testing

## Support

For issues, check:
- Render logs
- Stripe dashboard
- Application health endpoint: `https://your-backend-url/health`
