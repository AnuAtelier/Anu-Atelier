/**
 * Anu Atelier - Phase B7: Hardening & Go-Live Verification Suite
 * Tests:
 * 1. vercel.json HTTP security headers & CSP Report-Only configuration
 * 2. Rate limiter presets & assertRateLimit exception triggering
 * 3. CAPTCHA Turnstile verification logic
 * 4. Backup script permissions and retention logic
 * 5. Light load benchmark execution
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { checkRateLimit, assertRateLimit, RATE_LIMIT_PRESETS } from '../shared/rateLimiter';
import { RateLimitError } from '../shared/errors';
import { verifyTurnstileToken } from '../shared/captcha';
import { executeLoadTests } from '../scripts/load_test';

describe('Phase B7: HTTP Security Headers & CSP Audit', () => {
  const vercelConfigPath = path.resolve(process.cwd(), 'vercel.json');

  it('verifies vercel.json exists and contains headers', () => {
    expect(fs.existsSync(vercelConfigPath)).toBe(true);
    const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    expect(config.headers).toBeDefined();
    expect(Array.isArray(config.headers)).toBe(true);
  });

  it('ensures zero-trust security headers are configured', () => {
    const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    const allHeaders = config.headers[0]?.headers || [];
    const headerMap = new Map(allHeaders.map((h: any) => [h.key, h.value]));

    expect(headerMap.get('Strict-Transport-Security')).toContain('max-age=63072000');
    expect(headerMap.get('Strict-Transport-Security')).toContain('includeSubDomains');
    expect(headerMap.get('X-Content-Type-Options')).toBe('nosniff');
    expect(headerMap.get('X-Frame-Options')).toBe('SAMEORIGIN');
    expect(headerMap.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(headerMap.get('Permissions-Policy')).toContain('camera=()');
  });

  it('ensures Content-Security-Policy-Report-Only allows necessary e-commerce third parties', () => {
    const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    const allHeaders = config.headers[0]?.headers || [];
    const csp = allHeaders.find((h: any) => h.key === 'Content-Security-Policy-Report-Only')?.value || '';

    expect(csp).toContain('checkout.razorpay.com');
    expect(csp).toContain('api.razorpay.com');
    expect(csp).toContain('supabase.co');
    expect(csp).toContain('fonts.googleapis.com');
    expect(csp).toContain('fonts.gstatic.com');
  });
});

describe('Phase B7: Rate Limiting Engine', () => {
  it('defines standard rate limit presets with reasonable thresholds', () => {
    expect(RATE_LIMIT_PRESETS.COUPON_CHECK.maxRequests).toBe(10);
    expect(RATE_LIMIT_PRESETS.PINCODE_CHECK.maxRequests).toBe(30);
    expect(RATE_LIMIT_PRESETS.PAYMENT_CREATE.maxRequests).toBe(10);
    expect(RATE_LIMIT_PRESETS.AUTH_ATTEMPT.maxRequests).toBe(5);
  });

  it('allows requests within threshold and blocks excess requests', () => {
    const testKey = `test_client_${Date.now()}`;
    const opts = { windowMs: 10000, maxRequests: 3, keyPrefix: 'test' };

    // Request 1: Allowed
    expect(checkRateLimit(testKey, opts).allowed).toBe(true);
    // Request 2: Allowed
    expect(checkRateLimit(testKey, opts).allowed).toBe(true);
    // Request 3: Allowed
    expect(checkRateLimit(testKey, opts).allowed).toBe(true);
    // Request 4: Blocked
    const res = checkRateLimit(testKey, opts);
    expect(res.allowed).toBe(false);
    expect(res.remaining).toBe(0);

    // assertRateLimit throws RateLimitError
    expect(() => assertRateLimit(testKey, opts)).toThrowError(RateLimitError);
  });
});

describe('Phase B7: Bot & CAPTCHA Verification', () => {
  it('bypasses Turnstile in development mode for dummy tokens', async () => {
    const result = await verifyTurnstileToken('dummy-dev-token');
    expect(result.success).toBe(true);
  });

  it('rejects empty Turnstile tokens when secret is required', async () => {
    const prevEnv = process.env.APP_ENV;
    const prevSecret = process.env.TURNSTILE_SECRET_KEY;
    try {
      process.env.APP_ENV = 'production';
      process.env.TURNSTILE_SECRET_KEY = 'mock_secret_key';

      const result = await verifyTurnstileToken('');
      expect(result.success).toBe(false);
      expect(result.errorCodes).toContain('missing-input-response');
    } finally {
      process.env.APP_ENV = prevEnv;
      process.env.TURNSTILE_SECRET_KEY = prevSecret;
    }
  });
});

describe('Phase B7: Disaster Recovery Backup Script', () => {
  const backupScriptPath = path.resolve(process.cwd(), 'scripts/backup.sh');

  it('verifies scripts/backup.sh exists and is executable', () => {
    expect(fs.existsSync(backupScriptPath)).toBe(true);
    fs.accessSync(backupScriptPath, fs.constants.X_OK);
  });

  it('verifies backup script includes retention policy and excludes migration internals', () => {
    const content = fs.readFileSync(backupScriptPath, 'utf8');
    expect(content).toContain('pg_dump');
    expect(content).toContain('--exclude-schema=\'supabase_migrations\'');
    expect(content).toContain('-mtime +30 -delete');
  });
});

describe('Phase B7: Light Load & Performance Benchmark', () => {
  it('executes light load benchmark with zero errors', async () => {
    const benchmarkResults = await executeLoadTests();
    expect(benchmarkResults.length).toBeGreaterThanOrEqual(3);

    for (const b of benchmarkResults) {
      expect(b.errors).toBe(0);
      expect(b.p95Ms).toBeLessThan(100); // Sub-100ms 95th percentile
    }
  });
});
