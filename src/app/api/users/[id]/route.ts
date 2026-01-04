import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { lookupZipCode } from "@/lib/zipcode";

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
        firstName: true,
        lastName: true,
        zipCode: true,
        city: true,
        state: true,
        headline: true,
        bio: true,
        websiteUrl: true,
        twitterUrl: true,
        youtubeUrl: true,
        linkedinUrl: true,
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
      firstName,
      lastName,
      zipCode,
      headline,
      bio,
      websiteUrl,
      twitterUrl,
      youtubeUrl,
      linkedinUrl,
      // Status
      status,
      // Intent flags
      openToWork,
      lookingForCofounder,
      availableForContract,
    } = body;

    // Generate slug from name if not exists, and get current status for comparison
    const currentUser = await prisma.user.findUnique({
      where: { id },
      select: { slug: true, name: true, status: true },
    });

    let slug = currentUser?.slug;
    if (!slug) {
      const baseName = firstName && lastName
        ? `${firstName}-${lastName}`
        : firstName || lastName || currentUser?.name || id;
      slug = await getUniqueSlug(generateSlug(baseName), id);
    }

    // Validate URLs
    const urlFields = { websiteUrl, twitterUrl, youtubeUrl, linkedinUrl };
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

    // Lookup city/state from zip code if provided
    let city: string | null = null;
    let state: string | null = null;
    const trimmedZip = zipCode?.trim() || null;

    if (trimmedZip) {
      const locationData = await lookupZipCode(trimmedZip);
      if (locationData) {
        city = locationData.city;
        state = locationData.stateAbbreviation;
      }
    }

    // Check if status is being updated to a new non-empty value
    const trimmedStatus = status?.trim() || null;
    const statusChanged = status !== undefined && trimmedStatus && trimmedStatus !== currentUser?.status;

    const user = await prisma.user.update({
      where: { id },
      data: {
        slug,
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
        zipCode: trimmedZip,
        city,
        state,
        headline: headline?.trim() || null,
        bio: bio?.trim() || null,
        websiteUrl: websiteUrl?.trim() || null,
        twitterUrl: twitterUrl?.trim() || null,
        youtubeUrl: youtubeUrl?.trim() || null,
        linkedinUrl: linkedinUrl?.trim() || null,
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
        slug: true,
        firstName: true,
        lastName: true,
        zipCode: true,
        city: true,
        state: true,
        headline: true,
        bio: true,
        websiteUrl: true,
        twitterUrl: true,
        youtubeUrl: true,
        linkedinUrl: true,
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

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
