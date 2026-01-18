import Stripe from "stripe";

// ============================================
// Dynamic Ad Pricing System
// ============================================

// Platform-wide ad slot limit
export const PLATFORM_AD_SLOTS = 8;

// Base price for ads (doubles each tier)
export const BASE_AD_PRICE_CENTS = 500; // $5 starting price

// Ad duration
export const SIDEBAR_AD_DURATION_DAYS = 30;

// Calculate current ad price based on pricing tier
// Tier 0 = $5, Tier 1 = $10, Tier 2 = $20, Tier 3 = $40, etc.
export function getCurrentAdPriceCents(pricingTier: number): number {
  return BASE_AD_PRICE_CENTS * Math.pow(2, pricingTier);
}

// Format price for display (e.g., 1000 -> "$10")
export function formatAdPrice(priceCents: number): string {
  return `$${(priceCents / 100).toFixed(0)}`;
}

// Legacy exports for backward compatibility during migration
// These will be removed after all references are updated
export const SIDEBAR_AD_PRICE_CENTS = 500; // @deprecated - use getCurrentAdPriceCents()
export const MAX_ACTIVE_ADS = 10; // @deprecated - use PLATFORM_AD_SLOTS
export const AD_SURCHARGE_CENTS = 500; // @deprecated - surcharge system removed

// Services Marketplace pricing
export const SERVICE_LISTING_FEE_CENTS = 100; // $1
export const SERVICE_LISTING_DURATION_DAYS = 90;
export const SERVICE_PLATFORM_FEE_PERCENT = 5;
export const MIN_LAUNCHED_PROJECTS_FOR_LISTING = 1;

// Local Listings pricing
export const LOCAL_LISTING_FEE_CENTS = 100; // $1 for Services category
export const LOCAL_LISTING_PAID_DURATION_DAYS = 90; // Services category lasts 90 days
export const LOCAL_LISTING_FREE_DURATION_DAYS = 30; // Free categories last 30 days

// Lazy initialization to avoid build errors when env vars aren't set
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
    }
    // Don't specify apiVersion - use Stripe account's default API version
    // This ensures compatibility with webhooks which use the account's API version
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
}
