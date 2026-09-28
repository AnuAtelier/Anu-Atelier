# Anu Atelier Backend – Progress Tracker

**Active Git Branch:** `backend`  
**Current Phase:** B4 (Payments - Razorpay & COD) – Completed, Awaiting Approval  
**Next Phase:** B5 (Fulfilment & Post-Purchase)

---

## Phase Checklist

- [x] **B0 – Audit & Architecture**
  - [x] Codebase & Data Audit (localStorage keys, Add Craft form, mock backend).
  - [x] Catalog & Third-Party Media Audit (flagged Google cached thumbnails).
  - [x] Entity Relationship Diagram (ERD) with 36 tables in Mermaid.
  - [x] State machines defined (Orders, Payments, Returns/Replacements).
  - [x] Public RPC & Serverless API inventory designed.
  - [x] Environment variables matrix updated in `.env.example`.
  - [x] Step-by-step account setup guide created (Supabase, Razorpay, Resend, Vercel).
  - [x] Risks & assumptions documented.
  - [x] 7 Clarification questions with safe dev placeholder defaults prepared.
  - [x] Documented in `docs/B0_AUDIT_AND_ARCHITECTURE.md`.

- [x] **B1 – Foundation & Security Baseline**
  - [x] Directory layout (`supabase/`, `api/`, `shared/`, `tests/`, `scripts/`, `docs/`).
  - [x] Migration workflow, PostgreSQL extensions, custom ENUMs, helper functions.
  - [x] `profiles` table + signup trigger + role enforcement + `is_admin()`.
  - [x] Row-Level Security (RLS) default-deny baseline on all tables.
  - [x] Supabase Storage buckets & strict access policies.
  - [x] Audit-log infrastructure (`audit_log` table & trigger).
  - [x] `site_settings` table & schema validation.
  - [x] Vitest setup & RLS test suite (24/24 tests passing).
  - [x] Serverless health check `/api/health`.
  - [x] Developer smoke test suite (`scripts/smoke.ts`, 8/8 passing).
  - [x] Documented in `docs/B1_FOUNDATION_REPORT.md`.

- [x] **B2 – Catalog & Discovery**
  - [x] Categories, artisans, products, variants, media, highlights, specs, offers, pincodes.
  - [x] Database publish rules & slug uniqueness redirects.
  - [x] Full-text + trigram search RPCs (`search_products`, `list_products`, `get_product_detail`).
  - [x] Trigger-maintained `product_stats` (ratings, review count, bought count).
  - [x] Idempotent seed data migration for dev environment (`003_seed_dev_catalog.sql`).
  - [x] Catalog test suite (`tests/b2_catalog.test.ts`, 15/15 tests passing; 39 total).
  - [x] Documented in `docs/B2_CATALOG_REPORT.md`.

- [x] **B3 – Cart to Order (COD First)**
  - [x] Address validation (6-digit PIN, Indian mobile, max 10 trigger, default trigger).
  - [x] Server-side cart management & guest-to-user cart merging (`merge_guest_cart`).
  - [x] Coupon engine & `calculate_totals` pricing function (integer paise, largest-remainder distribution).
  - [x] Concurrency-safe atomic `place_order` with inventory ledger & row-level locking.
  - [x] Order cancellation & restocking triggers (`cancel_order`).
  - [x] Transactional email queue (`email_outbox`).
  - [x] Cart to order test suite (`tests/b3_cart_order.test.ts`, 13/13 tests passing; 52 total).
  - [x] Documented in `docs/B3_CART_TO_ORDER_REPORT.md`.

- [x] **B4 – Payments (Razorpay & COD)**
  - [x] Razorpay order creation (`/api/payments/create`) with server-calculated amounts.
  - [x] Signature verification (`/api/payments/verify`) & raw body webhook handler (`/api/webhooks/razorpay`).
  - [x] Payment state machine & duplicate/mismatch handling (`mark_order_paid`).
  - [x] Unpaid order stock hold & expiry background job (`expire_unpaid_orders`, `/api/cron/expire-orders`).
  - [x] Razorpay refund integration & refund ledger (`/api/admin/refunds`).
  - [x] Razorpay Test Mode verification script (`scripts/razorpay_test.ts`, `npm run test:razorpay`).
  - [x] Payments test suite (`tests/b4_payments.test.ts`, 14/14 tests passing; 66 total).
  - [x] Documented in `docs/B4_PAYMENTS_REPORT.md`.

- [ ] **B5 – Fulfilment & Post-Purchase**
  - [ ] Shipment tracking & status timeline updates.
  - [ ] Return and replacement requests workflow.
  - [ ] GST tax invoice PDF generation & storage in private bucket.
  - [ ] Email sender background worker via Resend API.
  - [ ] Customer reviews system with verified buyer badge & helpful votes.

- [ ] **B6 – Admin Operations & Growth**
  - [ ] Admin management RPCs & order dispatch tools.
  - [ ] Sales reports, revenue analytics, and low stock digest views.
  - [ ] CSV product import/export tools.
  - [ ] Abandoned cart reminder notifications.
  - [ ] Google Merchant & Meta catalog feeds.

- [ ] **B7 – Hardening & Go-Live**
  - [ ] Security audit: rate limits, CAPTCHA, HTTP security headers.
  - [ ] Supabase Security & Performance advisor verification.
  - [ ] Database backup & restore drill.
  - [ ] Production project cutover checklist (`anu-atelier-prod`).
