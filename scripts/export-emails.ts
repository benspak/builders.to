import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true },
    where: {
      email: { not: null },
      emailVerified: { not: null },
      OR: [
        { emailPreferences: null },
        { emailPreferences: { dailyDigest: true } },
      ],
    },
  });

  const emails = users.map(u => u.email as string);

  // Output one email per line
  console.log(emails.join('\n'));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
