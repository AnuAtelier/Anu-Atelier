-- ==============================================================================
-- Anu Atelier - Phase B5: Fulfilment & Post-Purchase
-- Shipments & Courier Tracking, Return & Replacement Workflows,
-- Tax Invoices, Review System with Verified Buyer Badges, and Stats Triggers
-- ==============================================================================

-- 1. SHIPMENTS TABLE (Courier Events & Live Checkpoints)
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  courier_name TEXT NOT NULL, -- 'Blue Dart', 'Delhivery', 'India Post', 'DTDC'
  tracking_number TEXT NOT NULL,
  tracking_url TEXT,
  status TEXT NOT NULL DEFAULT 'manifested' CHECK (status IN ('manifested', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'rto', 'undelivered')),
  shipped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  events JSONB DEFAULT '[]'::jsonb, -- Array of { timestamp, location, status, note }
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipments_order ON public.shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON public.shipments(tracking_number);

DROP TRIGGER IF EXISTS trg_shipments_updated_at ON public.shipments;
CREATE TRIGGER trg_shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. RETURNS & RETURN ITEMS (10-day replacement & refund lifecycle)
CREATE TABLE IF NOT EXISTS public.returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.return_status NOT NULL DEFAULT 'requested'::public.return_status,
  resolution TEXT NOT NULL DEFAULT 'replacement' CHECK (resolution IN ('replacement', 'refund')),
  reason TEXT NOT NULL CHECK (reason IN ('damaged_in_transit', 'defective_craft', 'wrong_item_received', 'size_fit_issue', 'other')),
  notes TEXT,
  photos TEXT[] DEFAULT '{}', -- Saved in private 'return-media' bucket
  pickup_address JSONB,
  pickup_scheduled_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  inspected_at TIMESTAMPTZ,
  inspection_notes TEXT,
  restock_decision TEXT CHECK (restock_decision IS NULL OR restock_decision IN ('restock', 'damage_writeoff', 'repaired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_returns_order ON public.returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_user ON public.returns(user_id);

CREATE TABLE IF NOT EXISTS public.return_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id UUID NOT NULL REFERENCES public.returns(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE RESTRICT,
  quantity INT NOT NULL CHECK (quantity > 0)
);

CREATE INDEX IF NOT EXISTS idx_return_items_return ON public.return_items(return_id);

-- 3. INVOICES TABLE (Sequential GST Tax Invoices)
CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq START WITH 101;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'INV-2627-' || LPAD(nextval('public.invoice_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE RESTRICT,
  invoice_number TEXT NOT NULL UNIQUE,
  financial_year TEXT NOT NULL DEFAULT '2026-27',
  subtotal_paise BIGINT NOT NULL CHECK (subtotal_paise >= 0),
  discount_paise BIGINT NOT NULL DEFAULT 0 CHECK (discount_paise >= 0),
  taxable_amount_paise BIGINT NOT NULL CHECK (taxable_amount_paise >= 0),
  cgst_paise BIGINT NOT NULL DEFAULT 0 CHECK (cgst_paise >= 0),
  sgst_paise BIGINT NOT NULL DEFAULT 0 CHECK (sgst_paise >= 0),
  igst_paise BIGINT NOT NULL DEFAULT 0 CHECK (igst_paise >= 0),
  total_tax_paise BIGINT NOT NULL CHECK (total_tax_paise >= 0),
  grand_total_paise BIGINT NOT NULL CHECK (grand_total_paise >= 0),
  pdf_path TEXT, -- Saved in private 'invoices' storage bucket
  seller_snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_order ON public.invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices(invoice_number);

-- 4. REVIEWS & RATINGS SYSTEM (Verified Buyer Badges & Privacy Protection)
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL CHECK (length(title) >= 2 AND length(title) <= 100),
  body TEXT NOT NULL CHECK (length(body) >= 5 AND length(body) <= 2000),
  reviewer_display_name TEXT NOT NULL, -- e.g. 'Anushka S.' (Privacy protected)
  is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
  photos TEXT[] DEFAULT '{}',
  video_url TEXT,
  helpful_count INT NOT NULL DEFAULT 0 CHECK (helpful_count >= 0),
  report_count INT NOT NULL DEFAULT 0 CHECK (report_count >= 0),
  is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id, created_at DESC)
  WHERE is_hidden = FALSE;
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews(user_id);

CREATE TABLE IF NOT EXISTS public.review_helpful_votes (
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (review_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.review_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TRIGGERS FOR REVIEW AGGREGATION & AUTO-HIDE
CREATE OR REPLACE FUNCTION public.recalculate_product_ratings()
RETURNS TRIGGER AS $$
DECLARE
  v_prod_id UUID;
  v_avg NUMERIC(3, 2);
  v_count INT;
  v_1 INT; v_2 INT; v_3 INT; v_4 INT; v_5 INT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_prod_id := OLD.product_id;
  ELSE
    v_prod_id := NEW.product_id;
  END IF;

  SELECT
    COALESCE(ROUND(AVG(rating), 2), 0.00),
    COUNT(*),
    COUNT(*) FILTER (WHERE rating = 1),
    COUNT(*) FILTER (WHERE rating = 2),
    COUNT(*) FILTER (WHERE rating = 3),
    COUNT(*) FILTER (WHERE rating = 4),
    COUNT(*) FILTER (WHERE rating = 5)
  INTO v_avg, v_count, v_1, v_2, v_3, v_4, v_5
  FROM public.reviews
  WHERE product_id = v_prod_id AND is_hidden = FALSE;

  UPDATE public.product_stats
  SET average_rating = v_avg,
      reviews_count = v_count,
      ratings_count = v_count,
      rating_1_count = v_1,
      rating_2_count = v_2,
      rating_3_count = v_3,
      rating_4_count = v_4,
      rating_5_count = v_5,
      updated_at = NOW()
  WHERE product_id = v_prod_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS trg_recalculate_ratings ON public.reviews;
CREATE TRIGGER trg_recalculate_ratings
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_product_ratings();

-- Auto-hide reviews with 5+ reports
CREATE OR REPLACE FUNCTION public.handle_review_report()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.reviews
  SET report_count = report_count + 1,
      is_hidden = (CASE WHEN report_count + 1 >= 5 THEN TRUE ELSE is_hidden END)
  WHERE id = NEW.review_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS trg_review_reported ON public.review_reports;
CREATE TRIGGER trg_review_reported
  AFTER INSERT ON public.review_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_review_report();

-- 6. RPC: GET ORDER TRACKING (get_order_tracking)
CREATE OR REPLACE FUNCTION public.get_order_tracking(p_order_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_shipment RECORD;
  v_history JSONB;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found.', p_order_id;
  END IF;

  -- Security: User can only track their own order unless staff/admin
  IF auth.uid() IS NOT NULL AND auth.uid() <> v_order.user_id AND NOT public.is_staff_or_admin() THEN
    RAISE EXCEPTION 'Forbidden: You do not have permission to view tracking for this order.';
  END IF;

  SELECT * INTO v_shipment FROM public.shipments WHERE order_id = p_order_id ORDER BY created_at DESC LIMIT 1;

  SELECT COALESCE(json_agg(row_to_json(h_row) ORDER BY h_row.created_at ASC), '[]'::json)
  INTO v_history
  FROM (
    SELECT from_status, to_status, note, created_at
    FROM public.order_status_history
    WHERE order_id = p_order_id
  ) h_row;

  RETURN jsonb_build_object(
    'order_id', v_order.id,
    'order_number', v_order.order_number,
    'order_status', v_order.status,
    'payment_status', v_order.payment_status,
    'placed_at', v_order.placed_at,
    'courier_name', v_shipment.courier_name,
    'tracking_number', v_shipment.tracking_number,
    'tracking_url', v_shipment.tracking_url,
    'shipment_status', v_shipment.status,
    'shipped_at', v_shipment.shipped_at,
    'delivered_at', v_shipment.delivered_at,
    'checkpoints', COALESCE(v_shipment.events, '[]'::jsonb),
    'status_history', v_history
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '';

-- 7. RPC: SUBMIT REVIEW (submit_review)
CREATE OR REPLACE FUNCTION public.submit_review(
  p_product_id UUID,
  p_rating INT,
  p_title TEXT,
  p_body TEXT,
  p_photos TEXT[] DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_profile RECORD;
  v_display_name TEXT;
  v_first_name TEXT;
  v_last_initial TEXT;
  v_has_delivered_order BOOLEAN := FALSE;
  v_review_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to submit a craft review.';
  END IF;

  IF p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5 stars.';
  END IF;

  -- 1. Check verified purchase status (User must have a delivered order with this product)
  SELECT EXISTS (
    SELECT 1
    FROM public.orders o
    INNER JOIN public.order_items oi ON oi.order_id = o.id
    WHERE o.user_id = v_user_id
      AND oi.product_id = p_product_id
      AND o.status = 'delivered'::public.order_status
  ) INTO v_has_delivered_order;

  -- 2. Build Privacy-Preserving Display Name (e.g. "Anushka S.")
  SELECT * INTO v_profile FROM public.profiles WHERE id = v_user_id;
  IF v_profile.full_name IS NOT NULL AND trim(v_profile.full_name) <> '' THEN
    v_first_name := split_part(trim(v_profile.full_name), ' ', 1);
    v_last_initial := substring(split_part(trim(v_profile.full_name), ' ', 2), 1, 1);
    IF v_last_initial <> '' THEN
      v_display_name := v_first_name || ' ' || v_last_initial || '.';
    ELSE
      v_display_name := v_first_name;
    END IF;
  ELSE
    v_display_name := 'Artisan Patron';
  END IF;

  -- 3. Upsert Review (one review per user per product)
  INSERT INTO public.reviews (
    product_id, user_id, rating, title, body, reviewer_display_name,
    is_verified_purchase, photos
  )
  VALUES (
    p_product_id, v_user_id, p_rating, trim(p_title), trim(p_body),
    v_display_name, v_has_delivered_order, p_photos
  )
  ON CONFLICT (product_id, user_id) DO UPDATE
  SET rating = EXCLUDED.rating,
      title = EXCLUDED.title,
      body = EXCLUDED.body,
      photos = EXCLUDED.photos,
      updated_at = NOW()
  RETURNING id INTO v_review_id;

  RETURN jsonb_build_object(
    'success', true,
    'review_id', v_review_id,
    'is_verified_purchase', v_has_delivered_order,
    'reviewer_display_name', v_display_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 8. RPC: VOTE REVIEW HELPFUL (vote_review_helpful)
CREATE OR REPLACE FUNCTION public.vote_review_helpful(p_review_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_exists BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to vote.';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.review_helpful_votes
    WHERE review_id = p_review_id AND user_id = v_user_id
  ) INTO v_exists;

  IF v_exists THEN
    -- Toggle vote off
    DELETE FROM public.review_helpful_votes
    WHERE review_id = p_review_id AND user_id = v_user_id;

    UPDATE public.reviews
    SET helpful_count = GREATEST(0, helpful_count - 1)
    WHERE id = p_review_id;

    RETURN jsonb_build_object('success', true, 'voted', false);
  ELSE
    INSERT INTO public.review_helpful_votes (review_id, user_id)
    VALUES (p_review_id, v_user_id);

    UPDATE public.reviews
    SET helpful_count = helpful_count + 1
    WHERE id = p_review_id;

    RETURN jsonb_build_object('success', true, 'voted', true);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 9. RPC: REQUEST RETURN (request_return)
CREATE OR REPLACE FUNCTION public.request_return(
  p_order_id UUID,
  p_reason TEXT,
  p_resolution TEXT DEFAULT 'replacement',
  p_notes TEXT DEFAULT NULL,
  p_photos TEXT[] DEFAULT '{}',
  p_items JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_user_id UUID;
  v_return_id UUID;
  v_delivered_date TIMESTAMPTZ;
  v_window_days INT := 10;
  v_return_settings JSONB;
  v_item RECORD;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to request a return.';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found.', p_order_id;
  END IF;

  IF v_order.user_id <> v_user_id AND NOT public.is_staff_or_admin() THEN
    RAISE EXCEPTION 'Forbidden: You cannot request returns on someone else''s order.';
  END IF;

  IF v_order.status <> 'delivered'::public.order_status THEN
    RAISE EXCEPTION 'Returns can only be requested for orders that have been successfully delivered.';
  END IF;

  -- 1. Check Return Window (Default 10 days from delivery)
  SELECT value INTO v_return_settings FROM public.site_settings WHERE key = 'returns';
  IF v_return_settings IS NOT NULL THEN
    v_window_days := COALESCE((v_return_settings->>'window_days')::INT, 10);
  END IF;

  SELECT delivered_at INTO v_delivered_date FROM public.shipments WHERE order_id = p_order_id ORDER BY created_at DESC LIMIT 1;
  v_delivered_date := COALESCE(v_delivered_date, v_order.updated_at);

  IF v_delivered_date < (NOW() - (v_window_days || ' days')::INTERVAL) THEN
    RAISE EXCEPTION 'Return window expired. Returns must be requested within % days of delivery.', v_window_days;
  END IF;

  -- 2. Insert Return Record
  INSERT INTO public.returns (
    order_id, user_id, status, resolution, reason, notes, photos, pickup_address
  )
  VALUES (
    p_order_id, v_user_id, 'requested'::public.return_status, p_resolution, p_reason, p_notes, p_photos, v_order.shipping_address
  )
  RETURNING id INTO v_return_id;

  -- 3. Insert Return Items
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(order_item_id UUID, quantity INT)
  LOOP
    INSERT INTO public.return_items (return_id, order_item_id, quantity)
    VALUES (v_return_id, v_item.order_item_id, v_item.quantity);
  END LOOP;

  -- 4. Queue Notification Email
  INSERT INTO public.email_outbox (
    recipient_email, recipient_name, subject, template_name, template_data, dedupe_key
  )
  VALUES (
    v_order.customer_email,
    v_order.customer_name,
    'Return Request Received - ' || v_order.order_number || ' | Anu Atelier',
    'return_requested',
    jsonb_build_object(
      'order_number', v_order.order_number,
      'return_id', v_return_id,
      'resolution', p_resolution,
      'reason', p_reason
    ),
    'return_req_' || v_return_id
  );

  RETURN jsonb_build_object('success', true, 'return_id', v_return_id, 'status', 'requested');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 10. RPC: ADMIN UPDATE SHIPMENT & AUTO-GENERATE INVOICE (admin_update_shipment)
CREATE OR REPLACE FUNCTION public.admin_update_shipment(
  p_order_id UUID,
  p_courier_name TEXT,
  p_tracking_number TEXT,
  p_tracking_url TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'shipped'
)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_shipment_id UUID;
  v_invoice_num TEXT;
  v_seller JSONB;
  v_tax_settings JSONB;
  v_origin_state TEXT := '09'; -- Uttar Pradesh
  v_dest_state TEXT;
  v_taxable BIGINT;
  v_cgst BIGINT := 0;
  v_sgst BIGINT := 0;
  v_igst BIGINT := 0;
BEGIN
  -- Staff or Admin only
  IF NOT public.is_staff_or_admin() AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Forbidden: Only staff or administrators can update shipments.';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found.', p_order_id;
  END IF;

  -- 1. Insert or update shipment
  INSERT INTO public.shipments (
    order_id, courier_name, tracking_number, tracking_url, status, shipped_at
  )
  VALUES (
    p_order_id, p_courier_name, p_tracking_number, p_tracking_url, p_status, NOW()
  )
  RETURNING id INTO v_shipment_id;

  -- 2. Update order status to shipped
  UPDATE public.orders
  SET status = (CASE WHEN p_status = 'delivered' THEN 'delivered'::public.order_status ELSE 'shipped'::public.order_status END),
      updated_at = NOW()
  WHERE id = p_order_id;

  -- 3. Automatic Tax Invoice Generation (if not already generated)
  IF NOT EXISTS (SELECT 1 FROM public.invoices WHERE order_id = p_order_id) THEN
    SELECT value INTO v_tax_settings FROM public.site_settings WHERE key = 'tax';
    IF v_tax_settings IS NOT NULL THEN
      v_origin_state := COALESCE(v_tax_settings->>'origin_state_code', '09');
    END IF;

    v_dest_state := COALESCE(v_order.shipping_address->>'state_code', '09');
    v_taxable := v_order.subtotal_sale_paise - v_order.total_tax_paise;

    -- GST Logic: Intra-state (UP to UP) = CGST (2.5%) + SGST (2.5%); Inter-state = IGST (5%)
    IF v_dest_state = v_origin_state THEN
      v_cgst := v_order.total_tax_paise / 2;
      v_sgst := v_order.total_tax_paise - v_cgst; -- Avoid fractional rounding
    ELSE
      v_igst := v_order.total_tax_paise;
    END IF;

    v_invoice_num := public.generate_invoice_number();

    v_seller := jsonb_build_object(
      'legal_name', 'Anu Atelier Crafts LLP',
      'address', 'Gorakhpur, Uttar Pradesh, India - 273001',
      'state_code', v_origin_state,
      'gstin', COALESCE(v_tax_settings->>'gstin', '09AAAAA0000A1Z5'),
      'grievance_officer', 'support@anuatelier.com'
    );

    INSERT INTO public.invoices (
      order_id, invoice_number, financial_year, subtotal_paise, discount_paise,
      taxable_amount_paise, cgst_paise, sgst_paise, igst_paise, total_tax_paise,
      grand_total_paise, seller_snapshot
    )
    VALUES (
      p_order_id, v_invoice_num, '2026-27', v_order.subtotal_sale_paise, v_order.coupon_discount_paise,
      v_taxable, v_cgst, v_sgst, v_igst, v_order.total_tax_paise,
      v_order.total_paise, v_seller
    );
  END IF;

  -- 4. Queue Shipping Email
  INSERT INTO public.email_outbox (
    recipient_email, recipient_name, subject, template_name, template_data, dedupe_key
  )
  VALUES (
    v_order.customer_email,
    v_order.customer_name,
    'Your Craft Order Has Shipped! - ' || v_order.order_number || ' | Anu Atelier',
    'order_shipped',
    jsonb_build_object(
      'order_number', v_order.order_number,
      'courier_name', p_courier_name,
      'tracking_number', p_tracking_number,
      'tracking_url', p_tracking_url
    ),
    'order_shipped_' || v_order.order_number
  );

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'shipment_id', v_shipment_id,
    'status', 'shipped'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 11. ROW-LEVEL SECURITY (RLS) POLICIES FOR B5 TABLES
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_helpful_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;

-- 11.1 Shipments Policies
DROP POLICY IF EXISTS "shipments_own_read" ON public.shipments;
CREATE POLICY "shipments_own_read" ON public.shipments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_staff_or_admin()))
  );

DROP POLICY IF EXISTS "shipments_manage_staff_admin" ON public.shipments;
CREATE POLICY "shipments_manage_staff_admin" ON public.shipments
  FOR ALL USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

-- 11.2 Returns Policies
DROP POLICY IF EXISTS "returns_own_manage" ON public.returns;
CREATE POLICY "returns_own_manage" ON public.returns
  FOR ALL USING (auth.uid() = user_id OR public.is_staff_or_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_staff_or_admin());

DROP POLICY IF EXISTS "return_items_own_read" ON public.return_items;
CREATE POLICY "return_items_own_read" ON public.return_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.returns r WHERE r.id = return_id AND (r.user_id = auth.uid() OR public.is_staff_or_admin()))
  );

-- 11.3 Invoices Policies (Private - Own or Admin only)
DROP POLICY IF EXISTS "invoices_own_read" ON public.invoices;
CREATE POLICY "invoices_own_read" ON public.invoices
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_staff_or_admin()))
  );

DROP POLICY IF EXISTS "invoices_manage_admin_service" ON public.invoices;
CREATE POLICY "invoices_manage_admin_service" ON public.invoices
  FOR ALL USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

-- 11.4 Reviews Policies
DROP POLICY IF EXISTS "reviews_select_public" ON public.reviews;
CREATE POLICY "reviews_select_public" ON public.reviews
  FOR SELECT USING (is_hidden = FALSE OR auth.uid() = user_id OR public.is_staff_or_admin());

DROP POLICY IF EXISTS "reviews_own_insert_update" ON public.reviews;
CREATE POLICY "reviews_own_insert_update" ON public.reviews
  FOR ALL USING (auth.uid() = user_id OR public.is_staff_or_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_staff_or_admin());

-- 11.5 Helpful Votes & Reports
DROP POLICY IF EXISTS "helpful_votes_own_manage" ON public.review_helpful_votes;
CREATE POLICY "helpful_votes_own_manage" ON public.review_helpful_votes
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "review_reports_auth_insert" ON public.review_reports;
CREATE POLICY "review_reports_auth_insert" ON public.review_reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "review_reports_admin_read" ON public.review_reports;
CREATE POLICY "review_reports_admin_read" ON public.review_reports
  FOR SELECT USING (public.is_staff_or_admin());
