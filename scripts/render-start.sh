#!/usr/bin/env bash
# Render.com start script
# This script runs at runtime when the persistent disk is mounted

set -e

echo "📁 Ensuring upload directories exist on persistent disk..."
if [ -n "$UPLOAD_DIR" ]; then
  mkdir -p "$UPLOAD_DIR/projects"
  mkdir -p "$UPLOAD_DIR/companies"
  echo "  Created directories under $UPLOAD_DIR"
else
  echo "  UPLOAD_DIR not set, skipping persistent storage setup"
fi

echo "🚀 Starting Next.js application..."
npm run start
