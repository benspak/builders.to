// Migration script to populate slugs for existing companies
// Run with: node scripts/migrate-company-slugs.mjs

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single
    .replace(/^-|-$/g, '')     // Remove leading/trailing hyphens
    .substring(0, 50);         // Limit length
}

async function migrateCompanySlugs() {
  console.log('Starting company slug migration...');

  // Get all companies without slugs
  const companies = await prisma.company.findMany({
    where: {
      OR: [
        { slug: null },
        { slug: '' }
      ]
    },
    select: {
      id: true,
      name: true
    }
  });

  console.log(`Found ${companies.length} companies without slugs`);

  const existingSlugs = new Set();

  // Get all existing slugs to avoid duplicates
  const companiesWithSlugs = await prisma.company.findMany({
    where: {
      slug: { not: null }
    },
    select: { slug: true }
  });

  companiesWithSlugs.forEach(c => {
    if (c.slug) existingSlugs.add(c.slug);
  });

  for (const company of companies) {
    let baseSlug = generateSlug(company.name);
    let slug = baseSlug;
    let counter = 1;

    // Ensure uniqueness
    while (existingSlugs.has(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    existingSlugs.add(slug);

    await prisma.company.update({
      where: { id: company.id },
      data: { slug }
    });

    console.log(`Updated company "${company.name}" with slug: ${slug}`);
  }

  console.log('Company slug migration complete!');
}

migrateCompanySlugs()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
