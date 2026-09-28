/**
 * Anu Atelier - Smoke Test Runner
 * Scenario 19 & 20: Walks backend foundation and invariants on DEV.
 * Run with: npm run smoke
 */

import { assertDevEnvironment } from '../shared/envGuard';
import { assertIntegerPaise, toPaise, toRupees, formatRupees } from '../shared/types';
import { siteSettingsSchema, indianPincodeSchema, indianPhoneSchema } from '../shared/schemas';
import { formatErrorResponse, BadRequestError } from '../shared/errors';
import fs from 'fs';
import path from 'path';

interface CheckResult {
  suite: string;
  test: string;
  status: 'PASS' | 'FAIL';
  details?: string;
}

const results: CheckResult[] = [];

function record(suite: string, test: string, fn: () => void) {
  try {
    fn();
    results.push({ suite, test, status: 'PASS' });
  } catch (err) {
    results.push({
      suite,
      test,
      status: 'FAIL',
      details: err instanceof Error ? err.message : String(err),
    });
  }
}

async function runSmokeTests() {
  console.log('\n======================================================');
  console.log('       ANU ATELIER - BACKEND DEV SMOKE TEST           ');
  console.log('======================================================\n');

  // 1. Guard & Isolation Checks
  record('Environment Guard', 'Refuses to execute in production mode', () => {
    // Current environment must be dev
    assertDevEnvironment();
    // Test production refusal
    const origEnv = process.env.APP_ENV;
    try {
      process.env.APP_ENV = 'production';
      let threw = false;
      try {
        assertDevEnvironment();
      } catch {
        threw = true;
      }
      if (!threw) throw new Error('Failed to block production execution!');
    } finally {
      process.env.APP_ENV = origEnv;
    }
  });

  // 2. Money Math & Paise Invariance Checks
  record('Money Invariant', 'Converts Rupees to Paise strictly as integers', () => {
    const paise = toPaise(1499.5);
    if (paise !== 149950) throw new Error(`Expected 149950 paise, got ${paise}`);
    if (toRupees(149950) !== 1499.5) throw new Error('Rupees conversion mismatch');
    if (formatRupees(149900) !== '₹1,499') throw new Error('Format rupees failed');
  });

  record('Money Invariant', 'Rejects negative and floating paise amounts', () => {
    let rejectedFloat = false;
    let rejectedNegative = false;
    try {
      assertIntegerPaise(100.5);
    } catch {
      rejectedFloat = true;
    }
    try {
      assertIntegerPaise(-50);
    } catch {
      rejectedNegative = true;
    }
    if (!rejectedFloat || !rejectedNegative) throw new Error('Failed to reject invalid paise');
  });

  // 3. Schema & Validation Checks
  record('Validation Schemas', 'Validates Indian 6-digit PIN codes correctly', () => {
    if (!indianPincodeSchema.safeParse('201301').success) throw new Error('Valid PIN 201301 rejected');
    if (indianPincodeSchema.safeParse('012345').success) throw new Error('Invalid PIN 012345 accepted');
    if (indianPincodeSchema.safeParse('11000').success) throw new Error('Short PIN 11000 accepted');
  });

  record('Validation Schemas', 'Validates Indian mobile phone numbers correctly', () => {
    if (!indianPhoneSchema.safeParse('9876543210').success) throw new Error('Valid phone rejected');
    if (!indianPhoneSchema.safeParse('+91 98765 43210').success) throw new Error('Valid formatted phone rejected');
    if (indianPhoneSchema.safeParse('1234567890').success) throw new Error('Invalid phone accepted');
  });

  record('Validation Schemas', 'Validates Dev Site Settings structure', () => {
    const devSettings = {
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
    const parsed = siteSettingsSchema.safeParse(devSettings);
    if (!parsed.success) throw new Error(`Settings validation failed: ${JSON.stringify(parsed.error)}`);
  });

  // 4. Standard Error Formatting Checks
  record('Error Handling', 'Formats API errors as { error: { code, message, details } }', () => {
    const err = new BadRequestError('Coupon code expired', { code: 'SUMMER20' });
    const formatted = formatErrorResponse(err);
    if (formatted.status !== 400) throw new Error(`Expected status 400, got ${formatted.status}`);
    if (formatted.body.error.code !== 'BAD_REQUEST') throw new Error('Mismatch in error code');
    if (formatted.body.error.message !== 'Coupon code expired') throw new Error('Mismatch in error message');
  });

  // 5. Database Migration Checks
  record('Database Migrations', 'Verifies 001_foundation.sql presence and security defaults', () => {
    const migrationPath = path.resolve(process.cwd(), 'supabase/migrations/001_foundation.sql');
    if (!fs.existsSync(migrationPath)) throw new Error('Missing 001_foundation.sql');
    const content = fs.readFileSync(migrationPath, 'utf8');

    // Assert search_path = '' on SECURITY DEFINER functions
    if (!content.includes("SECURITY DEFINER SET search_path = ''")) {
      throw new Error('Foundation migration missing search_path security parameter on security definer functions');
    }

    // Assert RLS enabled on all foundation tables
    if (!content.includes('ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;')) {
      throw new Error('RLS not enabled on profiles table');
    }
    if (!content.includes('ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;')) {
      throw new Error('RLS not enabled on audit_log table');
    }
  });

  // Print Summary Table
  console.log('----------------------------------------------------------------------');
  console.log('| Status | Suite                 | Test Description                  |');
  console.log('----------------------------------------------------------------------');
  for (const r of results) {
    const statusStr = r.status === 'PASS' ? ' PASS ' : ' FAIL ';
    const suiteStr = r.suite.padEnd(21, ' ');
    const testStr = r.test.padEnd(33, ' ').slice(0, 33);
    console.log(`| ${statusStr} | ${suiteStr} | ${testStr} |`);
    if (r.details) {
      console.log(`|   --> ERROR: ${r.details}`);
    }
  }
  console.log('----------------------------------------------------------------------\n');

  const failedCount = results.filter((r) => r.status === 'FAIL').length;
  if (failedCount > 0) {
    console.error(`❌ Smoke tests failed: ${failedCount} errors detected.\n`);
    process.exit(1);
  } else {
    console.log(`✅ All ${results.length} foundation smoke tests passed successfully!\n`);
  }
}

runSmokeTests().catch((err) => {
  console.error('Smoke test runner failed:', err);
  process.exit(1);
});
