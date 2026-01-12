import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateLocationSlug } from "@/lib/utils";
import { calculateProfileCompleteness } from "@/lib/profile-completeness";
import { grantProfileCompletionBonus } from "@/lib/tokens";

function generateSlug(name: string): string {
  return name
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
      displayName,
      firstName,
      lastName,
      city,
      country,
      headline,
      bio,
      websiteUrl,
      twitterUrl,
      youtubeUrl,
      linkedinUrl,
      twitchUrl,
      featuredVideoUrl,
      // Status
      status,
      // Intent flags
      openToWork,
      lookingForCofounder,
      availableForContract,
      // Email preferences
      weeklyDigest,
      dailyDigest,
      milestoneNotifications,
    } = body;

    // Generate slug from name if not exists, and get current status for comparison
    const currentUser = await prisma.user.findUnique({
      where: { id },
      select: { slug: true, name: true, username: true, status: true },
    });

    let slug = currentUser?.slug;
    if (!slug) {
      // Priority for slug: username > displayName > firstName+lastName > name > id
      const baseName = currentUser?.username
        || displayName
        || (firstName && lastName ? `${firstName}-${lastName}` : null)
        || firstName
        || lastName
        || currentUser?.name
        || id;
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
    const urlFields = { websiteUrl, twitterUrl, youtubeUrl, linkedinUrl, twitchUrl, featuredVideoUrl };
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

    const user = await prisma.user.update({
      where: { id },
      data: {
        slug,
        // Update email if provided
        ...(email !== undefined && { email: trimmedEmail }),
        displayName: displayName?.trim() || null,
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
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
      typeof weeklyDigest === "boolean" ||
      typeof dailyDigest === "boolean" ||
      typeof milestoneNotifications === "boolean";

    if (hasEmailPreferenceUpdate) {
      await prisma.emailPreferences.upsert({
        where: { userId: id },
        create: {
          userId: id,
          weeklyDigest: weeklyDigest ?? true,
          dailyDigest: dailyDigest ?? true,
          milestoneNotifications: milestoneNotifications ?? true,
        },
        update: {
          ...(typeof weeklyDigest === "boolean" && { weeklyDigest }),
          ...(typeof dailyDigest === "boolean" && { dailyDigest }),
          ...(typeof milestoneNotifications === "boolean" && { milestoneNotifications }),
        },
      });
    }

    // Check profile completeness and grant bonus if 100%
    const profileCompleteness = calculateProfileCompleteness({
      displayName: user.displayName,
      firstName: user.firstName,
      lastName: user.lastName,
      city: user.city,
      country: user.country,
      headline: user.headline,
      bio: user.bio,
      websiteUrl: user.websiteUrl,
      twitterUrl: user.twitterUrl,
      youtubeUrl: user.youtubeUrl,
      linkedinUrl: user.linkedinUrl,
      twitchUrl: user.twitchUrl,
      featuredVideoUrl: user.featuredVideoUrl,
      status: user.status,
      openToWork: user.openToWork,
      lookingForCofounder: user.lookingForCofounder,
      availableForContract: user.availableForContract,
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
