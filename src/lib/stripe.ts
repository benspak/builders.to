import Stripe from "stripe";

// Price for Roast my MVP feature ($20)
export const ROAST_MVP_PRICE_CENTS = 2000;
export const ROAST_MVP_FEATURE_DURATION_DAYS = 7;

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
