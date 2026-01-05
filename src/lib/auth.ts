import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Twitter from "next-auth/providers/twitter";
import { prisma } from "@/lib/prisma";

// Store for temporarily holding username during OAuth flow
// This is needed because the adapter doesn't pass custom fields
const pendingUsernames = new Map<string, string>();

// Helper to generate a unique slug from username
async function getUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug.toLowerCase().replace(/[^a-z0-9-]/g, "");
  let counter = 1;

  while (true) {
    const existing = await prisma.user.findUnique({
      where: { slug },
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug.toLowerCase()}-${counter}`;
    counter++;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      profile(profile) {
        // Twitter API v2 returns username in the profile
        // Store the username temporarily so we can use it in the createUser event
        const twitterId = profile.data.id;
        const username = profile.data.username;

        if (username) {
          pendingUsernames.set(twitterId, username);
        }

        return {
          id: twitterId,
          name: profile.data.name,
          email: null, // Twitter doesn't always provide email
          image: profile.data.profile_image_url?.replace("_normal", ""), // Get higher res image
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  events: {
    // When a new user is created, set their slug and username from their X handle
    async createUser({ user }) {
      if (user.id) {
        // Get the linked Twitter account to find the provider account ID
        const account = await prisma.account.findFirst({
          where: {
            userId: user.id,
            provider: "twitter",
          },
          select: { providerAccountId: true },
        });

        // Get username from our temporary store
        const twitterUsername = account?.providerAccountId
          ? pendingUsernames.get(account.providerAccountId)
          : null;

        // Clean up the temporary store
        if (account?.providerAccountId) {
          pendingUsernames.delete(account.providerAccountId);
        }

        // Use Twitter username for slug, fall back to name
        const baseName = twitterUsername || user.name || user.id;

        // Generate unique slug from username
        const slug = await getUniqueSlug(baseName);

        // Update user with username, slug, and auto-set Twitter URL
        await prisma.user.update({
          where: { id: user.id },
          data: {
            slug,
            username: twitterUsername,
            // Set twitterUrl automatically if we have username
            ...(twitterUsername && {
              twitterUrl: `https://x.com/${twitterUsername}`,
            }),
          },
        });
      }
    },
  },
  pages: {
    signIn: "/signin",
  },
  trustHost: true,
});
