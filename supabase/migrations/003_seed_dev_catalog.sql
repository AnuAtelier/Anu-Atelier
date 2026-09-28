-- ==============================================================================
-- Anu Atelier - Phase B2: Dev Seed Catalog
-- Idempotent development seed data for categories, artisans, products,
-- variants, highlights, specs, images, pincodes, banners, and collections.
-- ==============================================================================

-- 1. SEED CATEGORIES
INSERT INTO public.categories (id, name, slug, description, image_url, display_order, is_active)
VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'Terracotta & Clay Items',
    'terracotta-clay',
    'Traditional handcrafted clay and terracotta home accents, earthen pottery, and festive diyas moulded by skilled generational artisans.',
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    1,
    true
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    'Embroidered & Hand-Stitched',
    'embroidered-clothing',
    'Exquisite artisanal apparel, hand-stitched Chikankari, Zardozi dupattas, and authentic Indian textile crafts.',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    2,
    true
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    'Other Handicrafts',
    'other-handicrafts',
    'Handmade macrame accents, brass-inlaid woodwork, authentic blue pottery, and heritage Indian gifts.',
    'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=800&q=80',
    3,
    true
  )
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    display_order = EXCLUDED.display_order;

-- 2. SEED ARTISANS
INSERT INTO public.artisans (id, name, slug, bio, photo_url, location, craft_speciality, is_active)
VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    'Anushka Sharma',
    'anushka-sharma',
    'Generational terracotta artisan preserving the ancient pottery heritage of Eastern Uttar Pradesh. Every pot and figurine is shaped on a traditional manual wheel and sun-baked.',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    'Gorakhpur, Uttar Pradesh',
    'Wheel-thrown Terracotta & Earthenware',
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'Meera Devi',
    'meera-devi',
    'Master needlework artisan with over 22 years of experience in authentic Lucknowi Chikankari shadow work and royal Zardozi embroidery.',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    'Lucknow, Uttar Pradesh',
    'Fine Chikankari & Zardozi Needlework',
    true
  )
ON CONFLICT (slug) DO UPDATE
SET bio = EXCLUDED.bio,
    photo_url = EXCLUDED.photo_url,
    location = EXCLUDED.location,
    craft_speciality = EXCLUDED.craft_speciality;

