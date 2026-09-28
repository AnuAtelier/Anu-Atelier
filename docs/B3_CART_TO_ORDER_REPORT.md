# Phase B3 Report: Cart to Order (COD First)

**Status:** Completed  
**Branch:** `backend`  
**Test Suite:** 52/52 passing (`npm test`)  
**Smoke Test:** 11/11 passing (`npm run smoke`)  
**TypeScript Check:** Clean (`npx tsc --noEmit` passed with 0 errors)

---

## 1. What Was Built in Phase B3

### 1.1 Cart, Order & Inventory Schema (`supabase/migrations/004_cart_to_order.sql`)
- **11 Tables & Infrastructure**:
  - `addresses`: Customer addresses with Indian phone validation (`^[6-9][0-9]{9}$`) and 6-digit PIN code format. Trigger limits accounts to max 10 addresses and enforces exactly one default address.
  - `carts` & `cart_items`: Persistent server-side cart for logged-in users with quantity caps (1–10 units per craft), personalization notes, and gift flags.
  - `wishlists`: Customer wishlist items with duplicate prevention.
  - `back_in_stock_requests`: Out-of-stock notification registry.
  - `coupons`: Multi-type coupon engine (`percent`, `flat`, `free_delivery`) with minimum order value, maximum discount cap, total and per-user limits, and first-order-only flags.
  - `coupon_redemptions`: Audit log tracking user redemptions to prevent duplicate coupon use.
  - `orders`: Master orders table with human-friendly order numbers (`AA-26-XXXXXX`), idempotency keys, integer paise financial ledger (`subtotal_mrp_paise`, `subtotal_sale_paise`, `delivery_fee_paise`, `cod_fee_paise`, `total_tax_paise`, `total_paise`), payment statuses, and address snapshots.
  - `order_items`: Immutable snapshots of purchased crafts, unit prices, variant details, HSN codes, and tax rates.
  - `order_status_history`: Complete audit trail of order state machine transitions with notes and actor IDs.
  - `inventory_ledger`: Concurrency-safe immutable stock ledger recording all decrements and restocks with before/after balances.
  - `email_outbox`: Transactional outbox table with deduplication keys, ensuring that third-party email provider outages never interrupt order placement.

### 1.2 Pricing & Coupon Engine (`calculate_totals` RPC)
- **Single Source of Truth**: Evaluates product prices from the database, applies active offers, and rejects any client-tampered prices.
- **Largest-Remainder Discount Distribution**: Distributes coupon discounts proportionally across line items down to the single exact paisa without losing or creating fractional paise.
- **Dynamic Delivery Rules**:
  - Standard flat delivery fee: ₹60 (6,000 paise).
  - Free delivery threshold: Orders with discounted subtotal >= ₹999 (99,900 paise) automatically receive ₹0 delivery.
  - Free delivery coupons or items flagged `is_free_delivery` waive delivery fees.
- **COD Policy Enforcement**: Checks if COD is enabled and restricts orders exceeding ₹5,000 (500,000 paise).

### 1.3 Concurrency-Safe Order Transaction (`place_order` RPC)
- **Idempotency Guarantee**: If an identical `idempotency_key` is submitted more than once, returns the existing order instantly without double charging or duplicate stock deduction.
- **Row-Level Locking (`SELECT ... FOR UPDATE`)**: High-demand handcrafted items with stock = 1 cannot be double-bought; locks product rows during checkout.
- **Atomic Operations**:
  1. Validates real-time inventory.
  2. Calculates authoritative pricing.
  3. Inserts master order and line items.
  4. Decrements physical stock and logs to `inventory_ledger`.
  5. Redeems coupons and updates usage counts.
  6. Queues order confirmation email in `email_outbox` (`order_placed_AA-26-XXXXXX`).
  7. Empties the customer's server cart.

### 1.4 Customer Self-Service Order Cancellation (`cancel_order` RPC)
- Customers can cancel their own orders as long as status is `pending`, `placed`, or `confirmed` (blocked once order is marked `shipped`).
- Restores item quantities back to stock, logs positive entries in `inventory_ledger`, releases redeemed coupons, and queues cancellation confirmation emails.

### 1.5 Guest-to-User Cart Merging (`merge_guest_cart` RPC)
- Merges guest `localStorage` items into the user's persistent server cart upon authentication, clamping quantities to available physical stock.

---

## 2. Seeded Promotional Coupons
| Code | Type | Value | Min Order | Rules |
|---|---|---|---|---|
| `WELCOME10` | 10% Off | 10% (max ₹250) | ₹499 | First-time customers only |
| `FESTIVE200` | Flat Off | ₹200 | ₹1,499 | Max 2 uses per customer |
| `FREESHIP` | Free Delivery | ₹60 fee waived | ₹0 | All handcrafted orders |

---

## 3. Verification Commands
```bash
# 1. Run all unit, security, and cart-order tests (52 passing)
npm test

# 2. Run developer smoke test (11 passing)
npm run smoke

# 3. Verify TypeScript type safety
npx tsc --noEmit
```
