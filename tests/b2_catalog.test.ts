/**
 * Anu Atelier - Phase B2 Catalog & Discovery Test Suite
 * Tests: Schema integrity, publish rules, integer paise pricing,
 * full-text & trigram search SQL audit, RLS policies, pincode checks.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  productCreateSchema,
  productListFilterSchema,
  productSearchFilterSchema,
  indianPincodeSchema,
} from '../shared/schemas';

describe('Phase B2: Catalog SQL & Schema Security Audit', () => {
  const catalogMigrationPath = path.resolve(process.cwd(), 'supabase/migrations/002_catalog_and_discovery.sql');
  const seedMigrationPath = path.resolve(process.cwd(), 'supabase/migrations/003_seed_dev_catalog.sql');

  it('verifies 002_catalog_and_discovery.sql exists', () => {
    expect(fs.existsSync(catalogMigrationPath)).toBe(true);
  });

  it('verifies 003_seed_dev_catalog.sql exists', () => {
    expect(fs.existsSync(seedMigrationPath)).toBe(true);
  });

  it('ensures every SECURITY DEFINER function in catalog migration has search_path = ""', () => {
    const sql = fs.readFileSync(catalogMigrationPath, 'utf8');
    const secDefCount = (sql.match(/SECURITY DEFINER/g) || []).length;
    const searchPathCount = (sql.match(/SECURITY DEFINER SET search_path = ''/g) || []).length;

    expect(secDefCount).toBeGreaterThanOrEqual(10);
    expect(searchPathCount).toBe(secDefCount);
  });

  it('ensures RLS is enabled on all catalog tables', () => {
    const sql = fs.readFileSync(catalogMigrationPath, 'utf8');
    const expectedTables = [
      'categories',
      'artisans',
      'products',
      'slug_redirects',
      'product_images',
      'product_variants',
      'product_highlights',
      'product_specs',
      'product_offers',
      'product_stats',
      'pincodes',
      'banners',
      'collections',
      'collection_products',
    ];

    for (const table of expectedTables) {
      expect(sql).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
    }
  });

  it('ensures all monetary columns use BIGINT and enforce price <= mrp in SQL', () => {
    const sql = fs.readFileSync(catalogMigrationPath, 'utf8');
    expect(sql).toContain('mrp_paise BIGINT NOT NULL CHECK (mrp_paise > 0)');
    expect(sql).toContain('price_paise BIGINT NOT NULL CHECK (price_paise > 0 AND price_paise <= mrp_paise)');
  });
});

describe('Phase B2: Publish Rules & Price Tampering Defense', () => {
  it('accepts valid product creation with price <= MRP in integer paise', () => {
    const validProduct = {
      title: 'Handcrafted Terracotta Diya',
      slug: 'handcrafted-terracotta-diya',
      description: 'Handcrafted using traditional clay firing techniques in Uttar Pradesh.',
      category_id: 'a0000000-0000-0000-0000-000000000001',
      mrp_paise: 79900, // ₹799
      price_paise: 59900, // ₹599
      stock: 20,
    };

    const parsed = productCreateSchema.safeParse(validProduct);
    expect(parsed.success).toBe(true);
  });

  it('rejects product creation if price exceeds MRP (price_paise > mrp_paise)', () => {
    const invalidProduct = {
      title: 'Overpriced Craft',
      slug: 'overpriced-craft',
      description: 'Valid description with more than twenty characters.',
      category_id: 'a0000000-0000-0000-0000-000000000001',
      mrp_paise: 50000, // ₹500
      price_paise: 60000, // ₹600 (ILLEGAL: Price > MRP)
      stock: 10,
    };

    const parsed = productCreateSchema.safeParse(invalidProduct);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const priceError = parsed.error.issues.find((issue) => issue.path.includes('price_paise'));
      expect(priceError?.message).toBe('Selling price cannot exceed MRP (mrp_paise)');
    }
  });

  it('rejects non-integer floating prices', () => {
    const floatProduct = {
      title: 'Float Price Craft',
      slug: 'float-price-craft',
      description: 'Valid description with more than twenty characters.',
      category_id: 'a0000000-0000-0000-0000-000000000001',
      mrp_paise: 500.5,
      price_paise: 400.25,
      stock: 10,
    };

    const parsed = productCreateSchema.safeParse(floatProduct);
    expect(parsed.success).toBe(false);
  });
});

describe('Phase B2: Filters, Pincodes & Search Schemas', () => {
  it('validates product list filters with default sort and limit', () => {
    const filter = {
      category_slug: 'terracotta-clay',
      in_stock: true,
      min_price_paise: 20000,
    };

    const parsed = productListFilterSchema.safeParse(filter);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.sort).toBe('newest');
      expect(parsed.data.limit).toBe(20);
    }
  });

  it('validates search query requirements', () => {
    expect(productSearchFilterSchema.safeParse({ query: 'matka' }).success).toBe(true);
    expect(productSearchFilterSchema.safeParse({ query: '   ' }).success).toBe(false);
  });

  it('strictly validates 6-digit Indian PIN codes', () => {
    expect(indianPincodeSchema.safeParse('226001').success).toBe(true); // Lucknow
    expect(indianPincodeSchema.safeParse('273001').success).toBe(true); // Gorakhpur
    expect(indianPincodeSchema.safeParse('110001').success).toBe(true); // Delhi
    expect(indianPincodeSchema.safeParse('098765').success).toBe(false); // Leading zero invalid in India
    expect(indianPincodeSchema.safeParse('12345').success).toBe(false); // 5 digits
  });
});

describe('Phase B2: Seed Data Quality & Invariance', () => {
  const seedSql = fs.readFileSync(
    path.resolve(process.cwd(), 'supabase/migrations/003_seed_dev_catalog.sql'),
    'utf8'
  );

  it('ensures seed migration contains all 3 core Indian handicraft categories', () => {
    expect(seedSql).toContain("'terracotta-clay'");
    expect(seedSql).toContain("'embroidered-clothing'");
    expect(seedSql).toContain("'other-handicrafts'");
  });

  it('ensures authentic Uttar Pradesh artisans are seeded', () => {
    expect(seedSql).toContain("'Anushka Sharma'");
    expect(seedSql).toContain("'Gorakhpur, Uttar Pradesh'");
    expect(seedSql).toContain("'Meera Devi'");
    expect(seedSql).toContain("'Lucknow, Uttar Pradesh'");
  });

  it('verifies 9 distinct handcrafted products are seeded with integer paise prices', () => {
    const allMatches = seedSql.match(/'c0000000-0000-0000-0000-00000000000\d'/g) || [];
    const distinctProductIds = new Set(allMatches);
    expect(distinctProductIds.size).toBe(9);

    // Verify all prices in seed are integer paise (e.g. 59900, 89900, 149900, 249900)
    expect(seedSql).toContain('79900, 59900');
    expect(seedSql).toContain('119900, 89900');
    expect(seedSql).toContain('199900, 149900');
    expect(seedSql).toContain('329900, 249900');
    expect(seedSql).toContain('249900, 189900');
    expect(seedSql).toContain('449900, 349900');
    expect(seedSql).toContain('109900, 79900');
    expect(seedSql).toContain('169900, 129900');
    expect(seedSql).toContain('159900, 119900');
  });

  it('verifies primary images are seeded for each product', () => {
    const primaryMatches = seedSql.match(/,\s*true\s*\)/g) || [];
    expect(primaryMatches.length).toBeGreaterThanOrEqual(9);
  });
});