-- 3. SEED PRODUCTS (Strictly integer paise for mrp_paise and price_paise)
INSERT INTO public.products (
  id, title, slug, short_description, description, category_id, artisan_id,
  mrp_paise, price_paise, sku, stock, low_stock_threshold, weight_grams, dimensions_cm,
  handmade_lead_days, cod_allowed, is_free_delivery, badges, tags, materials, care_instructions,
  hsn_code, gst_rate_percent, status, published_at
)
VALUES
  -- 1. Terracotta Diya Set
  (
    'c0000000-0000-0000-0000-000000000001',
    'Festive Hand-Painted Terracotta Diya Set (Pack of 6)',
    'festive-hand-painted-terracotta-diya-set',
    'Pack of 6 hand-moulded natural clay diyas with gold-leaf accents, perfect for Diwali and sacred rituals.',
    'Carefully crafted from riverbank clay by master potter Anushka Sharma. Each diya is air-dried, kiln-baked, and lovingly detailed by hand with organic, eco-friendly pigments and subtle gold accents.',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    79900, 59900, 'TC-DIYA-06', 45, 5, 450, '8 x 8 x 4 cm each',
    0, true, false, ARRAY['bestseller', 'festive'], ARRAY['terracotta', 'diya', 'clay', 'diwali', 'puja'],
    'Natural Riverbed Clay, Non-toxic Paints', 'Wipe gently with dry cloth. Do not soak in water.',
    '6912', 5.0, 'published'::public.product_status, NOW() - INTERVAL '10 days'
  ),
  -- 2. Clay Water Matka
  (
    'c0000000-0000-0000-0000-000000000002',
    'Traditional Earthen Water Matka with Clay Lid (5 Litres)',
    'traditional-earthen-water-matka-clay-lid-5l',
    'Naturally cooling clay pitcher that enriches water with essential earth minerals.',
    'Hand-thrown on the potter''s wheel with high-porosity natural clay. Naturally keeps drinking water crisp and cool through micro-evaporation, without any electricity or chemicals.',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    119900, 89900, 'TC-MATKA-5L', 18, 3, 2400, '24 x 24 x 30 cm',
    0, true, false, ARRAY['eco-friendly', 'wellness'], ARRAY['matka', 'water-pot', 'clay', 'earthen', 'natural-cooling'],
    '100% Pure Unglazed Indian Clay', 'Rinse with warm water only before first use. Never use synthetic detergents.',
    '6912', 5.0, 'published'::public.product_status, NOW() - INTERVAL '8 days'
  ),
  -- 3. Terracotta Elephant
  (
    'c0000000-0000-0000-0000-000000000003',
    'Royal Gorakhpuri Terracotta Elephant Figurine',
    'royal-gorakhpuri-terracotta-elephant-figurine',
    'Heritage GI-tagged Gorakhpur terracotta elephant adorned with intricate artisanal bells and carvings.',
    'A magnificent decorative piece representing wisdom and prosperity. Crafted with centuries-old Gorakhpur terracotta technique featuring traditional howdah and embossed bell patterns.',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    199900, 149900, 'TC-ELEPHANT-01', 12, 2, 1100, '18 x 12 x 22 cm',
    2, true, true, ARRAY['gi-tagged', 'handcrafted'], ARRAY['elephant', 'gorakhpur', 'statue', 'heritage', 'terracotta'],
    'Native Alluvial Clay', 'Clean with a soft dusting brush.',
    '6912', 5.0, 'published'::public.product_status, NOW() - INTERVAL '7 days'
  ),
  -- 4. Chikankari Kurta
  (
    'c0000000-0000-0000-0000-000000000004',
    'Hand-Embroidered Pure Cotton Chikankari Kurta - Blush Rose',
    'hand-embroidered-cotton-chikankari-kurta-blush',
    'Delicate hand-embroidered shadow work on breathable cambric cotton with Bakhiya and Phanda stitches.',
    'Stitched and embroidered entirely by hand by Meera Devi and her craft collective in Lucknow. Takes over 14 days of dedicated needlework for a single garment, delivering an ethereal, graceful silhouette.',
    'a0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000002',
    329900, 249900, 'CK-KURTA-ROSE', 20, 4, 300, 'Standard Relaxed Fit',
    1, true, true, ARRAY['artisan-exclusive', 'cotton'], ARRAY['chikankari', 'kurta', 'lucknow', 'cotton', 'hand-stitched'],
    '100% Breathable Cambric Cotton, Silk Thread', 'Hand wash separately in cold water with mild liquid detergent. Dry in shade.',
    '6211', 5.0, 'published'::public.product_status, NOW() - INTERVAL '5 days'
  ),
  -- 5. Zardozi Silk Dupatta
  (
    'c0000000-0000-0000-0000-000000000005',
    'Heritage Zardozi Embroidered Chanderi Silk Dupatta',
    'heritage-zardozi-embroidered-chanderi-silk-dupatta',
    'Regal Chanderi silk dupatta with hand-laid metallic dabka embroidery and scalloped zari borders.',
    'Adorned with opulent zari work inspired by Mughal motifs. Pairs exquisitely with festive lehengas or understated suits, bringing an instant royal finish.',
    'a0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000002',
    249900, 189900, 'ZD-DUPATTA-GOLD', 15, 2, 280, '2.5 Meters x 0.9 Meters',
    2, true, true, ARRAY['festive', 'luxury'], ARRAY['zardozi', 'dupatta', 'chanderi', 'silk', 'zari', 'wedding'],
    'Pure Chanderi Silk, Gold & Silver Zari', 'Dry clean only. Store wrapped in soft muslin cloth.',
    '6214', 5.0, 'published'::public.product_status, NOW() - INTERVAL '4 days'
  ),
  -- 6. Kantha Saree
  (
    'c0000000-0000-0000-0000-000000000006',
    'Artisanal Kantha Stitched Mulmul Saree - Indigo Flora',
    'artisanal-kantha-stitched-mulmul-saree-indigo',
    'Feather-light organic mulmul cotton saree filled with running-stitch floral tapestry.',
    'Each saree tells a unique story through the rhythmic running stitch of Kantha needlecraft. Ultra-soft on the skin, effortlessly drapable, and perfect for warm Indian climates.',
    'a0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000002',
    449900, 349900, 'KT-SAREE-INDIGO', 8, 2, 450, '5.5 Meters + 0.8M Blouse Piece',
    3, true, true, ARRAY['limited', 'hand-stitched'], ARRAY['kantha', 'saree', 'mulmul', 'indigo', 'cotton'],
    '100% Organic Mulmul Cotton', 'Gentle hand wash in cold water or dry clean.',
    '5208', 5.0, 'published'::public.product_status, NOW() - INTERVAL '3 days'
  ),
  -- 7. Jute Macrame Wall Hanging
  (
    'c0000000-0000-0000-0000-000000000007',
    'Bohemian Hand-Knotted Jute & Cotton Macrame Wall Tapestry',
    'bohemian-hand-knotted-jute-macrame-wall-tapestry',
    'Organic hand-knotted wall hanging crafted on untreated natural driftwood.',
    'Adds warmth and textural character to living rooms, bedrooms, or sacred prayer spaces. Knotted with 100% biodegradable golden jute fibers.',
    'a0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000002',
    109900, 79900, 'HC-MACRAME-01', 25, 4, 600, '40 x 75 cm',
    0, true, false, ARRAY['eco-friendly', 'decor'], ARRAY['macrame', 'jute', 'wall-hanging', 'boho', 'handmade'],
    'Golden Jute Cord, Natural Wood Dowel', 'Gently shake outdoors to remove dust.',
    '6304', 5.0, 'published'::public.product_status, NOW() - INTERVAL '2 days'
  ),
  -- 8. Wooden Jewellery Box
  (
    'c0000000-0000-0000-0000-000000000008',
    'Brass-Inlaid Hand-Carved Sheesham Wood Trinket Box',
    'brass-inlaid-hand-carved-sheesham-wood-trinket-box',
    'Sustainably sourced Indian Rosewood chest inlaid with polished floral brass work.',
    'Crafted with precision dovetail joints, plush velvet interior lining, and intricate brass wire inlay work (Tarkashi) that reflects Indian royal heritage.',
    'a0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    169900, 129900, 'HC-WOODBOX-01', 14, 3, 750, '15 x 10 x 6 cm',
    0, true, true, ARRAY['heritage', 'gift-favorite'], ARRAY['wood', 'brass', 'jewellery-box', 'sheesham', 'tarkashi'],
    'Indian Sheesham Wood, Brass Inlay, Velvet Lining', 'Wipe with a soft dry cloth. Keep away from direct water.',
    '4420', 12.0, 'published'::public.product_status, NOW() - INTERVAL '1 day'
  ),
  -- 9. Blue Pottery Vase
  (
    'c0000000-0000-0000-0000-000000000009',
    'Hand-Painted Jaipur Blue Pottery Floral Ceramic Vase',
    'hand-painted-jaipur-blue-pottery-floral-ceramic-vase',
    'Traditional quartz-based blue pottery vase painted by hand with cobalt oxide floral motifs.',
    'Distinctive Egyptian paste craft from Rajasthan that uses no clay; made from powdered quartz, glass, and natural gums. A timeless focal accent for mantlepieces and dining settings.',
    'a0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    159900, 119900, 'HC-BLUEPOT-01', 10, 2, 900, '12 x 12 x 20 cm',
    0, true, true, ARRAY['bestseller', 'craft-icon'], ARRAY['blue-pottery', 'jaipur', 'ceramic', 'vase', 'floral'],
    'Quartz Powder, Natural Gum, Cobalt & Copper Pigments', 'Clean gently with damp cloth. Not intended for holding water without an insert.',
    '6913', 12.0, 'published'::public.product_status, NOW()
  )
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    mrp_paise = EXCLUDED.mrp_paise,
    price_paise = EXCLUDED.price_paise,
    stock = EXCLUDED.stock,
    status = EXCLUDED.status;

