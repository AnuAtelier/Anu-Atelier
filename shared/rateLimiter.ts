/**
 * Anu Atelier - Rate Limiting Utility
 * Protects public endpoints, checkout actions, and authentication routes against abuse.
 */

import { RateLimitError } from './errors';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of memoryStore.entries()) {
    if (record.resetAt <= now) {
      memoryStore.delete(key);
    }
  }
}, 300000).unref();

export interface RateLimitOptions {
  windowMs: number; // e.g. 60000 for 1 minute
  maxRequests: number; // e.g. 10 requests per window
  keyPrefix?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const fullKey = `${options.keyPrefix || 'rl'}:${key}`;
  const now = Date.now();
  const existing = memoryStore.get(fullKey);

  if (!existing || existing.resetAt <= now) {
    const record: RateLimitRecord = {
      count: 1,
      resetAt: now + options.windowMs,
    };
    memoryStore.set(fullKey, record);
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetAt: record.resetAt,
    };
  }

  if (existing.count >= options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: options.maxRequests - existing.count,
    resetAt: existing.resetAt,
  };
}

export function assertRateLimit(key: string, options: RateLimitOptions): void {
  const result = checkRateLimit(key, options);
  if (!result.allowed) {
    const retryAfterSec = Math.ceil((result.resetAt - Date.now()) / 1000);
    throw new RateLimitError(`Rate limit exceeded. Try again in ${retryAfterSec} seconds.`, {
      retryAfterSec,
      resetAt: new Date(result.resetAt).toISOString(),
    });
  }
}

/**
 * Standard Rate Limit Presets
 */
export const RATE_LIMIT_PRESETS = {
  COUPON_CHECK: { windowMs: 60 * 1000, maxRequests: 10, keyPrefix: 'rl_coupon' },
  PINCODE_CHECK: { windowMs: 60 * 1000, maxRequests: 30, keyPrefix: 'rl_pin' },
  SEARCH_SUGGESTIONS: { windowMs: 60 * 1000, maxRequests: 60, keyPrefix: 'rl_search' },
  CONTACT_ENQUIRY: { windowMs: 60 * 60 * 1000, maxRequests: 5, keyPrefix: 'rl_contact' },
  REVIEW_SUBMIT: { windowMs: 60 * 60 * 1000, maxRequests: 5, keyPrefix: 'rl_review' },
  PAYMENT_CREATE: { windowMs: 10 * 60 * 1000, maxRequests: 10, keyPrefix: 'rl_pay_create' },
  AUTH_ATTEMPT: { windowMs: 15 * 60 * 1000, maxRequests: 5, keyPrefix: 'rl_auth' },
};

