#!/usr/bin/env bash
# Render.com start script
# This script runs at runtime when the persistent disk is mounted

set -e

echo "📁 Ensuring upload directories exist on persistent disk..."
if [ -n "$UPLOAD_DIR" ]; then
  mkdir -p "$UPLOAD_DIR/projects"
  mkdir -p "$UPLOAD_DIR/companies"
  mkdir -p "$UPLOAD_DIR/updates"
  echo "  Created directories under $UPLOAD_DIR"
else
  echo "  UPLOAD_DIR not set, skipping persistent storage setup"
fi

echo "🔍 Checking environment..."
echo "  PORT: ${PORT:-not set}"
echo "  NODE_ENV: ${NODE_ENV:-not set}"
echo "  DATABASE_URL: ${DATABASE_URL:+set (hidden)}"

echo "🔄 Regenerating Prisma client for production environment..."
npx prisma generate

echo "🔗 Testing database connection..."
npx prisma db execute --stdin <<< "SELECT 1;" || echo "⚠️  Database connection test failed"

echo "🚀 Starting Next.js application on port ${PORT:-3000}..."
exec npm run start -- -p ${PORT:-3000}
