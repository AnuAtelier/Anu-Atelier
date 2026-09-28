# Anu Atelier Backend – Progress Tracker

**Active Git Branch:** `backend`  
**Current Phase:** B0 (Audit & Architecture) – Completed, Awaiting Approval  
**Next Phase:** B1 (Foundation & Security Baseline)

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

- [ ] **B1 – Foundation & Security Baseline**
  - [ ] Directory layout (`supabase/`, `api/`, `shared/`, `tests/`, `scripts/`, `docs/`).
  - [ ] Migration workflow, PostgreSQL extensions, custom ENUMs, helper functions.
  - [ ] `profiles` table + signup trigger + role enforcement + `is_admin()`.
  - [ ] Row-Level Security (RLS) default-deny baseline on all tables.
  - [ ] Supabase Storage buckets & strict access policies.
  - [ ] Audit-log infrastructure (`audit_log` table & trigger).
  - [ ] `site_settings` table & schema validation.
  - [ ] Vitest setup & RLS test suite.
  - [ ] Serverless health check `/api/health`.

- [ ] **B2 – Catalog & Discovery**
  - [ ] Categories, artisans, products, variants, media, highlights, specs, offers, pincodes.
  - [ ] Database publish rules & slug uniqueness redirects.
  - [ ] Full-text + trigram search RPCs (`search_products`, `list_products`, `get_product_detail`).
  - [ ] Trigger-maintained `product_stats` (ratings, review count, bought count).
  - [ ] Idempotent seed data migration for dev environment.

- [ ] **B3 – Cart to Order (COD First)**
  - [ ] Address validation (6-digit PIN, Indian mobile, state list).
  - [ ] Server-side cart management & guest-to-user cart merging.
  - [ ] Coupon engine & `calculate_totals` pricing function (integer paise).
  - [ ] Concurrency-safe atomic `place_order` with inventory ledger.
  - [ ] Order cancellation & restocking triggers.
  - [ ] Transactional email queue (`email_outbox`).

- [ ] **B4 – Payments (Razorpay & COD)**
  - [ ] Razorpay order creation (`/api/payments/create`) with server-calculated amounts.
  - [ ] Signature verification (`/api/payments/verify`) & raw body webhook handler (`/api/webhooks/razorpay`).
  - [ ] Payment state machine & duplicate/mismatch handling.
  - [ ] Unpaid order stock hold & expiry background job.
  - [ ] Razorpay refund integration & refund ledger.
  - [ ] Razorpay Test Mode verification script.

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
