import Stripe from "stripe";
import { getStripe, SERVICE_PLATFORM_FEE_PERCENT } from "./stripe";

/**
 * Stripe Connect utilities for the Services Marketplace
 *
 * This module handles:
 * - Seller onboarding via Stripe Connect Express
 * - Creating payment intents with application fees
 * - Managing transfers and payouts
 */

/**
 * Create a Stripe Connect account link for seller onboarding
 * This starts the Express onboarding flow
 */
export async function createConnectAccountLink(
  userId: string,
  email: string,
  returnUrl: string,
  refreshUrl: string
): Promise<{ accountId: string; url: string }> {
  const stripe = getStripe();

  // Create a Connect Express account
  const account = await stripe.accounts.create({
    type: "express",
    email: email,
    metadata: {
      userId: userId,
    },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });

  // Create the account link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });

  return {
    accountId: account.id,
    url: accountLink.url,
  };
}

/**
 * Create a new account link for an existing Connect account
 * Used when the user needs to complete onboarding or update their account
 */
export async function createAccountLinkForExisting(
  accountId: string,
  returnUrl: string,
  refreshUrl: string
): Promise<string> {
  const stripe = getStripe();

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });

  return accountLink.url;
}

/**
 * Check if a Connect account has completed onboarding
 */
export async function isAccountOnboarded(accountId: string): Promise<boolean> {
  const stripe = getStripe();

  try {
    const account = await stripe.accounts.retrieve(accountId);
    return (
      account.charges_enabled === true && account.payouts_enabled === true
    );
  } catch {
    return false;
  }
}

/**
 * Get the status of a Connect account
 */
export async function getAccountStatus(accountId: string): Promise<{
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirements: Stripe.Account.Requirements | null;
}> {
  const stripe = getStripe();

  const account = await stripe.accounts.retrieve(accountId);

  return {
    chargesEnabled: account.charges_enabled ?? false,
    payoutsEnabled: account.payouts_enabled ?? false,
    detailsSubmitted: account.details_submitted ?? false,
    requirements: account.requirements ?? null,
  };
}

/**
 * Create a payment intent for a service purchase
 * This creates a destination charge with an application fee
 */
export async function createServicePaymentIntent(params: {
  amountInCents: number;
  sellerConnectId: string;
  buyerEmail: string;
  serviceId: string;
  orderId: string;
  serviceTitle: string;
}): Promise<{
  clientSecret: string;
  paymentIntentId: string;
  platformFeeInCents: number;
}> {
  const stripe = getStripe();

  // Calculate platform fee (5%)
  const platformFeeInCents = Math.round(
    (params.amountInCents * SERVICE_PLATFORM_FEE_PERCENT) / 100
  );

  // Create payment intent with destination charge
  const paymentIntent = await stripe.paymentIntents.create({
    amount: params.amountInCents,
    currency: "usd",
    application_fee_amount: platformFeeInCents,
    transfer_data: {
      destination: params.sellerConnectId,
    },
    metadata: {
      type: "service_purchase",
      serviceId: params.serviceId,
      orderId: params.orderId,
      serviceTitle: params.serviceTitle,
    },
    receipt_email: params.buyerEmail,
    description: `Service: ${params.serviceTitle}`,
    // Don't capture immediately - hold funds in escrow
    capture_method: "manual",
  });

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
    platformFeeInCents,
  };
}

/**
 * Capture a payment intent (release funds from escrow)
 * Called when the buyer confirms delivery
 */
export async function captureServicePayment(
  paymentIntentId: string
): Promise<boolean> {
  const stripe = getStripe();

  try {
    await stripe.paymentIntents.capture(paymentIntentId);
    return true;
  } catch (error) {
    console.error("Failed to capture payment:", error);
    return false;
  }
}

/**
 * Cancel a payment intent (refund held funds)
 * Called when an order is cancelled before delivery
 */
export async function cancelServicePayment(
  paymentIntentId: string
): Promise<boolean> {
  const stripe = getStripe();

  try {
    await stripe.paymentIntents.cancel(paymentIntentId);
    return true;
  } catch (error) {
    console.error("Failed to cancel payment:", error);
    return false;
  }
}

/**
 * Refund a captured payment
 * Called when a dispute is resolved in buyer's favor
 */
export async function refundServicePayment(
  paymentIntentId: string,
  reason?: string
): Promise<boolean> {
  const stripe = getStripe();

  try {
    await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: "requested_by_customer",
      metadata: {
        refund_reason: reason || "Service order refunded",
      },
      // Reverse the transfer to the seller
      reverse_transfer: true,
      // Refund the application fee as well
      refund_application_fee: true,
    });
    return true;
  } catch (error) {
    console.error("Failed to refund payment:", error);
    return false;
  }
}

/**
 * Get the Stripe dashboard login link for a seller
 */
export async function getSellerDashboardLink(
  accountId: string
): Promise<string> {
  const stripe = getStripe();

  const loginLink = await stripe.accounts.createLoginLink(accountId);
  return loginLink.url;
}

/**
 * Verify a webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  endpointSecret: string
): Stripe.Event {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(payload, signature, endpointSecret);
}
