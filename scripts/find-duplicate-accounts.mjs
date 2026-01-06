/**
 * Script to find and investigate duplicate user accounts
 *
 * Usage:
 *   node scripts/find-duplicate-accounts.mjs your-email@example.com
 *
 * Or to merge accounts (keeps the older account):
 *   node scripts/find-duplicate-accounts.mjs your-email@example.com --merge
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const shouldMerge = process.argv.includes('--merge');

  if (!email) {
    console.error('❌ Please provide an email address as an argument');
    console.log('   Usage: node scripts/find-duplicate-accounts.mjs your-email@example.com');
    process.exit(1);
  }

  console.log(`\n🔍 Searching for accounts with email: ${email}\n`);

  // Find all users with this email
  const usersWithEmail = await prisma.user.findMany({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      slug: true,
      username: true,
      displayName: true,
      createdAt: true,
      image: true,
      accounts: {
        select: {
          provider: true,
          providerAccountId: true,
        }
      },
      _count: {
        select: {
          projects: true,
          dailyUpdates: true,
          comments: true,
          upvotes: true,
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  if (usersWithEmail.length === 0) {
    console.log('✅ No users found with this email address.');
    console.log('\n   This means you can safely set this email on your account.');
    return;
  }

  console.log(`Found ${usersWithEmail.length} user(s) with this email:\n`);

  usersWithEmail.forEach((user, index) => {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Account #${index + 1}:`);
    console.log(`  ID:           ${user.id}`);
    console.log(`  Name:         ${user.name || '(not set)'}`);
    console.log(`  Display Name: ${user.displayName || '(not set)'}`);
    console.log(`  Username:     ${user.username || '(not set)'}`);
    console.log(`  Slug:         ${user.slug || '(not set)'}`);
    console.log(`  Created:      ${user.createdAt.toISOString()}`);
    console.log(`  OAuth:        ${user.accounts.map(a => a.provider).join(', ') || 'none'}`);
    console.log(`  Content:`);
    console.log(`    - Projects:  ${user._count.projects}`);
    console.log(`    - Updates:   ${user._count.dailyUpdates}`);
    console.log(`    - Comments:  ${user._count.comments}`);
    console.log(`    - Upvotes:   ${user._count.upvotes}`);
  });

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  if (usersWithEmail.length > 1) {
    console.log('⚠️  Multiple accounts found with this email!');
    console.log('   This shouldn\'t happen - email should be unique.\n');

    if (shouldMerge) {
      await mergeAccounts(usersWithEmail);
    } else {
      console.log('   To merge these accounts (keeping the oldest one), run:');
      console.log(`   node scripts/find-duplicate-accounts.mjs ${email} --merge\n`);
    }
  } else {
    console.log('ℹ️  This email is already associated with the account shown above.');
    console.log('   If this is your account, you should already be able to use this email.');
    console.log('   If you\'re signed into a DIFFERENT account, that\'s why you\'re seeing the error.\n');

    // Check for users without email that might be the current session
    const usersWithoutEmail = await prisma.user.findMany({
      where: {
        email: null,
        accounts: { some: {} }  // Has at least one OAuth connection
      },
      select: {
        id: true,
        name: true,
        slug: true,
        username: true,
        createdAt: true,
        accounts: {
          select: { provider: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    if (usersWithoutEmail.length > 0) {
      console.log('   Recent accounts WITHOUT an email set (one might be yours):');
      usersWithoutEmail.forEach(user => {
        console.log(`   - ${user.id} | ${user.name || user.username || 'unnamed'} | ${user.accounts.map(a => a.provider).join(', ')} | Created: ${user.createdAt.toISOString().split('T')[0]}`);
      });
      console.log('');
    }
  }
}

async function mergeAccounts(users) {
  // Keep the oldest account (first one since we ordered by createdAt asc)
  const keepAccount = users[0];
  const deleteAccounts = users.slice(1);

  console.log(`\n🔄 Merging accounts...`);
  console.log(`   Keeping: ${keepAccount.id} (created ${keepAccount.createdAt.toISOString()})`);
  console.log(`   Deleting: ${deleteAccounts.map(u => u.id).join(', ')}\n`);

  for (const account of deleteAccounts) {
    console.log(`   Processing ${account.id}...`);

    // Move OAuth connections
    await prisma.account.updateMany({
      where: { userId: account.id },
      data: { userId: keepAccount.id }
    });
    console.log(`     ✓ Moved OAuth connections`);

    // Move projects
    await prisma.project.updateMany({
      where: { userId: account.id },
      data: { userId: keepAccount.id }
    });
    console.log(`     ✓ Moved projects`);

    // Move daily updates
    await prisma.dailyUpdate.updateMany({
      where: { userId: account.id },
      data: { userId: keepAccount.id }
    });
    console.log(`     ✓ Moved daily updates`);

    // Move comments
    await prisma.comment.updateMany({
      where: { userId: account.id },
      data: { userId: keepAccount.id }
    });
    console.log(`     ✓ Moved comments`);

    // Move upvotes (may fail if duplicate, that's ok)
    try {
      await prisma.upvote.updateMany({
        where: { userId: account.id },
        data: { userId: keepAccount.id }
      });
      console.log(`     ✓ Moved upvotes`);
    } catch {
      console.log(`     ⚠ Some upvotes skipped (already voted)`);
    }

    // Move companies
    await prisma.company.updateMany({
      where: { userId: account.id },
      data: { userId: keepAccount.id }
    });
    console.log(`     ✓ Moved companies`);

    // Delete the duplicate user
    await prisma.user.delete({
      where: { id: account.id }
    });
    console.log(`     ✓ Deleted duplicate account`);
  }

  console.log(`\n✅ Merge complete! All content has been moved to account ${keepAccount.id}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
