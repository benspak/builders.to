# Deployment Guide for Builders.to

## Quick Deploy to Render.com

### Step 1: Prepare MongoDB

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (if you don't have one)
3. In "Database Access", create a database user
4. In "Network Access", allow access from anywhere (0.0.0.0/0)
5. Get your connection string (should look like: `mongodb+srv://username:password@cluster.mongodb.net/buildersdb`)

### Step 2: Get API Keys

**Resend (Required for emails)**
1. Sign up at [resend.com](https://resend.com)
2. Get your API key from dashboard
3. Save it: `re_xxxxxxxxxx`

**Zoom (Required for video meetings)**
1. Go to [marketplace.zoom.us](https://marketplace.zoom.us)
2. "Develop" → "Build App" → "Server-to-Server OAuth"
3. Fill in basic info
4. Save these three values:
   - Account ID
   - Client ID
   - Client Secret
5. Add these scopes:
   - `meeting:write:admin`
   - `meeting:read:admin`

### Step 3: Deploy Backend

1. **Create Web Service on Render**
   - Go to [render.com](https://render.com)
   - "New +" → "Web Service"
   - Connect your GitHub repo
   - Service name: `builders-to-api`

2. **Configure Build Settings**
   ```
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start
   ```

3. **Add Environment Variables**
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   RESEND_API_KEY=your_resend_key
   ZOOM_CLIENT_ID=your_zoom_client_id
   ZOOM_CLIENT_SECRET=your_zoom_client_secret
   ZOOM_ACCOUNT_ID=your_zoom_account_id
   JWT_SECRET=generate_random_string
   FRONTEND_URL=https://your-frontend-url.onrender.com
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (takes ~5 minutes)
   - Copy your backend URL: `https://builders-to-api.onrender.com`

### Step 4: Deploy Frontend

1. **Update API URL**
   Edit `frontend/src/App.jsx` or create `frontend/.env`:
   ```
   VITE_API_URL=https://builders-to-api.onrender.com
   ```

2. **Update axios config**
   Edit `frontend/vite.config.js` - remove proxy (only needed in dev)

3. **Create Static Site on Render**
   - "New +" → "Static Site"
   - Connect GitHub repo
   - Service name: `builders-to`

4. **Configure Build Settings**
   ```
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: frontend/dist
   ```

5. **Deploy**
   - Click "Create Static Site"
   - Wait for build to complete
   - Your site is live!

### Step 5: Update Backend with Frontend URL

1. Go to your backend service on Render
2. Update `FRONTEND_URL` environment variable with your frontend URL
3. Service will auto-redeploy

### Step 6: Configure Email Domain (Optional)

For production emails from your own domain:

1. In Resend dashboard, go to "Domains"
2. Add your domain (e.g., `builders.to`)
3. Add DNS records to your domain provider
4. Verify domain
5. Update email sender in `backend/services/emailService.js`:
   ```javascript
   from: 'Builders.to <hello@builders.to>'
   ```

## Alternative: Deploy to Vercel + Railway

### Backend on Railway

1. Go to [railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub repo"
3. Select `backend` directory
4. Add environment variables (same as above)
5. Deploy

### Frontend on Vercel

1. Go to [vercel.com](https://vercel.com)
2. "New Project" → Import Git repo
3. Framework: Vite
4. Root directory: `frontend`
5. Build command: `npm run build`
6. Output directory: `dist`
7. Deploy

## Testing Your Deployment

1. **Backend Health Check**
   ```bash
   curl https://your-backend-url.onrender.com/api/health
   ```
   Should return: `{"status":"ok"}`

2. **Create Test Meeting**
   - Visit your frontend URL
   - Click "Schedule a Session"
   - Fill in details and create
   - Verify you can vote and see updates

3. **Test Email**
   - Check your inbox for confirmation email
   - Verify links work

4. **Test Zoom Integration**
   - Finalize a meeting time
   - Click "Generate Zoom Link"
   - Verify Zoom link is created

## Troubleshooting

### Backend won't start
- Check logs in Render dashboard
- Verify MONGODB_URI is correct
- Ensure all required env vars are set

### Emails not sending
- Verify RESEND_API_KEY is correct
- Check Resend dashboard for delivery status
- Verify sender email domain

### Zoom links not generating
- Verify all 3 Zoom credentials are set
- Check Zoom app has correct scopes
- View backend logs for specific error

### Frontend can't reach backend
- Verify CORS is enabled in backend
- Check FRONTEND_URL is set correctly
- Ensure API URLs match in frontend

## Performance Tips

### Render.com Free Tier
- Free tier spins down after 15 min of inactivity
- First request after spin-down takes 30-60 seconds
- Upgrade to paid tier ($7/mo) for always-on service

### Optimization
- MongoDB: Use indexes on frequently queried fields
- Frontend: Enable build optimizations
- Images: Use CDN for any images/assets

## Monitoring

**Render Dashboard**
- View logs
- Check deployment status
- Monitor resource usage

**MongoDB Atlas**
- Database metrics
- Query performance
- Storage usage

**Resend Dashboard**
- Email delivery rates
- Bounce/spam reports

## Custom Domain

1. **Purchase domain** (Namecheap, Google Domains, etc.)

2. **Frontend** (Render/Vercel)
   - Add custom domain in dashboard
   - Update DNS CNAME records

3. **Backend** (Render)
   - Add custom domain (e.g., `api.builders.to`)
   - Update DNS CNAME records
   - Update FRONTEND_URL in backend env vars

## Security Checklist

- [ ] All API keys in environment variables (not code)
- [ ] MongoDB only accepts connections with username/password
- [ ] CORS configured to only allow your frontend domain
- [ ] Rate limiting enabled on API endpoints
- [ ] Input validation on all forms
- [ ] HTTPS enabled (automatic on Render/Vercel)

## Backup Strategy

**MongoDB Atlas**
- Enable automatic backups (free tier includes this)
- Export data periodically: `mongodump`

**Environment Variables**
- Keep backup copy in password manager
- Document all required variables

---

🎉 Your Builders.to platform is now live! Share it with the world and start building together!
