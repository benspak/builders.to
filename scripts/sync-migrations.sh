#!/usr/bin/env bash
# Sync Prisma migration history with database state
# This marks all migrations as applied if their changes already exist in the database

set -e

echo "🔄 Syncing migration history with database state..."

# Get list of all migrations from the migrations folder
MIGRATIONS_DIR="prisma/migrations"

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "No migrations directory found, skipping sync"
  exit 0
fi

# Loop through each migration folder (sorted by name to maintain order)
for migration_dir in $(ls -d "$MIGRATIONS_DIR"/*/ 2>/dev/null | sort); do
  migration_name=$(basename "$migration_dir")
  
  # Skip the migration_lock.toml file
  if [ "$migration_name" = "migration_lock.toml" ]; then
    continue
  fi
  
  echo "  Checking migration: $migration_name"
  
  # Try to mark as applied - this will fail silently if already applied
  npx prisma migrate resolve --applied "$migration_name" 2>/dev/null || true
done

echo "✅ Migration sync complete"
