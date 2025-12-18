#!/usr/bin/env bash
# Render.com build script
# This script runs during the build phase on Render

set -e

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

echo "🗄️ Running database migrations..."
npx prisma db push --accept-data-loss

echo "🔄 Running slug migration for existing projects..."
node scripts/migrate-slugs.mjs

echo "🏗️ Building Next.js application..."
npm run build

echo "✅ Build complete!"
