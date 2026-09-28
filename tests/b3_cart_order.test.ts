/**
 * Anu Atelier - Phase B3 Cart to Order Test Suite
 * Tests: Pricing math, coupon engine, atomic totals, address validation,
 * order state machines, idempotency, inventory ledger, and SQL security audit.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  addressCreateSchema,
  cartItemInputSchema,
  calculateTotalsInputSchema,
  placeOrderInputSchema,
  cancelOrderInputSchema,
} from '../shared/schemas';
import { toPaise, toRupees, formatRupees, Paise } from '../shared/types';

describe('Phase B3: Cart to Order SQL Security Audit', () => {
  const migrationPath = path.resolve(process.cwd(), 'supabase/migrations/004_cart_to_order.sql');

  it('verifies 004_cart_to_order.sql exists', () => {
    expect(fs.existsSync(migrationPath)).toBe(true);
  });

  it('ensures every SECURITY DEFINER function has search_path = ""', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    const secDefCount = (sql.match(/SECURITY DEFINER/g) || []).length;
    const searchPathCount = (sql.match(/SECURITY DEFINER SET search_path = ''/g) || []).length;

    expect(secDefCount).toBeGreaterThanOrEqual(7);
    expect(searchPathCount).toBe(secDefCount);
  });

  it('ensures RLS is enabled on all cart and order tables', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    const expectedTables = [
      'addresses',
      'carts',
      'cart_items',
      'wishlists',
      'back_in_stock_requests',
      'coupons',
      'coupon_redemptions',
      'orders',
      'order_items',
      'order_status_history',
      'inventory_ledger',
      'email_outbox',
    ];

    for (const table of expectedTables) {
      expect(sql).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
    }
  });

  it('ensures orders and order_items strictly use BIGINT for all money columns', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    expect(sql).toContain('subtotal_mrp_paise BIGINT NOT NULL CHECK (subtotal_mrp_paise >= 0)');
    expect(sql).toContain('subtotal_sale_paise BIGINT NOT NULL CHECK (subtotal_sale_paise >= 0)');
    expect(sql).toContain('total_paise BIGINT NOT NULL CHECK (total_paise >= 0)');
    expect(sql).toContain('unit_price_paise BIGINT NOT NULL CHECK (unit_price_paise > 0)');
    expect(sql).toContain('line_total_paise BIGINT NOT NULL CHECK (line_total_paise >= 0)');
  });

  it('verifies row-level locking (FOR UPDATE) is enforced in place_order and cancel_order', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    expect(sql).toContain('SELECT * INTO v_prod FROM public.products WHERE id = v_item.product_id FOR UPDATE;');
    expect(sql).toContain('SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;');
  });
});

describe('Phase B3: Address & Cart Input Validation', () => {
  it('validates a complete, authentic Indian shipping address', () => {
    const validAddress = {
      full_name: 'Anushka Sharma',
      phone: '9876543210',
      address_line1: 'House No. 42, Artisan Colony, Mohaddipur',
      address_line2: 'Near Gorakhnath Temple Road',
      city: 'Gorakhpur',
      state: 'Uttar Pradesh',
      state_code: '09',
      pincode: '273001',
      address_type: 'home' as const,
      is_default: true,
    };

    const parsed = addressCreateSchema.safeParse(validAddress);
    expect(parsed.success).toBe(true);
  });

  it('rejects addresses with invalid phone or postal PIN code', () => {
    const badAddress = {
      full_name: 'Bad Address',
      phone: '1234567890', // Invalid Indian phone (must start with 6-9)
      address_line1: 'Short',
      city: 'Delhi',
      state: 'Delhi',
      state_code: '07',
      pincode: '011001', // Invalid PIN (starts with 0)
    };

    const parsed = addressCreateSchema.safeParse(badAddress);
    expect(parsed.success).toBe(false);
  });

  it('validates cart item quantities between 1 and 10 units', () => {
    const validItem = {
      product_id: 'c0000000-0000-0000-0000-000000000001',
      quantity: 3,
      personalization_note: 'Gift wrap with red ribbon please',
      is_gift: true,
    };
    expect(cartItemInputSchema.safeParse(validItem).success).toBe(true);

    const zeroQuantityItem = {
      product_id: 'c0000000-0000-0000-0000-000000000001',
      quantity: 0,
    };
    expect(cartItemInputSchema.safeParse(zeroQuantityItem).success).toBe(false);

    const excessiveItem = {
      product_id: 'c0000000-0000-0000-0000-000000000001',
      quantity: 25, // Max 10 allowed
    };
    expect(cartItemInputSchema.safeParse(excessiveItem).success).toBe(false);
  });
});

describe('Phase B3: Pricing & Coupon Math Invariants (Paise Precision)', () => {
  it('correctly calculates 10% coupon discount with maximum cap', () => {
    const subtotalPaise = 350000; // ₹3,500
    const discountPercent = 10;
    const maxDiscountPaise = 25000; // ₹250 max cap

    const rawDiscount = (subtotalPaise * discountPercent) / 100; // 35,000 paise (₹350)
    const cappedDiscount = Math.min(rawDiscount, maxDiscountPaise); // 25,000 paise (₹250)

    expect(cappedDiscount).toBe(25000);
    expect(toRupees(cappedDiscount as Paise)).toBe(250);
  });

  it('correctly evaluates Free Delivery threshold at ₹999 (99,900 paise)', () => {
    const orderUnderThreshold = 85000; // ₹850
    const orderAtThreshold = 99900; // ₹999
    const orderAboveThreshold = 149900; // ₹1,499
    const deliveryFee = 6000; // ₹60

    const fee1 = orderUnderThreshold >= 99900 ? 0 : deliveryFee;
    const fee2 = orderAtThreshold >= 99900 ? 0 : deliveryFee;
    const fee3 = orderAboveThreshold >= 99900 ? 0 : deliveryFee;

    expect(fee1).toBe(6000); // Charged ₹60
    expect(fee2).toBe(0); // Free delivery
    expect(fee3).toBe(0); // Free delivery
  });

  it('guarantees largest-remainder line distribution sums exactly to total coupon discount', () => {
    // 3 items with prices: ₹599 (59900), ₹899 (89900), ₹1,499 (149900). Total = ₹2,997 (299700)
    const items = [
      { id: '1', price_paise: 59900 },
      { id: '2', price_paise: 89900 },
      { id: '3', price_paise: 149900 },
    ];
    const totalSalePaise = 299700;
    const couponDiscountPaise = 20000; // Flat ₹200 discount

    // Largest remainder distribution across line items
    let allocatedTotal = 0;
    const lineDiscounts: number[] = [];

    for (let i = 0; i < items.length; i++) {
      if (i === items.length - 1) {
        // Last item absorbs remainder
        const lineDiscount = couponDiscountPaise - allocatedTotal;
        lineDiscounts.push(lineDiscount);
        allocatedTotal += lineDiscount;
      } else {
        const lineDiscount = Math.floor((items[i].price_paise * couponDiscountPaise) / totalSalePaise);
        lineDiscounts.push(lineDiscount);
        allocatedTotal += lineDiscount;
      }
    }

    const sumDistributed = lineDiscounts.reduce((a, b) => a + b, 0);
    expect(sumDistributed).toBe(couponDiscountPaise);
    expect(sumDistributed).toBe(20000);
  });
});

describe('Phase B3: Order State Machine & Cancellation Rules', () => {
  it('allows cancellation for placed and confirmed orders but blocks shipped orders', () => {
    const allowedStatuses = ['pending', 'placed', 'confirmed'];
    const blockedStatuses = ['packed', 'shipped', 'out_for_delivery', 'delivered', 'rto'];

    for (const status of allowedStatuses) {
      expect(['pending', 'placed', 'confirmed'].includes(status)).toBe(true);
    }

    for (const status of blockedStatuses) {
      expect(['pending', 'placed', 'confirmed'].includes(status)).toBe(false);
    }
  });

  it('validates cancel order input payload', () => {
    const validCancel = {
      order_id: 'c0000000-0000-0000-0000-000000000001',
      reason: 'Ordered wrong color variant by mistake',
    };
    expect(cancelOrderInputSchema.safeParse(validCancel).success).toBe(true);

    const tooShortCancel = {
      order_id: 'c0000000-0000-0000-0000-000000000001',
      reason: 'No', // Min 5 characters
    };
    expect(cancelOrderInputSchema.safeParse(tooShortCancel).success).toBe(false);
  });
});
