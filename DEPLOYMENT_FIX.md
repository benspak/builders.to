# Production Deployment Fix

## Issue
The frontend deployed at `https://builders.to` is trying to access `/api/listings` and getting 404 errors because it's looking for the API on the same domain.

## Solution

### 1. Configure Environment Variable in Render

Go to your Render dashboard and add the environment variable:

**For the frontend service:**
```
VITE_API_URL=https://builders-backend.onrender.com
```

Replace `builders-backend.onrender.com` with your actual backend service URL from Render.

### 2. Verify Backend is Running

1. Go to Render dashboard
2. Find your `builders-backend` service
3. Copy the URL (it should look like `https://your-backend-name.onrender.com`)
4. Visit: `https://your-backend-url/health` to verify it's running

### 3. Update Environment Variables

In the Render dashboard for your **frontend** service, make sure you have:

```
VITE_API_URL=https://your-backend-url.onrender.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
```

### 4. Redeploy

After setting the environment variables:
1. Go to your frontend service in Render
2. Click "Manual Deploy" or trigger a redeploy
3. The build will include the correct API URL

## Testing

After redeployment, check the browser console. You should see:
- `API_URL: https://your-backend-url.onrender.com`
- `Axios baseURL set to: https://your-backend-url.onrender.com`

If you still see `No API_URL configured`, the environment variable wasn't set properly.

## Alternative: Use CORS Proxy

If you can't set environment variables, you can also update `main.jsx` to use a hardcoded backend URL:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://your-backend-url.onrender.com';
```

But using environment variables is the better approach.
