/**
 * Building Similar Matching Service
 *
 * Handles:
 * - Finding users with similar tech stacks
 * - Matching by building category
 * - Interest-based matching
 * - Calculating similarity scores
 */

import { BuildingCategory } from "@prisma/client";
import prisma from "@/lib/prisma";

// ============================================
// Types
// ============================================

export interface SimilarUser {
  id: string;
  slug: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  image: string | null;
  headline: string | null;
  city: string | null;
  country: string | null;
  techStack: string[];
  buildingCategory: BuildingCategory | null;
  interests: string[];
  karma: number;
  currentStreak: number;
  similarityScore: number;
  matchReasons: string[];
}

export interface MatchingOptions {
  userId: string;
  limit?: number;
  excludeFollowing?: boolean;
}

// ============================================
// Similarity Calculation
// ============================================

/**
 * Calculate overlap between two arrays (case-insensitive)
 */
function calculateOverlap(arr1: string[], arr2: string[]): number {
  const set1 = new Set(arr1.map((s) => s.toLowerCase()));
  const set2 = new Set(arr2.map((s) => s.toLowerCase()));
  
  let overlap = 0;
  for (const item of set1) {
    if (set2.has(item)) {
      overlap++;
    }
  }
  
  return overlap;
}

/**
 * Calculate similarity score between two users
 * Returns a score from 0-100 and match reasons
 */
function calculateSimilarity(
  user: {
    techStack: string[];
    buildingCategory: BuildingCategory | null;
    interests: string[];
  },
  candidate: {
    techStack: string[];
    buildingCategory: BuildingCategory | null;
    interests: string[];
  }
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Tech stack overlap (weighted heavily - up to 50 points)
  const techOverlap = calculateOverlap(user.techStack, candidate.techStack);
  if (techOverlap > 0) {
    // More overlap = higher score (diminishing returns after 5)
    const techScore = Math.min(50, techOverlap * 10);
    score += techScore;
    
    // Find matching techs for the reason
    const userTechLower = new Set(user.techStack.map((s) => s.toLowerCase()));
    const matchingTechs = candidate.techStack.filter((t) =>
      userTechLower.has(t.toLowerCase())
    );
    
    if (matchingTechs.length > 0) {
      reasons.push(
        `Uses ${matchingTechs.slice(0, 3).join(", ")}${
          matchingTechs.length > 3 ? ` +${matchingTechs.length - 3} more` : ""
        }`
      );
    }
  }

  // Building category match (up to 30 points)
  if (
    user.buildingCategory &&
    candidate.buildingCategory &&
    user.buildingCategory === candidate.buildingCategory
  ) {
    score += 30;
    const categoryLabel = formatCategoryLabel(candidate.buildingCategory);
    reasons.push(`Building ${categoryLabel}`);
  }

  // Interest overlap (up to 20 points)
  const interestOverlap = calculateOverlap(user.interests, candidate.interests);
  if (interestOverlap > 0) {
    const interestScore = Math.min(20, interestOverlap * 5);
    score += interestScore;
    
    // Find matching interests
    const userInterestsLower = new Set(user.interests.map((s) => s.toLowerCase()));
    const matchingInterests = candidate.interests.filter((i) =>
      userInterestsLower.has(i.toLowerCase())
    );
    
    if (matchingInterests.length > 0) {
      reasons.push(
        `Interested in ${matchingInterests.slice(0, 2).join(", ")}${
          matchingInterests.length > 2 ? ` +${matchingInterests.length - 2} more` : ""
        }`
      );
    }
  }

  return { score, reasons };
}

/**
 * Format building category for display
 */
function formatCategoryLabel(category: BuildingCategory): string {
  const labels: Record<BuildingCategory, string> = {
    SAAS: "SaaS",
    MOBILE_APP: "Mobile Apps",
    DEVELOPER_TOOLS: "Developer Tools",
    ECOMMERCE: "E-commerce",
    AI_ML: "AI/ML",
    FINTECH: "Fintech",
    HEALTHTECH: "Healthtech",
    EDTECH: "Edtech",
    MARKETPLACE: "Marketplaces",
    AGENCY: "Agency",
    CONTENT: "Content",
    HARDWARE: "Hardware",
    OTHER: "Other",
  };
  
  return labels[category] || category;
}

