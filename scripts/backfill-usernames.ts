/**
 * Backfill usernames and slugs for existing users
 *
 * This script:
 * 1. Finds users with a twitterUrl but no username set
 * 2. Extracts the username from the Twitter/X URL
 * 3. Sets both username and slug (ensuring uniqueness)
 *
 * Run with: npx tsx scripts/backfill-usernames.ts
 * Or dry-run: npx tsx scripts/backfill-usernames.ts --dry-run
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper to generate a unique slug from username
async function getUniqueSlug(baseSlug: string, excludeUserId?: string): Promise<string> {
  let slug = baseSlug.toLowerCase().replace(/[^a-z0-9-]/g, "");
  let counter = 1;

  // Ensure we have at least a basic slug
  if (!slug) {
    slug = "user";
  }

  while (true) {
    const existing = await prisma.user.findFirst({
      where: {
        slug,
        ...(excludeUserId && { id: { not: excludeUserId } }),
      },
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug.toLowerCase().replace(/[^a-z0-9-]/g, "")}-${counter}`;
    counter++;
  }
}

// Extract username from Twitter/X URL
function extractUsernameFromUrl(url: string): string | null {
  if (!url) return null;

  // Handle various formats:
  // https://x.com/username
  // https://twitter.com/username
  // http://x.com/username
  // x.com/username
  // twitter.com/username
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:x\.com|twitter\.com)\/([a-zA-Z0-9_]+)\/?/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      // Ignore common non-username paths
      const username = match[1].toLowerCase();
      if (["home", "explore", "search", "settings", "notifications", "messages"].includes(username)) {
        return null;
      }
      return match[1]; // Keep original case for username
    }
  }

  return null;
}

async function backfillUsernames(dryRun: boolean = false) {
  console.log(`\n🚀 Starting username backfill${dryRun ? " (DRY RUN)" : ""}...\n`);

  // Find all users who have twitterUrl but no username
  const usersToUpdate = await prisma.user.findMany({
    where: {
      twitterUrl: { not: null },
      OR: [
        { username: null },
        { slug: null },
      ],
    },
    select: {
      id: true,
      name: true,
      twitterUrl: true,
      username: true,
      slug: true,
    },
  });

  console.log(`Found ${usersToUpdate.length} users to process\n`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const user of usersToUpdate) {
    try {
      const extractedUsername = extractUsernameFromUrl(user.twitterUrl!);

      if (!extractedUsername) {
        console.log(`⏭️  Skipping user ${user.id}: Could not extract username from "${user.twitterUrl}"`);
        skipped++;
        continue;
      }

      // Use existing username if set, otherwise use extracted
      const username = user.username || extractedUsername;

      // Generate unique slug
      const slug = user.slug || await getUniqueSlug(username, user.id);

      console.log(`📝 User ${user.id}:`);
      console.log(`   Name: ${user.name || "(no name)"}`);
      console.log(`   Twitter URL: ${user.twitterUrl}`);
      console.log(`   Extracted username: ${extractedUsername}`);
      console.log(`   Current username: ${user.username || "(none)"} -> ${username}`);
      console.log(`   Current slug: ${user.slug || "(none)"} -> ${slug}`);

      if (!dryRun) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            username: user.username || username,
            slug: user.slug || slug,
          },
        });
        console.log(`   ✅ Updated!\n`);
      } else {
        console.log(`   (dry run - not updated)\n`);
      }

      updated++;
    } catch (error) {
      console.error(`❌ Error processing user ${user.id}:`, error);
      errors++;
    }
  }

  // Also find users without slug but with username
  const usersWithUsernameNoSlug = await prisma.user.findMany({
    where: {
      username: { not: null },
      slug: null,
    },
    select: {
      id: true,
      name: true,
      username: true,
    },
  });

  console.log(`\nFound ${usersWithUsernameNoSlug.length} additional users with username but no slug\n`);

  for (const user of usersWithUsernameNoSlug) {
    try {
      const slug = await getUniqueSlug(user.username!, user.id);

      console.log(`📝 User ${user.id}:`);
      console.log(`   Name: ${user.name || "(no name)"}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Setting slug: ${slug}`);

      if (!dryRun) {
        await prisma.user.update({
          where: { id: user.id },
          data: { slug },
        });
        console.log(`   ✅ Updated!\n`);
      } else {
        console.log(`   (dry run - not updated)\n`);
      }

      updated++;
    } catch (error) {
      console.error(`❌ Error processing user ${user.id}:`, error);
      errors++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 Summary:");
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors: ${errors}`);
  console.log("=".repeat(50) + "\n");
}

// Main execution
const isDryRun = process.argv.includes("--dry-run");
backfillUsernames(isDryRun)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
