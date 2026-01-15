import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateLocationSlug } from "@/lib/utils";
import { calculateProfileCompleteness } from "@/lib/profile-completeness";
import { grantProfileCompletionBonus } from "@/lib/tokens";

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

function generateSlug(name: string): string {
  return transliterateForSlug(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function getUniqueSlug(baseSlug: string, userId: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.user.findUnique({
      where: { slug },
    });

    if (!existing || existing.id === userId) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        username: true,
        displayName: true,
        firstName: true,
        lastName: true,
        city: true,
        country: true,
        headline: true,
        bio: true,
        websiteUrl: true,
        twitterUrl: true,
        youtubeUrl: true,
        linkedinUrl: true,
        twitchUrl: true,
        githubUrl: true,
        producthuntUrl: true,
        featuredVideoUrl: true,
        image: true,
        createdAt: true,
        // Status
        status: true,
        statusUpdatedAt: true,
        // Intent flags
        openToWork: true,
        lookingForCofounder: true,
        availableForContract: true,
        // Streak data
        currentStreak: true,
        longestStreak: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Users can only update their own profile
    if (session.user.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      email,
      slug: customSlug,
      displayName,
      city,
      country,
      headline,
      bio,
      websiteUrl,
      twitterUrl,
      youtubeUrl,
      linkedinUrl,
      twitchUrl,
      githubUrl,
      producthuntUrl,
      featuredVideoUrl,
      // Profile image
      image,
      // Status
      status,
      // Intent flags
      openToWork,
      lookingForCofounder,
      availableForContract,
      // Email preferences
      dailyDigest,
    } = body;

    // Get current user data for comparison
    const currentUser = await prisma.user.findUnique({
      where: { id },
      select: { slug: true, name: true, username: true, status: true },
    });

    let slug = currentUser?.slug;

    // Handle custom slug if provided
    if (customSlug !== undefined) {
      const trimmedSlug = customSlug?.trim().toLowerCase();

      if (trimmedSlug) {
        // Validate slug format: only lowercase letters, numbers, and hyphens
        // Must start and end with alphanumeric character
        const slugRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;
        if (!slugRegex.test(trimmedSlug)) {
          return NextResponse.json(
            { error: "Profile URL can only contain lowercase letters, numbers, and hyphens, and must start and end with a letter or number" },
            { status: 400 }
          );
        }

        // Check minimum length
        if (trimmedSlug.length < 2) {
          return NextResponse.json(
            { error: "Profile URL must be at least 2 characters long" },
            { status: 400 }
          );
        }

        // Check maximum length
        if (trimmedSlug.length > 50) {
          return NextResponse.json(
            { error: "Profile URL must be 50 characters or less" },
            { status: 400 }
          );
        }

        // Check for uniqueness (only if different from current)
        if (trimmedSlug !== currentUser?.slug) {
          const existingUser = await prisma.user.findUnique({
            where: { slug: trimmedSlug },
          });

          if (existingUser && existingUser.id !== id) {
            return NextResponse.json(
              { error: "This profile URL is already taken" },
              { status: 400 }
            );
          }
        }

        slug = trimmedSlug;
      }
    } else if (!slug) {
      // Generate slug automatically if not exists and no custom slug provided
      // Check if name looks like an email - if so, don't use it for privacy
      const isNameAnEmail = currentUser?.name && currentUser.name.includes("@");
      const safeName = isNameAnEmail ? null : currentUser?.name;

      // Priority for slug: username > displayName > safeName > random
      // NEVER use email-derived values
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const baseName = currentUser?.username
        || displayName
        || safeName
        || `builder-${randomSuffix}`;
      slug = await getUniqueSlug(generateSlug(baseName), id);
    }

    // Validate email if provided
    const trimmedEmail = email?.trim() || null;
    if (trimmedEmail) {
      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }

      // Check for uniqueness if email is being changed
      const existingUser = await prisma.user.findFirst({
        where: {
          email: trimmedEmail,
          NOT: { id },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "This email is already in use by another account" },
          { status: 400 }
        );
      }
    }

    // Validate URLs
    const urlFields = { websiteUrl, twitterUrl, youtubeUrl, linkedinUrl, twitchUrl, githubUrl, producthuntUrl, featuredVideoUrl };
    for (const [key, value] of Object.entries(urlFields)) {
      if (value && typeof value === "string") {
        try {
          new URL(value);
        } catch {
          return NextResponse.json(
            { error: `Invalid URL for ${key}` },
            { status: 400 }
          );
        }
      }
    }

    // Process city and country for location
    const trimmedCity = city?.trim() || null;
    const trimmedCountry = country?.trim() || null;
    let locationSlug: string | null = null;

    // Generate locationSlug from city and country
    if (trimmedCity && trimmedCountry) {
      locationSlug = generateLocationSlug(`${trimmedCity}, ${trimmedCountry}`);
    } else if (trimmedCity) {
      locationSlug = generateLocationSlug(trimmedCity);
    }

    // Check if status is being updated to a new non-empty value
    const trimmedStatus = status?.trim() || null;
    const statusChanged = status !== undefined && trimmedStatus && trimmedStatus !== currentUser?.status;

    // Validate image URL if provided
    if (image !== undefined && image !== null && image !== "") {
      const trimmedImage = image.trim();
      // Only allow our own upload paths or external OAuth images
      const isOurUpload = trimmedImage.startsWith("/api/files/avatars/");
      const isExternalOAuth = trimmedImage.startsWith("https://");
      if (!isOurUpload && !isExternalOAuth) {
        return NextResponse.json(
          { error: "Invalid image URL" },
          { status: 400 }
        );
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        slug,
        // Update email if provided
        ...(email !== undefined && { email: trimmedEmail }),
        // Update image if provided (allow null to clear)
        ...(image !== undefined && { image: image?.trim() || null }),
        displayName: displayName?.trim() || null,
        city: trimmedCity,
        country: trimmedCountry,
        locationSlug,
        headline: headline?.trim() || null,
        bio: bio?.trim() || null,
        websiteUrl: websiteUrl?.trim() || null,
        twitterUrl: twitterUrl?.trim() || null,
        youtubeUrl: youtubeUrl?.trim() || null,
        linkedinUrl: linkedinUrl?.trim() || null,
        twitchUrl: twitchUrl?.trim() || null,
        githubUrl: githubUrl?.trim() || null,
        producthuntUrl: producthuntUrl?.trim() || null,
        featuredVideoUrl: featuredVideoUrl?.trim() || null,
        // Status - update if provided, allow clearing with empty string
        ...(status !== undefined && {
          status: trimmedStatus,
          statusUpdatedAt: trimmedStatus ? new Date() : null,
        }),
        // Intent flags - only update if explicitly provided
        ...(typeof openToWork === 'boolean' && { openToWork }),
        ...(typeof lookingForCofounder === 'boolean' && { lookingForCofounder }),
        ...(typeof availableForContract === 'boolean' && { availableForContract }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        slug: true,
        username: true,
        displayName: true,
        city: true,
        country: true,
        headline: true,
        bio: true,
        websiteUrl: true,
        twitterUrl: true,
        youtubeUrl: true,
        linkedinUrl: true,
        twitchUrl: true,
        githubUrl: true,
        producthuntUrl: true,
        featuredVideoUrl: true,
        image: true,
        createdAt: true,
        openToWork: true,
        lookingForCofounder: true,
        availableForContract: true,
        status: true,
        statusUpdatedAt: true,
        currentStreak: true,
        longestStreak: true,
      },
    });

    // Create a feed event if status was changed to a new value
    if (statusChanged && trimmedStatus) {
      await prisma.feedEvent.create({
        data: {
          type: "STATUS_UPDATE",
          userId: id,
          title: trimmedStatus,
        },
      });
    }

    // Update email preferences if any are provided
    const hasEmailPreferenceUpdate =
      typeof dailyDigest === "boolean";

    if (hasEmailPreferenceUpdate) {
      await prisma.emailPreferences.upsert({
        where: { userId: id },
        create: {
          userId: id,
          dailyDigest: dailyDigest ?? true,
        },
        update: {
          ...(typeof dailyDigest === "boolean" && { dailyDigest }),
        },
      });
    }

    // Check profile completeness and grant bonus if 100%
    const profileCompleteness = calculateProfileCompleteness({
      displayName: user.displayName,
      city: user.city,
      country: user.country,
      headline: user.headline,
      bio: user.bio,
      websiteUrl: user.websiteUrl,
      twitterUrl: user.twitterUrl,
      youtubeUrl: user.youtubeUrl,
      linkedinUrl: user.linkedinUrl,
      twitchUrl: user.twitchUrl,
      githubUrl: user.githubUrl,
      producthuntUrl: user.producthuntUrl,
      status: user.status,
    });

    // Grant 10 tokens if profile is 100% complete (only once per user)
    if (profileCompleteness.score >= 100) {
      await grantProfileCompletionBonus(id);
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
