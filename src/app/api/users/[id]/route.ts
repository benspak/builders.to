import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
        headline: true,
        bio: true,
        websiteUrl: true,
        twitterUrl: true,
        youtubeUrl: true,
        linkedinUrl: true,
        image: true,
        createdAt: true,
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
    } = body;

    // Generate slug from name if not exists
    const currentUser = await prisma.user.findUnique({
      where: { id },
      select: { slug: true, name: true },
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

    const user = await prisma.user.update({
      where: { id },
      data: {
        slug,
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
        zipCode: zipCode?.trim() || null,
        headline: headline?.trim() || null,
        bio: bio?.trim() || null,
        websiteUrl: websiteUrl?.trim() || null,
        twitterUrl: twitterUrl?.trim() || null,
        youtubeUrl: youtubeUrl?.trim() || null,
        linkedinUrl: linkedinUrl?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        firstName: true,
        lastName: true,
        zipCode: true,
        headline: true,
        bio: true,
        websiteUrl: true,
        twitterUrl: true,
        youtubeUrl: true,
        linkedinUrl: true,
        image: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
