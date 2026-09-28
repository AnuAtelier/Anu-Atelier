-- ==============================================================================
-- Anu Atelier - Phase B2: Catalog & Discovery
-- Categories, Artisans, Products, Variants, Media, Highlights, Specs, Offers,
-- Pincodes, Banners, Collections, Slug Redirects, and High-Performance RPCs
-- ==============================================================================

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_order ON public.categories(display_order);

DROP TRIGGER IF EXISTS trg_categories_updated_at ON public.categories;
CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. ARTISANS TABLE ("About the artisan" authenticity feature)
CREATE TABLE IF NOT EXISTS public.artisans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  photo_url TEXT,
  location TEXT NOT NULL, -- e.g., 'Gorakhpur, Uttar Pradesh'
  craft_speciality TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artisans_slug ON public.artisans(slug);

DROP TRIGGER IF EXISTS trg_artisans_updated_at ON public.artisans;
CREATE TRIGGER trg_artisans_updated_at
  BEFORE UPDATE ON public.artisans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3. PRODUCTS TABLE (All money amounts strictly BIGINT paise)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  artisan_id UUID REFERENCES public.artisans(id) ON DELETE SET NULL,
  mrp_paise BIGINT NOT NULL CHECK (mrp_paise > 0),
  price_paise BIGINT NOT NULL CHECK (price_paise > 0 AND price_paise <= mrp_paise),
  sku TEXT UNIQUE,
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  low_stock_threshold INT NOT NULL DEFAULT 3 CHECK (low_stock_threshold >= 0),
  weight_grams INT CHECK (weight_grams IS NULL OR weight_grams > 0),
  dimensions_cm TEXT, -- e.g. '18 x 18 x 22 cm'
  handmade_lead_days INT NOT NULL DEFAULT 0 CHECK (handmade_lead_days >= 0),
  cod_allowed BOOLEAN NOT NULL DEFAULT TRUE,
  is_free_delivery BOOLEAN NOT NULL DEFAULT FALSE,
  delivery_days_override INT CHECK (delivery_days_override IS NULL OR delivery_days_override > 0),
  is_returnable BOOLEAN NOT NULL DEFAULT TRUE,
  replacement_days_override INT CHECK (replacement_days_override IS NULL OR replacement_days_override >= 0),
  badges TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  materials TEXT,
  care_instructions TEXT,
  hsn_code TEXT NOT NULL DEFAULT '6912',
  gst_rate_percent NUMERIC(4, 2) NOT NULL DEFAULT 5.0 CHECK (gst_rate_percent >= 0),
  country_of_origin TEXT NOT NULL DEFAULT 'India',
  meta_title TEXT,
  meta_description TEXT,
  status public.product_status NOT NULL DEFAULT 'draft'::public.product_status,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Search and filter indices
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status_category ON public.products(status, category_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price_paise);
CREATE INDEX IF NOT EXISTS idx_products_published_at ON public.products(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_tags ON public.products USING GIN(tags);

-- Full-text search index (Title, Tags, Description)
CREATE INDEX IF NOT EXISTS idx_products_fts ON public.products USING GIN (
  to_tsvector('english', coalesce(title, '') || ' ' || array_to_string(tags, ' ') || ' ' || coalesce(description, ''))
);

-- Trigram index for fuzzy typo tolerance
CREATE INDEX IF NOT EXISTS idx_products_trgm_title ON public.products USING GIST (title gist_trgm_ops);

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. SLUG REDIRECTS TABLE (Ensures old URLs permanently 301/resolve)
CREATE TABLE IF NOT EXISTS public.slug_redirects (
  old_slug TEXT PRIMARY KEY,
  new_slug TEXT NOT NULL,
  entity_type TEXT NOT NULL DEFAULT 'product',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to record slug changes automatically
CREATE OR REPLACE FUNCTION public.handle_slug_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.slug IS DISTINCT FROM NEW.slug THEN
    INSERT INTO public.slug_redirects (old_slug, new_slug, entity_type)
    VALUES (OLD.slug, NEW.slug, 'product')
    ON CONFLICT (old_slug) DO UPDATE
    SET new_slug = EXCLUDED.new_slug,
        created_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS trg_product_slug_change ON public.products;
CREATE TRIGGER trg_product_slug_change
  AFTER UPDATE OF slug ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_slug_change();

-- 5. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id, display_order);

-- 6. PRODUCT VARIANTS TABLE
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  title TEXT NOT NULL, -- e.g. 'Standard' or 'Size M / Mustard Yellow'
  sku TEXT UNIQUE,
  color_name TEXT,
  color_hex TEXT,
  size TEXT,
  price_paise_override BIGINT CHECK (price_paise_override IS NULL OR price_paise_override > 0),
  mrp_paise_override BIGINT CHECK (mrp_paise_override IS NULL OR mrp_paise_override > 0),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);

