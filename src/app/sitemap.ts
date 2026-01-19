import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://builders.to";

// This route should not be prerendered at build time because it depends on the database.
// If the DB is unavailable during build (common in CI / Render build step), we still want
// the build to succeed.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages with their update frequencies and priorities
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
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

  // Fetch dynamic data in parallel. If the DB is unavailable, fall back to the static sitemap
  // so builds and deployments still succeed.
  let projects: Array<{ slug: string | null; updatedAt: Date }> = [];
  let companies: Array<{ slug: string | null; updatedAt: Date }> = [];
  let users: Array<{ slug: string | null; updatedAt: Date }> = [];
  let localListings: Array<{ slug: string | null; updatedAt: Date }> = [];
  let locations: Array<{ locationSlug: string | null }> = [];

  try {
    [projects, companies, users, localListings, locations] = await Promise.all([
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
      // Active local listings (must have slug)
      prisma.localListing.findMany({
        where: {
          status: "ACTIVE",
          slug: { not: null },
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
  } catch (err) {
    // Keep this as a warning (not an error) so build logs are informative without failing CI.
    console.warn("[sitemap] Failed to query database; returning static sitemap only.", err);
    return staticPages;
  }

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

  // Generate local listing pages
  const localListingPages: MetadataRoute.Sitemap = localListings
    .filter((l) => l.slug)
    .map((listing) => ({
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
    ...localListingPages,
    ...locationPages,
  ];
}
