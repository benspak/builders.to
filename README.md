# Builders.to 🚀

A members-only launchpad and community platform for indie hackers and builders. Share your work in progress, track milestones, discover projects, hire verified talent, and grow in an ecosystem of builders who ship.

**[Join the Community on X](https://x.com/i/communities/1943895831322439993)**

## ✨ Features

### 🎯 Core Platform

- **Project Showcase** — Post your work at any stage: `Idea → Building → Beta → Launched → Paused → Acquired`. Free accounts can share up to 3 projects; Pro members get unlimited.
- **Daily Updates Feed** — Share what you're building with text, images, GIFs, and YouTube videos
- **Milestone Tracking** — Celebrate achievements: v1 shipped, first user, first customer, MRR milestones, profitability, and more
- **Top Builders Ranking** — Leaderboard based on launched projects, engagement, and community contribution

### 🤖 AI-Powered Content

- **AI Content Generation** — Generate posts and updates with GPT-4 Turbo
- **Content Analysis** — Get AI suggestions to improve engagement
- **Content Variations** — Generate multiple versions of your content
- **Content Ideas** — AI suggests post ideas based on your profile and interests
- **DALL-E Image Generation** — Create AI images for your posts (Pro feature)

### 🔗 Cross-Platform Posting

- **Twitter/X Integration** — Post directly to Twitter with full media support
- **LinkedIn Integration** — Share updates to your LinkedIn feed
- **Scheduled Posts** — Schedule your content for optimal timing
- **Platform-Specific Optimization** — AI tailors content for each platform

### 🏢 Companies & Startups

- **Company Profiles** — Showcase your startup with traction badges, tech stack, and team
- **Team Members** — Add co-founders and team with Owner/Admin/Member roles
- **Company Updates** — Internal build logs and announcements
- **Traction Badges** — Display customer count, revenue range, users, funding stage

### 💼 Opportunity Hub (Job Board)

- **Job Listings** — Post full-time, part-time, contract, freelance, cofounder, advisor, and intern roles
- **Categories** — Engineering, Design, Product, Marketing, Sales, Operations, Finance, and more
- **Compensation Transparency** — Salary ranges, equity, and currency options
- **Remote Filtering** — Location-based or remote opportunities

### 📍 Builders Local

- **Local Builder Network** — Find services, jobs, and meet builders in your area
- **Services** — Advertise your services for free
- **Categories** — Services, Community, Discussion, Coworking/Housing, For Sale
- **No Platform Fees** — Sellers keep 100% of their earnings via Stripe Connect
- **Location Discovery** — Find builders in your city
- **Map View** — Interactive map showing builders and services near you
- **Open Posting** — Any builder can post on Local
- **Privacy-First Location** — Coordinates offset ~10 miles for privacy

### 📅 Events & Meetups

- **Host Events** — Create in-person meetups, workshops, or virtual events
- **Event Types** — Support for physical, virtual, and hybrid events
- **RSVP System** — Track attendance with Going, Interested, and Not Going statuses
- **Nearby Events** — Discover events within your radius using geolocation
- **Event Comments** — Threaded discussions on event pages

### 💬 Real-Time Chat (Slack/Discord-style)

### 🗺️ Nearby Discovery

- **Find Nearby Builders** — Discover users within a customizable radius
- **Location-Based Filtering** — Filter events, sessions, and users by distance
- **Geolocation Support** — Use browser location for automatic nearby search
- **Radius Options** — Search within 5, 10, 25, or 50 km

### 💬 Threaded Conversations

- **Reply Chains** — Reply directly to comments creating threaded discussions
- **Nested Replies** — Visual indentation for reply threads
- **Reply Notifications** — Get notified when someone replies to your comment
- **Works Everywhere** — Threaded comments on updates, projects, listings, and events

### 🪙 Token System

- **In-App Currency** — Earn tokens through engagement
- **Welcome Bonus** — 5 tokens for new signups
- **Referral Rewards** — 10 tokens when your referral joins
- **Streak Bonuses** — Daily update streaks earn bonus tokens
- **Profile Completion** — 10 tokens for completing your profile
- **Token Gifting** — Send tokens to support fellow builders

### ⭐ Pro Subscription

- **Pro Monthly** — $3.99/month for premium features
- **Pro Yearly** — $39.99/year (save ~17%)
- **Unlimited Projects** — Free accounts can share up to 3 projects; Pro unlocks unlimited
- **Pro Rewards** — Earn real money for quality content
- **DALL-E Image Generation** — Create AI images for posts
- **Enhanced AI Features** — Priority access to AI content tools
- **Pro Badge** — Stand out in the community

### 🔔 Notifications & Engagement

- **In-App Notifications** — Real-time updates on likes, comments, mentions
- **Push Notifications** — PWA support for mobile
- **Daily Digest** — Summary of activity on your content
- **Weekly Digest** — Platform highlights delivered to email
- **@Mentions** — Tag other builders in updates

### 👤 Builder Operating System

- **Profile Flags** — Open to Work, Looking for Cofounder, Available for Contract
- **Follow System** — Build your network of builders
- **Streak Tracking** — Current and longest daily update streaks
- **Public Profiles** — SEO-friendly profile pages (`builders.to/username`)

### 📊 Analytics

- **View Tracking** — Project views, update views, listing views
- **Click Tracking** — Outbound link and contact info clicks
- **Site Statistics** — Community-wide metrics

### 📢 Advertising

- **Sidebar Ads** — Limited to 8 slots platform-wide with dynamic pricing
- **Dynamic Pricing** — Price doubles when slots fill up (ensures quality exposure)
- **Impression & Click Tracking** — Full analytics dashboard
- **Token Redemption** — Use tokens to unlock ad spots

### 🔒 Security

- **Two-Factor Authentication** — TOTP-based 2FA with backup codes
- **Content Reporting** — Flag inappropriate content
- **Rate Limiting** — Protection against abuse

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Runtime** | React 19 |
| **Database** | PostgreSQL + Prisma ORM 6 |
| **Authentication** | NextAuth.js v5 (Auth.js) |
| **OAuth Providers** | Twitter/X, GitHub |
| **Magic Link** | Resend Email |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React |
| **Animation** | Motion (Framer Motion) |
| **Payments** | Stripe + Stripe Connect |
| **Push Notifications** | Web Push API |
| **GIFs** | Giphy SDK |
| **Image Processing** | Sharp |
| **2FA** | OTPAuth + QRCode |
| **Markdown** | react-markdown |
| **AI** | OpenAI GPT-4 Turbo + DALL-E 3 |
| **Geocoding** | OpenStreetMap Nominatim |
| **Maps** | Interactive map components |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Twitter/X Developer Application (optional)
- GitHub OAuth Application (optional)
- Resend API Key (optional, for magic links)
- Stripe Account (optional, for payments)
- Giphy API Key (optional, for GIF search)

### 1. Clone and Install

```bash
git clone https://github.com/your-org/builders.to.git
cd builders.to
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/builders_to?schema=public"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Twitter/X OAuth (https://developer.twitter.com/en/portal/dashboard)
TWITTER_CLIENT_ID=""
TWITTER_CLIENT_SECRET=""

# GitHub OAuth (https://github.com/settings/developers)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Resend Email (https://resend.com) - for magic link auth
RESEND_API_KEY=""
EMAIL_FROM="Builders.to <noreply@yourdomain.com>"

# Stripe Payments (https://stripe.com)
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Giphy (https://developers.giphy.com)
NEXT_PUBLIC_GIPHY_API_KEY=""

# OpenAI (https://platform.openai.com)
OPENAI_API_KEY=""

# Web Push VAPID Keys (generate with: npm run generate-vapid-keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=""
VAPID_PRIVATE_KEY=""

ADMIN_EMAILS="admin@builders.to"
```

### 3. Set Up Database

```bash
# Generate Prisma client and push schema
npx prisma generate
npx prisma db push

# Or run migrations for production
npx prisma migrate deploy
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🔐 OAuth Setup

### Twitter/X

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a project and app
3. Enable OAuth 2.0 with:
   - Type: Web App
   - **Callback URLs (add BOTH)**:
     - `http://localhost:3000/api/auth/callback/twitter` (for login)
     - `http://localhost:3000/api/platforms/callback/twitter` (for cross-posting)
   - For production, add both URLs with your domain (e.g., `https://builders.to/api/auth/callback/twitter` and `https://builders.to/api/platforms/callback/twitter`)
4. Copy Client ID and Client Secret to `.env`

> **Note**: The app requires two callback URLs because login (NextAuth) and platform connection (cross-posting) use separate OAuth flows.

### GitHub

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set:
   - Homepage URL: `http://localhost:3000`
   - Callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to `.env`

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/                 # Auth pages (signin)
│   ├── (protected)/            # Protected routes (dashboard, settings, etc.)
│   │   ├── ads/                # Advertisement management
│   │   ├── my-companies/       # Company management
│   │   ├── my-listings/        # Local listing management
│   │   ├── notifications/      # Notification center
│   │   ├── projects/           # Project management (new, edit, import)
│   │   ├── referrals/          # Referral dashboard
│   │   ├── services/           # Services marketplace management
│   │   ├── settings/           # User settings & 2FA
│   │   └── tokens/             # Token balance & history
│   ├── [slug]/                 # Dynamic user profile pages
│   ├── api/                    # API routes (120+ endpoints)
│   │   ├── 2fa/                # Two-factor authentication
│   │   ├── ads/                # Advertisement CRUD & tracking
│   │   ├── auth/               # NextAuth handlers
│   │   ├── companies/          # Company management
│   │   ├── feed-events/        # Feed event interactions
│   │   ├── local-listings/     # Builders Local
│   │   ├── notifications/      # Notification management
│   │   ├── projects/           # Project CRUD
│   │   ├── services/           # Services marketplace
│   │   ├── tokens/             # Token system
│   │   └── ...                 # Many more endpoints
│   ├── companies/              # Company directory pages
│   ├── feed/                   # Main builder feed
│   ├── local/                  # Builders Local pages
│   ├── projects/               # Project detail pages
│   ├── services/               # Services marketplace pages
│   └── streamers/              # Builder streamers directory
├── components/
│   ├── ads/                    # Advertisement components
│   ├── analytics/              # View tracking components
│   ├── auth/                   # Auth & 2FA components
│   ├── comments/               # Comment system
│   ├── companies/              # Company components
│   ├── feed/                   # Feed & updates components
│   ├── local/                  # Builders Local components
│   ├── notifications/          # Notification UI
│   ├── profile/                # Profile components
│   ├── projects/               # Project cards & forms
│   ├── pwa/                    # PWA install prompts
│   ├── services/               # Services marketplace UI
│   ├── ui/                     # Shared UI components
│   └── updates/                # Daily update components
├── lib/
│   ├── auth.ts                 # NextAuth configuration
│   ├── prisma.ts               # Prisma client singleton
│   ├── stripe.ts               # Stripe utilities
│   ├── tokens.ts               # Token system
│   └── utils.ts                # Helper utilities
└── middleware.ts               # Auth & route protection
```

## 🌐 Deployment on Render.com

This project includes a `render.yaml` blueprint for one-click deployment.

### One-Click Deploy

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New** → **Blueprint**
4. Connect your GitHub repository
5. Render will automatically detect `render.yaml` and create:
   - A **Web Service** for the Next.js app
   - A **PostgreSQL Database**
   - A **Persistent Disk** for user uploads

### Post-Deployment Setup

Configure these environment variables in the Render dashboard:

1. **NEXTAUTH_URL**: Set to your Render app URL (e.g., `https://builders.to`)
2. **TWITTER_CLIENT_ID** & **TWITTER_CLIENT_SECRET**: From Twitter Developer Portal
3. **GITHUB_CLIENT_ID** & **GITHUB_CLIENT_SECRET**: From GitHub Developer Settings
4. **STRIPE_SECRET_KEY**, **STRIPE_PUBLISHABLE_KEY**, **STRIPE_WEBHOOK_SECRET**: From Stripe Dashboard
5. **RESEND_API_KEY**: From Resend Dashboard
6. **ADMIN_EMAILS**: Comma-separated list of admin email addresses (for moderation, etc.)

**Important**: Update your OAuth callback URLs to use your production domain:
- Twitter (both required):
  - `https://your-domain.com/api/auth/callback/twitter` (login)
  - `https://your-domain.com/api/platforms/callback/twitter` (cross-posting)
- GitHub: `https://your-domain.com/api/auth/callback/github`

## 📜 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Prisma
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema to database
npx prisma studio    # Open Prisma Studio GUI
npx prisma migrate   # Run database migrations

# Utilities (in /scripts)
npm run generate-vapid-keys   # Generate VAPID keys for push notifications
```

## 🗂️ Database Schema

The database includes 50+ models covering:

- **Users & Auth**: User, Account, Session, VerificationToken
- **Projects**: Project, ProjectImage, ProjectMilestone, ProjectCoBuilder, Upvote, Comment
- **Companies**: Company, CompanyMember, CompanyUpdate, CompanyRole
- **Feed**: FeedEvent, FeedEventLike, FeedEventComment, DailyUpdate, UpdateLike, UpdateComment
- **Marketplace**: ServiceListing, ServicePortfolio, ServiceOrder
- **Local**: LocalListing, LocalListingImage, LocalListingComment, LocalListingFlag, LocalListingRating
- **Events**: Event, EventAttendee, EventComment
- **Tokens**: TokenTransaction
- **Notifications**: Notification, EmailPreferences, PushSubscription
- **Advertising**: Advertisement, AdView, AdClick
- **Analytics**: SiteView, ProjectView, ProjectClick, UpdateView, LocalListingView
- **Social**: Follow, Report
- **Subscriptions**: Pro subscriptions, Stripe integration
- **Rewards**: Post rewards, earnings, payouts
- **Platforms**: Connected platforms (Twitter, LinkedIn), OAuth tokens
- **AI**: User interests, tone preferences, posting style

## 🔮 Future Improvements

- [ ] **Restrict Image Domains**: Remove the wildcard `hostname: '**'` pattern in `next.config.mjs` and replace with specific allowed domains
- [ ] **Advanced Search**: Full-text search across projects, users, and companies
- [ ] **AI Features**: Smart project recommendations and auto-tagging
- [ ] **Mobile App**: React Native companion app
- [ ] **Webhooks**: External integrations for project milestones
## 🤝 Community

- 🐦 [X Community](https://x.com/i/communities/1943895831322439993)
- 🌐 [Live Site](https://builders.to)

## 📄 License

MIT

---

Built with ❤️ by the Builders.to community