-- 4. SEED PRODUCT IMAGES (At least 1 per product; primary flags set)
INSERT INTO public.product_images (product_id, image_url, alt_text, display_order, is_primary)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?auto=format&fit=crop&w=800&q=80', 'Festive Terracotta Diyas lit for prayer', 1, true),
  ('c0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80', 'Terracotta Diyas closeup details', 2, false),

  ('c0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=800&q=80', 'Traditional Indian Earthen Matka with Lid', 1, true),

  ('c0000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=800&q=80', 'Handcrafted Terracotta Elephant Statue', 1, true),

  ('c0000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', 'Blush Pink Chikankari Hand Embroidered Kurta', 1, true),

  ('c0000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80', 'Gold Zardozi Work Chanderi Silk Dupatta', 1, true),

  ('c0000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', 'Indigo Kantha Running Stitch Mulmul Saree', 1, true),

  ('c0000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80', 'Boho Hand Knotted Jute Macrame Tapestry', 1, true),

  ('c0000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80', 'Carved Sheesham Wood and Brass Jewellery Box', 1, true),

  ('c0000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80', 'Jaipur Blue Pottery Hand Painted Floral Vase', 1, true)
ON CONFLICT DO NOTHING;

-- 5. SEED PRODUCT VARIANTS (For apparel: S, M, L, XL)
INSERT INTO public.product_variants (product_id, title, sku, color_name, color_hex, size, stock)
VALUES
  ('c0000000-0000-0000-0000-000000000004', 'Size S / Blush Rose', 'CK-ROSE-S', 'Blush Rose', '#F4C2C2', 'S', 5),
  ('c0000000-0000-0000-0000-000000000004', 'Size M / Blush Rose', 'CK-ROSE-M', 'Blush Rose', '#F4C2C2', 'M', 8),
  ('c0000000-0000-0000-0000-000000000004', 'Size L / Blush Rose', 'CK-ROSE-L', 'Blush Rose', '#F4C2C2', 'L', 5),
  ('c0000000-0000-0000-0000-000000000004', 'Size XL / Blush Rose', 'CK-ROSE-XL', 'Blush Rose', '#F4C2C2', 'XL', 2)
