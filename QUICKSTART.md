# Quick Start Guide - Builders.to

Get up and running in 5 minutes!

## 1. Install Dependencies

```bash
# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

## 2. Configure Environment

### Backend
```bash
cd backend

# Create .env file manually (if .env.example doesn't exist)
cat > .env << EOF
PORT=5555
NODE_ENV=development
DATABASE_PATH=./builders.db
JWT_SECRET=change_this_secret_key_to_something_secure
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
EOF

# Edit .env with your Stripe keys
```

**Required environment variables:**
- `PORT`: Server port (default 5555)
- `JWT_SECRET`: Random string for JWT signing (generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
- `STRIPE_SECRET_KEY`: From your Stripe dashboard
- `STRIPE_PUBLISHABLE_KEY`: From your Stripe dashboard
- `DATABASE_PATH`: Path to SQLite database (default ./builders.db)

### Frontend
```bash
cd frontend

# Create .env file manually (if .env.example doesn't exist)
cat > .env << EOF
VITE_API_URL=http://localhost:5555
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
EOF

# Edit .env with your Stripe publishable key
```

**Required environment variables:**
- `VITE_API_URL`: Backend API URL (default http://localhost:5555)
- `VITE_STRIPE_PUBLISHABLE_KEY`: From your Stripe dashboard (same as backend)

## 3. Get Stripe Test Keys

1. Sign up at https://stripe.com
2. Go to Developers > API keys
3. Copy your test keys
4. Add to `.env` files

## 4. Start the Application

**Option A: Run both simultaneously (recommended)**

From project root:
```bash
npm run dev
```

**Option B: Run separately**

Terminal 1:
```bash
cd backend
npm run dev
```

Terminal 2:
```bash
cd frontend
npm run dev
```

## 5. Access the App

- Frontend: http://localhost:3000
- Backend API: http://localhost:5555
- API Health: http://localhost:5555/health

## 6. Test the Application

1. **Register**: Create a new account
2. **Profile**: Fill out your profile
3. **Create Listing**: Post a listing (Jobs, Services, or For Sale)
4. **Pay $5**: Complete payment to publish (REQUIRED)
   - Your listing is created as a "draft" until payment is completed
   - Only paid listings appear in the public feed
5. **Feature** (optional): Pay $50 to pin to top after initial payment

## Features

✅ User authentication (register/login)
✅ User profiles with detailed information
✅ Create listings in 3 categories (payment required before publication)
✅ Location-based filtering
✅ Payment processing with Stripe ($5 to publish)
✅ Featured listings ($50 to pin to top)
✅ Dashboard to view your listings & transactions
✅ Duplicate post prevention (anti-spam)
✅ Pending listings only visible to owners until paid
✅ Responsive design with Chakra UI
✅ Error handling and validation

## API Endpoints

- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/profiles/me` - Get my profile
- `POST /api/profiles` - Create/update profile
- `GET /api/listings` - Get all listings
- `POST /api/listings` - Create listing
- `POST /api/payments/create-listing-payment` - Pay for listing
- `POST /api/payments/create-featured-payment` - Feature listing
- `GET /api/dashboard` - Get dashboard data

## Project Structure

```
builders.to/
├── backend/
│   ├── database/
│   │   └── init.js          # Database initialization
│   ├── routes/
│   │   ├── auth.js          # Authentication
│   │   ├── profiles.js      # User profiles
│   │   ├── listings.js      # Listings
│   │   ├── payments.js      # Stripe payments
│   │   └── dashboard.js     # Dashboard data
│   ├── server.js            # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## Common Commands

```bash
# Install all dependencies
npm run install-all

# Run development mode (both services)
npm run dev

# Run backend only
npm run dev:backend

# Run frontend only
npm run dev:frontend

# Build for production
npm run build
```

## Troubleshooting

**Port already in use?**
- Backend uses port 5555, frontend uses port 3000
- Change in .env files if needed

**Database error?**
- Delete `builders.db` and restart
- Database is auto-created on first run

**Stripe not working?**
- Check API keys are correct in .env files
- Make sure `STRIPE_SECRET_KEY` starts with `sk_test_`
- Make sure `VITE_STRIPE_PUBLISHABLE_KEY` starts with `pk_test_`
- Use test cards: 4242 4242 4242 4242
- Check Stripe dashboard for logs
- Check browser console for error messages

**500 Internal Server Error on Payment?**
- Verify STRIPE_SECRET_KEY is set in backend/.env
- Check backend console for detailed error messages
- Ensure Stripe keys are from the same account (test or live)

**Duplicate listing error?**
- You cannot post the same listing within 24 hours
- System prevents spam by checking for duplicate posts
- Change your title or description to make it unique

**Environment variables not loading?**
- Make sure .env files are in the correct directories
- Backend .env should be in `/backend/` folder
- Frontend .env should be in `/frontend/` folder
- Restart your development servers after changing .env files

## Next Steps

1. Read `SETUP.md` for detailed setup
2. Read `DEPLOYMENT.md` for production deployment
3. Customize branding and colors
4. Add more features!

## Support

For issues or questions, check:
- Logs in terminal
- Backend: http://localhost:5555/health
- Stripe dashboard for payment issues

Happy building! 🚀
