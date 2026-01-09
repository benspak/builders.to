#!/usr/bin/env node

/**
 * Migration script to move existing companies to their respective locations
 * by populating the locationSlug field based on their location.
 *
 * This ensures companies show up on /local/[locationSlug] pages.
 *
 * Run with: node scripts/migrate-companies-to-local.mjs
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Generates a URL-friendly slug from a location string
 * Examples:
 * - "San Francisco, CA" -> "san-francisco-ca"
 * - "New York City" -> "new-york-city"
 * - "London, UK" -> "london-uk"
 */
function generateLocationSlug(location) {
  if (!location || location.trim() === "") {
    return null;
  }
  return location
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

async function main() {
  console.log("🚀 Starting company location migration...\n");

  // Find all companies that have a location but no locationSlug
  const companiesWithoutSlug = await prisma.company.findMany({
    where: {
      location: { not: null },
      locationSlug: null,
    },
    select: {
      id: true,
      name: true,
      location: true,
    },
  });

  console.log(`Found ${companiesWithoutSlug.length} companies needing locationSlug\n`);

  if (companiesWithoutSlug.length === 0) {
    console.log("✅ All companies already have locationSlugs!");
    return;
  }

  let updated = 0;
  let skipped = 0;

  for (const company of companiesWithoutSlug) {
    const locationSlug = generateLocationSlug(company.location);

    if (!locationSlug) {
      console.log(`⏭️  Skipping "${company.name}" - invalid location: "${company.location}"`);
      skipped++;
      continue;
    }

    await prisma.company.update({
      where: { id: company.id },
      data: { locationSlug },
    });

    console.log(`✅ Updated "${company.name}": ${company.location} -> ${locationSlug}`);
    updated++;
  }

  console.log("\n📊 Migration Summary:");
  console.log(`   Updated: ${updated} companies`);
  console.log(`   Skipped: ${skipped} companies`);

  // Show breakdown by location
  console.log("\n📍 Companies by Location:");

  const locationCounts = await prisma.company.groupBy({
    by: ["locationSlug"],
    where: { locationSlug: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  for (const loc of locationCounts) {
    const sample = await prisma.company.findFirst({
      where: { locationSlug: loc.locationSlug },
      select: { location: true },
    });
    console.log(`   ${sample?.location || loc.locationSlug}: ${loc._count.id} companies`);
  }

  console.log("\n🎉 Migration complete!");
  console.log("   Companies will now appear at /local/[locationSlug]");
}

main()
  .catch((error) => {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
