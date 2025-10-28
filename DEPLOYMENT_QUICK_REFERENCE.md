# Deployment Quick Reference

One-page deployment checklist for Builders.to

## Pre-Deployment Checklist

- [ ] Code committed and pushed to GitHub
- [ ] `render.yaml` is in the root directory
- [ ] Stripe account created
- [ ] Render account created

## Render Setup (5 minutes)

1. Go to https://dashboard.render.com
2. Click **New** → **Blueprint**
3. Connect GitHub repository
4. Select `builders.to` repository
5. Click **Apply**

That's it! Render will automatically:
- Create PostgreSQL database
- Deploy backend API service (separate service)
- Deploy frontend web service (separate service)
- Set up connections between services

## Required Environment Variables

Add these in Render dashboard after deployment:

### Backend (`builders-backend`)
```env
JWT_SECRET=<generate_random_32_char_string>
STRIPE_SECRET_KEY=sk_test_or_sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
(Auto-configured by render.yaml: DATABASE_URL, POSTGRES_DATABASE_URL)

### Frontend (`builders-frontend`)
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_or_pk_live_...
```
(Auto-configured by render.yaml: VITE_API_URL to backend service)

## Stripe Setup (3 minutes)

1. Go to https://dashboard.stripe.com
2. Copy API keys:
   - Secret Key → `STRIPE_SECRET_KEY`
   - Publishable Key → `VITE_STRIPE_PUBLISHABLE_KEY`
3. Create webhook:
   - URL: `https://builders-backend.onrender.com/api/payments/webhook`
   - Events: `payment_intent.succeeded`
   - Copy secret → `STRIPE_WEBHOOK_SECRET`

## Test Deployment

```bash
# Backend health
curl https://builders-backend.onrender.com/health

# Database health
curl https://builders-backend.onrender.com/health/db
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Backend won't start | Check `DATABASE_URL` is set |
| CORS errors | Verify frontend URL in backend CORS config |
| Pages don't persist on reload | Frontend now uses Express server for SPA routing |
| Payments fail | Check Stripe keys and webhook |
| Build fails | Check Node version (18.20.8) |

## URLs After Deployment

- **Frontend**: `https://builders-frontend.onrender.com` (Web Service - Node.js)
- **Backend API**: `https://builders-backend.onrender.com` (Web Service - Node.js)
- **Database**: Internal connection (managed by Render)

## Support

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.
