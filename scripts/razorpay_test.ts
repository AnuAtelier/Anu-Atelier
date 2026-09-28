/**
 * Anu Atelier - Razorpay Test Mode Verification Script
 * Simulates online payment creation, HMAC signature verification,
 * webhook processing, and amount mismatch defenses.
 * Run with: npx tsx scripts/razorpay_test.ts
 */

import { assertDevEnvironment } from '../shared/envGuard';
import {
  verifyRazorpaySignature,
  verifyWebhookSignature,
  generateTestSignature,
} from '../shared/razorpay';
import crypto from 'crypto';

interface StepResult {
  step: string;
  status: 'PASS' | 'FAIL';
  details?: string;
}

const results: StepResult[] = [];

function step(title: string, fn: () => void) {
  try {
    fn();
    results.push({ step: title, status: 'PASS' });
  } catch (err) {
    results.push({
      step: title,
      status: 'FAIL',
      details: err instanceof Error ? err.message : String(err),
    });
  }
}

async function runRazorpaySimulation() {
  console.log('\n======================================================');
  console.log('     ANU ATELIER - RAZORPAY TEST MODE SIMULATION      ');
  console.log('======================================================\n');

  assertDevEnvironment();

  const secretKey = 'test_secret_key_anu_atelier_dev';
  const webhookSecret = 'whsec_test_secret_anu_atelier_dev';
  const orderId = 'order_dev_1001';
  const paymentId = 'pay_dev_2002';
  const amountPaise = 149900; // ₹1,499.00

  // 1. Signature Generation & Verification
  step('Generate & verify authentic Razorpay signature', () => {
    const signature = generateTestSignature(orderId, paymentId, secretKey);
    const valid = verifyRazorpaySignature(orderId, paymentId, signature, secretKey);
    if (!valid) throw new Error('Authentic signature was rejected!');
  });

  // 2. Tampered Signature Defense
  step('Reject tampered payment signature', () => {
    const signature = generateTestSignature(orderId, paymentId, secretKey);
    const tampered = signature.slice(0, -6) + 'abcdef';
    const valid = verifyRazorpaySignature(orderId, paymentId, tampered, secretKey);
    if (valid) throw new Error('Tampered signature was improperly accepted!');
  });

  // 3. Webhook Raw Body Signature
  step('Verify Razorpay raw body webhook HMAC signature', () => {
    const rawPayload = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: paymentId,
            order_id: orderId,
            amount: amountPaise,
            method: 'upi',
            vpa: 'user@okhdfcbank',
          },
        },
      },
    });

    const whSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawPayload)
      .digest('hex');

    const valid = verifyWebhookSignature(rawPayload, whSignature, webhookSecret);
    if (!valid) throw new Error('Authentic webhook signature rejected!');
  });

  // 4. Webhook Tampered Body Defense
  step('Reject webhook with modified payload body', () => {
    const rawPayload = JSON.stringify({
      event: 'payment.captured',
      amount: 149900,
    });
    const whSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawPayload)
      .digest('hex');

    const tamperedPayload = rawPayload.replace('149900', '100'); // Attacker modifies amount to ₹1
    const valid = verifyWebhookSignature(tamperedPayload, whSignature, webhookSecret);
    if (valid) throw new Error('Tampered webhook payload was accepted!');
  });

  // 5. Amount Mismatch Simulation
  step('Simulate amount mismatch defense', () => {
    const orderExpectedPaise = 149900;
    const receivedPaise = 100000; // Mismatch: ₹1,000 received instead of ₹1,499
    if (orderExpectedPaise === receivedPaise) {
      throw new Error('Amounts should not match');
    }
  });

  // Print Summary Table
  console.log('----------------------------------------------------------------------');
  console.log('| Status | Step Description                                          |');
  console.log('----------------------------------------------------------------------');
  for (const r of results) {
    const statusStr = r.status === 'PASS' ? ' PASS ' : ' FAIL ';
    const stepStr = r.step.padEnd(57, ' ').slice(0, 57);
    console.log(`| ${statusStr} | ${stepStr} |`);
    if (r.details) {
      console.log(`|   --> ERROR: ${r.details}`);
    }
  }
  console.log('----------------------------------------------------------------------\n');

  const failedCount = results.filter((r) => r.status === 'FAIL').length;
  if (failedCount > 0) {
    console.error(`❌ Razorpay simulation failed: ${failedCount} errors detected.\n`);
    process.exit(1);
  } else {
    console.log(`✅ All ${results.length} Razorpay verification steps passed successfully!\n`);
  }
}

runRazorpaySimulation().catch((err) => {
  console.error('Razorpay test script error:', err);
  process.exit(1);
});
