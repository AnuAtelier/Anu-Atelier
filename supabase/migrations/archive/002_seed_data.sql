-- ==============================================================================
-- Anu Atelier - Initial Seed Data
-- 3 Categories, 9 Authentic Crafts, Site Settings & Coupons
-- ==============================================================================

-- 1. Insert Categories
INSERT INTO public.categories (id, name, slug, description, image_url, display_order)
VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Terracotta & Clay', 'terracotta-clay', 'Eco-friendly, hand-moulded earthenware created by traditional artisans.', 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80', 1),
  ('c2222222-2222-2222-2222-222222222222', 'Embroidered Clothing', 'embroidered-clothing', 'Heritage hand-embroidered Kurtis, Dupattas, and ethnic outfits.', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80', 2),
  ('c3333333-3333-3333-3333-333333333333', 'Handicrafts & Decor', 'handicrafts-decor', 'Intricate jute, brass, and macrame decor for vibrant Indian homes.', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80', 3)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url;

-- 2. Insert Initial 9 Products
INSERT INTO public.products (
  id, name, slug, category_id, category_name, subcategory_name,
  price, original_price, discount_percent, stock, badge, rating, reviews_count,
  images, description, materials, dimensions, care_instructions, artisan_notes,
  is_featured, is_active
)
VALUES
  (
    'p1111111-1111-1111-1111-111111111111',
    'Hand-Carved Terracotta Table Vase',
    'hand-carved-terracotta-table-vase',
    'c1111111-1111-1111-1111-111111111111',
    'Terracotta & Clay',
    'Vases & Pots',
    599, 899, 33, 15, 'Bestseller', 4.9, 128,
    ARRAY['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'],
    'Artisan-crafted baked clay vase etched with rustic motifs. Adds organic elegance to any shelf, console, or side table.',
    '100% Natural River Clay, Mineral Pigments',
    '8 inches Height x 4.5 inches Diameter',
    'Wipe gently with a dry cotton cloth. Do not soak in water.',
    'Hand-thrown on a traditional potter wheel by artisans in Gorakhpur, Uttar Pradesh.',
    TRUE, TRUE
  ),
  (
    'p2222222-2222-2222-2222-222222222222',
    'Festive Hand-Painted Diya Set (Pack of 6)',
    'festive-hand-painted-diya-set',
    'c1111111-1111-1111-1111-111111111111',
    'Terracotta & Clay',
    'Pooja & Diyas',
    249, 399, 38, 40, 'Popular', 4.8, 94,
    ARRAY['https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?auto=format&fit=crop&w=800&q=80'],
    'Set of 6 vibrantly hand-painted terracotta oil lamps. Perfect for Diwali, daily pooja, and welcoming good fortune into your home.',
    'Baked Red Clay, Acrylic Colors, Gold Foil Accents',
    '3 inches Diameter each',
    'Store in a dry box. Clean oil residue with gentle damp cloth.',
    'Crafted with auspicious motifs by rural women artisans.',
    TRUE, TRUE
  ),
  (
    'p3333333-3333-3333-3333-333333333333',
    'Rustic Hanging Terracotta Planter',
    'rustic-hanging-terracotta-planter',
    'c1111111-1111-1111-1111-111111111111',
    'Terracotta & Clay',
    'Planters & Garden',
    449, 649, 31, 20, 'New', 4.7, 56,
    ARRAY['https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80'],
    'Natural porous clay pot with durable braided jute rope. Promotes root aeration and brings a touch of nature into your balcony.',
    'Raw Terracotta Clay, Braided Natural Jute Rope',
    '6 inches Diameter, 24 inches hanging length',
    'Suitable for indoor & sheltered outdoor plants. Includes drainage hole.',
    'Porous nature allows optimal soil breathing.',
    FALSE, TRUE
  ),
  (
    'p4444444-4444-4444-4444-444444444444',
    'Chikankari Hand-Embroidered Cotton Kurti',
    'chikankari-hand-embroidered-cotton-kurti',
    'c2222222-2222-2222-2222-222222222222',
    'Embroidered Clothing',
    'Kurtis & Tops',
    1299, 1899, 32, 12, 'Bestseller', 5.0, 214,
    ARRAY['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'],
    'Pure breathable cotton kurti adorned with intricate shadow-work Chikankari embroidery. Effortlessly graceful for work and festivities.',
    '100% Breathable Malmal Cotton, Cotton Embroidery Thread',
    'Available in S, M, L, XL, XXL (Relaxed Straight Fit)',
    'Hand wash separately in cold water with mild detergent. Dry in shade.',
    'Each piece requires over 14 days of dedicated hand embroidery in Lucknow.',
    TRUE, TRUE
  ),
  (
    'p5555555-5555-5555-5555-555555555555',
    'Phulkari Silk Thread Dupatta',
    'phulkari-silk-thread-dupatta',
    'c2222222-2222-2222-2222-222222222222',
    'Embroidered Clothing',
    'Dupattas & Stoles',
    899, 1399, 36, 18, 'Popular', 4.9, 87,
    ARRAY['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'],
    'Geometric folk embroidery in vibrant silk floss threads on a soft chanderi base. Instantly elevates any simple suit or kurta.',
    'Chanderi Silk Blend, Pat (Untwisted Silk) Threads',
    '2.5 meters Length x 36 inches Width',
    'Dry clean recommended to preserve silk luster and embroidery.',
    'Traditional geometric darn-stitch patterns passed down through generations.',
    TRUE, TRUE
  ),
  (
    'p6666666-6666-6666-6666-666666666666',
    'Kantha Stitch Boho Cotton Jacket',
    'kantha-stitch-boho-cotton-jacket',
    'c2222222-2222-2222-2222-222222222222',
    'Embroidered Clothing',
    'Jackets & Overlays',
    1599, 2299, 30, 8, 'Trending', 4.8, 63,
    ARRAY['https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80'],
    'Reversible quilted cotton jacket layered with continuous running Kantha stitches. Unique bohemian aesthetic crafted from vintage textiles.',
    '100% Upcycled Pure Vintage Cotton, Cotton Thread',
    'Free Size (Fits Bust 34 to 42 inches), Length 26 inches',
    'Gentle cycle cold machine wash or hand wash. Iron on medium.',
    'Artisanal sustainable fashion made by Bengal craftswomen.',
    FALSE, TRUE
  ),
  (
    'p7777777-7777-7777-7777-777777777777',
    'Macrame Handwoven Boho Wall Hanging',
    'macrame-handwoven-boho-wall-hanging',
    'c3333333-3333-3333-3333-333333333333',
    'Handicrafts & Decor',
    'Wall Decor',
    799, 1199, 33, 25, 'Popular', 4.9, 102,
    ARRAY['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80'],
    'Intricately knotted bohemian wall tapestry mounted on polished natural driftwood. Brings cozy texture and warmth to your living space.',
    '100% Organic Natural Cotton Cord, Polished Teak Driftwood Rod',
    '18 inches Width x 30 inches Length',
    'Comb fringes gently with a wide-tooth comb. Dust regularly.',
    'Hand-knotted with over 1,200 individual square and lark head knots.',
    TRUE, TRUE
  ),
  (
    'p8888888-8888-8888-8888-888888888888',
    'Braided Eco Jute Storage Baskets (Set of 2)',
    'braided-eco-jute-storage-baskets',
    'c3333333-3333-3333-3333-333333333333',
    'Handicrafts & Decor',
    'Storage & Organizers',
    649, 999, 35, 30, 'Eco-Friendly', 4.8, 77,
    ARRAY['https://images.unsplash.com/photo-1595822369688-6612ec953d10?auto=format&fit=crop&w=800&q=80'],
    'Durable natural golden jute fiber hand-coiled into multifunctional organizers. Perfect for planters, blankets, or nursery storage.',
    '100% Golden Jute Fiber, Cotton Thread Stitching',
    'Large: 10x10 inches; Medium: 8x8 inches',
    'Spot clean with a damp sponge. Keep away from prolonged moisture.',
    'Hand-braided in West Bengal using sustainably harvested golden fiber.',
    FALSE, TRUE
  ),
  (
    'p9999999-9999-9999-9999-999999999999',
    'Handmade Brass Dhokra Dancing Figurine',
    'handmade-brass-dhokra-dancing-figurine',
    'c3333333-3333-3333-3333-333333333333',
    'Handicrafts & Decor',
    'Art Figurines',
    1199, 1699, 29, 10, 'Heritage', 4.9, 45,
    ARRAY['https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=800&q=80'],
    'Authentic lost-wax casting technique dating back 4,000 years. Striking tribal dancing figurine showcasing primitive elegance.',
    'Solid Bell Metal Brass Alloy',
    '7.5 inches Height x 3 inches Width x 2 inches Depth; Weight 480g',
    'Clean with soft dry cloth. Occasional brass polish restores luster.',
    'Cast by Bastar tribal artisans using ancient beeswax modeling technique.',
    TRUE, TRUE
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_name = EXCLUDED.category_name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  stock = EXCLUDED.stock,
  badge = EXCLUDED.badge,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  dimensions = EXCLUDED.dimensions,
  care_instructions = EXCLUDED.care_instructions,
  artisan_notes = EXCLUDED.artisan_notes;

-- 3. Insert Site Settings (Single Row with threshold = ₹100, WhatsApp = 9555562542, Email = anushka32199@gmail.com)
INSERT INTO public.site_settings (id, announcement_text, free_delivery_threshold, support_whatsapp, support_email)
VALUES (
  's1111111-1111-1111-1111-111111111111',
  '✨ Handcrafted with love in India | Free Delivery above ₹100!',
  100,
  '9555562542',
  'anushka32199@gmail.com'
)
ON CONFLICT (id) DO UPDATE SET
  free_delivery_threshold = EXCLUDED.free_delivery_threshold,
  support_whatsapp = EXCLUDED.support_whatsapp,
  support_email = EXCLUDED.support_email;

-- 4. Insert Promotional Coupons
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_amount, is_active)
VALUES
  ('ANU10', 'percent', 10, 200, TRUE),
  ('FIRST50', 'flat', 50, 250, TRUE)
ON CONFLICT (code) DO NOTHING;
