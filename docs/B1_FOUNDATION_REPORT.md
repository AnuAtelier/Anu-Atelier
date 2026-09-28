# Phase B1 Report: Foundation & Security Baseline

**Status:** Completed  
**Branch:** `backend`  
**Test Suite:** 24/24 passing (`npm test`)  
**Smoke Test:** 8/8 passing (`npm run smoke`)  
**TypeScript Check:** Clean (`npx tsc --noEmit` passed with 0 errors)

---

## 1. What Was Built in Phase B1

### 1.1 Foundation Database Migration (`supabase/migrations/001_foundation.sql`)
- **Extensions:**
  - `uuid-ossp`, `pgcrypto` (cryptographic operations & UUID generation).
  - `pg_trgm`, `unaccent` (fuzzy Indian craft search & accent normalization for Phase B2).
- **Domain ENUMs:**
  - `user_role` (`customer`, `staff`, `admin`).
  - `order_status` (`pending`, `confirmed`, `processing`, `packed`, `shipped`, `out_for_delivery`, `delivered`, `cancelled`, `rto`).
  - `payment_status` (`pending`, `paid`, `failed`, `refunded`, `partially_refunded`, `cod_due`, `cod_collected`).
  - `payment_method` (`cod`, `upi`, `card`, `netbanking`, `wallet`).
  - `product_status` (`draft`, `published`, `archived`).
  - `return_status` (`requested`, `approved`, `rejected`, `pickup_scheduled`, `item_received`, `inspected`, `replacement_dispatched`, `refund_processed`, `closed`).
  - `stock_transaction_type` (`purchase`, `order_placed`, `order_cancelled`, `return_restock`, `manual_adjustment`, `damaged`).
  - `email_status` (`pending`, `sending`, `sent`, `failed`).
- **Tables & Triggers:**
  - `profiles`: Extends `auth.users` with `id`, `email`, `phone`, `full_name`, `role`, `avatar_url`, and timestamps.
  - `handle_new_user()` trigger: Automatically creates a profile record upon signup, strictly defaulting to the `customer` role.
  - `protect_profile_role()` trigger: Enforces database-level role immutability. Prevents customers from escalating their own or other users' roles. Only admins or service role can modify roles.
  - `audit_log`: Immutable append-only audit trail capturing table name, record ID, action, actor ID, actor role, before/after JSONB snapshots, and client IP. Client writes are completely disabled.
  - `site_settings`: JSONB key-value configuration store with seeded dev defaults:
    - `shipping`: ₹60 delivery fee, free delivery over ₹999.
    - `cod`: Enabled up to ₹5,000 with ₹0 fee.
    - `tax`: 5% placeholder rate, origin state Uttar Pradesh (`09`).
    - `returns`: 10-day replacement window, manual approval.
    - `general`: Store metadata and Indian Rupee (`INR`) currency.
  - `rate_limit_entries`: Table for persistent tracking of rate limits and IP thresholds.
- **Supabase Storage Buckets & Policies:**
  - Initialized buckets: `product-media`, `site-assets`, `review-media`, `return-media`, `invoices`.
  - Configured file size caps (5MB - 10MB) and allowed MIME types.
  - Configured RLS on `storage.objects` (e.g. `invoices` and `return-media` restricted to owning user or admin; `product-media` public read).
- **Row-Level Security (RLS) Baseline:**
  - RLS enabled across all foundation tables.
  - Strict default-deny baseline.
  - All `SECURITY DEFINER` functions explicitly set `search_path = ''` to prevent search path injection attacks.

### 1.2 Shared Backend Modules & Invariants (`shared/`)
- `shared/types.ts`:
  - Enforces **Paise Invariant** (`assertIntegerPaise`, `toPaise`, `toRupees`, `formatRupees`). All monetary amounts are strictly non-negative integer paise. Floating-point numbers are rejected.
  - Type definitions for `Profile`, `AuditLogEntry`, `SiteSettings`, and domain enums.
- `shared/schemas.ts`:
  - Zod schemas for runtime validation (`profileUpdateSchema`, `siteSettingsSchema`, `indianPincodeSchema`, `indianPhoneSchema`, `userRoleSchema`).
  - `profileUpdateSchema` uses `.strict()` to reject unauthorized fields like `role` or `id`.
- `shared/envGuard.ts`:
  - Invariant 3 enforcement: Asserts `APP_ENV === 'development'`. Prevents test, seed, or reset scripts from executing against production.
- `shared/errors.ts`:
  - Standardized error hierarchy (`AppError`, `BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`, `ValidationError`, `RateLimitError`).
  - Standard response formatting: `{ error: { code, message, details } }`.
- `shared/logger.ts`:
  - Structured JSON logger with automatic redaction of sensitive credentials (`token`, `secret`, `password`, `pan`, `key`).
- `shared/rateLimiter.ts`:
  - In-memory & edge-ready rate limiting helper protecting sensitive routes and brute-force attempts.
- `shared/supabaseClient.ts`:
  - Segregated factories for anonymous client (RLS enforced) and service-role client (server-side only, guarded by `assertDevEnvironment`).

### 1.3 Serverless Health Endpoint (`api/health.ts`)
- `GET /api/health` probes system status, reports latency, environment, request ID, and database readiness.
- Rejects non-GET requests with `405 Method Not Allowed`.

### 1.4 Test & Smoke Infrastructure
- Vitest suite in `tests/b1_foundation.test.ts` (24 test scenarios covering RLS, role escalation defense, money invariants, schemas, errors, and health endpoint).
- `scripts/smoke.ts` providing an automated dev smoke test suite with formatted summary table (`npm run smoke`).

---

## 2. What Was Skipped / Deferred
- Product catalog tables, variants, and search RPCs (Scheduled for **Phase B2**).
- Cart, coupon engine, and atomic order placement transactions (Scheduled for **Phase B3**).
- Razorpay payment order creation and webhook handlers (Scheduled for **Phase B4**).
- Invoices PDF generator and email sender (Scheduled for **Phase B5**).

---

## 3. Assumptions Made
- Supabase Auth handles core authentication tokens (JWT). Profiles automatically synchronize through PostgreSQL trigger on `auth.users`.
- Role assignment defaults to `customer`. Promotion to `staff` or `admin` is performed by an existing admin or service role script.

---

## 4. Risks Identified & Mitigations
| Risk | Mitigation |
|---|---|
| Customer attempts self-promotion to `admin` | Blocked at 3 layers: Zod strict schema rejection, RLS update policy, and database trigger `protect_profile_role()`. |
| Script accidentally runs against production database | `shared/envGuard.ts` asserts `APP_ENV === 'development'` and blocks execution if pointing to production. |
| Floating point rounding discrepancies in currency | All calculations use integer paise (`bigint` in SQL, `number` integer in TS). `assertIntegerPaise()` validates at runtime. |
| Function search path hijacking | All `SECURITY DEFINER` functions explicitly set `SET search_path = ''`. |

---

## 5. Verification Commands
To re-verify Phase B1 deliverables at any time:
```bash
# 1. Run full unit and security test suite
npm test

# 2. Run developer smoke test
npm run smoke

# 3. Verify TypeScript type safety
npx tsc --noEmit
```
