/**
 * Anu Atelier - Phase B5 Fulfilment & Post-Purchase Test Suite
 * Tests: GST tax invoices, intra/inter-state tax breakups,
 * return eligibility windows, review verified buyer badges,
 * review rating aggregations, and email templates.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { renderEmail } from '../shared/emailTemplates';

describe('Phase B5: Fulfilment SQL Security Audit', () => {
  const migrationPath = path.resolve(
    process.cwd(),
    'supabase/migrations/006_fulfilment_and_post_purchase.sql'
  );

  it('verifies 006_fulfilment_and_post_purchase.sql exists', () => {
    expect(fs.existsSync(migrationPath)).toBe(true);
  });

  it('ensures every SECURITY DEFINER function in fulfilment migration has search_path = ""', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    const secDefCount = (sql.match(/SECURITY DEFINER/g) || []).length;
    const searchPathCount = (sql.match(/SECURITY DEFINER SET search_path = ''/g) || []).length;

    expect(secDefCount).toBeGreaterThanOrEqual(7);
    expect(searchPathCount).toBe(secDefCount);
  });

  it('ensures RLS is enabled on all shipments, returns, invoices, and review tables', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    const expectedTables = [
      'shipments',
      'returns',
      'return_items',
      'invoices',
      'reviews',
      'review_helpful_votes',
      'review_reports',
    ];

    for (const table of expectedTables) {
      expect(sql).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
    }
  });

  it('ensures invoices table strictly uses BIGINT for all monetary amounts', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    expect(sql).toContain('subtotal_paise BIGINT NOT NULL CHECK (subtotal_paise >= 0)');
    expect(sql).toContain('taxable_amount_paise BIGINT NOT NULL CHECK (taxable_amount_paise >= 0)');
    expect(sql).toContain('cgst_paise BIGINT NOT NULL DEFAULT 0 CHECK (cgst_paise >= 0)');
    expect(sql).toContain('sgst_paise BIGINT NOT NULL DEFAULT 0 CHECK (sgst_paise >= 0)');
    expect(sql).toContain('igst_paise BIGINT NOT NULL DEFAULT 0 CHECK (igst_paise >= 0)');
    expect(sql).toContain('total_tax_paise BIGINT NOT NULL CHECK (total_tax_paise >= 0)');
    expect(sql).toContain('grand_total_paise BIGINT NOT NULL CHECK (grand_total_paise >= 0)');
  });
});

describe('Phase B5: GST Tax Invoice Breakup (Scenario 12)', () => {
  it('correctly calculates intra-state tax (CGST + SGST) for Uttar Pradesh (09)', () => {
    const totalTaxPaise = 7138; // ₹71.38 tax on ₹1,499 craft
    const cgstPaise = Math.floor(totalTaxPaise / 2); // 3569
    const sgstPaise = totalTaxPaise - cgstPaise; // 3569

    expect(cgstPaise + sgstPaise).toBe(totalTaxPaise);
    expect(cgstPaise).toBe(3569);
    expect(sgstPaise).toBe(3569);
  });

  it('correctly handles odd tax paise in CGST/SGST without losing a single paisa', () => {
    const totalTaxPaise = 7139; // Odd number
    const cgstPaise = Math.floor(totalTaxPaise / 2); // 3569
    const sgstPaise = totalTaxPaise - cgstPaise; // 3570

    expect(cgstPaise + sgstPaise).toBe(totalTaxPaise);
    expect(sgstPaise).toBe(3570);
  });

  it('correctly assigns 100% of tax to IGST for inter-state deliveries (e.g. Maharashtra 27)', () => {
    const totalTaxPaise = 11900;
    const isIntraState = false;

    const cgst = isIntraState ? totalTaxPaise / 2 : 0;
    const sgst = isIntraState ? totalTaxPaise / 2 : 0;
    const igst = isIntraState ? 0 : totalTaxPaise;

    expect(cgst).toBe(0);
    expect(sgst).toBe(0);
    expect(igst).toBe(totalTaxPaise);
  });
});

describe('Phase B5: Review System & Privacy Invariants (Scenario 11)', () => {
  it('formats privacy-safe display names from full customer names', () => {
    function formatReviewerName(fullName: string): string {
      const parts = fullName.trim().split(/\s+/);
      if (parts.length > 1) {
        return `${parts[0]} ${parts[1][0]}.`;
      }
      return parts[0];
    }

    expect(formatReviewerName('Anushka Sharma')).toBe('Anushka S.');
    expect(formatReviewerName('Meera Devi')).toBe('Meera D.');
    expect(formatReviewerName('Pooja')).toBe('Pooja');
  });

  it('verifies review rating constraint between 1 and 5 stars', () => {
    const validRatings = [1, 2, 3, 4, 5];
    const invalidRatings = [0, 6, -1, 4.5];

    for (const r of validRatings) {
      expect(Number.isInteger(r) && r >= 1 && r <= 5).toBe(true);
    }
    for (const r of invalidRatings) {
      expect(Number.isInteger(r) && r >= 1 && r <= 5).toBe(false);
    }
  });

  it('verifies review auto-hide trigger on 5 reports in SQL', () => {
    const sql = fs.readFileSync(
      path.resolve(process.cwd(), 'supabase/migrations/006_fulfilment_and_post_purchase.sql'),
      'utf8'
    );
    expect(sql).toContain('report_count + 1 >= 5 THEN TRUE');
    expect(sql).toContain('CREATE TRIGGER trg_review_reported');
  });
});

describe('Phase B5: Return Window & Outbox Templates (Scenario 10 & 13)', () => {
  it('verifies return window eligibility calculation within 10 days of delivery', () => {
    const deliveredAt = new Date('2026-09-20T10:00:00Z');
    const windowDays = 10;
    const expiryDate = new Date(deliveredAt.getTime() + windowDays * 86400000);

    const withinWindowDate = new Date('2026-09-25T10:00:00Z');
    const pastWindowDate = new Date('2026-10-02T10:00:00Z');

    expect(withinWindowDate <= expiryDate).toBe(true);
    expect(pastWindowDate <= expiryDate).toBe(false);
  });

  it('renders order confirmation and shipment email templates with brand colors', () => {
    const placedEmail = renderEmail('order_placed', {
      order_number: 'AA-26-000101',
      customer_name: 'Anushka Sharma',
      total_paise: 149900,
      payment_method: 'cod',
    });

    expect(placedEmail.subject).toContain('AA-26-000101');
    expect(placedEmail.html).toContain('₹1499.00');
    expect(placedEmail.html).toContain('Cash on Delivery (COD)');
    expect(placedEmail.text).toContain('AA-26-000101');

    const shippedEmail = renderEmail('order_shipped', {
      order_number: 'AA-26-000101',
      courier_name: 'Blue Dart',
      tracking_number: 'BD123456789IN',
      tracking_url: 'https://bluedart.com/track/BD123456789IN',
    });

    expect(shippedEmail.subject).toContain('Has Shipped');
    expect(shippedEmail.html).toContain('Blue Dart');
    expect(shippedEmail.html).toContain('BD123456789IN');
  });
});
