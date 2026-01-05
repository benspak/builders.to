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
# Using db push to sync schema - safe for adding nullable columns
npx prisma db push

echo "🔄 Running slug migration for existing projects..."
node scripts/migrate-slugs.mjs

echo "🏗️ Building Next.js application..."
npm run build

echo "✅ Build complete!"
