# Quick Start Guide - Builders.to

Get your video coworking platform running in 5 minutes!

## 🚀 Fastest Path to Launch

### Option 1: Use TidyCal (0 minutes)
You already have it! Just share: https://tidycal.com/benvspak/virtual-coworking

### Option 2: Deploy Full Platform (30 minutes)

#### Step 1: Install (2 minutes)
```bash
cd /Users/benjaminspak/Desktop/repos/builders.to
npm run install:all
```

#### Step 2: Configure Backend (5 minutes)
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://your-connection-string
RESEND_API_KEY=re_your_key
```

**Get MongoDB URI** (Free):
1. Go to mongodb.com/cloud/atlas
2. Create free cluster (M0)
3. Create database user
4. Allow all IPs (0.0.0.0/0)
5. Get connection string

**Get Resend API Key** (Free):
1. Go to resend.com
2. Sign up
3. Get API key from dashboard

#### Step 3: Run Locally (1 minute)
```bash
cd /Users/benjaminspak/Desktop/repos/builders.to
npm run dev
```

Open: http://localhost:5173

#### Step 4: Test It (3 minutes)
1. Click "Schedule a Session"
2. Fill in your details
3. Add 2-3 time slots
4. Create session
5. Vote on your own session
6. Check your email!

#### Step 5: Deploy (20 minutes)
See `DEPLOYMENT.md` for detailed instructions.

Quick deploy to Render.com:
1. Push to GitHub
2. Connect to Render
3. Deploy backend + frontend
4. Add environment variables
5. Done! 🎉

## 🎯 What You Get

### Landing Page
- Beautiful dark mode design (Spotify-inspired)
- Clear value proposition
- Call-to-action buttons

### Scheduling System
- Create sessions with multiple time options
- Share link with participants
- Consensus voting (everyone votes on best time)
- Automatic email notifications

### Meeting Management
- Generate Zoom links automatically
- Track participants
- View upcoming sessions
- Session countdown

### Email Notifications
- Session created confirmation
- Voting updates
- Schedule confirmation
- Meeting reminders (coming soon)

## 📱 User Flow

### For Organizers:
1. Create session → Add time slots
2. Share link with team
3. Review votes
4. Finalize winning time
5. Generate Zoom link
6. Show up and build together!

### For Participants:
1. Receive link
2. View proposed times
3. Vote for preferred time
4. Get confirmation email
5. Receive Zoom link
6. Join and cowork!

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check if MongoDB is connected
cd backend
npm start

# Should see: "MongoDB connected successfully"
```

### Frontend can't reach backend
```bash
# Make sure backend is running on port 5000
curl http://localhost:5000/api/health

# Should return: {"status":"ok"}
```

### Emails not sending
- Verify RESEND_API_KEY in `.env`
- Check Resend dashboard for errors
- Free tier: 100 emails/day (plenty for testing)

### Zoom links not generating
- You need Zoom API credentials
- Optional for MVP - can use manual Zoom links
- See DEPLOYMENT.md for Zoom setup

## 💡 Tips

### For MVP Testing:
- Skip Zoom integration initially
- Use Google Meet/Zoom personal links
- Focus on the voting/scheduling UX
- Get 5-10 user feedback sessions

### For Production:
- Set up custom domain
- Configure Zoom OAuth
- Add analytics (Plausible/Google)
- Set up monitoring (Sentry)

### For Growth:
- Add recurring sessions
- Build community features
- Integrate with Slack/Discord
- Add session recordings

## 🎨 Customization

### Change Colors:
Edit `frontend/src/theme.js`:
```javascript
colors: {
  brand: {
    500: '#3f9142', // Change this!
  }
}
```

### Change Copy:
Edit `frontend/src/pages/Home.jsx`:
```javascript
<Heading>
  Your Custom Headline Here
</Heading>
```

### Change Session Length:
Edit `backend/models/Meeting.js`:
```javascript
duration: {
  type: Number,
  default: 45 // Change to 60, 90, etc.
}
```

## 📊 Metrics to Track

### Week 1:
- Sessions created
- Votes cast
- Emails sent
- User feedback

### Month 1:
- Active users
- Sessions completed
- Avg. participants per session
- Email open rates

### Quarter 1:
- Revenue (if monetized)
- Retention rate
- NPS score
- Feature requests

## 🚦 Launch Checklist

- [ ] MongoDB connected
- [ ] Emails sending
- [ ] Create test session
- [ ] Vote on session
- [ ] Finalize meeting
- [ ] Verify email received
- [ ] Test on mobile
- [ ] Share with 3 friends for feedback
- [ ] Deploy to production
- [ ] Custom domain (optional)
- [ ] Analytics setup
- [ ] Launch! 🚀

## 🤝 Next Steps

1. **Test locally** (5 min)
2. **Get feedback** from 5 potential users (1 day)
3. **Iterate** based on feedback (1-2 days)
4. **Deploy** to production (30 min)
5. **Launch** on Twitter/LinkedIn (1 day)
6. **First paying customer** (1 week)

## 💰 Monetization Ideas

### Freemium Model:
- Free: 3 sessions/month
- Pro: Unlimited sessions - $20/month
- Team: Multiple organizers - $50/month

### Features to Charge For:
- Recurring sessions
- Custom branding
- Session recordings
- Advanced analytics
- Priority support
- API access

### Target Market:
- Indie hackers: $20/month
- Small teams: $50/month
- Communities: $200/month
- Enterprises: Custom pricing

## 📈 Growth Strategy

### Week 1-2: Launch
- Post on Twitter/LinkedIn
- Share in indie hacker communities
- DM 50 potential users
- Get 10 user testing sessions

### Week 3-4: Iterate
- Fix top 3 pain points
- Add most requested feature
- Improve onboarding
- Create demo video

### Month 2: Scale
- Content marketing (blog posts)
- SEO optimization
- Partnerships with accelerators
- Launch affiliate program

### Month 3: Monetize
- Add pricing page
- Stripe integration
- Convert free users to paid
- Target: $1K MRR

## 🎯 Success Metrics

### Activation:
- User creates first session: 50%+
- User invites others: 70%+
- Session completed: 80%+

### Retention:
- Week 1 return: 40%+
- Month 1 return: 20%+
- Create 2nd session: 60%+

### Revenue (if charging):
- Free to paid: 5%+
- MRR growth: 20%/month
- Churn: <5%/month

---

**Ready to build?** Start with:
```bash
npm run install:all
cd backend && cp .env.example .env
# Add your MongoDB URI and Resend API key
cd ..
npm run dev
```

Then open http://localhost:5173 and create your first session! 🚀

Questions? Check out INTEGRATION_GUIDE.md for different deployment options.
