/**
 * Manually create a RoastMVP entry and feature a project
 *
 * Usage:
 *   npx tsx scripts/manually-feature-roast-mvp.ts <projectSlug> [stripePaymentId]
 *
 * Example:
 *   npx tsx scripts/manually-feature-roast-mvp.ts popvia pi_xxxxx
 */

import { PrismaClient } from "@prisma/client";
import { addDays } from "date-fns";

const ROAST_MVP_FEATURE_DURATION_DAYS = 7;

const prisma = new PrismaClient();

async function main() {
  const [projectSlugOrId, stripePaymentId] = process.argv.slice(2);

  if (!projectSlugOrId) {
    console.error("Usage: npx tsx scripts/manually-feature-roast-mvp.ts <projectSlug> [stripePaymentId]");
    console.error("\nExample: npx tsx scripts/manually-feature-roast-mvp.ts popvia");
    process.exit(1);
  }

  // Try to find project by slug first, then by ID
  let project = await prisma.project.findFirst({
    where: { slug: projectSlugOrId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      roastMVP: true,
    },
  });

  if (!project) {
    project = await prisma.project.findUnique({
      where: { id: projectSlugOrId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        roastMVP: true,
      },
    });
  }

  if (!project) {
    console.error(`Project with slug/ID "${projectSlugOrId}" not found.`);
    process.exit(1);
  }

  const userId = project.user.id;

  console.log(`\n📦 Project: "${project.title}" (ID: ${project.id})`);
  console.log(`👤 Owner: ${project.user.name} (${project.user.email})`);
  console.log(`🔑 User ID: ${userId}`);

  // Check for existing entry
  if (project.roastMVP) {
    console.log(`\n⚠️  RoastMVP entry already exists:`);
    console.log(`   Status: ${project.roastMVP.status}`);
    console.log(`   Queue Position: ${project.roastMVP.queuePosition}`);
    console.log(`   Featured At: ${project.roastMVP.featuredAt}`);
    console.log(`   Expires At: ${project.roastMVP.expiresAt}`);

    if (project.roastMVP.status === "PENDING_PAYMENT") {
      console.log(`\n🔧 Entry is PENDING_PAYMENT. Updating to FEATURED...`);
    } else if (project.roastMVP.status === "PAID") {
      console.log(`\n🔧 Entry is PAID. Promoting to FEATURED...`);
    } else if (project.roastMVP.status === "FEATURED") {
      console.log(`\n✅ Project is already FEATURED!`);
      process.exit(0);
    } else {
      console.log(`\n❓ Entry is ${project.roastMVP.status}. Do you want to re-feature? Run with FORCE=true`);
      if (process.env.FORCE !== "true") {
        process.exit(1);
      }
    }
  }

  const now = new Date();
  const expiresAt = addDays(now, ROAST_MVP_FEATURE_DURATION_DAYS);

  // Get max queue position
  const maxQueuePosition = await prisma.roastMVP.aggregate({
    _max: { queuePosition: true },
    where: { status: { in: ["PAID", "FEATURED"] } },
  });

  const nextPosition = (maxQueuePosition._max.queuePosition || 0) + 1;

  if (project.roastMVP) {
    // Update existing entry
    const updated = await prisma.roastMVP.update({
      where: { id: project.roastMVP.id },
      data: {
        status: "FEATURED",
        stripePaymentId: stripePaymentId || project.roastMVP.stripePaymentId || "manual-fix",
        queuePosition: nextPosition,
        featuredAt: now,
        expiresAt,
      },
    });

    console.log(`\n✅ Updated RoastMVP entry ${updated.id}`);
  } else {
    // Create new entry
    const created = await prisma.roastMVP.create({
      data: {
        projectId: project.id,
        userId,
        stripePaymentId: stripePaymentId || "manual-fix",
        amountPaid: 2000,
        status: "FEATURED",
        queuePosition: nextPosition,
        featuredAt: now,
        expiresAt,
      },
    });

    console.log(`\n✅ Created RoastMVP entry ${created.id}`);
  }

  console.log(`\n🔥 Project "${project.title}" is now FEATURED!`);
  console.log(`   Featured at: ${now.toISOString()}`);
  console.log(`   Expires at: ${expiresAt.toISOString()}`);
  console.log(`   Queue position: ${nextPosition}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
