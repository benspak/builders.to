/**
 * Betting System Constants and Helpers
 *
 * Users can bet tokens on whether a company or founder will achieve
 * a certain MRR growth percentage during a calendar quarter.
 */

// House fee percentage (5%)
export const HOUSE_FEE_PERCENTAGE = 0.05;

// Minimum bet amount in tokens
export const MIN_BET_TOKENS = 10;

// Maximum bet amount in tokens
export const MAX_BET_TOKENS = 10000;

// Minimum target percentage for betting (-100% to allow shorting to zero)
export const MIN_TARGET_PERCENTAGE = -100;

// Maximum target percentage for betting
export const MAX_TARGET_PERCENTAGE = 1000;

// Default percentage increments for UI
export const PERCENTAGE_PRESETS = [-20, -10, 0, 10, 20, 50, 100];

// Quarter definitions
export interface Quarter {
  quarter: string; // e.g., "2026-Q1"
  startsAt: Date;
  endsAt: Date;
  bettingClosesAt: Date;
}

/**
 * Get the current quarter string (e.g., "2026-Q1")
 */
export function getCurrentQuarter(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  const quarter = Math.floor(month / 3) + 1;
  return `${year}-Q${quarter}`;
}

/**
 * Get the next quarter string
 */
export function getNextQuarter(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  const currentQuarter = Math.floor(month / 3) + 1;

  if (currentQuarter === 4) {
    return `${year + 1}-Q1`;
  }
  return `${year}-Q${currentQuarter + 1}`;
}

/**
 * Parse a quarter string into start and end dates
 */
export function parseQuarter(quarterStr: string): Quarter {
  const match = quarterStr.match(/^(\d{4})-Q([1-4])$/);
  if (!match) {
    throw new Error(`Invalid quarter format: ${quarterStr}`);
  }

  const year = parseInt(match[1], 10);
  const quarter = parseInt(match[2], 10);

  // Quarter start month (0-indexed): Q1=0, Q2=3, Q3=6, Q4=9
  const startMonth = (quarter - 1) * 3;

  const startsAt = new Date(year, startMonth, 1, 0, 0, 0, 0);

  // End date is last day of the quarter
  const endMonth = startMonth + 3;
  const endsAt = new Date(year, endMonth, 0, 23, 59, 59, 999);

  // Betting closes at quarter start
  const bettingClosesAt = new Date(startsAt);

  return {
    quarter: quarterStr,
    startsAt,
    endsAt,
    bettingClosesAt,
  };
}

/**
 * Get upcoming quarters that can be bet on (current + next)
 */
export function getAvailableQuarters(date: Date = new Date()): Quarter[] {
  const current = getCurrentQuarter(date);
  const next = getNextQuarter(date);

  return [parseQuarter(current), parseQuarter(next)];
}

/**
 * Calculate house fee from stake amount
 */
export function calculateHouseFee(stakeTokens: number): number {
  return Math.ceil(stakeTokens * HOUSE_FEE_PERCENTAGE);
}

/**
 * Calculate net stake after house fee
 */
export function calculateNetStake(stakeTokens: number): number {
  return stakeTokens - calculateHouseFee(stakeTokens);
}

/**
 * Calculate MRR percentage growth
 */
export function calculateMrrGrowth(startMrr: number, endMrr: number): number {
  if (startMrr === 0) {
    // If starting from zero, any positive MRR is infinite growth
    // We cap it at a high number for practical purposes
    return endMrr > 0 ? 1000 : 0;
  }

  return ((endMrr - startMrr) / startMrr) * 100;
}

/**
 * Determine if a bet is won based on direction and actual growth
 */
export function isBetWon(
  direction: "LONG" | "SHORT",
  targetPercentage: number,
  actualPercentage: number
): boolean {
  if (direction === "LONG") {
    // LONG wins if actual >= target
    return actualPercentage >= targetPercentage;
  } else {
    // SHORT wins if actual < target
    return actualPercentage < targetPercentage;
  }
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Format tokens for display
 */
export function formatTokens(value: number): string {
  return value.toLocaleString();
}

/**
 * Validate bet parameters
 */
export function validateBet(params: {
  stakeTokens: number;
  targetPercentage: number;
  userBalance: number;
}): { valid: boolean; error?: string } {
  const { stakeTokens, targetPercentage, userBalance } = params;

  if (stakeTokens < MIN_BET_TOKENS) {
    return { valid: false, error: `Minimum bet is ${MIN_BET_TOKENS} tokens` };
  }

  if (stakeTokens > MAX_BET_TOKENS) {
    return { valid: false, error: `Maximum bet is ${MAX_BET_TOKENS} tokens` };
  }

  if (stakeTokens > userBalance) {
    return { valid: false, error: "Insufficient token balance" };
  }

  if (targetPercentage < MIN_TARGET_PERCENTAGE) {
    return { valid: false, error: `Minimum target is ${MIN_TARGET_PERCENTAGE}%` };
  }

  if (targetPercentage > MAX_TARGET_PERCENTAGE) {
    return { valid: false, error: `Maximum target is ${MAX_TARGET_PERCENTAGE}%` };
  }

  return { valid: true };
}

/**
 * Get quarter display name
 */
export function getQuarterDisplayName(quarterStr: string): string {
  const match = quarterStr.match(/^(\d{4})-Q([1-4])$/);
  if (!match) return quarterStr;

  const year = match[1];
  const quarter = match[2];

  const quarterNames: Record<string, string> = {
    "1": "Jan - Mar",
    "2": "Apr - Jun",
    "3": "Jul - Sep",
    "4": "Oct - Dec",
  };

  return `Q${quarter} ${year} (${quarterNames[quarter]})`;
}

/**
 * Check if betting is open for a quarter
 */
export function isBettingOpen(quarter: Quarter, now: Date = new Date()): boolean {
  return now < quarter.bettingClosesAt;
}

/**
 * Get time remaining until betting closes
 */
export function getTimeUntilBettingCloses(quarter: Quarter, now: Date = new Date()): {
  days: number;
  hours: number;
  minutes: number;
  total: number;
} {
  const diff = quarter.bettingClosesAt.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, total: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes, total: diff };
}

/**
 * Bet status display info
 */
export const BET_STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
    description: "Waiting for quarter to end",
  },
  WON: {
    label: "Won",
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    description: "You won this bet!",
  },
  LOST: {
    label: "Lost",
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    description: "Better luck next time",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-zinc-400",
    bgColor: "bg-zinc-500/20",
    description: "Bet was cancelled and refunded",
  },
  VOID: {
    label: "Void",
    color: "text-zinc-400",
    bgColor: "bg-zinc-500/20",
    description: "Target opted out or invalid",
  },
} as const;

/**
 * Direction display info
 */
export const DIRECTION_CONFIG = {
  LONG: {
    label: "Long",
    icon: "📈",
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    description: "Betting MRR will grow by at least this %",
  },
  SHORT: {
    label: "Short",
    icon: "📉",
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    description: "Betting MRR will grow less than this %",
  },
} as const;
