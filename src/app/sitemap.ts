import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://builders.to";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages with their update frequencies and priorities
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/feed`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/projects`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/companies`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/local`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/streamers`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date("2026-01-14"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date("2026-01-14"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Fetch dynamic data in parallel
  const [projects, companies, users, services, localListings, locations] = await Promise.all([
    // Projects with slugs
    prisma.project.findMany({
      where: { slug: { not: null } },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    // Companies with slugs
    prisma.company.findMany({
      where: { slug: { not: null } },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    // Users with public profiles (have slug)
    prisma.user.findMany({
      where: { slug: { not: null } },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    // Active service listings
    prisma.serviceListing.findMany({
      where: {
        status: "ACTIVE",
        slug: { not: null },
      },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    // Active local listings
    prisma.localListing.findMany({
      where: {
        status: "ACTIVE",
      },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    // Unique location slugs from local listings
    prisma.localListing.findMany({
      where: {
        status: "ACTIVE",
        locationSlug: { not: null },
      },
      select: { locationSlug: true },
      distinct: ["locationSlug"],
    }),
  ]);

  // Generate project pages
  const projectPages: MetadataRoute.Sitemap = projects
    .filter((p) => p.slug)
    .map((project) => ({
      url: `${BASE_URL}/projects/${project.slug}`,
      lastModified: project.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  // Generate company pages
  const companyPages: MetadataRoute.Sitemap = companies
    .filter((c) => c.slug)
    .map((company) => ({
      url: `${BASE_URL}/companies/${company.slug}`,
      lastModified: company.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  // Generate user profile pages
  const userPages: MetadataRoute.Sitemap = users
    .filter((u) => u.slug)
    .map((user) => ({
      url: `${BASE_URL}/${user.slug}`,
      lastModified: user.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  // Generate user updates pages
  const userUpdatesPages: MetadataRoute.Sitemap = users
    .filter((u) => u.slug)
    .map((user) => ({
      url: `${BASE_URL}/${user.slug}/updates`,
      lastModified: user.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.5,
    }));

  // Generate service listing pages
  const servicePages: MetadataRoute.Sitemap = services
    .filter((s) => s.slug)
    .map((service) => ({
      url: `${BASE_URL}/services/${service.slug}`,
      lastModified: service.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  // Generate local listing pages
  const localListingPages: MetadataRoute.Sitemap = localListings.map((listing) => ({
    url: `${BASE_URL}/listing/${listing.slug}`,
    lastModified: listing.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  // Generate location pages
  const locationPages: MetadataRoute.Sitemap = locations
    .filter((l) => l.locationSlug)
    .map((location) => ({
      url: `${BASE_URL}/local/${location.locationSlug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.6,
    }));

  return [
    ...staticPages,
    ...projectPages,
    ...companyPages,
    ...userPages,
    ...userUpdatesPages,
    ...servicePages,
    ...localListingPages,
    ...locationPages,
  ];
}
