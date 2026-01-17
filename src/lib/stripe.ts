import Stripe from "stripe";

// Price for Sidebar Advertisement ($5/month)
export const SIDEBAR_AD_PRICE_CENTS = 500;
export const SIDEBAR_AD_DURATION_DAYS = 30;

// Ad limits and surcharge
export const MAX_ACTIVE_ADS = 10; // Maximum active ads before surcharge applies
export const AD_SURCHARGE_CENTS = 500; // $5 surcharge for ads over the limit

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
