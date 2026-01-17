#!/usr/bin/env bash
# Render.com build script
# This script runs during the build phase on Render

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
# Apply token system schema changes safely before prisma db push
npx prisma db execute --schema ./prisma/schema.prisma --file ./scripts/pre-push-token-system.sql || true

echo "🗄️ Running database migrations..."
npx prisma db push

echo "🔄 Running slug migration for existing projects..."
node scripts/migrate-slugs.mjs || {
  echo "⚠️  Slug migration had issues (may be okay if already done)"
}

echo "🏗️ Building Next.js application..."
npm run build

echo "✅ Build complete!"
