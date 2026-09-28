# Phase B4 Report: Payments (Razorpay & COD)

**Status:** Completed  
**Branch:** `backend`  
**Test Suite:** 66/66 passing (`npm test`)  
**Razorpay Simulation:** 5/5 passing (`npm run test:razorpay`)  
**Smoke Test:** 12/12 passing (`npm run smoke`)  
**TypeScript Check:** Clean (`npx tsc --noEmit` passed with 0 errors)

---

## 1. What Was Built in Phase B4

### 1.1 Payments Schema (`supabase/migrations/005_payments.sql`)
- **4 Tables & Security Controls**:
  - `payments`: Comprehensive audit trail of all transactions with `provider_payment_id` (`pay_...`), masked `card_last4`, network type, UPI VPA hints, and exact `amount_paise`. PCI-DSS compliant: **Never stores full card numbers, CVV, or UPI PINs**.
  - `webhook_events`: Idempotent webhook event ledger indexed by `event_id` (`x-razorpay-event-id`), ensuring duplicated webhook deliveries are processed exactly once.
  - `refunds`: Full and partial refund ledger recording provider refund IDs, amount in paise, reasons, and actors.
  - `payment_alerts`: Anomaly detection table logging critical issues (amount mismatches, duplicate payments for the same order, late payments on expired orders).

### 1.2 Idempotent Payment RPC Functions (`mark_order_paid`)
- **Single Source of Truth**: Called by both `/api/payments/verify` and `/api/webhooks/razorpay`.
- **Amount Mismatch Defense**: Asserts that `p_amount_paise === order.total_paise`. If an attacker attempts to pay ₹1 for a ₹1,499 craft, the system immediately logs a critical alert, rejects order confirmation, and halts the flow.
- **Duplicate Payment Auto-Refund**: If a customer pays twice for the same order (e.g. browser retry while webhook was in-flight), the second payment is registered in `payment_alerts` with severity `critical` for automatic refund.
- **Late Payment Handling**: If payment arrives after the order was auto-cancelled by the expiry cron, it is safely recorded and flagged for immediate customer refund.
- **State Machine Advancement**: Transitions order to `status = 'confirmed'` and `payment_status = 'paid'`.
- **Outbox Integration**: Queues payment confirmation email in `email_outbox`.

### 1.3 Serverless Payment Endpoints (`api/`)
- `POST /api/payments/create`: Fetches authoritative `total_paise` from the database and returns Razorpay checkout payload.
- `POST /api/payments/verify`: Validates client-side Razorpay Checkout payment HMAC-SHA256 signature (`order_id|payment_id`) using timing-safe comparison.
- `POST /api/webhooks/razorpay`: Verifies raw request body HMAC signature using `RAZORPAY_WEBHOOK_SECRET`, checks deduplication, and handles `payment.captured`, `order.paid`, `payment.failed`, and `refund.processed` events.
- `POST /api/admin/refunds`: Staff/Admin endpoint to initiate full or partial refunds. Validates that refund amount does not exceed order total and updates status to `partially_refunded` or `refunded`.
- `POST /api/cron/expire-orders`: Background cron endpoint protected by `CRON_SECRET` bearer token. Automatically cancels unpaid online orders after 30 minutes, restores reserved stock to `inventory_ledger`, and releases redeemed coupons.

### 1.4 Cash on Delivery (COD) Controls
- `mark_cod_collected`: Admin/Courier action verifying physical cash collection at the doorstep and advancing payment status from `cod_due` to `cod_collected`.

---

## 2. Razorpay Test Mode Verification
Run the automated end-to-end Razorpay simulation:
```bash
npm run test:razorpay
```
Checks verified:
1. Generation and verification of authentic HMAC-SHA256 payment signature.
2. Rejection of tampered signatures.
3. Verification of raw body webhook HMAC signatures.
4. Rejection of tampered webhook payloads (e.g. modified amount).
5. Amount mismatch defense simulation.

---

## 3. Verification Commands
```bash
# 1. Run all unit, security, catalog, and payments tests (66 passing)
npm test

# 2. Run Razorpay simulation suite (5 passing)
npm run test:razorpay

# 3. Run developer smoke test (12 passing)
npm run smoke

# 4. Verify TypeScript type safety
npx tsc --noEmit
```
