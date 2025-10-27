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
- Deploy backend service
- Deploy frontend service
- Set up connections

## Required Environment Variables

Add these in Render dashboard after deployment:

### Backend (`builders-backend`)
```env
JWT_SECRET=<generate_random_32_char_string>
STRIPE_SECRET_KEY=sk_test_or_sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Frontend (`builders-frontend`)
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_or_pk_live_...
```

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
| Payments fail | Check Stripe keys and webhook |
| Build fails | Check Node version (18.20.8) |

## URLs After Deployment

- **Frontend**: `https://builders-frontend.onrender.com`
- **Backend**: `https://builders-backend.onrender.com`
- **API**: `https://builders-backend.onrender.com/api`

## Support

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.
