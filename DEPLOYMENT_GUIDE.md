# Builders.to Deployment Guide

Complete deployment guide for the Builders.to marketplace application.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Production Deployment on Render](#production-deployment-on-render)
- [Environment Variables](#environment-variables)
- [Stripe Configuration](#stripe-configuration)
- [Post-Deployment Verification](#post-deployment-verification)
- [Troubleshooting](#troubleshooting)

## Architecture Overview

### Tech Stack

**Backend**:
- Node.js 18.20.8 with Express
- PostgreSQL database (migrated from SQLite)
- JWT authentication
- Stripe payment processing
- Helmet security middleware
- Express rate limiting

**Frontend**:
- React 18 with Vite
- Chakra UI v2
- React Router for navigation
- Stripe Elements for checkout
- Axios for API calls

**Hosting**:
- Backend API: Render.com (Node.js Web Service)
- Frontend: Render.com (Static Site, separate service)
- Database: Render.com (PostgreSQL)

## Prerequisites

### Required Accounts
1. **GitHub Account** - For repository hosting
2. **Render Account** - For hosting (https://render.com)
3. **Stripe Account** - For payment processing (https://stripe.com)

### Required Software (for local development)
- Node.js 18.20.8 or higher
- npm or yarn package manager
- Git
- PostgreSQL (for local database)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/builders.to.git
cd builders.to
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5555
NODE_ENV=development

# Database
DATABASE_URL=postgresql://localhost:5432/builders_dev
POSTGRES_DATABASE_URL=postgresql://localhost:5432/builders_dev

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**Setup Local PostgreSQL Database**:

```bash
# Create database
createdb builders_dev

# Or using psql
psql postgres
CREATE DATABASE builders_dev;
\q
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5555

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 4. Run the Application

**Terminal 1 - Start Backend**:
```bash
cd backend
npm run dev
```

**Terminal 2 - Start Frontend**:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5555

## Production Deployment on Render

### Overview

The application uses `render.yaml` for infrastructure-as-code deployment. This file automatically configures:
- Backend API service (separate Node.js web service)
- Frontend static site (separate static site service)
- PostgreSQL database
- Environment variables and connections

**Note**: Frontend and backend are separate services. The frontend is a static site that makes API calls to the backend service.

### Deployment Steps

#### 1. Push Code to GitHub

```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

#### 2. Connect to Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub account
4. Select the `builders.to` repository
5. Render will detect the `render.yaml` file automatically

#### 3. Deploy Services

Render will create 3 services:

**a) PostgreSQL Database**:
- Name: `builders-db`
- Database: `builders`
- Plan: `free` (free tier)

**b) Backend API Service**:
- Name: `builders-backend`
- Runtime: Node.js
- Build Command: `cd backend && npm i`
- Start Command: `cd backend && npm start`
- Serves only the API endpoints
- Auto-deploys from main branch

**c) Frontend Web Service**:
- Name: `builders-frontend`
- Type: Web Service (Node.js)
- Build Command: `cd frontend && npm ci && npm run build`
- Start Command: `cd frontend && npm start`
- Serves React SPA with Express server for proper routing
- Makes API calls to `builders-backend`
- Auto-deploys from main branch

#### 4. Configure Environment Variables

After deployment starts, add these environment variables in the Render dashboard:

**Backend Service** (`builders-backend`):
```env
# Already set by render.yaml:
NODE_ENV=production
DATABASE_URL=<auto-set from builders-db>
VITE_API_URL=""  # Empty to use same-origin requests

# Add these manually:
JWT_SECRET=<generate a secure random string>
STRIPE_SECRET_KEY=<from your Stripe dashboard>
STRIPE_WEBHOOK_SECRET=<from your Stripe dashboard>
POSTGRES_DATABASE_URL=<auto-set from builders-db>
```

### 5. Manual Render Setup (If not using render.yaml)

If you prefer manual setup or to update existing services:

#### Backend Service Setup

1. Go to Render dashboard → **New Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `builders-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm ci`
   - **Start Command**: `cd backend && npm start`
   - **Node Version**: `18.20.8`

**Note**: Frontend is served as a separate web service running a Node.js Express server that handles SPA routing.

#### Database Setup

1. Go to Render dashboard → **New PostgreSQL**
2. Configure:
   - **Name**: `builders-db`
   - **Database Name**: `builders`
   - **Plan**: `starter` (free tier)

## Environment Variables

### Backend Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `production` | Yes |
| `PORT` | Server port | `5555` | Auto-set |
| `DATABASE_URL` | PostgreSQL connection | Auto from database | Yes |
| `POSTGRES_DATABASE_URL` | Alternative DB URL | `postgresql://...` | Optional |
| `JWT_SECRET` | JWT signing secret | Random string (32+ chars) | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_...` or `sk_test_...` | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` | Yes |

### Frontend Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL | Auto-set from backend service | Yes |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` or `pk_live_...` | Yes |

**Note**: `VITE_API_URL` is automatically set to the backend service host by `render.yaml`. You only need to set `VITE_STRIPE_PUBLISHABLE_KEY` manually.

## Stripe Configuration

### 1. Get Stripe API Keys

1. Go to https://dashboard.stripe.com
2. Navigate to **Developers** → **API keys**
3. Copy:
   - **Secret key** → `STRIPE_SECRET_KEY`
   - **Publishable key** → `VITE_STRIPE_PUBLISHABLE_KEY`

### 2. Setup Webhook Endpoint

1. In Stripe dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL: `https://your-backend-url.onrender.com/api/payments/webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### 3. Test vs Live Mode

**Development/Testing**:
- Use test keys: `sk_test_...` and `pk_test_...`
- Test with card: `4242 4242 4242 4242`

**Production**:
- Use live keys: `sk_live_...` and `pk_live_...`
- Real payments will be processed

## Post-Deployment Verification

### 1. Health Checks

**Backend Health**:
```bash
curl https://builders-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Builders.to API is running"
}
```

**Database Health**:
```bash
curl https://builders-backend.onrender.com/health/db
```

Expected response:
```json
{
  "status": "ok",
  "message": "Database connection healthy",
  "listings_count": 0
}
```

**Frontend Static Site**:
- Visit: `https://builders-frontend.onrender.com`
- Should load the React app
- API calls should automatically connect to the backend service

### 2. Test Application Features

1. **Register a new user**
   - Go to your frontend URL
   - Click "Sign Up"
   - Create an account

2. **Create a profile**
   - Navigate to Profile page
   - Fill in profile details
   - Save profile

3. **Create a listing**
   - Go to Create Listing
   - Fill in listing details
   - Submit (should be in pending status)

4. **Test payment**
   - Click "Pay $5" on your listing
   - Use Stripe test card: `4242 4242 4242 4242`
   - Complete payment

5. **Verify listing is published**
   - Listing should now appear in the main feed
   - Payment status should show as "paid"

### 3. Check Logs

**Backend API Logs**:
- Go to Render dashboard
- Select `builders-backend` service
- Click **Logs** tab
- Look for "Server running on port" messages

**Frontend Web Service**:
- Go to Render dashboard
- Select `builders-frontend` service
- Check build logs for successful Vite build
- Check runtime logs for Express server running

## Troubleshooting

### Backend Issues

**Issue**: Backend fails to start
```
Error: Cannot connect to database
```

**Solution**:
1. Check `DATABASE_URL` environment variable
2. Verify PostgreSQL service is running in Render
3. Check backend logs for detailed error

**Issue**: Rate limiting errors
```
Too many requests from this IP
```

**Solution**:
1. Wait 15 minutes
2. Check if you're behind a proxy/corporate firewall
3. Rate limits: 100 requests per 15 minutes

### Frontend Issues

**Issue**: API calls fail with CORS error

**Solution**:
1. Check backend CORS configuration in `backend/server.js`
2. Verify frontend URL (`https://builders-frontend.onrender.com`) is in allowed origins
3. Check `VITE_API_URL` is automatically set by `render.yaml`
4. Ensure both services are deployed and running

**Issue**: Stripe payment fails

**Solution**:
1. Verify Stripe keys are set correctly
2. Check webhook endpoint is configured
3. Test with Stripe test cards
4. Check backend logs for Stripe errors

### Database Issues

**Issue**: Tables not created

**Solution**:
1. Check backend logs for initialization errors
2. Verify `initializeDatabase()` runs on startup
3. Manually run SQL if needed (see `backend/database/db.js`)

**Issue**: Connection pool exhausted

**Solution**:
1. Check for unclosed connections
2. Implement connection pooling limits
3. Consider upgrading database plan

### Deployment Issues

**Issue**: Build fails on Render

**Solution**:
1. Check build logs for specific error
2. Verify Node.js version matches (18.20.8)
3. Check for missing dependencies
4. Try deleting and recreating service

**Issue**: Environment variables not set

**Solution**:
1. Verify variables in Render dashboard
2. Check for typos in variable names
3. Redeploy after adding variables
4. For frontend: restart service to apply VITE_ variables

## Scaling Considerations

### Database
- Current: `starter` plan (free tier)
- Consider upgrading to `standard` plan for:
  - Faster performance
  - Better reliability
  - Automatic backups
  - Dedicated resources

### Backend
- Current: Free tier with startup delays
- Consider upgrading for:
  - Persistent instances
  - No cold starts
  - Better performance
  - SSL custom domains

### Monitoring
- Set up error tracking (e.g., Sentry)
- Monitor API response times
- Track database connection pool
- Set up alerts for failures

## Security Best Practices

1. **Use strong JWT secret** (32+ characters, random)
2. **Keep Stripe keys secure** (never commit to git)
3. **Enable HTTPS** (automatic on Render)
4. **Regular security updates** (keep dependencies updated)
5. **Monitor for suspicious activity** (unusual payment patterns)
6. **Implement rate limiting** (already configured)
7. **Use Helmet** (already configured)
8. **Sanitize user input** (prevent SQL injection)

## Maintenance

### Regular Tasks

1. **Monitor logs** weekly for errors
2. **Update dependencies** monthly
3. **Review Stripe transactions** regularly
4. **Check database size** and plan upgrades
5. **Review security advisories** for dependencies

### Backup Strategy

**Current (Starter Plan)**:
- Manual backups available
- Export data periodically

**Upgraded Plans**:
- Automatic daily backups
- Point-in-time recovery
- Backup retention policies

## Support & Resources

### Documentation
- Render: https://render.com/docs
- Stripe: https://stripe.com/docs
- React: https://react.dev
- PostgreSQL: https://www.postgresql.org/docs

### API Endpoints Reference

```
# Authentication
POST /api/auth/register
POST /api/auth/login

# Profiles
GET  /api/profiles
GET  /api/profiles/me
GET  /api/profiles/:id
POST /api/profiles

# Listings
GET    /api/listings
GET    /api/listings/:id
POST   /api/listings
PUT    /api/listings/:id
DELETE /api/listings/:id
GET    /api/listings/user/my-listings

# Payments
POST /api/payments/create-listing-payment
POST /api/payments/create-featured-payment

# Dashboard
GET /api/dashboard

# Health Checks
GET /health
GET /health/db
```

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Repository connected to Render
- [ ] `render.yaml` committed to repository
- [ ] Backend service deployed
- [ ] Database service created
- [ ] Frontend service deployed
- [ ] Environment variables configured
- [ ] Stripe account configured
- [ ] Webhook endpoint configured
- [ ] Health checks passing
- [ ] Test user registration works
- [ ] Test listing creation works
- [ ] Test payment processing works
- [ ] Logs monitoring configured
- [ ] Custom domain configured (optional)

## Success Criteria

Your deployment is successful when:
1. ✅ All health checks pass
2. ✅ Users can register and login
3. ✅ Users can create and publish listings
4. ✅ Payments process successfully
5. ✅ Listings appear in feed after payment
6. ✅ Dashboard displays user data
7. ✅ No errors in application logs

---

**Deployment Date**: _______________

**Deployed by**: _______________

**Production URL**: _______________

**Backend URL**: _______________

**Status**: ✅ Production Ready
