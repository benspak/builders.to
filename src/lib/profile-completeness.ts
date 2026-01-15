// Profile completeness calculation utility
// Helps users understand what fields they should fill out to complete their profile

export interface ProfileField {
  key: string;
  label: string;
  description: string;
  weight: number;
  category: "essential" | "important" | "optional";
  icon: string; // Lucide icon name
}

export interface ProfileCompletenessResult {
  score: number; // 0-100
  completedFields: string[];
  missingFields: ProfileField[];
  nextSteps: ProfileField[];
  level: "beginner" | "intermediate" | "advanced" | "complete";
  levelLabel: string;
}

// Define profile fields with weights
// Note: featuredVideo, intentFlag, and multipleSocials are NOT required for completeness
export const PROFILE_FIELDS: ProfileField[] = [
  // Essential fields (higher weight) - 60 points total
  {
    key: "headline",
    label: "Headline",
    description: "Add a tagline about yourself",
    weight: 20,
    category: "essential",
    icon: "FileText",
  },
  {
    key: "bio",
    label: "Bio",
    description: "Tell the community about yourself",
    weight: 20,
    category: "essential",
    icon: "AlignLeft",
  },
  {
    key: "location",
    label: "Location",
    description: "Add your city and country",
    weight: 20,
    category: "essential",
    icon: "MapPin",
  },
  {
    key: "socialLink",
    label: "Social Link",
    description: "Connect at least one social profile",
    weight: 20,
    category: "essential",
    icon: "Link",
  },

  // Important fields (medium weight) - 20 points total
  {
    key: "displayName",
    label: "Display Name",
    description: "Set a custom display name",
    weight: 10,
    category: "important",
    icon: "User",
  },
  {
    key: "websiteUrl",
    label: "Website",
    description: "Link your personal website or portfolio",
    weight: 5,
    category: "important",
    icon: "Globe",
  },
  {
    key: "status",
    label: "Status",
    description: "Share what you're currently working on",
    weight: 5,
    category: "important",
    icon: "MessageCircle",
  },
];

export interface UserProfileData {
  displayName?: string | null;
  city?: string | null;
  country?: string | null;
  headline?: string | null;
  bio?: string | null;
  websiteUrl?: string | null;
  twitterUrl?: string | null;
  youtubeUrl?: string | null;
  linkedinUrl?: string | null;
  twitchUrl?: string | null;
  githubUrl?: string | null;
  producthuntUrl?: string | null;
  status?: string | null;
}

export function calculateProfileCompleteness(user: UserProfileData): ProfileCompletenessResult {
  const completedFields: string[] = [];
  const missingFields: ProfileField[] = [];

  // Check each field
  for (const field of PROFILE_FIELDS) {
    const isComplete = checkFieldComplete(field.key, user);
    if (isComplete) {
      completedFields.push(field.key);
    } else {
      missingFields.push(field);
    }
  }

  // Calculate score
  const totalWeight = PROFILE_FIELDS.reduce((sum, f) => sum + f.weight, 0);
  const completedWeight = PROFILE_FIELDS
    .filter((f) => completedFields.includes(f.key))
    .reduce((sum, f) => sum + f.weight, 0);

  const score = Math.round((completedWeight / totalWeight) * 100);

  // Determine level
  let level: ProfileCompletenessResult["level"];
  let levelLabel: string;

  if (score >= 100) {
    level = "complete";
    levelLabel = "Profile Complete! 🎉";
  } else if (score >= 75) {
    level = "advanced";
    levelLabel = "Almost There";
  } else if (score >= 40) {
    level = "intermediate";
    levelLabel = "Making Progress";
  } else {
    level = "beginner";
    levelLabel = "Just Getting Started";
  }

  // Sort missing fields by category priority (essential first) then by weight
  const categoryOrder = { essential: 0, important: 1, optional: 2 };
  const sortedMissing = [...missingFields].sort((a, b) => {
    const catDiff = categoryOrder[a.category] - categoryOrder[b.category];
    if (catDiff !== 0) return catDiff;
    return b.weight - a.weight;
  });

  // Get top 3 next steps (prioritize essential/important)
  const nextSteps = sortedMissing.slice(0, 3);

  return {
    score,
    completedFields,
    missingFields: sortedMissing,
    nextSteps,
    level,
    levelLabel,
  };
}

function checkFieldComplete(fieldKey: string, user: UserProfileData): boolean {
  switch (fieldKey) {
    case "headline":
      return Boolean(user.headline?.trim());

    case "bio":
      return Boolean(user.bio?.trim() && user.bio.trim().length >= 20);

    case "location":
      return Boolean(user.city?.trim());

    case "socialLink":
      return Boolean(
        user.twitterUrl?.trim() ||
        user.youtubeUrl?.trim() ||
        user.linkedinUrl?.trim() ||
        user.twitchUrl?.trim() ||
        user.githubUrl?.trim() ||
        user.producthuntUrl?.trim()
      );

    case "displayName":
      return Boolean(user.displayName?.trim());

    case "websiteUrl":
      return Boolean(user.websiteUrl?.trim());

    case "status":
      return Boolean(user.status?.trim());

    default:
      return false;
  }
}

// Get color based on score
export function getScoreColor(score: number): string {
  if (score >= 100) return "emerald";
  if (score >= 75) return "cyan";
  if (score >= 40) return "amber";
  return "orange";
}

// Get gradient based on score
export function getScoreGradient(score: number): string {
  if (score >= 100) return "from-emerald-500 to-emerald-600";
  if (score >= 75) return "from-cyan-500 to-blue-500";
  if (score >= 40) return "from-amber-500 to-orange-500";
  return "from-orange-500 to-red-500";
}
