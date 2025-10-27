# Quick Fix for Production 404 Errors

## Problem
Your production site at `https://builders.to` is showing 404 errors when trying to access `/api/listings` because the frontend doesn't know where the backend API is located.

## Quick Fix Steps

### 1. Find Your Backend URL
Go to your Render dashboard and find your backend service. The URL will look like:
```
https://builders-backend-xxxxx.onrender.com
```

### 2. Set Environment Variable in Render

In your Render dashboard for the **frontend** service:

1. Go to your frontend service
2. Click on "Environment"
3. Add this environment variable:
   ```
   VITE_API_URL=https://builders-backend-xxxxx.onrender.com
   ```
   (Replace with your actual backend URL)

4. Click "Save Changes"

### 3. Redeploy the Frontend

1. Go to your frontend service in Render
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait for the deployment to complete

## Verification

After redeployment, your app should work. The frontend will now make API calls to your backend service instead of trying to find it on the same domain.

## What Changed

I updated `frontend/src/main.jsx` to:
- Use the `VITE_API_URL` environment variable when available
- Automatically configure axios to use the backend URL in production
- Keep using relative paths with the proxy in development

## Still Having Issues?

1. **Check the backend is running**: Visit `https://your-backend-url/health`
2. **Check environment variable**: Make sure `VITE_API_URL` is set in Render dashboard
3. **Redeploy**: Always trigger a redeploy after changing environment variables
4. **Clear cache**: Hard refresh the browser (Cmd+Shift+R or Ctrl+Shift+R)
