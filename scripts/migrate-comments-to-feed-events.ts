/**
 * Migration Script: Unified Comments System
 *
 * This script migrates existing comments from separate tables (Comment, LocalListingComment)
 * to the unified FeedEventComment system.
 *
 * Steps:
 * 1. Create missing FeedEvent records for projects that don't have PROJECT_CREATED events
 * 2. Create missing FeedEvent records for listings that don't have LISTING_CREATED events
 * 3. Migrate existing Comment records to FeedEventComment
 * 4. Migrate existing LocalListingComment records to FeedEventComment
 *
 * Usage:
 *   npx tsx scripts/migrate-comments-to-feed-events.ts
 *
 * This script is idempotent - running it multiple times won't create duplicates.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting comment migration to unified FeedEventComment system...\n");

  // Step 1: Create missing FeedEvent records for projects
  console.log("Step 1: Creating missing FeedEvent records for projects...");
  const projectsWithoutFeedEvent = await prisma.project.findMany({
    where: {
      NOT: {
        id: {
          in: await prisma.feedEvent.findMany({
            where: { type: "PROJECT_CREATED", projectId: { not: null } },
            select: { projectId: true },
          }).then(events => events.map(e => e.projectId!).filter(Boolean)),
        },
      },
    },
    select: {
      id: true,
      title: true,
      tagline: true,
      userId: true,
      createdAt: true,
    },
  });

  console.log(`  Found ${projectsWithoutFeedEvent.length} projects without PROJECT_CREATED feed events`);

  for (const project of projectsWithoutFeedEvent) {
    await prisma.feedEvent.create({
      data: {
        type: "PROJECT_CREATED",
        title: `New project: ${project.title}`,
        description: project.tagline || null,
        userId: project.userId,
        projectId: project.id,
        createdAt: project.createdAt,
      },
    });
    console.log(`  Created feed event for project: ${project.title}`);
  }

  // Step 2: Create missing FeedEvent records for local listings
  console.log("\nStep 2: Creating missing FeedEvent records for local listings...");
  const listingsWithoutFeedEvent = await prisma.localListing.findMany({
    where: {
      NOT: {
        id: {
          in: await prisma.feedEvent.findMany({
            where: { type: "LISTING_CREATED", localListingId: { not: null } },
            select: { localListingId: true },
          }).then(events => events.map(e => e.localListingId!).filter(Boolean)),
        },
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      userId: true,
      createdAt: true,
    },
  });

  console.log(`  Found ${listingsWithoutFeedEvent.length} listings without LISTING_CREATED feed events`);

  for (const listing of listingsWithoutFeedEvent) {
    await prisma.feedEvent.create({
      data: {
        type: "LISTING_CREATED",
        title: `New listing: ${listing.title}`,
        description: listing.description.slice(0, 500),
        userId: listing.userId,
        localListingId: listing.id,
        createdAt: listing.createdAt,
      },
    });
    console.log(`  Created feed event for listing: ${listing.title}`);
  }

  // Step 3: Migrate existing Comment records to FeedEventComment
  console.log("\nStep 3: Migrating project comments (Comment -> FeedEventComment)...");

  // Get all existing project comments
  const projectComments = await prisma.comment.findMany({
    include: {
      project: {
        select: { id: true, title: true },
      },
    },
  });

  console.log(`  Found ${projectComments.length} project comments to migrate`);

  let projectCommentsMigrated = 0;
  let projectCommentsSkipped = 0;

  for (const comment of projectComments) {
    // Find the PROJECT_CREATED feed event for this project
    const feedEvent = await prisma.feedEvent.findFirst({
      where: {
        projectId: comment.projectId,
        type: "PROJECT_CREATED",
      },
    });

    if (!feedEvent) {
      console.log(`  Warning: No feed event found for project ${comment.project.title}, skipping comment ${comment.id}`);
      projectCommentsSkipped++;
      continue;
    }

    // Check if this comment was already migrated (by checking for same user, content, and timestamp)
    const existingFeedComment = await prisma.feedEventComment.findFirst({
      where: {
        feedEventId: feedEvent.id,
        userId: comment.userId,
        content: comment.content,
        createdAt: comment.createdAt,
      },
    });

    if (existingFeedComment) {
      projectCommentsSkipped++;
      continue;
    }

    // Migrate the comment
    await prisma.feedEventComment.create({
      data: {
        content: comment.content,
        userId: comment.userId,
        feedEventId: feedEvent.id,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      },
    });
    projectCommentsMigrated++;
  }

  console.log(`  Migrated ${projectCommentsMigrated} project comments`);
  console.log(`  Skipped ${projectCommentsSkipped} comments (already migrated or no feed event)`);

  // Step 4: Migrate existing LocalListingComment records to FeedEventComment
  console.log("\nStep 4: Migrating local listing comments (LocalListingComment -> FeedEventComment)...");

  const listingComments = await prisma.localListingComment.findMany({
    include: {
      listing: {
        select: { id: true, title: true },
      },
    },
  });

  console.log(`  Found ${listingComments.length} listing comments to migrate`);

  let listingCommentsMigrated = 0;
  let listingCommentsSkipped = 0;

  for (const comment of listingComments) {
    // Find the LISTING_CREATED feed event for this listing
    const feedEvent = await prisma.feedEvent.findFirst({
      where: {
        localListingId: comment.listingId,
        type: "LISTING_CREATED",
      },
    });

    if (!feedEvent) {
      console.log(`  Warning: No feed event found for listing ${comment.listing.title}, skipping comment ${comment.id}`);
      listingCommentsSkipped++;
      continue;
    }

    // Check if this comment was already migrated
    const existingFeedComment = await prisma.feedEventComment.findFirst({
      where: {
        feedEventId: feedEvent.id,
        userId: comment.userId,
        content: comment.content,
        createdAt: comment.createdAt,
      },
    });

    if (existingFeedComment) {
      listingCommentsSkipped++;
      continue;
    }

    // Migrate the comment
    await prisma.feedEventComment.create({
      data: {
        content: comment.content,
        userId: comment.userId,
        feedEventId: feedEvent.id,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      },
    });
    listingCommentsMigrated++;
  }

  console.log(`  Migrated ${listingCommentsMigrated} listing comments`);
  console.log(`  Skipped ${listingCommentsSkipped} comments (already migrated or no feed event)`);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("Migration Summary:");
  console.log("=".repeat(60));
  console.log(`  Feed events created for projects: ${projectsWithoutFeedEvent.length}`);
  console.log(`  Feed events created for listings: ${listingsWithoutFeedEvent.length}`);
  console.log(`  Project comments migrated: ${projectCommentsMigrated}`);
  console.log(`  Listing comments migrated: ${listingCommentsMigrated}`);
  console.log("\nMigration complete!");
  console.log("\nNote: The old Comment and LocalListingComment tables still exist.");
  console.log("Once you verify the migration was successful, you can optionally");
  console.log("remove these tables in a future schema migration.");
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
