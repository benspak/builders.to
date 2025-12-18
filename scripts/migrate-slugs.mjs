// Migration script to populate slugs for existing projects
// Run with: node scripts/migrate-slugs.mjs

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single
    .substring(0, 50);         // Limit length
}

async function migrateProjectSlugs() {
  console.log('Starting slug migration...');

  // Get all projects without slugs
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { slug: null },
        { slug: '' }
      ]
    },
    select: {
      id: true,
      title: true
    }
  });

  console.log(`Found ${projects.length} projects without slugs`);

  const existingSlugs = new Set();

  // Get all existing slugs to avoid duplicates
  const projectsWithSlugs = await prisma.project.findMany({
    where: {
      slug: { not: null }
    },
    select: { slug: true }
  });

  projectsWithSlugs.forEach(p => {
    if (p.slug) existingSlugs.add(p.slug);
  });

  for (const project of projects) {
    let baseSlug = generateSlug(project.title);
    let slug = baseSlug;
    let counter = 1;

    // Ensure uniqueness
    while (existingSlugs.has(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    existingSlugs.add(slug);

    await prisma.project.update({
      where: { id: project.id },
      data: { slug }
    });

    console.log(`Updated project "${project.title}" with slug: ${slug}`);
  }

  console.log('Slug migration complete!');
}

migrateProjectSlugs()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
