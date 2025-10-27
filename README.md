# builders.to

A marketplace for builders and founders to offer services, get hired, or sell businesses.

## Features

- **User Profiles**: Complete profiles with name, location, about, achievements, skills, and more
- **Listings**: Post in three categories:
  - Jobs
  - Services
  - For Sale
- **Payments**:
  - $5 per listing
  - $50 to feature/pin listings to the top
- **Filtering**: Filter by location/city and category
- **Dashboard**: View all your listings and transactions

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL database
- JWT authentication
- Stripe for payments

### Frontend
- React + Vite
- Chakra UI v2
- Stripe Elements for checkout
- React Router for navigation

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
   cp .env.example .env
   # Edit .env with your Stripe keys
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure environment variables**

   Backend: Ensure your backend .env has:
   ```
   PORT=5555
   ```

   Backend `.env`:
   ```env
   PORT=5555
   JWT_SECRET=your_super_secret_jwt_key
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   DATABASE_URL=postgresql://localhost:5432/builders_dev
   NODE_ENV=development
   ```

   Frontend `.env`:
   ```env
   VITE_API_URL=http://localhost:5555
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
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
- `POST /api/listings` - Create listing
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing
- `GET /api/listings/user/my-listings` - Get my listings

### Payments
- `POST /api/payments/create-listing-payment` - Create payment for listing
- `POST /api/payments/create-featured-payment` - Create payment for featured listing

### Dashboard
- `GET /api/dashboard` - Get dashboard data (listings and transactions)

## Database Schema

### Users
- id, email, password_hash, created_at, updated_at

### Profiles
- id, user_id, name, sub_heading, location, about, current_role, additional_details, key_achievements, philosophy, skills, links, created_at, updated_at

### Listings
- id, user_id, category, title, location, description, is_featured, payment_status, created_at, updated_at

### Transactions
- id, user_id, listing_id, type, amount, stripe_payment_intent_id, status, created_at

## Deployment

**Quick Deploy to Render**: The application includes `render.yaml` for automated deployment. See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete instructions.

### Automatic Deployment
1. Push code to GitHub
2. Connect repository to Render
3. Render automatically provisions:
   - PostgreSQL database
   - Backend web service
   - Frontend static site

### Manual Configuration
If needed, see detailed instructions in [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the dashboard
3. Set up webhook endpoint at `https://your-backend-url/api/payments/webhook`
4. Add the webhook secret to your environment variables

## License

MIT
