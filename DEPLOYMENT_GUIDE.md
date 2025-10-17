# Builders.to Deployment Guide

## Current Issue: 404 Error on Production

The domain `builders.to` is currently returning a 404 error because the Next.js application is not properly deployed to the hosting server.

## Diagnosis

1. ✅ **Domain DNS**: The domain resolves correctly to IP addresses (216.24.57.7, 216.24.57.251)
2. ✅ **SSL/HTTPS**: The domain redirects HTTP to HTTPS properly
3. ✅ **Next.js Build**: The application builds successfully locally
4. ❌ **Deployment**: The hosting server is not serving the Next.js application

## Solution Steps

### 1. Deploy to Render.com

The project is configured for Render.com deployment with:
- `render.yaml` configuration file
- Updated `next.config.ts` with standalone output
- Proper build and start commands in `package.json`

### 2. Deployment Commands

```bash
# Build the application
npm run build

# Start production server
npm start
```

### 3. Environment Variables

Set these environment variables in your hosting platform:
- `NODE_ENV=production`
- Any Firebase or API keys if needed

### 4. Domain Configuration

After deployment, update your domain's DNS settings to point to your hosting platform's server instead of the current IP addresses.

## Files Created/Modified

1. `render.yaml` - Render.com deployment configuration
2. `next.config.ts` - Updated with standalone output for better deployment
3. `.env.example` - Environment variables template

## Next Steps

1. Deploy the application to Render.com or your preferred hosting platform
2. Update DNS settings to point to the new hosting server
3. Test the deployment to ensure it's working correctly
4. Monitor for any additional configuration issues
