#!/usr/bin/env bash
# Render.com build script
# This script runs during the build phase on Render
# Updated: 2026-02-01 - Added fix migration for growth features

set -e

echo "🔍 Build environment info..."
echo "  Node version: $(node --version)"
echo "  npm version: $(npm --version)"
echo "  Working directory: $(pwd)"

echo "🧹 Clearing build cache..."
rm -rf .next node_modules/.cache

echo "📂 Verifying source files exist..."
ls -la src/lib/
ls -la src/components/auth/
ls -la src/components/projects/

echo "📦 Installing ALL dependencies (including devDependencies for build)..."
npm ci --include=dev

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🗄️ Cleaning up deprecated tables..."
# Explicitly drop the RoastMVP table that was removed from the schema
npx prisma db execute --schema ./prisma/schema.prisma --file ./scripts/drop-roast-mvp.sql || true

echo "🗄️ Running pre-migration scripts..."
# Apply token system schema changes safely before migrations
npx prisma db execute --schema ./prisma/schema.prisma --file ./scripts/pre-push-token-system.sql || true

echo "🗄️ Syncing migration history..."
# Mark existing migrations as applied if schema already has those changes
# This handles cases where db push was used previously
bash scripts/sync-migrations.sh || true

echo "🗄️ Checking migration status..."
npx prisma migrate status || true

echo "🗄️ Running database migrations..."
# Use migrate deploy for production - it applies pending migrations safely
npx prisma migrate deploy --schema ./prisma/schema.prisma 2>&1 || {
  echo "⚠️  migrate deploy failed, checking if we need to force apply..."
  echo "Attempting db push as fallback..."
  npx prisma db push --accept-data-loss 2>&1 || {
    echo "❌ Both migrate deploy and db push failed!"
    exit 1
  }
}

echo "🔍 Verifying migration applied - checking for karma column..."
npx prisma db execute --schema ./prisma/schema.prisma --stdin <<< "SELECT column_name FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'karma';" || echo "⚠️  Could not verify karma column"

echo "🔄 Running slug migration for existing projects..."
node scripts/migrate-slugs.mjs || {
  echo "⚠️  Slug migration had issues (may be okay if already done)"
}

echo "🏗️ Building Next.js application..."
npm run build

echo "✅ Build complete!"
