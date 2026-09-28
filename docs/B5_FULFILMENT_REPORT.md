# Phase B5 Report: Fulfilment & Post-Purchase

**Status:** Completed  
**Branch:** `backend`  
**Test Suite:** 78/78 passing (`npm test`)  
**Razorpay Simulation:** 5/5 passing (`npm run test:razorpay`)  
**Smoke Test:** 13/13 passing (`npm run smoke`)  
**TypeScript Check:** Clean (`npx tsc --noEmit` passed with 0 errors)

---

## 1. What Was Built in Phase B5

### 1.1 Fulfilment, Returns & Review Schema (`supabase/migrations/006_fulfilment_and_post_purchase.sql`)
- **7 Tables**:
  - `shipments`: Courier dispatch tracking (`Blue Dart`, `Delhivery`, `India Post`, `DTDC`), tracking number (AWB), direct tracking URL, and checkpoint event history array.
  - `returns`: 10-day return & replacement request lifecycle (`requested` → `approved` → `pickup_scheduled` → `item_received` → `inspected` → `replacement_dispatched` / `refund_processed` → `closed`). Photos stored in private `return-media` bucket.
  - `return_items`: Individual order items requested for return/exchange with quantities.
  - `invoices`: Sequential tax invoices with financial year (`2026-27`), taxable value, CGST, SGST, IGST, seller legal snapshot, and private storage path.
  - `reviews`: Customer reviews with 1–5 star rating constraint, title/body lengths, verified buyer badges, photos, helpful votes, and privacy-safe reviewer display name snapshots.
  - `review_helpful_votes`: Upvotes per customer with duplicate vote prevention.
  - `review_reports`: User reporting system with automated auto-hide after 5 reports.

### 1.2 GST Tax Invoicing & State Breakup
- **Sequential Invoicing**: `INV-2627-XXXXXX` generated via PostgreSQL sequence `invoice_number_seq` (no gaps or duplicates even under concurrency).
- **Intra-state (Uttar Pradesh 09 to 09)**: Split evenly into CGST (2.5%) and SGST (2.5%). Odd paise discrepancies are resolved cleanly without creating or dropping a single paisa.
- **Inter-state (UP to other states)**: 100% of tax assigned to IGST (5%).
- **Automated Generation**: Invoices are generated automatically when order moves to `shipped`.

### 1.3 Review System & Privacy Invariants
- **Verified Buyer Badge**: Computed server-side by checking if the authenticated user has a `delivered` order containing that craft.
- **PII Protection**: Full user profile, email, and phone are never exposed in public review feeds. Snapshot display names are formatted as `Firstname L.` (e.g. `Anushka S.`).
- **Dynamic Stats Recalculation**: Trigger `trg_recalculate_ratings` automatically updates `product_stats` (average rating, review count, rating histogram 1–5) on review insert, update, or deletion.

### 1.4 Branded Transactional Emails & Outbox Worker
- **Artisanal Email Templates ([shared/emailTemplates.ts](file:///Users/athletesingh/Selling%20company/shared/emailTemplates.ts))**: Branded rose-pink HTML with plain-text fallback (`order_placed`, `order_confirmed`, `order_shipped`, `order_delivered`, `order_cancelled`, `return_requested`).
- **Background Cron Worker ([api/cron/send-emails.ts](file:///Users/athletesingh/Selling%20company/api/cron/send-emails.ts))**: Protected by `CRON_SECRET`. Reads pending emails from `email_outbox`, delivers via Resend API, and handles exponential retry backoff.
- **Invoice Download Endpoint ([api/invoices/download.ts](file:///Users/athletesingh/Selling%20company/api/invoices/download.ts))**: Streams invoice data with full GST breakup, restricted to the owning customer or store admin.

---

## 2. Verification Commands
```bash
# 1. Run all unit, catalog, order, payment, and fulfilment tests (78 passing)
npm test

# 2. Run Razorpay simulation suite (5 passing)
npm run test:razorpay

# 3. Run developer smoke test (13 passing)
npm run smoke

# 4. Verify TypeScript type safety
npx tsc --noEmit
```
