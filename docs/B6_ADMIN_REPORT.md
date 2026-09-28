# Phase B6 Report: Admin Operations & Growth

**Status:** Completed  
**Branch:** `backend`  
**Test Suite:** 92/92 passing (`npm test`)  
**Razorpay Simulation:** 5/5 passing (`npm run test:razorpay`)  
**Smoke Test:** 14/14 passing (`npm run smoke`)  
**TypeScript Check:** Clean (`npx tsc --noEmit` passed with 0 errors)

---

## 1. What Was Built in Phase B6

### 1.1 Admin Operations Schema & RPCs (`supabase/migrations/007_admin_operations.sql`)
- **Schema Enhancements**:
  - `profiles`: Added `is_blocked`, `cod_blocked`, and `marketing_opt_in` (DPDPA compliance).
  - `carts`: Added `reminder_count` and `last_reminded_at` for abandoned cart recovery.
  - `reviews`: Added `moderation_status` (`approved`, `rejected`, `flagged`).
  - `products` & `categories`: Added `deleted_at` for soft-deletion capability.
- **Authorization Helper**:
  - `is_staff_or_admin()`: Confirms caller holds either `admin` or `staff` role in `profiles`, supporting delegation to warehouse and support team members without privilege escalation.
- **Admin Order Management**:
  - `admin_list_orders(p_status, p_search, p_limit, p_offset)`: Paginated order search by order number, customer name, email, or phone.
  - `admin_get_order_detail(p_order_id)`: Complete order snapshot including items, status history, payment events, refunds, shipments, and customer metadata.
  - `admin_update_order_status(p_order_id, p_new_status, p_reason, p_internal_notes)`: Status override with automatic inventory restocking upon cancellation (`cancel_restock`), automatic tax invoice creation upon dispatch (`shipped`), and change logging in `audit_log`.
- **Inventory & Stock Adjustment**:
  - `admin_adjust_stock(p_product_id, p_variant_id, p_delta, p_reason, p_notes)`: Atomic stock modification with row-level locks, ledger auditing (`purchase` / `manual_adjustment`), and audit trail.
- **Customer Moderation**:
  - `admin_list_customers(p_search, p_role, p_is_blocked, p_limit, p_offset)`: Customer directory with lifetime purchase counts and total spend in paise.
  - `admin_set_customer_status(p_customer_id, p_is_blocked, p_cod_blocked, p_reason)`: Super-admin only command to block malicious users or COD access.
- **Review Moderation**:
  - `admin_moderate_review(p_review_id, p_status, p_admin_notes)`: Allows staff to approve, flag, or reject customer reviews, triggering live recalculation of `product_stats`.
- **Audit Log Viewer & Settings**:
  - `admin_get_audit_log(p_table_name, p_actor_id, p_limit, p_offset)`: Filterable view of system audit trail.
  - `admin_update_setting(p_key, p_value)`: Safe configuration updates recorded in `audit_log`.
  - `admin_upsert_coupon(...)`: Admin creation and updating of promotional coupons.

### 1.2 Sales Analytics & Reporting (IST Timezone Aware)
- `get_sales_analytics(p_start_date, p_end_date)`: Computes total revenue, total orders, Average Order Value (AOV), COD vs Prepaid splits, cancellation rate, and return requests.
- `get_top_selling_products(p_limit, p_start_date, p_end_date)`: Aggregates top-performing crafts by units sold and gross revenue.
- `view_low_stock_products`: Security-invoker SQL view filtering published crafts where stock is at or below `low_stock_threshold`.
- `admin_get_daily_summary(p_date)`: Daily operations digest reporting revenue, order count, pending fulfilments, and low-stock item count.

### 1.3 Customer Self-Service & Privacy (DPDPA 2023 / GDPR Compliance)
- `export_customer_data(p_user_id)`: Generates full structured JSON export of profile, addresses, wishlists, reviews, and order history (callable only by the customer or admin).
- `delete_customer_account(p_user_id, p_confirmation)`: Right to be Forgotten workflow:
  - Requires strict confirmation `DELETE`.
  - Anonymizes profile data (`Deleted Customer`, dummy email, phone cleared, avatar removed, blocked).
  - Deletes transient PII (addresses, active carts, wishlists).
  - Anonymizes public review attribution to `Anonymous Artisan Admirer`.
  - **Legal Invariant**: Retains immutable financial order records (`orders`, `order_items`, `invoices`, `payments`) as legally mandated under Indian GST / Companies Act (minimum 8 financial years).

### 1.4 Bulk Catalog CSV Import & Export ([api/admin/catalog-csv.ts](file:///Users/athletesingh/Selling%20company/api/admin/catalog-csv.ts))
- **Export**: Streams complete catalog as RFC-4180 CSV with rupee prices, stock levels, GST tax rates, and artisan information.
- **Import with Dry-Run**: Validates CSV rows before touching the database.
  - Detects duplicate SKUs, missing headers, negative prices, and invalid categories.
  - Converts rupee inputs into integer paise with zero floating-point error.
  - Returns detailed error diagnostics by row number and SKU.

### 1.5 Growth & Marketing Features
- **Abandoned Cart Recovery ([api/cron/abandoned-carts.ts](file:///Users/athletesingh/Selling%20company/api/cron/abandoned-carts.ts))**:
  - Automatically identifies carts untouched for > 2 hours.
  - Checks customer marketing opt-in consent and ensures no order was placed in the interim.
  - Enforces hard limit of maximum 2 reminders per cart.
  - Queues branded artisanal recovery email into `email_outbox` with preview images and recovery link.
- **Google Merchant & Meta Feeds ([api/feeds/catalog.ts](file:///Users/athletesingh/Selling%20company/api/feeds/catalog.ts))**:
  - Generates Google Merchant Center RSS 2.0 XML feed with `<g:id>`, `<g:title>`, `<g:price>499.00 INR</g:price>`, `<g:availability>`, and image links.
  - Generates Meta Catalog JSON feed for Instagram & Facebook Shopping.
- **Dynamic XML Sitemap ([api/sitemap.ts](file:///Users/athletesingh/Selling%20company/api/sitemap.ts))**:
  - Conforms to sitemaps.org protocol, indexing all active product pages, category pages, artisan pages, and policy pages with `<lastmod>` and priority scores.

---

## 2. Verification Commands
```bash
# 1. Run full test suite (92 tests across 6 suites)
npm test

# 2. Run Razorpay payment simulation suite (5 steps)
npm run test:razorpay

# 3. Run developer smoke test suite (14 checks)
npm run smoke

# 4. Verify TypeScript compiler
npx tsc --noEmit
```