-- 7. PRODUCT HIGHLIGHTS & SPECS TABLES
CREATE TABLE IF NOT EXISTS public.product_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  icon_key TEXT NOT NULL, -- 'leaf', 'sparkles', 'shield', 'flame', 'award'
  title TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_highlights_product ON public.product_highlights(product_id, display_order);

CREATE TABLE IF NOT EXISTS public.product_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  key TEXT NOT NULL, -- e.g. 'Material', 'Craft Technique', 'Region'
  value TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_specs_product ON public.product_specs(product_id, display_order);

-- 8. PRODUCT OFFERS TABLE (Deals with start and real end times)
CREATE TABLE IF NOT EXISTS public.product_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sale_price_paise BIGINT NOT NULL CHECK (sale_price_paise > 0),
  label TEXT NOT NULL, -- e.g. 'Festive Offer', 'Artisan Week'
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offers_product_active ON public.product_offers(product_id, is_active, ends_at);

-- 9. PRODUCT STATS TABLE (Maintained via triggers, real numbers only)
CREATE TABLE IF NOT EXISTS public.product_stats (
  product_id UUID PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
  average_rating NUMERIC(3, 2) NOT NULL DEFAULT 0.00 CHECK (average_rating >= 0 AND average_rating <= 5),
  reviews_count INT NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),
  ratings_count INT NOT NULL DEFAULT 0 CHECK (ratings_count >= 0),
  rating_1_count INT NOT NULL DEFAULT 0 CHECK (rating_1_count >= 0),
  rating_2_count INT NOT NULL DEFAULT 0 CHECK (rating_2_count >= 0),
  rating_3_count INT NOT NULL DEFAULT 0 CHECK (rating_3_count >= 0),
  rating_4_count INT NOT NULL DEFAULT 0 CHECK (rating_4_count >= 0),
  rating_5_count INT NOT NULL DEFAULT 0 CHECK (rating_5_count >= 0),
  bought_count INT NOT NULL DEFAULT 0 CHECK (bought_count >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to initialize product_stats row on product insert
CREATE OR REPLACE FUNCTION public.handle_new_product_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.product_stats (product_id)
  VALUES (NEW.id)
  ON CONFLICT (product_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS trg_new_product_stats ON public.products;
CREATE TRIGGER trg_new_product_stats
  AFTER INSERT ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_product_stats();

-- 10. PINCODES TABLE (Indian Postal Code Serviceability & COD)
CREATE TABLE IF NOT EXISTS public.pincodes (
  pincode TEXT PRIMARY KEY CHECK (pincode ~ '^[1-9][0-9]{5}$'),
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  state_code TEXT NOT NULL, -- e.g. '09' for UP, '07' for DL
  is_serviceable BOOLEAN NOT NULL DEFAULT TRUE,
  is_cod_allowed BOOLEAN NOT NULL DEFAULT TRUE,
  min_delivery_days INT NOT NULL DEFAULT 3 CHECK (min_delivery_days >= 1),
  max_delivery_days INT NOT NULL DEFAULT 7 CHECK (max_delivery_days >= min_delivery_days),
  zone TEXT NOT NULL DEFAULT 'standard', -- 'local', 'regional', 'metro', 'national'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pincodes_serviceable ON public.pincodes(is_serviceable, is_cod_allowed);

-- 11. BANNERS & COLLECTIONS TABLES
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  link_url TEXT,
  image_url TEXT NOT NULL,
  mobile_image_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_banners_active_order ON public.banners(is_active, display_order);

CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.collection_products (
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  display_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (collection_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_collection_products_order ON public.collection_products(collection_id, display_order);

-- 12. PUBLISH / UNPUBLISH / ARCHIVE FUNCTIONS (search_path = '' enforced)

CREATE OR REPLACE FUNCTION public.publish_product(p_product_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_prod RECORD;
  v_image_count INT;
BEGIN
  -- Security check: Staff or Admin only
  IF NOT public.is_staff_or_admin() AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Forbidden: Only staff or administrators can publish products.';
  END IF;

  SELECT * INTO v_prod FROM public.products WHERE id = p_product_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product with ID % not found.', p_product_id;
  END IF;

  -- Rule 1: Must have price > 0 and price <= mrp
  IF v_prod.price_paise <= 0 OR v_prod.price_paise > v_prod.mrp_paise THEN
    RAISE EXCEPTION 'Publish rule failed: Product price must be greater than 0 and less than or equal to MRP.';
  END IF;

  -- Rule 2: Must have at least 1 image
  SELECT COUNT(*) INTO v_image_count FROM public.product_images WHERE product_id = p_product_id;
  IF v_image_count = 0 THEN
    RAISE EXCEPTION 'Publish rule failed: Product must have at least one uploaded image before publishing.';
  END IF;

  -- Update status
  UPDATE public.products
  SET status = 'published'::public.product_status,
      published_at = COALESCE(published_at, NOW()),
      updated_at = NOW()
  WHERE id = p_product_id;

  RETURN jsonb_build_object('success', true, 'status', 'published', 'product_id', p_product_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.unpublish_product(p_product_id UUID)
RETURNS JSONB AS $$
BEGIN
  IF NOT public.is_staff_or_admin() AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Forbidden: Only staff or administrators can unpublish products.';
  END IF;

  UPDATE public.products
  SET status = 'draft'::public.product_status,
      updated_at = NOW()
  WHERE id = p_product_id;

  RETURN jsonb_build_object('success', true, 'status', 'draft', 'product_id', p_product_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.archive_product(p_product_id UUID)
RETURNS JSONB AS $$
BEGIN
  IF NOT public.is_staff_or_admin() AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Forbidden: Only staff or administrators can archive products.';
  END IF;

  UPDATE public.products
  SET status = 'archived'::public.product_status,
      updated_at = NOW()
  WHERE id = p_product_id;

  RETURN jsonb_build_object('success', true, 'status', 'archived', 'product_id', p_product_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 13. CLIENT-SAFE DISCOVERY RPCs (search_path = '' enforced)

-- 13.1 list_products
CREATE OR REPLACE FUNCTION public.list_products(
  p_category_slug TEXT DEFAULT NULL,
  p_min_price_paise BIGINT DEFAULT NULL,
  p_max_price_paise BIGINT DEFAULT NULL,
  p_in_stock BOOLEAN DEFAULT NULL,
  p_sort TEXT DEFAULT 'newest',
  p_cursor_published_at TIMESTAMPTZ DEFAULT NULL,
  p_cursor_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  short_description TEXT,
  category_name TEXT,
  category_slug TEXT,
  artisan_name TEXT,
  artisan_location TEXT,
  mrp_paise BIGINT,
  price_paise BIGINT,
  primary_image_url TEXT,
  stock INT,
  is_free_delivery BOOLEAN,
  cod_allowed BOOLEAN,
  badges TEXT[],
  tags TEXT[],
  average_rating NUMERIC(3, 2),
  reviews_count INT,
  active_offer_label TEXT,
  active_offer_sale_price_paise BIGINT,
  published_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.slug,
    p.short_description,
    c.name AS category_name,
    c.slug AS category_slug,
    a.name AS artisan_name,
    a.location AS artisan_location,
    p.mrp_paise,
    p.price_paise,
    COALESCE(
      (SELECT img.image_url FROM public.product_images img WHERE img.product_id = p.id AND img.is_primary LIMIT 1),
      (SELECT img.image_url FROM public.product_images img WHERE img.product_id = p.id ORDER BY img.display_order ASC LIMIT 1)
    ) AS primary_image_url,
    p.stock,
    p.is_free_delivery,
    p.cod_allowed,
    p.badges,
    p.tags,
    COALESCE(ps.average_rating, 0.00) AS average_rating,
    COALESCE(ps.reviews_count, 0) AS reviews_count,
    po.label AS active_offer_label,
    po.sale_price_paise AS active_offer_sale_price_paise,
    p.published_at
  FROM public.products p
  INNER JOIN public.categories c ON c.id = p.category_id AND c.is_active = TRUE
  LEFT JOIN public.artisans a ON a.id = p.artisan_id AND a.is_active = TRUE
  LEFT JOIN public.product_stats ps ON ps.product_id = p.id
  LEFT JOIN LATERAL (
    SELECT o.label, o.sale_price_paise
    FROM public.product_offers o
    WHERE o.product_id = p.id
      AND o.is_active = TRUE
      AND o.starts_at <= NOW()
      AND o.ends_at > NOW()
    ORDER BY o.sale_price_paise ASC
    LIMIT 1
  ) po ON TRUE
  WHERE p.status = 'published'::public.product_status
    AND (p_category_slug IS NULL OR c.slug = p_category_slug)
    AND (p_min_price_paise IS NULL OR p.price_paise >= p_min_price_paise)
    AND (p_max_price_paise IS NULL OR p.price_paise <= p_max_price_paise)
    AND (p_in_stock IS NULL OR (p_in_stock = TRUE AND p.stock > 0))
    AND (
      p_cursor_published_at IS NULL OR
      (p.published_at < p_cursor_published_at) OR
      (p.published_at = p_cursor_published_at AND p.id < p_cursor_id)
    )
  ORDER BY
    CASE WHEN p_sort = 'price_asc' THEN p.price_paise END ASC,
    CASE WHEN p_sort = 'price_desc' THEN p.price_paise END DESC,
    CASE WHEN p_sort = 'rating' THEN COALESCE(ps.average_rating, 0) END DESC,
    CASE WHEN p_sort = 'popularity' THEN COALESCE(ps.bought_count, 0) END DESC,
    p.published_at DESC,
    p.id DESC
  LIMIT LEAST(p_limit, 50);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '';

-- 13.2 search_products (Weighted FTS + Trigram Typo Tolerance)
CREATE OR REPLACE FUNCTION public.search_products(
  p_query TEXT,
  p_category_slug TEXT DEFAULT NULL,
  p_sort TEXT DEFAULT 'relevance',
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  short_description TEXT,
  category_name TEXT,
  mrp_paise BIGINT,
  price_paise BIGINT,
  primary_image_url TEXT,
  stock INT,
  average_rating NUMERIC(3, 2),
  reviews_count INT,
  match_rank REAL
) AS $$
DECLARE
  v_cleaned TEXT;
BEGIN
  v_cleaned := trim(p_query);
  IF v_cleaned = '' THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.slug,
    p.short_description,
    c.name AS category_name,
    p.mrp_paise,
    p.price_paise,
    COALESCE(
      (SELECT img.image_url FROM public.product_images img WHERE img.product_id = p.id AND img.is_primary LIMIT 1),
      (SELECT img.image_url FROM public.product_images img WHERE img.product_id = p.id ORDER BY img.display_order ASC LIMIT 1)
    ) AS primary_image_url,
    p.stock,
    COALESCE(ps.average_rating, 0.00) AS average_rating,
    COALESCE(ps.reviews_count, 0) AS reviews_count,
    (
      -- Title weight A (1.0), Tags weight B (0.4), Description weight C (0.2)
      ts_rank(
        setweight(to_tsvector('english', coalesce(p.title, '')), 'A') ||
        setweight(to_tsvector('english', array_to_string(p.tags, ' ')), 'B') ||
        setweight(to_tsvector('english', coalesce(p.description, '')), 'C'),
        plainto_tsquery('english', v_cleaned)
      ) +
      -- Trigram similarity score for typo tolerance
      (similarity(p.title, v_cleaned) * 0.5)
    )::REAL AS match_rank
  FROM public.products p
  INNER JOIN public.categories c ON c.id = p.category_id AND c.is_active = TRUE
  LEFT JOIN public.product_stats ps ON ps.product_id = p.id
  WHERE p.status = 'published'::public.product_status
    AND (p_category_slug IS NULL OR c.slug = p_category_slug)
    AND (
      to_tsvector('english', coalesce(p.title, '') || ' ' || array_to_string(p.tags, ' ') || ' ' || coalesce(p.description, '')) @@ plainto_tsquery('english', v_cleaned)
      OR p.title % v_cleaned
      OR p.tags && ARRAY[lower(v_cleaned)]
    )
  ORDER BY
    CASE WHEN p_sort = 'price_asc' THEN p.price_paise END ASC,
    CASE WHEN p_sort = 'price_desc' THEN p.price_paise END DESC,
    match_rank DESC,
    p.published_at DESC
  LIMIT LEAST(p_limit, 50)
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '';

-- 13.3 search_suggestions (Typeahead for search overlay)
CREATE OR REPLACE FUNCTION public.search_suggestions(
  p_prefix TEXT,
  p_limit INT DEFAULT 6
)
RETURNS TABLE (
  title TEXT,
  slug TEXT,
  category_name TEXT,
  image_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.title,
    p.slug,
    c.name AS category_name,
    COALESCE(
      (SELECT img.image_url FROM public.product_images img WHERE img.product_id = p.id AND img.is_primary LIMIT 1),
      (SELECT img.image_url FROM public.product_images img WHERE img.product_id = p.id ORDER BY img.display_order ASC LIMIT 1)
    ) AS image_url
  FROM public.products p
  INNER JOIN public.categories c ON c.id = p.category_id AND c.is_active = TRUE
  WHERE p.status = 'published'::public.product_status
    AND (
      p.title ILIKE p_prefix || '%'
      OR p.title % p_prefix
      OR EXISTS (SELECT 1 FROM unnest(p.tags) t WHERE t ILIKE p_prefix || '%')
    )
  ORDER BY
    CASE WHEN p.title ILIKE p_prefix || '%' THEN 0 ELSE 1 END,
    p.published_at DESC
  LIMIT LEAST(p_limit, 10);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '';

-- 13.4 get_product_detail (Single round-trip with all nested components)
CREATE OR REPLACE FUNCTION public.get_product_detail(p_slug_or_id TEXT)
RETURNS JSONB AS $$
DECLARE
  v_prod_id UUID;
  v_target_slug TEXT;
  v_redirect TEXT;
  v_result JSONB;
BEGIN
  -- 1. Check if slug matches redirect table
  SELECT new_slug INTO v_redirect FROM public.slug_redirects WHERE old_slug = p_slug_or_id;
  IF v_redirect IS NOT NULL THEN
    v_target_slug := v_redirect;
  ELSE
    v_target_slug := p_slug_or_id;
  END IF;

  -- 2. Find product by slug or UUID
  SELECT id INTO v_prod_id
  FROM public.products
  WHERE (slug = v_target_slug OR (p_slug_or_id ~ '^[0-9a-fA-F-]{36}$' AND id = p_slug_or_id::UUID))
    AND (status = 'published'::public.product_status OR public.is_staff_or_admin());

  IF v_prod_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- 3. Construct rich unified response JSON
  SELECT jsonb_build_object(
    'product', (
      SELECT row_to_json(p_row) FROM (
        SELECT
          p.id,
          p.title,
          p.slug,
          p.short_description,
          p.description,
          p.mrp_paise,
          p.price_paise,
          p.sku,
          p.stock,
          p.weight_grams,
          p.dimensions_cm,
          p.handmade_lead_days,
          p.cod_allowed,
          p.is_free_delivery,
          p.delivery_days_override,
          p.is_returnable,
          p.replacement_days_override,
          p.badges,
          p.tags,
          p.materials,
          p.care_instructions,
          p.country_of_origin,
          p.status,
          p.published_at,
          c.name AS category_name,
          c.slug AS category_slug,
          a.name AS artisan_name,
          a.bio AS artisan_bio,
          a.photo_url AS artisan_photo_url,
          a.location AS artisan_location,
          a.craft_speciality AS artisan_craft_speciality
        FROM public.products p
        INNER JOIN public.categories c ON c.id = p.category_id
        LEFT JOIN public.artisans a ON a.id = p.artisan_id
        WHERE p.id = v_prod_id
      ) p_row
    ),
    'images', (
      SELECT COALESCE(json_agg(row_to_json(i_row) ORDER BY i_row.display_order ASC), '[]'::json)
      FROM (
        SELECT id, image_url, alt_text, display_order, is_primary
        FROM public.product_images
        WHERE product_id = v_prod_id
      ) i_row
    ),
    'variants', (
      SELECT COALESCE(json_agg(row_to_json(v_row) ORDER BY v_row.created_at ASC), '[]'::json)
      FROM (
        SELECT id, title, sku, color_name, color_hex, size, price_paise_override, mrp_paise_override, stock, image_url
        FROM public.product_variants
        WHERE product_id = v_prod_id AND is_active = TRUE
      ) v_row
    ),
    'highlights', (
      SELECT COALESCE(json_agg(row_to_json(h_row) ORDER BY h_row.display_order ASC), '[]'::json)
      FROM (
        SELECT id, icon_key, title
        FROM public.product_highlights
        WHERE product_id = v_prod_id
      ) h_row
    ),
    'specs', (
      SELECT COALESCE(json_agg(row_to_json(s_row) ORDER BY s_row.display_order ASC), '[]'::json)
      FROM (
        SELECT id, key, value
        FROM public.product_specs
        WHERE product_id = v_prod_id
      ) s_row
    ),
    'stats', (
      SELECT row_to_json(st_row)
      FROM (
        SELECT average_rating, reviews_count, ratings_count, rating_1_count, rating_2_count, rating_3_count, rating_4_count, rating_5_count, bought_count
        FROM public.product_stats
        WHERE product_id = v_prod_id
      ) st_row
    ),
    'active_offer', (
      SELECT row_to_json(off_row)
      FROM (
        SELECT id, sale_price_paise, label, starts_at, ends_at
        FROM public.product_offers
        WHERE product_id = v_prod_id
          AND is_active = TRUE
          AND starts_at <= NOW()
          AND ends_at > NOW()
        ORDER BY sale_price_paise ASC
        LIMIT 1
      ) off_row
    ),
    'related_products', (
      SELECT COALESCE(json_agg(row_to_json(rel_row)), '[]'::json)
      FROM (
        SELECT
          rp.id,
          rp.title,
          rp.slug,
          rp.mrp_paise,
          rp.price_paise,
          COALESCE(
            (SELECT img.image_url FROM public.product_images img WHERE img.product_id = rp.id AND img.is_primary LIMIT 1),
            (SELECT img.image_url FROM public.product_images img WHERE img.product_id = rp.id ORDER BY img.display_order ASC LIMIT 1)
          ) AS primary_image_url,
          rps.average_rating,
          rps.reviews_count
        FROM public.products rp
        LEFT JOIN public.product_stats rps ON rps.product_id = rp.id
        WHERE rp.status = 'published'::public.product_status
          AND rp.id <> v_prod_id
          AND rp.category_id = (SELECT category_id FROM public.products WHERE id = v_prod_id)
        LIMIT 4
      ) rel_row
    ),
    'redirect_from', (CASE WHEN v_redirect IS NOT NULL THEN p_slug_or_id ELSE NULL END)
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '';

-- 13.5 get_home_feed (Banners, featured collections, bestsellers, fresh arrivals)
CREATE OR REPLACE FUNCTION public.get_home_feed()
RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object(
    'banners', (
      SELECT COALESCE(json_agg(row_to_json(b_row) ORDER BY b_row.display_order ASC), '[]'::json)
      FROM (
        SELECT id, title, subtitle, link_url, image_url, mobile_image_url
        FROM public.banners
        WHERE is_active = TRUE
          AND (starts_at IS NULL OR starts_at <= NOW())
          AND (ends_at IS NULL OR ends_at > NOW())
      ) b_row
    ),
    'categories', (
      SELECT COALESCE(json_agg(row_to_json(c_row) ORDER BY c_row.display_order ASC), '[]'::json)
      FROM (
        SELECT id, name, slug, description, image_url
        FROM public.categories
        WHERE is_active = TRUE
      ) c_row
    ),
    'collections', (
      SELECT COALESCE(json_agg(row_to_json(col_row) ORDER BY col_row.display_order ASC), '[]'::json)
      FROM (
        SELECT id, title, slug, description, image_url
        FROM public.collections
        WHERE is_active = TRUE
      ) col_row
    ),
    'fresh_arrivals', (
      SELECT COALESCE(json_agg(row_to_json(f_row)), '[]'::json)
      FROM (
        SELECT
          p.id,
          p.title,
          p.slug,
          p.mrp_paise,
          p.price_paise,
          COALESCE(
            (SELECT img.image_url FROM public.product_images img WHERE img.product_id = p.id AND img.is_primary LIMIT 1),
            (SELECT img.image_url FROM public.product_images img WHERE img.product_id = p.id ORDER BY img.display_order ASC LIMIT 1)
          ) AS primary_image_url,
          p.badges,
          ps.average_rating,
          ps.reviews_count
        FROM public.products p
        LEFT JOIN public.product_stats ps ON ps.product_id = p.id
        WHERE p.status = 'published'::public.product_status
        ORDER BY p.published_at DESC
        LIMIT 6
      ) f_row
    ),
    'bestsellers', (
      SELECT COALESCE(json_agg(row_to_json(bs_row)), '[]'::json)
      FROM (
        SELECT
          p.id,
          p.title,
          p.slug,
          p.mrp_paise,
          p.price_paise,
          COALESCE(
            (SELECT img.image_url FROM public.product_images img WHERE img.product_id = p.id AND img.is_primary LIMIT 1),
            (SELECT img.image_url FROM public.product_images img WHERE img.product_id = p.id ORDER BY img.display_order ASC LIMIT 1)
          ) AS primary_image_url,
          p.badges,
          ps.average_rating,
          ps.reviews_count,
          ps.bought_count
        FROM public.products p
        LEFT JOIN public.product_stats ps ON ps.product_id = p.id
        WHERE p.status = 'published'::public.product_status
        ORDER BY COALESCE(ps.bought_count, 0) DESC, COALESCE(ps.average_rating, 0) DESC
        LIMIT 6
      ) bs_row
    )
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '';

-- 13.6 check_pincode (Serviceability, COD, and estimated delivery days)
CREATE OR REPLACE FUNCTION public.check_pincode(
  p_pincode TEXT,
  p_product_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_pin RECORD;
  v_prod_lead INT := 0;
  v_prod_cod BOOLEAN := TRUE;
  v_min_days INT;
  v_max_days INT;
BEGIN
  -- Clean input
  p_pincode := trim(p_pincode);

  IF p_pincode !~ '^[1-9][0-9]{5}$' THEN
    RETURN jsonb_build_object(
      'is_serviceable', false,
      'error', 'Invalid Indian 6-digit PIN code format.'
    );
  END IF;

  SELECT * INTO v_pin FROM public.pincodes WHERE pincode = p_pincode;

  IF NOT FOUND THEN
    -- By default in India, unknown pincodes fall back to standard courier serviceability check
    RETURN jsonb_build_object(
      'pincode', p_pincode,
      'is_serviceable', true,
      'is_cod_allowed', true,
      'city', 'Standard Delivery Zone',
      'state', 'India',
      'estimated_delivery_days', '5 - 8 days',
      'min_days', 5,
      'max_days', 8
    );
  END IF;

  IF NOT v_pin.is_serviceable THEN
    RETURN jsonb_build_object(
      'pincode', p_pincode,
      'is_serviceable', false,
      'message', 'Delivery is currently not available to this PIN code.'
    );
  END IF;

  -- If product specified, check handmade lead time and COD override
  IF p_product_id IS NOT NULL THEN
    SELECT handmade_lead_days, cod_allowed
    INTO v_prod_lead, v_prod_cod
    FROM public.products
    WHERE id = p_product_id;
  END IF;

  v_min_days := v_pin.min_delivery_days + COALESCE(v_prod_lead, 0);
  v_max_days := v_pin.max_delivery_days + COALESCE(v_prod_lead, 0);

  RETURN jsonb_build_object(
    'pincode', p_pincode,
    'is_serviceable', true,
    'is_cod_allowed', (v_pin.is_cod_allowed AND COALESCE(v_prod_cod, true)),
    'city', v_pin.city,
    'state', v_pin.state,
    'state_code', v_pin.state_code,
    'estimated_delivery_days', v_min_days || ' - ' || v_max_days || ' business days',
    'min_days', v_min_days,
    'max_days', v_max_days
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '';

-- 14. ROW LEVEL SECURITY (RLS) FOR CATALOG TABLES
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slug_redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pincodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_products ENABLE ROW LEVEL SECURITY;

-- 14.1 Categories Policies
DROP POLICY IF EXISTS "categories_select_public" ON public.categories;
CREATE POLICY "categories_select_public" ON public.categories
  FOR SELECT USING (is_active = TRUE OR public.is_staff_or_admin());

DROP POLICY IF EXISTS "categories_manage_staff_admin" ON public.categories;
CREATE POLICY "categories_manage_staff_admin" ON public.categories
  FOR ALL USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

-- 14.2 Artisans Policies
DROP POLICY IF EXISTS "artisans_select_public" ON public.artisans;
CREATE POLICY "artisans_select_public" ON public.artisans
  FOR SELECT USING (is_active = TRUE OR public.is_staff_or_admin());

DROP POLICY IF EXISTS "artisans_manage_staff_admin" ON public.artisans;
CREATE POLICY "artisans_manage_staff_admin" ON public.artisans
  FOR ALL USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

-- 14.3 Products Policies (Anonymous can ONLY see published items)
DROP POLICY IF EXISTS "products_select_published_or_staff" ON public.products;
CREATE POLICY "products_select_published_or_staff" ON public.products
  FOR SELECT USING (status = 'published'::public.product_status OR public.is_staff_or_admin());

DROP POLICY IF EXISTS "products_manage_staff_admin" ON public.products;
CREATE POLICY "products_manage_staff_admin" ON public.products
  FOR ALL USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

-- 14.4 Product Images, Variants, Highlights, Specs, Offers, Stats
DROP POLICY IF EXISTS "product_images_select_public" ON public.product_images;
CREATE POLICY "product_images_select_public" ON public.product_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND (p.status = 'published'::public.product_status OR public.is_staff_or_admin()))
  );

DROP POLICY IF EXISTS "product_images_manage_staff_admin" ON public.product_images;
CREATE POLICY "product_images_manage_staff_admin" ON public.product_images
  FOR ALL USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

DROP POLICY IF EXISTS "variants_select_public" ON public.product_variants;
CREATE POLICY "variants_select_public" ON public.product_variants
  FOR SELECT USING (
    is_active = TRUE AND EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND (p.status = 'published'::public.product_status OR public.is_staff_or_admin()))
  );

DROP POLICY IF EXISTS "variants_manage_staff_admin" ON public.product_variants;
CREATE POLICY "variants_manage_staff_admin" ON public.product_variants
  FOR ALL USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

DROP POLICY IF EXISTS "highlights_select_public" ON public.product_highlights;
CREATE POLICY "highlights_select_public" ON public.product_highlights
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "highlights_manage_staff_admin" ON public.product_highlights;
CREATE POLICY "highlights_manage_staff_admin" ON public.product_highlights
  FOR ALL USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

DROP POLICY IF EXISTS "specs_select_public" ON public.product_specs;
CREATE POLICY "specs_select_public" ON public.product_specs
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "specs_manage_staff_admin" ON public.product_specs;
CREATE POLICY "specs_manage_staff_admin" ON public.product_specs
  FOR ALL USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

DROP POLICY IF EXISTS "offers_select_public" ON public.product_offers;
CREATE POLICY "offers_select_public" ON public.product_offers
  FOR SELECT USING (is_active = TRUE OR public.is_staff_or_admin());

DROP POLICY IF EXISTS "offers_manage_staff_admin" ON public.product_offers;
CREATE POLICY "offers_manage_staff_admin" ON public.product_offers
  FOR ALL USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

DROP POLICY IF EXISTS "stats_select_public" ON public.product_stats;
CREATE POLICY "stats_select_public" ON public.product_stats
  FOR SELECT USING (TRUE);

-- Stats updates handled exclusively by triggers and internal RPCs
DROP POLICY IF EXISTS "stats_write_service_role" ON public.product_stats;
CREATE POLICY "stats_write_service_role" ON public.product_stats
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 14.5 Pincodes Policies (Public read for checkout address checks)
DROP POLICY IF EXISTS "pincodes_select_public" ON public.pincodes;
CREATE POLICY "pincodes_select_public" ON public.pincodes
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "pincodes_manage_admin" ON public.pincodes;
CREATE POLICY "pincodes_manage_admin" ON public.pincodes
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 14.6 Banners & Collections Policies
DROP POLICY IF EXISTS "banners_select_public" ON public.banners;
CREATE POLICY "banners_select_public" ON public.banners
  FOR SELECT USING (is_active = TRUE OR public.is_staff_or_admin());

DROP POLICY IF EXISTS "banners_manage_staff_admin" ON public.banners;
CREATE POLICY "banners_manage_staff_admin" ON public.banners
  FOR ALL USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

DROP POLICY IF EXISTS "collections_select_public" ON public.collections;
CREATE POLICY "collections_select_public" ON public.collections
  FOR SELECT USING (is_active = TRUE OR public.is_staff_or_admin());

DROP POLICY IF EXISTS "collections_manage_staff_admin" ON public.collections;
CREATE POLICY "collections_manage_staff_admin" ON public.collections
  FOR ALL USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

DROP POLICY IF EXISTS "collection_products_select_public" ON public.collection_products;
CREATE POLICY "collection_products_select_public" ON public.collection_products
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "collection_products_manage_staff_admin" ON public.collection_products;
CREATE POLICY "collection_products_manage_staff_admin" ON public.collection_products
  FOR ALL USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

-- 14.7 Slug Redirects Policies
DROP POLICY IF EXISTS "slug_redirects_select_public" ON public.slug_redirects;
CREATE POLICY "slug_redirects_select_public" ON public.slug_redirects
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "slug_redirects_manage_staff_admin" ON public.slug_redirects;
CREATE POLICY "slug_redirects_manage_staff_admin" ON public.slug_redirects
  FOR ALL USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());
