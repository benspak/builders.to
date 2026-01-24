import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Twitter from "next-auth/providers/twitter";
import GitHub from "next-auth/providers/github";
import Resend from "next-auth/providers/resend";
import { prisma } from "@/lib/prisma";
import { generateMagicLinkEmail } from "@/lib/magic-link-email";

// Store for temporarily holding username during OAuth flow
// This is needed because the adapter doesn't pass custom fields
const pendingUsernames = new Map<string, string>();

// Helper to transliterate special characters for URL-safe slugs
function transliterateForSlug(str: string): string {
  // Common transliterations for European characters
  const transliterations: Record<string, string> = {
    'ü': 'ue', 'ö': 'oe', 'ä': 'ae', 'ß': 'ss',
    'Ü': 'ue', 'Ö': 'oe', 'Ä': 'ae',
    'ñ': 'n', 'Ñ': 'n',
    'ç': 'c', 'Ç': 'c',
    'á': 'a', 'à': 'a', 'â': 'a', 'ã': 'a', 'å': 'a',
    'Á': 'a', 'À': 'a', 'Â': 'a', 'Ã': 'a', 'Å': 'a',
    'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
    'É': 'e', 'È': 'e', 'Ê': 'e', 'Ë': 'e',
    'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
    'Í': 'i', 'Ì': 'i', 'Î': 'i', 'Ï': 'i',
    'ó': 'o', 'ò': 'o', 'ô': 'o', 'õ': 'o', 'ø': 'o',
    'Ó': 'o', 'Ò': 'o', 'Ô': 'o', 'Õ': 'o', 'Ø': 'o',
    'ú': 'u', 'ù': 'u', 'û': 'u',
    'Ú': 'u', 'Ù': 'u', 'Û': 'u',
    'ý': 'y', 'ÿ': 'y', 'Ý': 'y',
    'æ': 'ae', 'Æ': 'ae',
    'œ': 'oe', 'Œ': 'oe',
    'ł': 'l', 'Ł': 'l',
    'ž': 'z', 'Ž': 'z', 'ź': 'z', 'Ź': 'z',
    'ś': 's', 'Ś': 's', 'š': 's', 'Š': 's',
    'č': 'c', 'Č': 'c', 'ć': 'c', 'Ć': 'c',
    'ř': 'r', 'Ř': 'r',
    'ň': 'n', 'Ň': 'n', 'ń': 'n', 'Ń': 'n',
    'ď': 'd', 'Ď': 'd',
    'ť': 't', 'Ť': 't',
    'ě': 'e', 'Ě': 'e',
  };

  let result = '';
  for (const char of str) {
    result += transliterations[char] || char;
  }
  return result;
}

// Helper to generate a unique slug from username
async function getUniqueSlug(baseSlug: string): Promise<string> {
  // First transliterate, then clean up
  let slug = transliterateForSlug(baseSlug).toLowerCase().replace(/[^a-z0-9-]/g, "");
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
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM || "Builders.to <noreply@builders.to>",
      async sendVerificationRequest({ identifier: email, url }) {
        const { html, text } = generateMagicLinkEmail({
          email,
          url,
          baseUrl: process.env.NEXTAUTH_URL || "https://builders.to",
        });

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || "Builders.to <noreply@builders.to>",
            to: email,
            subject: "Sign in to Builders.to ✨",
            html,
            text,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`Resend error: ${JSON.stringify(error)}`);
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
      }
      // Mark if this is a new user (for redirect purposes)
      if (trigger === "signUp") {
        token.isNewUser = true;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      // Pass isNewUser flag to session
      if (token.isNewUser) {
        (session as { isNewUser?: boolean }).isNewUser = true;
      }
      return session;
    },
    // Redirect new users to settings page
    redirect({ url, baseUrl }) {
      // If this is a callback from OAuth provider
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Default to the requested URL or base URL
      return url.startsWith("/") ? `${baseUrl}${url}` : baseUrl;
    },
  },
  events: {
    // When a new user is created, set their slug and username from their OAuth handle
    async createUser({ user }) {
      if (user.id) {
        // First check if user already has a slug (shouldn't happen for new users, but safety check)
        const existingUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { slug: true },
        });

        // NEVER overwrite an existing slug
        if (existingUser?.slug) {
          return;
        }

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

        // For email signups, generate a random slug (don't use email prefix for privacy)
        const randomSuffix = Math.random().toString(36).substring(2, 8);

        // Check if user.name looks like an email address - if so, ignore it
        const isNameAnEmail = user.name && user.name.includes("@");
        const safeName = isNameAnEmail ? null : user.name;

        // Use OAuth username for slug, fall back to name (if not email), then generate a random builder slug
        const baseName = oauthUsername || safeName || `builder-${randomSuffix}`;

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

        // NOTE: Disabled USER_JOINED feed events - too many sign-ups were cluttering the feed
        // const displayName = (safeName || oauthUsername) || "A new builder";
        // await prisma.feedEvent.create({
        //   data: {
        //     type: "USER_JOINED",
        //     userId: user.id,
        //     title: `${displayName} joined the community`,
        //     description: "Welcome to Builders.to! 🎉",
        //   },
        // });
      }
    },
  },
  pages: {
    signIn: "/signin",
  },
  trustHost: true,
});
