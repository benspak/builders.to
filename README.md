# builders.to

A marketplace for builders and founders to offer services, get hired, or sell businesses.

## Features

- **User Profiles**: Complete profiles with name, location, about, achievements, skills, and more
- **Listings**: Post in three categories:
  - Jobs
  - Services
  - For Sale
- **Token System**:
  - Purchase tokens (1 token = $1)
  - Use tokens to create listings (5 tokens per listing)
  - Get 1 free post for every 5 posts you purchase
- **Payment Options**:
  - Direct payment: $5 per listing (traditional payment)
  - Token payment: Use 5 tokens per listing
  - $50 to feature/pin listings to the top
- **Referral Program**:
  - Generate your unique referral code
  - Refer friends and earn 5 tokens (1 free post) when they set their username
- **Filtering**: Filter by location/city and category
- **Dashboard**: View all your listings, transactions, and token balance

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL database
- JWT authentication
- Stripe for payments

### Frontend
- Next.js 16 (App Router)
- React 18
- Lexical rich text editor
- Stripe Elements for checkout

## Getting Started

### Prerequisites
- Node.js 18+
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd builders.to
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure environment variables**

   Backend `.env`:
   ```env
   PORT=5555
   JWT_SECRET=your_super_secret_jwt_key
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   DATABASE_URL=postgresql://localhost:5432/builders_dev
   POSTGRES_DATABASE_URL=postgresql://localhost:5432/builders_dev
   NODE_ENV=development
   RESEND_API_KEY=re_...
   RESEND_FROM_EMAIL=noreply@builders.to
   FRONTEND_URL=http://localhost:3000
   ```

   Frontend `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5555
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

   **Note**: Create a local PostgreSQL database before starting:
   ```bash
   createdb builders_dev
   ```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The app will be available at http://localhost:3000. Make sure the backend is running on port 5555.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Profiles
- `GET /api/profiles` - Get all profiles
- `GET /api/profiles/me` - Get my profile
- `GET /api/profiles/:id` - Get profile by ID
- `POST /api/profiles` - Create or update profile

### Listings
- `GET /api/listings` - Get all listings
- `GET /api/listings/:id` - Get listing by ID
- `POST /api/listings` - Create listing (requires 5 tokens or direct payment)
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing
- `GET /api/listings/user/my-listings` - Get my listings

### Payments
- `POST /api/payments/create-listing-payment` - Create payment intent for listing ($5)
- `POST /api/payments/create-featured-payment` - Create payment intent for featured listing ($50)
- `POST /api/payments/webhook` - Stripe webhook endpoint (handles token purchases, listing payments, and featured payments)

### Tokens
- `GET /api/tokens/balance` - Get user's current token balance
- `GET /api/tokens/transactions` - Get token transaction history (purchases, spent, rewards, refunds)
- `POST /api/tokens/purchase` - Create payment intent for token purchase (1 token = $1, accepts 1-1000 tokens)

### Referrals
- `GET /api/referrals/code` - Get or generate user's referral code (auto-generates if missing)
- `GET /api/referrals/stats` - Get referral statistics (total referrals, rewarded referrals)
- `GET /api/referrals/verify/:code` - Verify if a referral code is valid (public endpoint, no auth required)

### Dashboard
- `GET /api/dashboard` - Get dashboard data (listings and transactions)

## Database Schema

### Users
- id, email, password_hash, name, username, referral_code, referred_by, tokens, posts_purchased, is_admin, created_at, updated_at

### Profiles
- id, user_id, name, sub_heading, location, about, current_role, additional_details, key_achievements, philosophy, skills, links, created_at, updated_at

### Listings
- id, user_id, category, title, location, description, is_featured, payment_status, created_at, updated_at

### Transactions
- id, user_id, listing_id, type, amount, stripe_payment_intent_id, status, created_at

### Token Transactions
- id, user_id, type, amount, description, stripe_payment_intent_id, created_at

### Referrals
- id, referrer_id, referred_id, reward_given, created_at

### Password Reset Tokens
- id, user_id, token, expires_at, used, created_at

## Deployment

**Quick Deploy to Render**: The application includes `render.yaml` for automated deployment. See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete instructions.

### Automatic Deployment
1. Push code to GitHub
2. Connect repository to Render
3. Render automatically provisions:
   - PostgreSQL database
   - Backend web service (serves both API and frontend)

### Manual Configuration
If needed, see detailed instructions in [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## New Features

### Token System
Users can purchase tokens (1 token = $1) and use 5 tokens to create a listing. The system includes a "buy 5 get 1 free" promotion:
- For every 5 posts you pay for (using tokens or direct payment), the 6th post is free
- Tokens can be purchased in increments: 5, 10, 25, 50, or 100 tokens
- View your token balance and transaction history on the Tokens page

### Referral Program
- Every user automatically gets a unique referral code
- Share your referral link: `/register?ref=YOUR_CODE`
- When someone signs up with your code and sets their username, you automatically receive 5 tokens (1 free post)
- Track your referral statistics (total referrals, rewarded referrals) on the Referrals page

## Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the dashboard
3. Set up webhook endpoint at `https://your-backend-url/api/payments/webhook`
4. Add the webhook secret to your environment variables

## License

MIT
