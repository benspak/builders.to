/**
 * Token Service (in-app currency)
 *
 * Handles:
 * - Balance queries and credit/debit with transaction history
 * - Constants for token economics (tokens per dollar, ad cost, etc.)
 * - All token changes go through this service
 */

import { TokenTransactionType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getCurrentAdPriceCents } from "@/lib/stripe";

// ============================================
// Constants
// ============================================

/** 10 tokens = $1 */
export const TOKENS_PER_DOLLAR = 10;

/** Convert cents to tokens (e.g. 500 cents = 50 tokens) */
export function centsToTokens(cents: number): number {
  return Math.round((cents / 100) * TOKENS_PER_DOLLAR);
}

/** Get ad slot cost in tokens for a given pricing tier */
export function getAdSlotCostTokens(pricingTier: number): number {
  return centsToTokens(getCurrentAdPriceCents(pricingTier));
}

// ============================================
// Balance & checks
// ============================================

export async function getBalance(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tokenBalance: true },
  });
  return user?.tokenBalance ?? 0;
}

export async function canAfford(userId: string, amount: number): Promise<boolean> {
  if (amount <= 0) return true;
  const balance = await getBalance(userId);
  return balance >= amount;
}

// ============================================
// Credit (add tokens)
// ============================================

export interface CreditInput {
  userId: string;
  amount: number;
  type: TokenTransactionType;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Credit tokens to a user. Amount must be positive.
 * Updates tokenBalance and lifetimeTokensEarned, creates TokenTransaction.
 */
export async function credit(input: CreditInput): Promise<{ newBalance: number; transactionId: string }> {
  const { userId, amount, type, description, metadata } = input;
  if (amount <= 0) {
    throw new Error("Credit amount must be positive");
  }

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: {
        tokenBalance: { increment: amount },
        lifetimeTokensEarned: { increment: amount },
      },
      select: { tokenBalance: true },
    });

    const transaction = await tx.tokenTransaction.create({
      data: {
        userId,
        amount,
        type,
        description: description ?? undefined,
        metadata: metadata ?? undefined,
      },
    });

    return { newBalance: user.tokenBalance, transactionId: transaction.id };
  });

  return result;
}

// ============================================
// Debit (spend tokens)
// ============================================

export interface DebitInput {
  userId: string;
  amount: number;
  type: TokenTransactionType;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Debit tokens from a user. Amount must be positive (stored as negative in transaction).
 * Fails if insufficient balance. Updates tokenBalance, creates TokenTransaction.
 */
export async function debit(input: DebitInput): Promise<{ newBalance: number; transactionId: string }> {
  const { userId, amount, type, description, metadata } = input;
  if (amount <= 0) {
    throw new Error("Debit amount must be positive");
  }

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { tokenBalance: true },
    });

    if (!user) {
      throw new Error("User not found");
    }
    if (user.tokenBalance < amount) {
      throw new Error("Insufficient token balance");
    }

    const updated = await tx.user.update({
      where: { id: userId },
      data: { tokenBalance: { decrement: amount } },
      select: { tokenBalance: true },
    });

    const transaction = await tx.tokenTransaction.create({
      data: {
        userId,
        amount: -amount,
        type,
        description: description ?? undefined,
        metadata: metadata ?? undefined,
      },
    });

    return { newBalance: updated.tokenBalance, transactionId: transaction.id };
  });

  return result;
}

// ============================================
// Transaction history
// ============================================

export async function getRecentTransactions(
  userId: string,
  limit = 20
): Promise<
  Array<{
    id: string;
    amount: number;
    type: TokenTransactionType;
    description: string | null;
    createdAt: Date;
  }>
> {
  const list = await prisma.tokenTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, amount: true, type: true, description: true, createdAt: true },
  });
  return list;
}
