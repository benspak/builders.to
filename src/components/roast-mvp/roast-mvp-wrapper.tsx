import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RoastMVPSection } from "./roast-mvp-section";

export async function RoastMVPWrapper() {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  let userProjects: Array<{ id: string; title: string; slug: string | null }> = [];

  if (session?.user?.id) {
    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id,
        // Exclude projects already in the roast queue (paid or featured)
        OR: [
          { roastMVP: null },
          {
            roastMVP: {
              status: { in: ["PENDING_PAYMENT", "COMPLETED", "CANCELLED"] }
            }
          },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
      orderBy: { createdAt: "desc" },
    });
    userProjects = projects;
  }

  return (
    <RoastMVPSection
      isAuthenticated={isAuthenticated}
      userProjects={userProjects}
    />
  );
}
