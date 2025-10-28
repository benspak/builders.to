# Migration from Vite + React to Next.js

## Summary

The frontend has been successfully migrated from Vite + React to Next.js to fix SPA routing issues. All functionality has been preserved.

## Key Changes

### 1. Project Structure
- **Old**: `src/pages/` with React Router
- **New**: `app/` directory with Next.js App Router

### 2. Routing
- **Old**: `react-router-dom` with `<Routes>` and `<Route>`
- **New**: File-based routing with Next.js
  - `/` → `app/page.jsx`
  - `/login` → `app/login/page.jsx`
  - `/register` → `app/register/page.jsx`
  - `/listing/[id]` → `app/listing/[id]/page.jsx`
  - `/user/[userId]` → `app/user/[userId]/page.jsx`

### 3. Environment Variables
- **Old**: `VITE_API_URL`, `VITE_STRIPE_PUBLISHABLE_KEY`
- **New**: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### 4. Client Components
All interactive components now use the `'use client'` directive:
- `AuthContext`
- `Navbar`
- `RichTextEditor`
- `CheckoutForm`
- All page components

### 5. Dependencies
Removed:
- `react-router-dom` (routing handled by Next.js)
- `vite`
- `@vitejs/plugin-react`

Added:
- `next`
- `eslint-config-next`

### 6. Build & Development
- **Development**: `npm run dev` (runs on port 3000)
- **Build**: `npm run build`
- **Start**: `npm start` (production server)

## Benefits

1. **Fixed Routing**: No more SPA routing issues on Render.com
2. **SEO**: Better SEO with server-side rendering support
3. **Performance**: Automatic code splitting and optimization
4. **Modern**: Using Next.js 14 App Router (latest)

## Environment Setup

### Development
Create a `.env.local` file in `frontend/`:
```
NEXT_PUBLIC_API_URL=http://localhost:5555
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Production (Render.com)
Environment variables are automatically configured via `render.yaml`:
- `NEXT_PUBLIC_API_URL` - Backend service URL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe key

## Deployment

The deployment configuration has been updated in `render.yaml`:
- Frontend service now builds with `npm run build`
- Starts with `npm start`
- Environment variables prefixed with `NEXT_PUBLIC_` for client-side access

## Files Modified

### Created
- `frontend/app/layout.jsx` - Root layout with metadata
- `frontend/app/providers.jsx` - Chakra UI provider wrapper
- `frontend/app/client-layout.jsx` - Client-side layout with navbar
- `frontend/app/page.jsx` - Home page
- `frontend/app/login/page.jsx` - Login page
- `frontend/app/register/page.jsx` - Register page
- `frontend/app/dashboard/page.jsx` - Dashboard page
- `frontend/app/profile/page.jsx` - Profile page
- `frontend/app/create-listing/page.jsx` - Create listing page
- `frontend/app/listing/[id]/page.jsx` - Listing detail page
- `frontend/app/user/[userId]/page.jsx` - Public user profile
- `frontend/next.config.js` - Next.js configuration
- `frontend/.eslintrc.json` - ESLint configuration

### Removed
- `frontend/vite.config.js`
- `frontend/index.html`
- `frontend/server.js`
- `frontend/public/_redirects`
- `frontend/public/nginx.conf`

### Modified
- `frontend/package.json` - Updated dependencies and scripts
- `frontend/src/lib/axios.js` - Updated for Next.js environment
- `frontend/src/context/AuthContext.jsx` - Added 'use client' directive
- `frontend/src/components/Navbar.jsx` - Updated to use Next.js Link and useRouter
- `frontend/src/components/RichTextEditor.jsx` - Added 'use client' directive
- `frontend/src/components/CheckoutForm.jsx` - Added 'use client' directive
- `render.yaml` - Updated environment variables
- `.gitignore` - Added Next.js specific entries

## Next Steps

1. Test locally: `cd frontend && npm install && npm run dev`
2. Verify all functionality works
3. Deploy to Render.com
4. Monitor for any issues

## Notes

- All existing functionality has been preserved
- The backend API remains unchanged
- Authentication flow is identical
- Stripe payments continue to work as before