// ============================================
// Main Matching Function
// ============================================

/**
 * Find users building similar things
 */
export async function findSimilarBuilders(
  options: MatchingOptions
): Promise<SimilarUser[]> {
  const { userId, limit = 10, excludeFollowing = true } = options;

  // Get the current user's profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      techStack: true,
      buildingCategory: true,
      interests: true,
      following: excludeFollowing
        ? {
            select: { followingId: true },
          }
        : false,
    },
  });

  if (!user) {
    return [];
  }

  // If user has no matching data, return empty
  if (
    user.techStack.length === 0 &&
    !user.buildingCategory &&
    user.interests.length === 0
  ) {
    return [];
  }

  // Build exclusion list
  const excludeIds = [userId];
  if (excludeFollowing && user.following) {
    excludeIds.push(...(user.following as { followingId: string }[]).map((f) => f.followingId));
  }

  // Query candidates with any matching criteria
  // We use a broad query and then score/filter in application
  const candidates = await prisma.user.findMany({
    where: {
      id: { notIn: excludeIds },
      OR: [
        // Has any tech stack overlap
        ...(user.techStack.length > 0
          ? [{ techStack: { hasSome: user.techStack } }]
          : []),
        // Same building category
        ...(user.buildingCategory
          ? [{ buildingCategory: user.buildingCategory }]
          : []),
        // Has any interest overlap
        ...(user.interests.length > 0
          ? [{ interests: { hasSome: user.interests } }]
          : []),
      ],
    },
    select: {
      id: true,
      slug: true,
      displayName: true,
      firstName: true,
      lastName: true,
      name: true,
      image: true,
      headline: true,
      city: true,
      country: true,
      techStack: true,
      buildingCategory: true,
      interests: true,
      karma: true,
      currentStreak: true,
    },
    // Get more candidates than needed for scoring/filtering
    take: Math.min(limit * 5, 100),
  });

  // Calculate similarity scores
  const scoredCandidates = candidates.map((candidate) => {
    const { score, reasons } = calculateSimilarity(
      {
        techStack: user.techStack,
        buildingCategory: user.buildingCategory,
        interests: user.interests,
      },
      {
        techStack: candidate.techStack,
        buildingCategory: candidate.buildingCategory,
        interests: candidate.interests,
      }
    );

    return {
      ...candidate,
      similarityScore: score,
      matchReasons: reasons,
    };
  });

  // Sort by similarity score (descending) and take top results
  const sortedCandidates = scoredCandidates
    .filter((c) => c.similarityScore > 0)
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit);

  return sortedCandidates;
}

/**
 * Get suggested tech stacks based on popular choices
 */
export async function getSuggestedTechStacks(): Promise<string[]> {
  // Common tech stacks for builders
  return [
    "React",
    "Next.js",
    "Node.js",
    "TypeScript",
    "Python",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "AWS",
    "Vercel",
    "Tailwind CSS",
    "GraphQL",
    "Docker",
    "Kubernetes",
    "Go",
    "Rust",
    "Swift",
    "Kotlin",
    "Flutter",
    "React Native",
    "Vue.js",
    "Django",
    "Rails",
    "Laravel",
    "Supabase",
    "Firebase",
    "OpenAI",
    "Stripe",
    "Prisma",
    "tRPC",
  ];
}

/**
 * Get suggested interests based on popular choices
 */
export async function getSuggestedInterests(): Promise<string[]> {
  return [
    "AI",
    "SaaS",
    "Developer Tools",
    "No-Code",
    "Open Source",
    "Indie Hacking",
    "Bootstrapping",
    "Mobile Apps",
    "Web3",
    "Fintech",
    "E-commerce",
    "Productivity",
    "Automation",
    "Design",
    "Marketing",
    "Growth",
    "Community Building",
    "Content Creation",
    "API Development",
    "DevOps",
    "Security",
    "Data Science",
    "Machine Learning",
    "EdTech",
    "HealthTech",
    "Climate Tech",
    "B2B",
    "B2C",
    "Marketplaces",
    "Hardware",
  ];
}
