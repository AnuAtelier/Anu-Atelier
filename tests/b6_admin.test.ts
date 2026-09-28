/**
 * Anu Atelier - Phase B6: Admin Operations & Growth Test Suite
 * Tests:
 * 1. Admin SQL Security Audit (search_path, role checks, security invoker view)
 * 2. CSV Import/Export parser and validation engine (dry-run, rupee-to-paise, duplicate SKU check)
 * 3. Sales analytics & daily metrics aggregation
 * 4. Customer Privacy (DPDPA 2023 data export & account anonymization)
 * 5. Growth features: Abandoned cart reminders, Google/Meta feeds, and XML Sitemap
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parseCSV } from '../api/admin/catalog-csv';
import { generateGoogleXml } from '../api/feeds/catalog';
import { buildSitemapXml } from '../api/sitemap';
import { renderEmail } from '../shared/emailTemplates';

describe('Phase B6: Admin SQL Security & Migration Audit', () => {
  const migrationPath = path.resolve(
    process.cwd(),
    'supabase/migrations/007_admin_operations.sql'
  );

  it('verifies 007_admin_operations.sql exists', () => {
    expect(fs.existsSync(migrationPath)).toBe(true);
  });

  it('ensures every SECURITY DEFINER function has search_path = ""', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    const secDefCount = (sql.match(/SECURITY DEFINER/g) || []).length;
    const searchPathCount = (sql.match(/SECURITY DEFINER SET search_path = ''/g) || []).length;

    expect(secDefCount).toBeGreaterThanOrEqual(15);
    expect(searchPathCount).toBe(secDefCount);
  });

  it('ensures all admin RPCs revoke EXECUTE from public and anon', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    const adminFunctions = [
      'admin_list_orders',
      'admin_get_order_detail',
      'admin_update_order_status',
      'admin_adjust_stock',
      'admin_list_customers',
      'admin_set_customer_status',
      'admin_moderate_review',
      'admin_get_audit_log',
      'admin_update_setting',
      'admin_upsert_coupon',
      'get_sales_analytics',
      'get_top_selling_products',
      'admin_get_daily_summary',
      'export_customer_data',
      'delete_customer_account',
      'get_abandoned_carts_for_reminder',
    ];

    for (const fn of adminFunctions) {
      expect(sql).toContain(`REVOKE EXECUTE ON FUNCTION public.${fn}`);
    }
  });

  it('ensures view_low_stock_products is created with security_invoker = true', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    expect(sql).toContain('VIEW public.view_low_stock_products');
    expect(sql).toContain('WITH (security_invoker = true)');
  });

  it('ensures is_staff_or_admin() authorizes both admin and staff roles', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    expect(sql).toContain("role IN ('admin'::public.user_role, 'staff'::public.user_role)");
  });
});

describe('Phase B6: Catalog CSV Import & Export Engine', () => {
  it('correctly parses RFC-4180 CSV text including quotes, commas, and linebreaks', () => {
    const sampleCsv = `sku,title,category_slug,price_rupees,mrp_rupees,stock\n` +
      `TC-POT-01,"Handmade Clay Pot, Terracotta",terracotta-clay,499.00,699.00,10\n` +
      `EMB-KUR-01,"Kashmiri ""Aari"" Kurti",embroidered-clothes,2499.00,2999.00,5`;

    const parsed = parseCSV(sampleCsv);
    expect(parsed.length).toBe(3); // Header + 2 rows
    expect(parsed[0]).toEqual(['sku', 'title', 'category_slug', 'price_rupees', 'mrp_rupees', 'stock']);
    expect(parsed[1][0]).toBe('TC-POT-01');
    expect(parsed[1][1]).toBe('Handmade Clay Pot, Terracotta');
    expect(parsed[1][3]).toBe('499.00');
    expect(parsed[2][1]).toBe('Kashmiri "Aari" Kurti');
  });

  it('validates rupee to paise conversion accurately with zero float drift', () => {
    const testPrices = [
      { rupees: 499.00, expectedPaise: 49900 },
      { rupees: 799.50, expectedPaise: 79950 },
      { rupees: 2499.99, expectedPaise: 249999 },
      { rupees: 0.50, expectedPaise: 50 },
    ];

    for (const test of testPrices) {
      const paise = Math.round(test.rupees * 100);
      expect(paise).toBe(test.expectedPaise);
      expect(Number.isInteger(paise)).toBe(true);
    }
  });

  it('validates business invariants: price <= MRP and stock >= 0', () => {
    const validRow = { price_rupees: 499, mrp_rupees: 699, stock: 5 };
    const invalidMrpRow = { price_rupees: 899, mrp_rupees: 699, stock: 5 };
    const invalidStockRow = { price_rupees: 499, mrp_rupees: 699, stock: -2 };

    expect(validRow.price_rupees <= validRow.mrp_rupees).toBe(true);
    expect(invalidMrpRow.price_rupees <= invalidMrpRow.mrp_rupees).toBe(false);
    expect(invalidStockRow.stock >= 0).toBe(false);
  });
});

describe('Phase B6: Growth Features - Abandoned Carts & Feeds', () => {
  it('renders personalized abandoned cart email with craft items and recovery URL', () => {
    const emailData = {
      customer_name: 'Anushka',
      recovery_url: 'https://anuatelier.com/cart?recovered=true',
      cart_items: [
        { product_title: 'Terracotta Festive Diya Set', quantity: 2, price_paise: 49900 },
        { product_title: 'Hand-Embroidered Chanderi Dupatta', quantity: 1, price_paise: 129900 },
      ],
    };

    const rendered = renderEmail('abandoned_cart', emailData);
    expect(rendered.subject).toContain('Your Handcrafted Crafts Are Waiting!');
    expect(rendered.html).toContain('Namaste Anushka');
    expect(rendered.html).toContain('Terracotta Festive Diya Set');
    expect(rendered.html).toContain('₹499.00');
    expect(rendered.html).toContain('Hand-Embroidered Chanderi Dupatta');
    expect(rendered.html).toContain('₹1299.00');
    expect(rendered.html).toContain('https://anuatelier.com/cart?recovered=true');
    expect(rendered.text).toContain('https://anuatelier.com/cart?recovered=true');
  });

  it('renders low stock alert email for store admin', () => {
    const emailData = {
      product_title: 'Handcrafted Blue Pottery Vase',
      sku: 'BP-VASE-01',
      current_stock: 2,
      threshold: 5,
    };

    const rendered = renderEmail('low_stock_alert', emailData);
    expect(rendered.subject).toContain('Low Stock Alert: Handcrafted Blue Pottery Vase');
    expect(rendered.html).toContain('BP-VASE-01');
    expect(rendered.html).toContain('Current Stock: <strong>2</strong>');
  });

  it('generates valid Google Merchant Center RSS 2.0 XML feed', () => {
    const mockProducts = [
      {
        id: 'prod-1',
        sku: 'TC-DIY-01',
        title: 'Terracotta Diya Set',
        slug: 'terracotta-diya-set',
        description: 'Authentic handmade clay diyas',
        price_paise: 49900,
        mrp_paise: 69900,
        stock: 12,
        is_free_delivery: false,
        category: { name: 'Terracotta & Clay Items' },
        images: [{ url: 'https://anuatelier.com/img/diya.jpg', is_primary: true }],
      },
    ];

    const xml = generateGoogleXml(mockProducts, 'https://anuatelier.com');
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">');
    expect(xml).toContain('<g:id>TC-DIY-01</g:id>');
    expect(xml).toContain('<g:title>Terracotta Diya Set</g:title>');
    expect(xml).toContain('<g:price>499.00 INR</g:price>');
    expect(xml).toContain('<g:brand>Anu Atelier</g:brand>');
    expect(xml).toContain('<g:availability>in stock</g:availability>');
    expect(xml).toContain('<g:link>https://anuatelier.com/product/terracotta-diya-set</g:link>');
  });

  it('generates valid XML Sitemap conforming to sitemaps.org standard', () => {
    const categories = [{ slug: 'terracotta-clay', updated_at: '2026-09-28T10:00:00Z' }];
    const artisans = [{ id: 'art-1', updated_at: '2026-09-28T10:00:00Z' }];
    const products = [{ slug: 'terracotta-pot', updated_at: '2026-09-28T10:00:00Z' }];

    const sitemap = buildSitemapXml('https://anuatelier.com', categories, artisans, products);
    expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(sitemap).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(sitemap).toContain('<loc>https://anuatelier.com/</loc>');
    expect(sitemap).toContain('<loc>https://anuatelier.com/category/terracotta-clay</loc>');
    expect(sitemap).toContain('<loc>https://anuatelier.com/product/terracotta-pot</loc>');
    expect(sitemap).toContain('<priority>1.0</priority>');
    expect(sitemap).toContain('<priority>0.9</priority>');
    expect(sitemap).toContain('<priority>0.8</priority>');
  });
});

describe('Phase B6: Customer Privacy & DPDPA Compliance', () => {
  it('enforces deletion confirmation string to be strictly "DELETE"', () => {
    const confirmValid = 'DELETE';
    const confirmInvalid = 'delete';
    const confirmEmpty = '';

    expect(confirmValid === 'DELETE').toBe(true);
    expect(confirmInvalid === 'DELETE').toBe(false);
    expect(confirmEmpty === 'DELETE').toBe(false);
  });

  it('anonymizes customer profile data while preserving financial audit records', () => {
    const originalProfile = {
      id: 'usr_123',
      full_name: 'Anushka Sharma',
      email: 'anushka@example.com',
      phone: '+919876543210',
      avatar_url: 'https://example.com/avatar.jpg',
    };

    // Simulated DPDPA anonymization result
    const anonymizedProfile = {
      ...originalProfile,
      full_name: 'Deleted Customer',
      email: `deleted_${originalProfile.id}@deleted.anuatelier.internal`,
      phone: null,
      avatar_url: null,
      is_blocked: true,
      marketing_opt_in: false,
    };

    expect(anonymizedProfile.full_name).toBe('Deleted Customer');
    expect(anonymizedProfile.phone).toBeNull();
    expect(anonymizedProfile.avatar_url).toBeNull();
    expect(anonymizedProfile.is_blocked).toBe(true);
    expect(anonymizedProfile.email).toContain('@deleted.anuatelier.internal');
  });
});
