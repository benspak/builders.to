export interface LocalListingUser {
  id: string;
  name: string | null;
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  image: string | null;
  slug: string | null;
  headline?: string | null;
  createdAt?: string | Date;
  _count?: {
    localListings?: number;
  };
}

export interface LocalListingImage {
  id: string;
  url: string;
  caption: string | null;
  order: number;
}

export interface LocalListing {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: LocalListingCategory;
  status: LocalListingStatus;
  locationSlug: string;
  city: string;
  state: string;
  zipCode: string | null;
  contactUrl: string | null;
  priceInCents: number | null;
  activatedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: LocalListingUser;
  images: LocalListingImage[];
  _count: {
    comments: number;
    flags: number;
  };
  isOwner?: boolean;
  userRating?: {
    average: number;
    count: number;
  };
}

export interface LocalListingComment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: LocalListingUser;
}

export type LocalListingCategory =
  | "COMMUNITY"
  | "SERVICES"
  | "DISCUSSION"
  | "COWORKING_HOUSING"
  | "FOR_SALE";

export type LocalListingStatus =
  | "DRAFT"
  | "PENDING_PAYMENT"
  | "ACTIVE"
  | "EXPIRED"
  | "FLAGGED"
  | "REMOVED";

export const CATEGORY_LABELS: Record<LocalListingCategory, string> = {
  COMMUNITY: "Community",
  SERVICES: "Services",
  DISCUSSION: "Discussion",
  COWORKING_HOUSING: "Co-working / Housing",
  FOR_SALE: "For Sale",
};

export const CATEGORY_COLORS: Record<LocalListingCategory, string> = {
  COMMUNITY: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  SERVICES: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  DISCUSSION: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  COWORKING_HOUSING: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  FOR_SALE: "bg-pink-500/20 text-pink-300 border-pink-500/30",
};

export const CATEGORY_ICONS: Record<LocalListingCategory, string> = {
  COMMUNITY: "Users",
  SERVICES: "Wrench",
  DISCUSSION: "MessageSquare",
  COWORKING_HOUSING: "Home",
  FOR_SALE: "ShoppingBag",
};

export const STATUS_LABELS: Record<LocalListingStatus, string> = {
  DRAFT: "Draft",
  PENDING_PAYMENT: "Pending Payment",
  ACTIVE: "Active",
  EXPIRED: "Expired",
  FLAGGED: "Under Review",
  REMOVED: "Removed",
};

export const STATUS_COLORS: Record<LocalListingStatus, string> = {
  DRAFT: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  PENDING_PAYMENT: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  ACTIVE: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  EXPIRED: "bg-red-500/20 text-red-300 border-red-500/30",
  FLAGGED: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  REMOVED: "bg-red-500/20 text-red-300 border-red-500/30",
};

export const FLAG_REASONS = [
  { value: "SPAM", label: "Spam" },
  { value: "INAPPROPRIATE", label: "Inappropriate content" },
  { value: "SCAM", label: "Scam or fraud" },
  { value: "DUPLICATE", label: "Duplicate listing" },
  { value: "WRONG_CATEGORY", label: "Wrong category" },
  { value: "OTHER", label: "Other" },
];
