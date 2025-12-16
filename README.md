# Builders.to 🚀

A members-only project launchpad for builders. Share your work in progress, get feedback from the community, and find your first users.

**Part of the [Builder community on X](https://x.com/i/communities/1943895831322439993)**

## Features

- 🔐 **Members-Only Access** - Sign in with Discord or X/Twitter
- 📝 **Project Sharing** - Post your work at any stage (Idea → Building → Beta → Launched)
- ⬆️ **Upvoting** - Support projects you love
- 💬 **Comments** - Give and receive feedback
- 🔍 **Discovery** - Browse, search, and filter projects
- 📱 **Responsive** - Works beautifully on all devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js v5 (Discord & Twitter OAuth)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Discord Developer Application
- Twitter/X Developer Application

### 1. Clone and Install

```bash
git clone <your-repo>
cd builders.to
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Then fill in your values:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/builders_to?schema=public"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Discord OAuth (https://discord.com/developers/applications)
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""

# Twitter/X OAuth (https://developer.twitter.com/en/portal/dashboard)
TWITTER_CLIENT_ID=""
TWITTER_CLIENT_SECRET=""
```

### 3. Set Up Database

```bash
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## OAuth Setup

### Discord

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 → General
4. Add redirect URL: `http://localhost:3000/api/auth/callback/discord`
5. Copy Client ID and Client Secret to `.env`

### Twitter/X

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a project and app
3. Enable OAuth 2.0 with:
   - Type: Web App
   - Callback URL: `http://localhost:3000/api/auth/callback/twitter`
4. Copy Client ID and Client Secret to `.env`

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Auth pages (signin)
│   ├── (protected)/      # Protected routes (dashboard, new project)
│   ├── api/              # API routes
│   ├── projects/         # Public project pages
│   └── page.tsx          # Landing page
├── components/
│   ├── auth/             # Auth components
│   ├── comments/         # Comment components
│   ├── projects/         # Project components
│   └── ui/               # UI components
└── lib/
    ├── auth.ts           # NextAuth config
    ├── prisma.ts         # Prisma client
    └── utils.ts          # Utilities
```

## Community

- 🐦 [X Community](https://x.com/i/communities/1943895831322439993)
- 💬 [Discord](https://discord.com/invite/G7nmswWkbn)

## License

MIT

---

Built with ❤️ by the Builder community
