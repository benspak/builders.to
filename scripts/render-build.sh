#!/usr/bin/env bash
# Render.com build script
# This script runs during the build phase on Render

set -e

echo "📦 Installing dependencies..."
npm install

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🗄️ Running database migrations..."
npx prisma db push --accept-data-loss

echo "🏗️ Building Next.js application..."
npm run build

echo "✅ Build complete!"
