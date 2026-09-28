/**
 * Anu Atelier - Phase B1 Foundation & Security Test Suite
 * Tests: RLS baseline, role-escalation prevention, money paise invariant,
 * environment guards, error formats, and rate limiting.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { assertDevEnvironment, EnvironmentGuardError } from '../shared/envGuard';
import {
  assertIntegerPaise,
  toPaise,
  toRupees,
  formatRupees,
  Paise,
} from '../shared/types';
import {
  profileUpdateSchema,
  siteSettingsSchema,
  indianPincodeSchema,
  indianPhoneSchema,
  userRoleSchema,
} from '../shared/schemas';
import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  formatErrorResponse,
} from '../shared/errors';
import { checkRateLimit, assertRateLimit } from '../shared/rateLimiter';
import healthHandler from '../api/health';

describe('Phase B1: Environment Isolation & Guards', () => {
  const originalEnv = process.env.APP_ENV;
  const originalSupabaseUrl = process.env.SUPABASE_URL;

  afterEach(() => {
    process.env.APP_ENV = originalEnv;
    process.env.SUPABASE_URL = originalSupabaseUrl;
  });

  it('permits execution in development environment', () => {
    process.env.APP_ENV = 'development';
    expect(() => assertDevEnvironment()).not.toThrow();
  });

  it('immediately aborts with EnvironmentGuardError if APP_ENV is production', () => {
    process.env.APP_ENV = 'production';
    expect(() => assertDevEnvironment()).toThrow(EnvironmentGuardError);
    expect(() => assertDevEnvironment()).toThrow(/CRITICAL: Attempted to run a dev\/test script/);
  });

  it('aborts if SUPABASE_URL points to a production domain', () => {
    process.env.APP_ENV = 'development';
    process.env.SUPABASE_URL = 'https://anuatelier.com/api/v1';
    expect(() => assertDevEnvironment()).toThrow(EnvironmentGuardError);
  });
});

describe('Phase B1: Money Invariant (Integer Paise Only)', () => {
  it('correctly converts Rupees to integer Paise', () => {
    expect(toPaise(0)).toBe(0);
    expect(toPaise(10)).toBe(1000);
    expect(toPaise(999)).toBe(99900);
    expect(toPaise(1499.5)).toBe(149950);
  });

  it('correctly converts Paise back to Rupees', () => {
    expect(toRupees(1000)).toBe(10);
    expect(toRupees(99900)).toBe(999);
    expect(toRupees(149950)).toBe(1499.5);
  });

  it('formats Paise as Indian Rupee currency strings', () => {
    expect(formatRupees(99900)).toBe('₹999');
    expect(formatRupees(149950)).toBe('₹1,499.50');
    expect(formatRupees(500000)).toBe('₹5,000');
  });

  it('rejects floating-point paise numbers', () => {
    expect(() => assertIntegerPaise(100.25 as Paise)).toThrow(TypeError);
    expect(() => assertIntegerPaise(0.1 as Paise)).toThrow(TypeError);
  });

  it('rejects negative paise numbers', () => {
    expect(() => assertIntegerPaise(-1 as Paise)).toThrow(TypeError);
    expect(() => assertIntegerPaise(-5000 as Paise)).toThrow(TypeError);
  });
});

describe('Phase B1: Role Escalation Defense & Zod Schemas', () => {
  it('allows valid profile updates without role tampering', () => {
    const validPayload = {
      full_name: 'Anushka Sharma',
      phone: '9876543210',
    };
    const parsed = profileUpdateSchema.safeParse(validPayload);
    expect(parsed.success).toBe(true);
  });

  it('strictly blocks client attempts to supply or alter role field in profile update', () => {
    const maliciousPayload = {
      full_name: 'Attacker',
      role: 'admin',
    };
    const parsed = profileUpdateSchema.safeParse(maliciousPayload);
    // Strict schema rejects unrecognized / unauthorized keys
    expect(parsed.success).toBe(false);
  });

  it('validates only authorized user roles', () => {
    expect(userRoleSchema.safeParse('customer').success).toBe(true);
    expect(userRoleSchema.safeParse('staff').success).toBe(true);
    expect(userRoleSchema.safeParse('admin').success).toBe(true);
    expect(userRoleSchema.safeParse('superuser').success).toBe(false);
    expect(userRoleSchema.safeParse('root').success).toBe(false);
  });

  it('validates Indian PIN codes and mobile numbers', () => {
    expect(indianPincodeSchema.safeParse('110001').success).toBe(true);
    expect(indianPincodeSchema.safeParse('201301').success).toBe(true);
    expect(indianPincodeSchema.safeParse('000000').success).toBe(false);
    expect(indianPincodeSchema.safeParse('ABC123').success).toBe(false);

    expect(indianPhoneSchema.safeParse('9876543210').success).toBe(true);
    expect(indianPhoneSchema.safeParse('+91 98765 43210').success).toBe(true);
    expect(indianPhoneSchema.safeParse('5555555555').success).toBe(false);
  });

  it('validates dev site settings with correct integer paise types', () => {
    const settings = {
      shipping: { standard_delivery_fee_paise: 6000, free_delivery_threshold_paise: 99900 },
      cod: { enabled: true, max_amount_paise: 500000, fee_paise: 0 },
      tax: { gst_registered: false, default_gst_rate_percent: 5, origin_state_code: '09' },
      returns: { window_days: 10, auto_approve: false },
      general: {
        store_name: 'Anu Atelier',
        support_email: 'support@anuatelier.com',
        support_phone: '+91 98765 43210',
        currency: 'INR',
      },
    };
    expect(siteSettingsSchema.safeParse(settings).success).toBe(true);
  });
});

describe('Phase B1: Standard Error Formatting', () => {
  it('formats custom AppError correctly with code and HTTP status', () => {
    const err = new BadRequestError('Invalid input parameter', { field: 'pincode' });
    const formatted = formatErrorResponse(err);

    expect(formatted.status).toBe(400);
    expect(formatted.body).toEqual({
      error: {
        code: 'BAD_REQUEST',
        message: 'Invalid input parameter',
        details: { field: 'pincode' },
      },
    });
  });

  it('correctly maps various error types to their standard status codes', () => {
    expect(new UnauthorizedError().statusCode).toBe(401);
    expect(new ForbiddenError().statusCode).toBe(403);
    expect(new NotFoundError().statusCode).toBe(404);
    expect(new ValidationError('Invalid').statusCode).toBe(422);
    expect(new RateLimitError().statusCode).toBe(429);
  });

  it('safely wraps untyped exceptions into 500 INTERNAL_SERVER_ERROR', () => {
    const genericErr = new Error('Database connection timed out');
    const formatted = formatErrorResponse(genericErr);

    expect(formatted.status).toBe(500);
    expect(formatted.body.error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(formatted.body.error.message).toBe('Database connection timed out');
  });
});

describe('Phase B1: Rate Limiting Helper', () => {
  it('allows requests within the limit and blocks excess requests', () => {
    const testKey = `test_user_${Date.now()}`;
    const opts = { windowMs: 10000, maxRequests: 2, keyPrefix: 'test' };

    const first = checkRateLimit(testKey, opts);
    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(1);

    const second = checkRateLimit(testKey, opts);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(0);

    const third = checkRateLimit(testKey, opts);
    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);

    expect(() => assertRateLimit(testKey, opts)).toThrow(RateLimitError);
  });
});

describe('Phase B1: Database Migration Security Audit', () => {
  const migrationPath = path.resolve(process.cwd(), 'supabase/migrations/001_foundation.sql');

  it('verifies 001_foundation.sql exists', () => {
    expect(fs.existsSync(migrationPath)).toBe(true);
  });

  it('verifies search_path = "" on all SECURITY DEFINER functions', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Find all SECURITY DEFINER functions in SQL
    const secDefinerMatches = sql.match(/CREATE OR REPLACE FUNCTION[^\n]+(?:\n[^\n]+)*?SECURITY DEFINER[^\n]*;/gi) || [];
    expect(secDefinerMatches.length).toBeGreaterThan(0);

    for (const funcDef of secDefinerMatches) {
      expect(funcDef).toContain("SET search_path = ''");
    }
  });

  it('verifies RLS enabled on all foundation tables', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    expect(sql).toContain('ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.rate_limit_entries ENABLE ROW LEVEL SECURITY;');
  });

  it('verifies role protection trigger on profiles table', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.protect_profile_role()');
    expect(sql).toContain('CREATE TRIGGER trg_protect_profile_role');
  });

  it('verifies storage buckets configuration with strict limits', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    expect(sql).toContain("'product-media'");
    expect(sql).toContain("'review-media'");
    expect(sql).toContain("'return-media'");
    expect(sql).toContain("'invoices'");
    expect(sql).toContain("'site-assets'");
  });
});

describe('Phase B1: Serverless Health Endpoint', () => {
  it('returns 405 Method Not Allowed for non-GET requests', async () => {
    let statusCode = 0;
    let jsonResponse: any = null;
    const headers: Record<string, string> = {};

    const req: any = {
      method: 'POST',
      headers: {},
    };

    const res: any = {
      setHeader: (name: string, val: string) => {
        headers[name] = val;
        return res;
      },
      status: (code: number) => {
        statusCode = code;
        return res;
      },
      json: (data: any) => {
        jsonResponse = data;
      },
    };

    await healthHandler(req, res);
    expect(statusCode).toBe(405);
    expect(jsonResponse.error.code).toBe('METHOD_NOT_ALLOWED');
  });

  it('returns 200 OK with health metadata for GET requests', async () => {
    let statusCode = 0;
    let jsonResponse: any = null;
    const headers: Record<string, string> = {};

    const req: any = {
      method: 'GET',
      headers: { 'x-request-id': 'req_test_12345' },
    };

    const res: any = {
      setHeader: (name: string, val: string) => {
        headers[name] = val;
        return res;
      },
      status: (code: number) => {
        statusCode = code;
        return res;
      },
      json: (data: any) => {
        jsonResponse = data;
      },
    };

    await healthHandler(req, res);
    expect(statusCode).toBe(200);
    expect(jsonResponse.status).toBe('healthy');
    expect(jsonResponse.requestId).toBe('req_test_12345');
    expect(jsonResponse.version).toBe('1.0.0');
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['X-Request-Id']).toBe('req_test_12345');
  });
});
