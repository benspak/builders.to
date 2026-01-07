import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Twitter from "next-auth/providers/twitter";
import GitHub from "next-auth/providers/github";
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
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
      profile(profile) {
        const githubId = String(profile.id);
        const username = profile.login;

        if (username) {
          pendingUsernames.set(githubId, username);
        }

        return {
          id: githubId,
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
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
    // When a new user is created, set their slug and username from their OAuth handle
    async createUser({ user }) {
      if (user.id) {
        // Try to get linked account (Twitter or GitHub)
        const account = await prisma.account.findFirst({
          where: { userId: user.id },
          select: { providerAccountId: true, provider: true },
        });

        // Get username from our temporary store
        const oauthUsername = account?.providerAccountId
          ? pendingUsernames.get(account.providerAccountId)
          : null;

        // Clean up the temporary store
        if (account?.providerAccountId) {
          pendingUsernames.delete(account.providerAccountId);
        }

        // Use OAuth username for slug, fall back to name
        const baseName = oauthUsername || user.name || user.id;

        // Generate unique slug from username
        const slug = await getUniqueSlug(baseName);

        // Update user with username, slug, and auto-set social URL
        await prisma.user.update({
          where: { id: user.id },
          data: {
            slug,
            username: oauthUsername,
            // Set social URL automatically based on provider
            ...(oauthUsername &&
              account?.provider === "twitter" && {
                twitterUrl: `https://x.com/${oauthUsername}`,
              }),
            ...(oauthUsername &&
              account?.provider === "github" && {
                githubUrl: `https://github.com/${oauthUsername}`,
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
