# Anu Atelier Backend – Progress Tracker

**Active Git Branch:** `backend`  
**Current Phase:** B7 (Hardening & Go-Live) – Completed! (All Phases B0-B7 Complete)  
**Next Step:** Awaiting User Approval for Final Go-Live Cutover & Merge to Main

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

- [x] **B5 – Fulfilment & Post-Purchase**
  - [x] Shipment tracking & status timeline updates (`shipments`, `get_order_tracking`).
  - [x] Return and replacement requests workflow (`returns`, `request_return`).
  - [x] GST tax invoice sequential numbering & intra/inter-state tax calculation (`invoices`, `/api/invoices/download`).
  - [x] Email sender background worker via Resend API (`/api/cron/send-emails`, `shared/emailTemplates.ts`).
  - [x] Customer reviews system with verified buyer badge & helpful votes (`reviews`, `submit_review`, `vote_review_helpful`).
  - [x] Fulfilment test suite (`tests/b5_fulfilment.test.ts`, 12/12 tests passing; 78 total).
  - [x] Documented in `docs/B5_FULFILMENT_REPORT.md`.

- [x] **B6 – Admin Operations & Growth**
  - [x] Admin management RPCs & order dispatch tools (`admin_list_orders`, `admin_get_order_detail`, `admin_update_order_status`, `admin_adjust_stock`).
  - [x] Customer management & review moderation RPCs (`admin_list_customers`, `admin_set_customer_status`, `admin_moderate_review`).
  - [x] Sales reports, revenue analytics, and low stock digest views (`get_sales_analytics`, `get_top_selling_products`, `view_low_stock_products`, `admin_get_daily_summary`).
  - [x] Customer Privacy & DPDPA compliance (`export_customer_data`, `delete_customer_account`).
  - [x] CSV product import/export tools with dry-run validation (`/api/admin/catalog-csv`).
  - [x] Abandoned cart reminder worker with opt-in & 2-reminder cap (`/api/cron/abandoned-carts`).
  - [x] Google Merchant Center XML & Meta catalog feeds (`/api/feeds/catalog`).
  - [x] SEO-compliant dynamic XML sitemap endpoint (`/api/sitemap`).
  - [x] Admin & Growth test suite (`tests/b6_admin.test.ts`, 14/14 tests passing; 92 total).
  - [x] Documented in `docs/B6_ADMIN_REPORT.md`.

- [x] **B7 – Hardening & Go-Live**
  - [x] Security audit: rate limits, CAPTCHA, HTTP security headers (`vercel.json`, `shared/rateLimiter.ts`, `shared/captcha.ts`).
  - [x] Supabase Security & Performance advisor verification (`docs/SECURITY.md`).
  - [x] Database backup & restore drill (`scripts/backup.sh`, `./scripts/backup.sh --verify`).
  - [x] Light load benchmark (`scripts/load_test.ts`, `npm run test:load`, 0 errors, sub-ms latencies).
  - [x] Operational runbook & SOPs (`docs/RUNBOOK.md`).
  - [x] Production cutover checklist & rollback plan (`docs/GO_LIVE.md`).
  - [x] Hardening test suite (`tests/b7_hardening.test.ts`, 10/10 tests passing; 102 total).
  - [x] Documented in `docs/B7_HARDENING_REPORT.md`.


