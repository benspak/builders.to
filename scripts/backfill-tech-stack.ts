/**
 * Backfill Tech Stack Script
 * 
 * This script copies techStack from companies owned by users to the User model.
 * It aggregates tech stacks from all companies a user owns.
 * 
 * Usage: npx ts-node scripts/backfill-tech-stack.ts
 */

import { PrismaClient, BuildingCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function backfillTechStack() {
  console.log('Starting tech stack backfill...\n');

  // Get all users who own companies with tech stacks
  const usersWithCompanies = await prisma.user.findMany({
    where: {
      companies: {
        some: {
          techStack: {
            isEmpty: false,
          },
        },
      },
    },
    include: {
      companies: {
        select: {
          techStack: true,
          category: true,
        },
      },
    },
  });

  console.log(`Found ${usersWithCompanies.length} users with company tech stacks\n`);

  let updatedCount = 0;

  for (const user of usersWithCompanies) {
    // Aggregate all unique tech stack items from user's companies
    const allTechStack = new Set<string>();
    
    for (const company of user.companies) {
      for (const tech of company.techStack) {
        allTechStack.add(tech);
      }
    }

    const techStackArray = Array.from(allTechStack);

    if (techStackArray.length > 0) {
      // Use the category from the first company as the building category
      // Map CompanyCategory to BuildingCategory (they share most values)
      const firstCompanyCategory = user.companies[0]?.category;
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          techStack: techStackArray,
          // Map company category to building category if applicable
          buildingCategory: mapCompanyToBuildingCategory(firstCompanyCategory),
        },
      });

      updatedCount++;
      console.log(`[${updatedCount}] Updated ${user.slug || user.id}: ${techStackArray.length} tech items`);
    }
  }

  console.log('\n========================================');
  console.log('Tech stack backfill complete!');
  console.log(`Total users updated: ${updatedCount}`);
  console.log('========================================\n');
}

// Map CompanyCategory to BuildingCategory
function mapCompanyToBuildingCategory(companyCategory: string | undefined): BuildingCategory | undefined {
  if (!companyCategory) return undefined;
  
  const categoryMap: Record<string, BuildingCategory> = {
    'SAAS': 'SAAS',
    'AGENCY': 'AGENCY',
    'FINTECH': 'FINTECH',
    'ECOMMERCE': 'ECOMMERCE',
    'HEALTHTECH': 'HEALTHTECH',
    'EDTECH': 'EDTECH',
    'AI_ML': 'AI_ML',
    'DEVTOOLS': 'DEVELOPER_TOOLS',
    'MEDIA': 'CONTENT',
    'MARKETPLACE': 'MARKETPLACE',
    'OTHER': 'OTHER',
  };
  
  return categoryMap[companyCategory] || 'OTHER';
}

// Run the backfill
backfillTechStack()
  .catch((e) => {
    console.error('Error during tech stack backfill:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
