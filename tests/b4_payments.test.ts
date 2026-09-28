/**
 * Anu Atelier - Phase B4 Payments Test Suite
 * Tests: Razorpay HMAC-SHA256 verification, raw-body webhook signatures,
 * amount mismatch defense, duplicate/late payment detection, COD lifecycle,
 * and SQL security audit.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  verifyRazorpaySignature,
  verifyWebhookSignature,
  generateTestSignature,
} from '../shared/razorpay';
import crypto from 'crypto';

describe('Phase B4: Payments SQL & Schema Security Audit', () => {
  const migrationPath = path.resolve(process.cwd(), 'supabase/migrations/005_payments.sql');

  it('verifies 005_payments.sql exists', () => {
    expect(fs.existsSync(migrationPath)).toBe(true);
  });

  it('ensures every SECURITY DEFINER function in payments migration has search_path = ""', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    const secDefCount = (sql.match(/SECURITY DEFINER/g) || []).length;
    const searchPathCount = (sql.match(/SECURITY DEFINER SET search_path = ''/g) || []).length;

    expect(secDefCount).toBeGreaterThanOrEqual(4);
    expect(searchPathCount).toBe(secDefCount);
  });

  it('ensures RLS is enabled on all payment tables', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    const expectedTables = ['payments', 'webhook_events', 'refunds', 'payment_alerts'];

    for (const table of expectedTables) {
      expect(sql).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
    }
  });

  it('ensures all monetary amounts strictly use BIGINT in payments and refunds', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    expect(sql).toContain('amount_paise BIGINT NOT NULL CHECK (amount_paise > 0)');
  });

  it('enforces PCI-DSS security: stores only masked last 4 digits and never CVV or full card', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    expect(sql).toContain("card_last4 TEXT CHECK (card_last4 IS NULL OR card_last4 ~ '^[0-9]{4}$')");
    expect(sql).not.toContain('cvv');
    expect(sql).not.toContain('card_number');
    expect(sql).not.toContain('upi_pin');
  });
});

describe('Phase B4: Razorpay HMAC Signature Verification (Scenario 8)', () => {
  const testSecret = 'secret_test_key_1234567890';
  const orderId = 'order_test_123';
  const paymentId = 'pay_test_456';

  it('verifies an authentic HMAC-SHA256 payment signature', () => {
    const validSignature = generateTestSignature(orderId, paymentId, testSecret);
    const result = verifyRazorpaySignature(orderId, paymentId, validSignature, testSecret);
    expect(result).toBe(true);
  });

  it('rejects a tampered payment signature', () => {
    const validSignature = generateTestSignature(orderId, paymentId, testSecret);
    const tamperedSignature = validSignature.slice(0, -4) + 'abcd';
    const result = verifyRazorpaySignature(orderId, paymentId, tamperedSignature, testSecret);
    expect(result).toBe(false);
  });

  it('rejects signature if order ID or payment ID does not match the payload', () => {
    const validSignature = generateTestSignature(orderId, paymentId, testSecret);
    const result = verifyRazorpaySignature('order_diff_999', paymentId, validSignature, testSecret);
    expect(result).toBe(false);
  });

  it('verifies raw-body webhook signature correctly', () => {
    const webhookSecret = 'whsec_test_secret_9876543210';
    const rawPayload = JSON.stringify({
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_999', amount: 59900 } } },
    });

    const signature = crypto.createHmac('sha256', webhookSecret).update(rawPayload).digest('hex');
    const result = verifyWebhookSignature(rawPayload, signature, webhookSecret);
    expect(result).toBe(true);

    // Tampered payload fails
    const tamperedPayload = rawPayload.replace('59900', '100');
    expect(verifyWebhookSignature(tamperedPayload, signature, webhookSecret)).toBe(false);
  });
});

describe('Phase B4: Payment State Machine & Anomalies Invariants', () => {
  const migrationSql = fs.readFileSync(
    path.resolve(process.cwd(), 'supabase/migrations/005_payments.sql'),
    'utf8'
  );

  it('verifies amount mismatch check in mark_order_paid RPC', () => {
    expect(migrationSql).toContain('IF p_amount_paise <> v_order.total_paise THEN');
    expect(migrationSql).toContain("'amount_mismatch'");
    expect(migrationSql).toContain('Payment verification failed: Amount mismatch.');
  });

  it('verifies duplicate payment anomaly detection in mark_order_paid RPC', () => {
    expect(migrationSql).toContain("'duplicate_payment'");
    expect(migrationSql).toContain("'critical'");
    expect(migrationSql).toContain('Duplicate payment received for an already paid order. Immediate refund required.');
  });

  it('verifies late payment handling in mark_order_paid RPC', () => {
    expect(migrationSql).toContain("'late_payment_refunded'");
    expect(migrationSql).toContain('Payment arrived after order was cancelled/expired. Flagged for automatic refund.');
  });

  it('verifies COD collected lifecycle in mark_cod_collected RPC', () => {
    expect(migrationSql).toContain("payment_status = 'cod_collected'::public.payment_status");
    expect(migrationSql).toContain("provider, amount_paise, status, method_type, captured_at");
  });

  it('verifies unpaid order expiry job rests stock to inventory ledger', () => {
    expect(migrationSql).toContain('CREATE OR REPLACE FUNCTION public.expire_unpaid_orders()');
    expect(migrationSql).toContain("'Restock: Payment expired'");
    expect(migrationSql).toContain("payment_expires_at <= NOW()");
  });
});
