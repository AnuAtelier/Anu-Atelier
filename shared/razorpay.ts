/**
 * Anu Atelier - Razorpay Payment Utilities
 * Secure HMAC-SHA256 signature verification and payload builders.
 */

import crypto from 'crypto';

/**
 * Verifies Razorpay Checkout payment signature (order_id + '|' + payment_id)
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret?: string
): boolean {
  const secretKey = secret || process.env.RAZORPAY_KEY_SECRET;
  if (!secretKey) {
    // In local dev test without configured secrets, allow test signatures
    if (process.env.APP_ENV === 'development' && signature.startsWith('sig_test_')) {
      return true;
    }
    throw new Error('Missing RAZORPAY_KEY_SECRET in server environment.');
  }

  const payload = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(payload)
    .digest('hex');

  // Timing-safe comparison to prevent timing side-channel attacks
  return (
    expectedSignature.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))
  );
}

/**
 * Verifies Razorpay Webhook signature over the RAW request body string
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret?: string
): boolean {
  const webhookSecret = secret || process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    if (process.env.APP_ENV === 'development' && signature.startsWith('whsec_test_')) {
      return true;
    }
    throw new Error('Missing RAZORPAY_WEBHOOK_SECRET in server environment.');
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  return (
    expectedSignature.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))
  );
}

/**
 * Generates an authentic HMAC-SHA256 signature fixture for test assertions
 */
export function generateTestSignature(
  orderId: string,
  paymentId: string,
  secret: string
): string {
  const payload = `${orderId}|${paymentId}`;
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}
