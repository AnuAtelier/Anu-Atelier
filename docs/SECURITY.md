# Security Architecture & RLS Matrix: Anu Atelier

**Document Version:** 1.0 (Phase B7 Final Hardening)  
**Branch:** `backend`  
**Classification:** Confidential – Internal Engineering & Compliance

---

## 1. Row-Level Security (RLS) Policy Matrix

Row-Level Security is strictly enforced (`ENABLE ROW LEVEL SECURITY`) across all public tables. Anonymous and customer access is restricted to least privilege, with server-side validations preventing unauthorized mutations.

| Table Name | Anonymous | Customer (Authenticated) | Staff | Admin | Security Mechanism |
|---|---|---|---|---|---|
| `profiles` | None | Read/Update own profile (safe columns only) | Read all | Read/Write all | Column-level privileges & `protect_profile_role` trigger |
| `audit_log` | None | None | None | Read all | Immutable append-only trigger logging |
| `site_settings` | Read public keys | Read public keys | Read all | Read/Write all | Validated JSON schema in DB |
| `rate_limit_entries` | Service Role only | Service Role only | Service Role only | Service Role only | Managed by Postgres rate-limiting RPCs |
| `categories` | Read active | Read active | Read all | Read/Write all | Soft-delete filter `deleted_at IS NULL` |
| `artisans` | Read published | Read published | Read all | Read/Write all | Filtered by active crafts |
| `products` | Read published only | Read published only | Read all | Read/Write all | `status = 'published' AND deleted_at IS NULL` |
| `product_images` | Read | Read | Read all | Read/Write all | Read-only public media |
| `product_variants` | Read published | Read published | Read all | Read/Write all | Linked to published product |
| `product_highlights` | Read | Read | Read all | Read/Write all | Public display bullet points |
| `product_specs` | Read | Read | Read all | Read/Write all | Public craftsman specifications |
| `product_offers` | Read active | Read active | Read all | Read/Write all | Filtered by `starts_at <= NOW() AND expires_at >= NOW()` |
| `product_stats` | Read | Read | Read all | Read/Write all | Maintained strictly by database triggers |
| `slug_redirects` | Read | Read | Read all | Read/Write all | Automatic slug alias redirects |
| `pincodes` | Read | Read | Read all | Read/Write all | 6-digit Indian PIN check |
| `banners` | Read published | Read published | Read all | Read/Write all | Storefront hero cards |
| `collections` | Read published | Read published | Read all | Read/Write all | Workshop collections |
| `collection_products`| Read | Read | Read all | Read/Write all | Collection mapping |
| `addresses` | None | Full access to own (max 10) | Read all | Read all | `auth.uid() = user_id` + single default trigger |
| `carts` | None | Full access to own cart | Read all | Read all | `auth.uid() = user_id` |
| `cart_items` | None | Full access to own items (qty 1-10) | Read all | Read all | Foreign key check to own cart |
| `wishlists` | None | Full access to own | Read all | Read all | `auth.uid() = user_id` |
| `back_in_stock_requests` | None | Insert own, Read own | Read all | Read all | `auth.uid() = user_id` |
| `coupons` | None (RPC only) | None (RPC only) | Read all | Read/Write all | Validated via `calculate_totals` RPC |
| `coupon_redemptions` | None | Read own | Read all | Read all | Single redemption per user validation |
| `orders` | None | Read/Cancel own (before dispatch) | Read all | Read/Write all | `auth.uid() = user_id` + atomic `place_order` |
| `order_items` | None | Read own | Read all | Read all | Read via order ownership |
| `order_status_history`| None | Read own | Read all | Read all | Append-only status progression |
| `inventory_ledger` | None | None | None | Read all | Immutable stock ledger |
| `email_outbox` | None | None | None | Read all | Worker access via `service_role` |
| `payments` | None | Read own (masked) | Read all | Read all | PCI-DSS compliant: masked `card_last4` only |
| `webhook_events` | None | None | None | Read all | Deduplicated by `provider_event_id` |
| `refunds` | None | Read own | Read all | Read/Write all | Full/partial refund ledger |
| `payment_alerts` | None | None | None | Read all | Real-time amount mismatch notifications |
| `shipments` | None | Read own tracking | Read all | Read/Write all | Courier checkpoints & AWB |
| `returns` | None | Create & Read own (10-day window) | Read all | Read/Write all | Photo verification in private bucket |
| `return_items` | None | Read own | Read all | Read all | Mapped to parent return |
| `invoices` | None | Read/Download own | Read all | Read all | Sequential tax invoice PDF |
| `reviews` | Read unhidden | Create own (verified buyer), Read | Moderate | Moderate/Delete | Rating 1-5, auto-hide on 5 reports |
| `review_helpful_votes`| None | Create own (1 per review) | Read all | Read all | Duplicate prevention |
| `review_reports` | None | Create own | Read all | Read all | User reporting system |

