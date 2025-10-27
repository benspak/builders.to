# PostgreSQL Migration Guide

This document outlines the migration from SQLite to PostgreSQL for the Builders.to application.

## What Changed

### Database
- **From**: SQLite (file-based database)
- **To**: PostgreSQL (production-grade database)

### Files Modified
1. `backend/database/db.js` - Already using PostgreSQL connection pooling
2. `backend/server.js` - Fixed database health check to use PostgreSQL async queries
3. `backend/routes/dashboard.js` - Migrated from SQLite `.prepare()` syntax to PostgreSQL async queries
4. `backend/routes/listings.js` - Already using PostgreSQL syntax
5. `backend/routes/profiles.js` - Already using PostgreSQL syntax
6. `backend/routes/auth.js` - Already using PostgreSQL syntax
7. `backend/routes/payments.js` - Already using PostgreSQL syntax
8. `render.yaml` - Added PostgreSQL database service configuration
9. Deleted: `backend/builders.db` (old SQLite database file)

### Key Differences

#### Query Execution
- **SQLite**: Synchronous methods like `db.prepare().get()`, `db.prepare().all()`
- **PostgreSQL**: Asynchronous queries with `await db.query()`

#### Parameter Binding
- **SQLite**: Uses `?` placeholders
- **PostgreSQL**: Uses `$1, $2, $3...` placeholders

#### Result Access
- **SQLite**: Direct access to result object
- **PostgreSQL**: Results returned in `result.rows` array

### Example Migration

**SQLite (Old)**:
```javascript
const listings = db.prepare('SELECT * FROM listings WHERE user_id = ?').all(userId);
```

**PostgreSQL (New)**:
```javascript
const result = await db.query('SELECT * FROM listings WHERE user_id = $1', [userId]);
const listings = result.rows;
```

## Deployment Configuration

The `render.yaml` file has been updated to:
1. Create a PostgreSQL database instance on Render
2. Automatically connect the backend to the database using the `DATABASE_URL` environment variable

### Database Configuration
- **Name**: builders-db
- **Plan**: starter (free tier)
- **Connection**: Managed by Render, accessible via `DATABASE_URL` environment variable

## Environment Variables

Make sure these environment variables are set in your Render dashboard:

- `DATABASE_URL` - Automatically set by Render from the database service
- `POSTGRES_DATABASE_URL` - Alternative connection string (if using external PostgreSQL)
- `JWT_SECRET` - For authentication
- `STRIPE_SECRET_KEY` - For payment processing
- `STRIPE_WEBHOOK_SECRET` - For Stripe webhooks
- `NODE_ENV` - Set to `production`

## Database Schema

The PostgreSQL database includes these tables:
- `users` - User accounts
- `profiles` - User profiles
- `listings` - Job/service listings
- `transactions` - Payment transactions

All tables are automatically created on application startup via the `initializeDatabase()` function in `backend/database/db.js`.

## Migration Steps for Render Deployment

1. **Push changes to GitHub**:
   ```bash
   git add .
   git commit -m "Migrate to PostgreSQL"
   git push origin main
   ```

2. **Deploy on Render**:
   - Render will automatically detect the changes
   - The PostgreSQL database service will be created
   - Tables will be initialized automatically on first startup

3. **Verify deployment**:
   - Check health endpoint: `https://builders-to-backend.onrender.com/health`
   - Check database health: `https://builders-to-backend.onrender.com/health/db`

## Local Development

For local development, you have two options:

### Option 1: Local PostgreSQL (Recommended)
1. Install PostgreSQL locally
2. Create a local database: `createdb builders_dev`
3. Set environment variable:
   ```bash
   export DATABASE_URL="postgresql://localhost:5432/builders_dev"
   ```

### Option 2: Use Render PostgreSQL (Cloud)
Use the connection string from your Render PostgreSQL dashboard.

## Testing the Migration

1. **Check database connection**:
   ```bash
   curl https://builders-to-backend.onrender.com/health/db
   ```

2. **Test API endpoints**:
   - Register a new user
   - Create a profile
   - Create a listing
   - Make a payment (test mode)

## Rollback Plan

If you need to rollback to SQLite:
1. Restore `backend/builders.db` from git history
2. Update `backend/database/db.js` to use SQLite
3. Update all routes to use SQLite syntax
4. Rebuild and redeploy

## Benefits of PostgreSQL

1. **Production-ready**: Better for production workloads
2. **Concurrent access**: Handles multiple users better
3. **Scalability**: Can grow with your application
4. **Features**: Advanced SQL features, transactions, foreign keys
5. **Cloud-native**: Works better with cloud hosting platforms like Render

## Next Steps

1. Monitor database performance in the Render dashboard
2. Set up database backups (automatic on Render paid plans)
3. Consider adding database indexes for frequently queried fields:
   - `users.email` (already has UNIQUE constraint)
   - `profiles.user_id` (already has UNIQUE constraint)
   - `listings.user_id`
   - `listings.created_at` (for sorting)

## Support

If you encounter any issues:
1. Check Render logs for database connection errors
2. Verify environment variables are set correctly
3. Test database connectivity using the health endpoints
