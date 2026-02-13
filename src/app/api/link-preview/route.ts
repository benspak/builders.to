import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseBuildersToUrl, LinkPreviewData } from "@/lib/link-preview";
import { getAbsoluteImageUrl } from "@/lib/utils";

export const runtime = "nodejs";

/**
 * GET /api/link-preview?url=https://builders.to/...
 * Fetches preview data for a builders.to URL
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  const parsed = parseBuildersToUrl(url);

  if (!parsed) {
    return NextResponse.json(
      { error: "Invalid or unsupported builders.to URL" },
      { status: 400 }
    );
  }

  try {
    let previewData: LinkPreviewData | null = null;

    switch (parsed.type) {
      case "profile":
        previewData = await getProfilePreview(parsed.slug!);
        break;
      case "update":
        previewData = await getUpdatePreview(parsed.slug!, parsed.id!);
        break;
      case "project":
        previewData = await getProjectPreview(parsed.slug!);
        break;
      case "company":
        previewData = await getCompanyPreview(parsed.slug!);
        break;
      case "service":
        previewData = await getServicePreview(parsed.id!);
        break;
      case "local":
        if (parsed.slug) {
          previewData = await getLocalCompanyPreview(parsed.location!, parsed.slug);
        } else {
          previewData = await getLocationPreview(parsed.location!);
        }
        break;
      default:
        return NextResponse.json(
          { error: "Unsupported URL type" },
          { status: 400 }
        );
    }

    if (!previewData) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }

    // Add the original URL to the response
    previewData.url = url;

    return NextResponse.json(previewData, {
      headers: {
        // Cache for 5 minutes
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    });
  } catch (error) {
    console.error("Error fetching link preview:", error);
    return NextResponse.json(
      { error: "Failed to fetch preview" },
      { status: 500 }
    );
  }
}

async function getProfilePreview(slug: string): Promise<LinkPreviewData | null> {
  const user = await prisma.user.findUnique({
    where: { slug },
    select: {
      name: true,
      displayName: true,
      firstName: true,
      lastName: true,
      image: true,
      headline: true,
      city: true,
      state: true,
      country: true,
      slug: true,
      _count: {
        select: {
          projects: true,
          followers: true,
        },
      },
    },
  });

  if (!user) return null;

  const displayName = user.displayName
    || (user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : null)
    || user.name
    || "Builder";

  const location = [user.city, user.state, user.country]
    .filter(Boolean)
    .join(", ");

  return {
    url: "",
    type: "profile",
    title: displayName,
    description: user.headline || `${displayName}'s profile on Builders.to`,
    image: getAbsoluteImageUrl(user.image) ?? undefined,
    author: {
      name: displayName,
      image: getAbsoluteImageUrl(user.image) ?? undefined,
      slug: user.slug || undefined,
    },
    stats: {
      projects: user._count.projects,
      followers: user._count.followers,
    },
    meta: {
      location: location || undefined,
    },
  };
}

async function getUpdatePreview(userSlug: string, updateId: string): Promise<LinkPreviewData | null> {
  const update = await prisma.dailyUpdate.findUnique({
    where: { id: updateId },
    select: {
      content: true,
      imageUrl: true,
      createdAt: true,
      user: {
        select: {
          name: true,
          displayName: true,
          firstName: true,
          lastName: true,
          image: true,
          slug: true,
          headline: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  if (!update || update.user.slug !== userSlug) return null;

  const displayName = update.user.displayName
    || (update.user.firstName && update.user.lastName
      ? `${update.user.firstName} ${update.user.lastName}`
      : null)
    || update.user.name
    || "Builder";

  // Truncate content for description
  const description = update.content.length > 200
    ? update.content.slice(0, 197) + "..."
    : update.content;

  return {
    url: "",
    type: "update",
    title: `${displayName} on Builders.to`,
    description,
    image: getAbsoluteImageUrl(update.imageUrl) ?? getAbsoluteImageUrl(update.user.image) ?? undefined,
    author: {
      name: displayName,
      image: getAbsoluteImageUrl(update.user.image) ?? undefined,
      slug: update.user.slug || undefined,
    },
    stats: {
      likes: update._count.likes,
      comments: update._count.comments,
    },
    meta: {
      createdAt: update.createdAt.toISOString(),
    },
  };
}

async function getProjectPreview(slug: string): Promise<LinkPreviewData | null> {
  const project = await prisma.project.findFirst({
    where: { slug },
    select: {
      name: true,
      tagline: true,
      logo: true,
      status: true,
      user: {
        select: {
          name: true,
          displayName: true,
          firstName: true,
          lastName: true,
          image: true,
          slug: true,
        },
      },
      _count: {
        select: {
          upvotes: true,
        },
      },
    },
  });

  if (!project) return null;

  const displayName = project.user.displayName
    || (project.user.firstName && project.user.lastName
      ? `${project.user.firstName} ${project.user.lastName}`
      : null)
    || project.user.name
    || "Builder";

  return {
    url: "",
    type: "project",
    title: project.name,
    description: project.tagline || `${project.name} on Builders.to`,
    image: getAbsoluteImageUrl(project.logo) ?? undefined,
    author: {
      name: displayName,
      image: getAbsoluteImageUrl(project.user.image) ?? undefined,
      slug: project.user.slug || undefined,
    },
    stats: {
      likes: project._count.upvotes,
    },
    meta: {
      status: project.status,
    },
  };
}

async function getCompanyPreview(slug: string): Promise<LinkPreviewData | null> {
  const company = await prisma.company.findFirst({
    where: { slug },
    select: {
      name: true,
      about: true,
      logo: true,
      location: true,
      user: {
        select: {
          name: true,
          displayName: true,
          firstName: true,
          lastName: true,
          image: true,
          slug: true,
        },
      },
      _count: {
        select: {
          members: true,
        },
      },
    },
  });

  if (!company) return null;

  const displayName = company.user.displayName
    || (company.user.firstName && company.user.lastName
      ? `${company.user.firstName} ${company.user.lastName}`
      : null)
    || company.user.name
    || "Builder";

  return {
    url: "",
    type: "company",
    title: company.name,
    description: company.about || `${company.name} on Builders.to`,
    image: getAbsoluteImageUrl(company.logo) ?? undefined,
    author: {
      name: displayName,
      image: getAbsoluteImageUrl(company.user.image) ?? undefined,
      slug: company.user.slug || undefined,
    },
    meta: {
      location: company.location || undefined,
    },
  };
}

async function getServicePreview(id: string): Promise<LinkPreviewData | null> {
  const service = await prisma.userService.findUnique({
    where: { id },
    select: {
      title: true,
      description: true,
      images: true,
      category: true,
      user: {
        select: {
          name: true,
          displayName: true,
          firstName: true,
          lastName: true,
          image: true,
          slug: true,
        },
      },
    },
  });

  if (!service) return null;

  const displayName = service.user.displayName
    || (service.user.firstName && service.user.lastName
      ? `${service.user.firstName} ${service.user.lastName}`
      : null)
    || service.user.name
    || "Builder";

  // Get first image if available
  const firstImage = Array.isArray(service.images) && service.images.length > 0
    ? service.images[0] as string
    : null;

  return {
    url: "",
    type: "service",
    title: service.title,
    description: service.description.slice(0, 200),
    image: getAbsoluteImageUrl(firstImage) ?? getAbsoluteImageUrl(service.user.image) ?? undefined,
    author: {
      name: displayName,
      image: getAbsoluteImageUrl(service.user.image) ?? undefined,
      slug: service.user.slug || undefined,
    },
    meta: {
      category: service.category,
    },
  };
}

async function getLocationPreview(locationSlug: string): Promise<LinkPreviewData | null> {
  // Get location info from companies or users
  const [company, user] = await Promise.all([
    prisma.company.findFirst({
      where: { locationSlug },
      select: { location: true },
    }),
    prisma.user.findFirst({
      where: { locationSlug },
      select: { city: true, state: true, country: true },
    }),
  ]);

  let locationName = "";
  if (company?.location) {
    locationName = company.location;
  } else if (user) {
    locationName = [user.city, user.state, user.country].filter(Boolean).join(", ");
  }

  if (!locationName) return null;

  return {
    url: "",
    type: "local",
    title: locationName,
    description: `Discover builders and companies in ${locationName}`,
    meta: {
      location: locationName,
    },
  };
}

async function getLocalCompanyPreview(locationSlug: string, companySlug: string): Promise<LinkPreviewData | null> {
  const company = await prisma.company.findFirst({
    where: {
      slug: companySlug,
      locationSlug,
    },
    select: {
      name: true,
      about: true,
      logo: true,
      location: true,
      user: {
        select: {
          name: true,
          displayName: true,
          firstName: true,
          lastName: true,
          image: true,
          slug: true,
        },
      },
    },
  });

  if (!company) return null;

  const displayName = company.user.displayName
    || (company.user.firstName && company.user.lastName
      ? `${company.user.firstName} ${company.user.lastName}`
      : null)
    || company.user.name
    || "Builder";

  return {
    url: "",
    type: "local",
    title: company.name,
    description: company.about || `${company.name} in ${company.location || "Builders Local"}`,
    image: getAbsoluteImageUrl(company.logo) ?? undefined,
    author: {
      name: displayName,
      image: getAbsoluteImageUrl(company.user.image) ?? undefined,
      slug: company.user.slug || undefined,
    },
    meta: {
      location: company.location || undefined,
    },
  };
}
