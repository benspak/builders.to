/**
 * In-memory rate limiter with abuse logging
 * Works well for single-server deployments (Render.com)
 */

type RateLimitEntry = {
  count: number;
  resetTime: number;
  violations: number; // Track repeated violations
};

type RateLimitConfig = {
  limit: number; // Max requests
  windowMs: number; // Time window in ms
  name: string; // Endpoint name for logging
};

// Store: key -> { count, resetTime, violations }
const rateLimitStore = new Map<string, RateLimitEntry>();

// Track abusive IPs separately for logging
const abuseLog = new Map<string, { count: number; lastSeen: Date; endpoints: Set<string> }>();

// Cleanup old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;

  Array.from(rateLimitStore.entries()).forEach(([key, entry]) => {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  });

  // Keep abuse log for 24 hours
  const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
  Array.from(abuseLog.entries()).forEach(([ip, data]) => {
    if (data.lastSeen < dayAgo) {
      abuseLog.delete(ip);
    }
  });
}

function logAbuse(ip: string, endpoint: string, violations: number) {
  const existing = abuseLog.get(ip);

  if (existing) {
    existing.count++;
    existing.lastSeen = new Date();
    existing.endpoints.add(endpoint);
  } else {
    abuseLog.set(ip, {
      count: 1,
      lastSeen: new Date(),
      endpoints: new Set([endpoint]),
    });
  }

  const data = abuseLog.get(ip)!;

  // Log levels based on severity
  if (violations >= 10 || data.count >= 20) {
    console.error(`[RATE LIMIT] SEVERE ABUSE - IP: ${ip} | Endpoint: ${endpoint} | Total violations: ${data.count} | Endpoints hit: ${Array.from(data.endpoints).join(", ")}`);
  } else if (violations >= 5 || data.count >= 10) {
    console.warn(`[RATE LIMIT] Suspicious activity - IP: ${ip} | Endpoint: ${endpoint} | Violations: ${violations} | Total: ${data.count}`);
  } else {
    console.log(`[RATE LIMIT] Blocked - IP: ${ip} | Endpoint: ${endpoint} | Violations: ${violations}`);
  }
}

export function getClientIp(request: Request): string {
  // Check common proxy headers
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback
  return "unknown";
}

export function rateLimit(
  request: Request,
  config: RateLimitConfig
): { success: boolean; remaining: number; reset: number } {
  cleanup();

  const ip = getClientIp(request);
  const now = Date.now();
  const key = `${ip}:${config.name}`;

  const existing = rateLimitStore.get(key);

  // If no entry or window expired, create new entry
  if (!existing || now > existing.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
      violations: existing?.violations || 0, // Carry over violations
    });

    return {
      success: true,
      remaining: config.limit - 1,
      reset: now + config.windowMs,
    };
  }

  // Increment count
  existing.count++;

  // Check if over limit
  if (existing.count > config.limit) {
    existing.violations++;
    logAbuse(ip, config.name, existing.violations);

    return {
      success: false,
      remaining: 0,
      reset: existing.resetTime,
    };
  }

  return {
    success: true,
    remaining: config.limit - existing.count,
    reset: existing.resetTime,
  };
}

// Preset configurations for different endpoints
export const RATE_LIMITS = {
  // Strict limits for expensive operations
  upload: { limit: 10, windowMs: 15 * 60 * 1000, name: "upload" }, // 10 per 15 min
  createProject: { limit: 5, windowMs: 60 * 60 * 1000, name: "createProject" }, // 5 per hour
  createCompany: { limit: 5, windowMs: 60 * 60 * 1000, name: "createCompany" }, // 5 per hour

  // Moderate limits
  comment: { limit: 30, windowMs: 60 * 60 * 1000, name: "comment" }, // 30 per hour
  upvote: { limit: 60, windowMs: 60 * 60 * 1000, name: "upvote" }, // 60 per hour
  createUpdate: { limit: 20, windowMs: 60 * 60 * 1000, name: "createUpdate" }, // 20 per hour

  // Looser limits for reads
  api: { limit: 100, windowMs: 60 * 1000, name: "api" }, // 100 per minute
} as const;

// Helper to create rate limit response
export function rateLimitResponse(reset: number) {
  const retryAfter = Math.ceil((reset - Date.now()) / 1000);
  return new Response(
    JSON.stringify({ error: "Too many requests. Please slow down." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
        "X-RateLimit-Reset": String(reset),
      },
    }
  );
}

// Get current abuse stats (for admin/monitoring)
export function getAbuseStats() {
  return Array.from(abuseLog.entries()).map(([ip, data]) => ({
    ip,
    violations: data.count,
    lastSeen: data.lastSeen,
    endpoints: Array.from(data.endpoints),
  }));
}
