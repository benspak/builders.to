import Stripe from "stripe";

// Price for Sidebar Advertisement ($20/month)
export const SIDEBAR_AD_PRICE_CENTS = 2000;
export const SIDEBAR_AD_DURATION_DAYS = 30;

// Services Marketplace pricing
export const SERVICE_LISTING_FEE_CENTS = 100; // $1
export const SERVICE_LISTING_DURATION_DAYS = 90;
export const SERVICE_PLATFORM_FEE_PERCENT = 5;
export const MIN_LAUNCHED_PROJECTS_FOR_LISTING = 2;

// Lazy initialization to avoid build errors when env vars aren't set
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }
  return stripeInstance;
}
