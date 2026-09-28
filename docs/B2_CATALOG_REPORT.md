# Phase B2 Report: Catalog & Discovery

**Status:** Completed  
**Branch:** `backend`  
**Test Suite:** 39/39 passing (`npm test`)  
**Smoke Test:** 10/10 passing (`npm run smoke`)  
**TypeScript Check:** Clean (`npx tsc --noEmit` passed with 0 errors)

---

## 1. What Was Built in Phase B2

### 1.1 Catalog & Discovery Schema (`supabase/migrations/002_catalog_and_discovery.sql`)
- **14 Tables**:
  - `categories`: Hierarchical craft categories (`slug`, `name`, `image_url`, `display_order`, `is_active`).
  - `artisans`: Dedicated artisan profiles for "About the artisan" authenticity (`name`, `bio`, `photo_url`, `location`, `craft_speciality`).
  - `products`: Complete craft catalog table with strict integer paise (`mrp_paise`, `price_paise`), SKU, stock, low stock alert threshold, dimensions, weight, lead times, returnability, badges, and tags.
  - `product_images`: Multi-image gallery with `is_primary` flag and display order.
  - `product_variants`: Color, size, hex code, variant stock, and price override support.
  - `product_highlights`: Icon-based value badges (e.g. `leaf`, `sparkles`, `award`).
  - `product_specs`: Detailed craft specifications (Artisan Origin, Firing Method, Fabric, Embroidery Type).
  - `product_offers`: Real-time deal engine with start and end timestamps.
  - `product_stats`: Trigger-maintained counters for average rating, review count, rating histogram (1–5), and verified `bought_count`. Real numbers only.
  - `pincodes`: Indian PIN code serviceability table with COD flags, courier zones (`local`, `regional`, `metro`, `national`), and delivery day estimates.
  - `banners`: Homepage promo carousels and announcement banners with active scheduling.
  - `collections`: Curated homepage craft collections (e.g. "Artisan Workshop Specials").
  - `collection_products`: Join table for products inside curated collections.
  - `slug_redirects`: Automated redirect table ensuring old product URLs never result in 404 errors.

### 1.2 Database Publish Rules & Protections
- **Database Functions** (Strictly `SECURITY DEFINER SET search_path = ''`):
  - `publish_product(product_id UUID)`: Validates that the product has at least one uploaded image, `price_paise > 0`, and `price_paise <= mrp_paise`. Only staff or administrators can invoke.
  - `unpublish_product(product_id UUID)`: Switches product status back to `draft`.
  - `archive_product(product_id UUID)`: Safely archives discontinued items without breaking past order history.
  - `handle_slug_change()` trigger: Automatically logs `(old_slug, new_slug, 'product')` into `slug_redirects` whenever a product's slug is updated.

### 1.3 High-Performance Client-Safe Discovery RPCs
- `list_products`: Filters by category slug, price range (in paise), in-stock status, and sorts by newest, price ascending/descending, rating, or popularity. Employs keyset cursor pagination.
- `search_products`: Weighted full-text search (`title` weight 1.0, `tags` weight 0.4, `description` weight 0.2) combined with `pg_trgm` fuzzy typo tolerance and `unaccent` normalization. Excludes drafts and archived products.
- `search_suggestions`: Fast typeahead suggestions for search bars and modal overlays.
- `get_product_detail`: Single round-trip RPC returning unified JSON containing product, image gallery, variants, highlights, specs, real stats, active deals, artisan story, and related crafts. Resolves old slugs via `slug_redirects`.
- `get_home_feed`: Single unified query returning active banners, categories, collections, fresh workshop arrivals, and bestsellers.
- `check_pincode`: Validates 6-digit Indian PIN codes, checks COD eligibility, and adds `handmade_lead_days` to courier transit estimates.

### 1.4 Idempotent Dev Seed Catalog (`supabase/migrations/003_seed_dev_catalog.sql`)
- **3 Core Categories**: Terracotta & Clay Items, Embroidered & Hand-Stitched, Other Handicrafts.
- **2 Real Uttar Pradesh Artisans**: Anushka Sharma (Gorakhpur, Wheel-thrown Terracotta) and Meera Devi (Lucknow, Chikankari & Zardozi).
- **9 Handcrafted Indian Products** with high-resolution imagery, realistic dimensions, materials, care instructions, and integer paise pricing:
  1. Festive Hand-Painted Terracotta Diya Set (₹599 / 59,900 paise)
  2. Traditional Earthen Water Matka with Clay Lid (₹899 / 89,900 paise)
  3. Royal Gorakhpuri Terracotta Elephant Figurine (₹1,499 / 149,900 paise)
  4. Hand-Embroidered Pure Cotton Chikankari Kurta - Blush Rose (₹2,499 / 249,900 paise)
  5. Heritage Zardozi Embroidered Chanderi Silk Dupatta (₹1,899 / 189,900 paise)
  6. Artisanal Kantha Stitched Mulmul Saree - Indigo Flora (₹3,499 / 349,900 paise)
  7. Bohemian Hand-Knotted Jute & Cotton Macrame Wall Tapestry (₹799 / 79,900 paise)
  8. Brass-Inlaid Hand-Carved Sheesham Wood Trinket Box (₹1,299 / 129,900 paise)
  9. Hand-Painted Jaipur Blue Pottery Floral Ceramic Vase (₹1,199 / 119,900 paise)
- **PIN Code Seed**: Major delivery hubs across India (Lucknow, Gorakhpur, Delhi, Noida, Mumbai, Bengaluru, Kolkata, Chennai, Jaipur).

### 1.5 Shared Modules & Testing
- Updated `shared/types.ts` with all catalog domain models and RPC return types.
- Updated `shared/schemas.ts` with Zod validation for product creation, list filters, search queries, and PIN codes.
- Added `tests/b2_catalog.test.ts` with 15 test scenarios (all 39 tests passing across B1 and B2 suites).
- Updated `scripts/smoke.ts` to verify catalog migrations and seed integrity (all 10 smoke checks passing).

---

## 2. What Was Skipped / Deferred
- Shopping cart persistence, coupon engine, and atomic order placement transaction (Scheduled for **Phase B3**).
- Razorpay payment order generation and webhook signature verification (Scheduled for **Phase B4**).
- Shipment tracking updates, return/replacement requests, and PDF invoices (Scheduled for **Phase B5**).

---

## 3. Assumptions Made
- Product prices include tax (GST). Default craft GST is set to 5% with HSN 6912/6211.
- Standard courier delivery transit time within India is 3 to 7 business days for metropolitan and local regional zones.

---

## 4. Verification Commands
```bash
# 1. Run all unit and security tests (39 passing)
npm test

# 2. Run developer smoke test (10 passing)
npm run smoke

# 3. Verify TypeScript type safety
npx tsc --noEmit
```