ON CONFLICT (sku) DO NOTHING;

-- 6. SEED PRODUCT HIGHLIGHTS & SPECS
INSERT INTO public.product_highlights (product_id, icon_key, title, display_order)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'leaf', '100% Natural Riverbed Clay', 1),
  ('c0000000-0000-0000-0000-000000000001', 'sparkles', 'Hand-Painted with Eco Pigments', 2),
  ('c0000000-0000-0000-0000-000000000004', 'award', 'Authentic Lucknowi Chikankari', 1),
  ('c0000000-0000-0000-0000-000000000004', 'sparkles', '14+ Days of Hand Needlecraft', 2),
  ('c0000000-0000-0000-0000-000000000009', 'award', 'Certified Jaipur Blue Pottery', 1)
ON CONFLICT DO NOTHING;

INSERT INTO public.product_specs (product_id, key, value, display_order)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Artisan Origin', 'Gorakhpur, Uttar Pradesh', 1),
  ('c0000000-0000-0000-0000-000000000001', 'Firing Method', 'Traditional Wood Fired Kiln', 2),
  ('c0000000-0000-0000-0000-000000000004', 'Fabric', '100% Pure Cambric Cotton', 1),
  ('c0000000-0000-0000-0000-000000000004', 'Embroidery Type', 'Shadow Work, Bakhiya & Phanda Stitches', 2),
  ('c0000000-0000-0000-0000-000000000009', 'Craft Region', 'Jaipur, Rajasthan', 1)
ON CONFLICT DO NOTHING;

-- 7. SEED PINCODES (Major Indian shipping zones)
INSERT INTO public.pincodes (pincode, city, state, state_code, is_serviceable, is_cod_allowed, min_delivery_days, max_delivery_days, zone)
VALUES
  ('226001', 'Lucknow', 'Uttar Pradesh', '09', true, true, 2, 4, 'local'),
  ('273001', 'Gorakhpur', 'Uttar Pradesh', '09', true, true, 2, 3, 'local'),
  ('110001', 'New Delhi', 'Delhi', '07', true, true, 3, 5, 'metro'),
  ('201301', 'Noida', 'Uttar Pradesh', '09', true, true, 3, 5, 'metro'),
  ('400001', 'Mumbai', 'Maharashtra', '27', true, true, 4, 6, 'metro'),
  ('560001', 'Bengaluru', 'Karnataka', '29', true, true, 4, 6, 'metro'),
  ('700001', 'Kolkata', 'West Bengal', '19', true, true, 4, 7, 'metro'),
  ('600001', 'Chennai', 'Tamil Nadu', '33', true, true, 4, 7, 'metro'),
  ('302001', 'Jaipur', 'Rajasthan', '08', true, true, 3, 5, 'regional')
ON CONFLICT (pincode) DO UPDATE
SET city = EXCLUDED.city,
    is_serviceable = EXCLUDED.is_serviceable,
    is_cod_allowed = EXCLUDED.is_cod_allowed;

-- 8. SEED BANNERS & COLLECTIONS
INSERT INTO public.banners (title, subtitle, link_url, image_url, display_order, is_active)
VALUES
  (
    'Handmade Terracotta Magic',
    'Rooted in the earth, shaped by generational hands of Uttar Pradesh.',
    '/category.html?c=terracotta-clay',
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1600&q=80',
    1,
    true
  ),
  (
    'The Lucknowi Chikankari Collection',
    'Graceful, breathable summer silhouettes with timeless shadow needlework.',
    '/category.html?c=embroidered-clothing',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80',
    2,
    true
  )
ON CONFLICT DO NOTHING;

INSERT INTO public.collections (id, title, slug, description, image_url, display_order, is_active)
VALUES
  (
    'd0000000-0000-0000-0000-000000000001',
    'Artisan Workshop Specials',
    'artisan-workshop-specials',
    'Limited batch creations crafted straight from our family workshops in Gorakhpur and Lucknow.',
    'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=800&q=80',
    1,
    true
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    'Festive Light & Puja Accents',
    'festive-light-puja-accents',
    'Earthen diyas and brass pieces to illuminate your home for celebrations.',
    'https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?auto=format&fit=crop&w=800&q=80',
    2,
    true
  )
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description;
