# Fixing the 500 Internal Server Error on /api/listings

## Issue
The API endpoint `/api/listings` is returning a 500 Internal Server Error on production.

## Root Cause
The issue is likely related to one of the following:
1. `better-sqlite3` not being built correctly on Render's build environment
2. Database file not being created or accessible on Render's ephemeral filesystem
3. Missing build dependencies for native compilation of better-sqlite3

## Changes Made

### 1. Enhanced Error Logging
- Added detailed error logging in `backend/database/db.js`
- Added error logging in `backend/routes/listings.js` to catch PRAGMA errors
- Added database health check endpoint at `/health/db`

### 2. Build Process Improvements
- Added `.nvmrc` file specifying Node 18
- Updated `package.json` to include a `build` script that rebuilds better-sqlite3
- Updated `render.yaml` to include the build step and specify Node 18

### 3. Database Initialization
- Added connection testing on database initialization
- Added retry logic for database connection
- Made verbose logging conditional (only in development)

## Next Steps

### Deploy and Test
1. Commit and push changes to trigger Render rebuild
2. Check Render logs to see detailed error messages
3. Test the `/health/db` endpoint to verify database connection
4. If issue persists, check for:
   - Missing system dependencies
   - File permissions on database file
   - better-sqlite3 compilation errors

### If better-sqlite3 Still Fails
Consider these alternatives:
1. Use PostgreSQL instead of SQLite (better for production)
2. Add system dependencies to Render build
3. Use a different SQLite library that doesn't require native compilation

## Testing
After deployment, test these endpoints:
- `GET /health` - Basic health check
- `GET /health/db` - Database health check
- `GET /api/listings` - Should now work if database is healthy