---

## 2. HTTP Security Headers ([vercel.json](file:///Users/athletesingh/Selling%20company/vercel.json))

All incoming web traffic is secured with zero-trust HTTP response headers:

```json
{
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy-Report-Only": "default-src 'self'; script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://challenges.cloudflare.com; connect-src 'self' https://*.supabase.co https://api.razorpay.com https://lumberjack.razorpay.com; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://api.razorpay.com https://challenges.cloudflare.com; object-src 'none'; base-uri 'self'; form-action 'self' https://api.razorpay.com;"
}
```

> **Note on CSP Report-Only:** CSP is staged in `Report-Only` mode initially so third-party checkout frames (Razorpay Modal), Supabase Auth sessions, and Google Font assets are audited under real customer traffic without accidental functional breakage. Once monitored, it converts directly to enforced `Content-Security-Policy`.

---

## 3. Rate Limiting & Abuse Prevention ([shared/rateLimiter.ts](file:///Users/athletesingh/Selling%20company/shared/rateLimiter.ts))

To prevent card-testing, coupon brute-forcing, scraping, and inventory denial of service:
- **Coupon Check**: 10 requests / minute per IP/Session.
- **PIN Code Validation**: 30 requests / minute per IP.
- **Search Typeahead**: 60 requests / minute.
- **Payment Creation**: 10 attempts / 10 minutes per customer.
- **Review Submission**: 5 reviews / hour per customer.
- **Contact & Custom Enquiries**: 5 enquiries / hour.
- **Authentication Attempts**: 5 attempts / 15 minutes.

---

## 4. Storage Bucket Security

1. **`product-media`** (Public Read, Admin Write):
   - MIME Types: `image/jpeg`, `image/png`, `image/webp`.
   - Max file size: 5 MB.
   - SVG upload strictly prohibited to eliminate XSS via vector graphic scripts.
2. **`review-media`** (Public Read, Authenticated Write):
   - Path constraint: `auth.uid()/*` (users can only upload into their own folder).
   - Max file size: 5 MB.
   - SVG prohibited.
3. **`return-media`** (Private, Customer/Admin Only):
   - Served strictly via short-lived signed URLs (15 minutes expiry).
4. **`invoices`** (Private, Customer/Admin Only):
   - Stores generated tax invoice PDFs.
   - Served via signed URLs validated against order ownership.

---

## 5. Data Privacy & Compliance (DPDPA 2023)

- **Zero Client-Side Role Forgery**: Profiles role is checked on server via PostgreSQL `SECURITY DEFINER` function `is_admin()` and protected by trigger `protect_profile_role`.
- **Review Privacy**: Public reviews store immutable display name snapshots (`Firstname L.`), preventing scraping of real full names or email addresses.
- **Right to Portability**: `export_customer_data(user_id)` returns clean JSON data dump of profile, addresses, wishlist, and reviews.
- **Right to be Forgotten**: `delete_customer_account(user_id, 'DELETE')` scrubs phone, name, avatar, and addresses, while retaining immutable order ledgers for mandatory 8-year statutory compliance under Indian tax law.
