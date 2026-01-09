#!/usr/bin/env node

/**
 * Migration script to move existing companies and users to their respective locations
 * by populating the locationSlug field based on their location.
 *
 * This ensures both companies and builders show up on /local/[locationSlug] pages.
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

async function migrateCompanies() {
  console.log("📦 Migrating companies...\n");

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
    console.log("✅ All companies already have locationSlugs!\n");
    return { updated: 0, skipped: 0 };
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

  return { updated, skipped };
}

async function migrateUsers() {
  console.log("\n👤 Migrating users (builders)...\n");

  // Find all users that have city and state but no locationSlug
  const usersWithoutSlug = await prisma.user.findMany({
    where: {
      city: { not: null },
      state: { not: null },
      locationSlug: null,
    },
    select: {
      id: true,
      name: true,
      city: true,
      state: true,
    },
  });

  console.log(`Found ${usersWithoutSlug.length} users needing locationSlug\n`);

  if (usersWithoutSlug.length === 0) {
    console.log("✅ All users already have locationSlugs!\n");
    return { updated: 0, skipped: 0 };
  }

  let updated = 0;
  let skipped = 0;

  for (const user of usersWithoutSlug) {
    const location = `${user.city}, ${user.state}`;
    const locationSlug = generateLocationSlug(location);

    if (!locationSlug) {
      console.log(`⏭️  Skipping "${user.name}" - invalid location: "${location}"`);
      skipped++;
      continue;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { locationSlug },
    });

    console.log(`✅ Updated "${user.name || "Anonymous"}": ${location} -> ${locationSlug}`);
    updated++;
  }

  return { updated, skipped };
}

async function main() {
  console.log("🚀 Starting Builders Local migration...\n");

  const companyResults = await migrateCompanies();
  const userResults = await migrateUsers();

  console.log("\n" + "=".repeat(50));
  console.log("📊 Migration Summary:");
  console.log("=".repeat(50));
  console.log(`   Companies: ${companyResults.updated} updated, ${companyResults.skipped} skipped`);
  console.log(`   Users:     ${userResults.updated} updated, ${userResults.skipped} skipped`);

  // Show breakdown by location
  console.log("\n📍 Companies by Location:");

  const companyLocationCounts = await prisma.company.groupBy({
    by: ["locationSlug"],
    where: { locationSlug: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  for (const loc of companyLocationCounts) {
    const sample = await prisma.company.findFirst({
      where: { locationSlug: loc.locationSlug },
      select: { location: true },
    });
    console.log(`   ${sample?.location || loc.locationSlug}: ${loc._count.id} companies`);
  }

  console.log("\n👥 Builders by Location:");

  const userLocationCounts = await prisma.user.groupBy({
    by: ["locationSlug"],
    where: { locationSlug: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  for (const loc of userLocationCounts) {
    const sample = await prisma.user.findFirst({
      where: { locationSlug: loc.locationSlug },
      select: { city: true, state: true },
    });
    const location = sample?.city && sample?.state ? `${sample.city}, ${sample.state}` : loc.locationSlug;
    console.log(`   ${location}: ${loc._count.id} builders`);
  }

  console.log("\n🎉 Migration complete!");
  console.log("   Companies and builders will now appear at /local/[locationSlug]");
}

main()
  .catch((error) => {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
