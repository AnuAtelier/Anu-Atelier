-- ==============================================================================
-- Anu Atelier - Phase B3: Cart to Order (COD First)
-- Addresses, Carts, Wishlists, Coupons, Atomic calculate_totals,
-- Concurrency-Safe place_order, Inventory Ledger, Order Cancellation, Outbox
-- ==============================================================================

-- 1. ADDRESSES TABLE (Customer Shipping & Billing Addresses)
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL CHECK (phone ~ '^(\+91)?[6-9][0-9]{9}$'),
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  landmark TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  state_code TEXT NOT NULL, -- e.g. '09' for Uttar Pradesh
  pincode TEXT NOT NULL CHECK (pincode ~ '^[1-9][0-9]{5}$'),
  address_type TEXT NOT NULL DEFAULT 'home' CHECK (address_type IN ('home', 'work', 'other')),
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses(user_id);

-- Enforce exactly one default address per user
CREATE OR REPLACE FUNCTION public.handle_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    UPDATE public.addresses
    SET is_default = FALSE
    WHERE user_id = NEW.user_id AND id <> NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS trg_default_address ON public.addresses;
CREATE TRIGGER trg_default_address
  BEFORE INSERT OR UPDATE OF is_default ON public.addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_default_address();

-- Enforce maximum 10 addresses per user
CREATE OR REPLACE FUNCTION public.check_max_addresses()
RETURNS TRIGGER AS $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.addresses WHERE user_id = NEW.user_id;
  IF v_count >= 10 THEN
    RAISE EXCEPTION 'Address limit reached: Maximum 10 saved addresses permitted per account.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS trg_max_addresses ON public.addresses;
CREATE TRIGGER trg_max_addresses
  BEFORE INSERT ON public.addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.check_max_addresses();

-- 2. CARTS & CART ITEMS (Server-side persistent cart for authenticated users)
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0 AND quantity <= 10),
  personalization_note TEXT CHECK (personalization_note IS NULL OR length(personalization_note) <= 250),
  is_gift BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cart_id, product_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON public.cart_items(cart_id);

-- 3. WISHLISTS & BACK IN STOCK REQUESTS
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlists_user ON public.wishlists(user_id);

CREATE TABLE IF NOT EXISTS public.back_in_stock_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'notified')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. COUPONS & REDEMPTIONS (All amounts strictly integer paise)
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'flat', 'free_delivery')),
  discount_value_paise BIGINT NOT NULL CHECK (discount_value_paise >= 0),
  max_discount_paise BIGINT CHECK (max_discount_paise IS NULL OR max_discount_paise > 0),
  min_order_paise BIGINT NOT NULL DEFAULT 0 CHECK (min_order_paise >= 0),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  usage_limit_total INT CHECK (usage_limit_total IS NULL OR usage_limit_total > 0),
  usage_limit_per_user INT NOT NULL DEFAULT 1 CHECK (usage_limit_per_user > 0),
  used_count INT NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  is_first_order_only BOOLEAN NOT NULL DEFAULT FALSE,
  scope TEXT NOT NULL DEFAULT 'all' CHECK (scope IN ('all', 'category', 'product')),
  scope_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);

-- Seed Initial Promotional Coupons
INSERT INTO public.coupons (
  code, description, discount_type, discount_value_paise, max_discount_paise,
  min_order_paise, starts_at, expires_at, usage_limit_per_user, is_first_order_only, is_active
)
VALUES
  (
    'WELCOME10',
    '10% off on your first handcrafted order up to ₹250',
    'percent', 10, 25000, 49900, NOW() - INTERVAL '1 day', NOW() + INTERVAL '365 days',
    1, true, true
  ),
  (
    'FESTIVE200',
    'Flat ₹200 off on festive craft orders above ₹1,499',
    'flat', 20000, NULL, 149900, NOW() - INTERVAL '1 day', NOW() + INTERVAL '365 days',
    2, false, true
  ),
  (
    'FREESHIP',
    'Free delivery on any handcrafted order',
    'free_delivery', 0, NULL, 0, NOW() - INTERVAL '1 day', NOW() + INTERVAL '365 days',
    5, false, true
  )
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE RESTRICT,
  order_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  discount_applied_paise BIGINT NOT NULL CHECK (discount_applied_paise >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (order_id, coupon_id)
);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user ON public.coupon_redemptions(coupon_id, user_id);

-- 5. ORDER NUMBER SEQUENCE & GENERATOR
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START WITH 101;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'AA-26-' || LPAD(nextval('public.order_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 6. ORDERS TABLE (All money amounts strictly BIGINT paise)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  idempotency_key TEXT UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status public.order_status NOT NULL DEFAULT 'pending'::public.order_status,
  payment_status public.payment_status NOT NULL DEFAULT 'pending'::public.payment_status,
  payment_method public.payment_method NOT NULL,
  subtotal_mrp_paise BIGINT NOT NULL CHECK (subtotal_mrp_paise >= 0),
  subtotal_sale_paise BIGINT NOT NULL CHECK (subtotal_sale_paise >= 0),
  discount_paise BIGINT NOT NULL DEFAULT 0 CHECK (discount_paise >= 0),
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
  coupon_code TEXT,
  coupon_discount_paise BIGINT NOT NULL DEFAULT 0 CHECK (coupon_discount_paise >= 0),
  delivery_fee_paise BIGINT NOT NULL DEFAULT 0 CHECK (delivery_fee_paise >= 0),
  cod_fee_paise BIGINT NOT NULL DEFAULT 0 CHECK (cod_fee_paise >= 0),
  gift_wrap_fee_paise BIGINT NOT NULL DEFAULT 0 CHECK (gift_wrap_fee_paise >= 0),
  total_tax_paise BIGINT NOT NULL DEFAULT 0 CHECK (total_tax_paise >= 0),
  total_paise BIGINT NOT NULL CHECK (total_paise >= 0),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  is_gift BOOLEAN NOT NULL DEFAULT FALSE,
  gift_message TEXT,
  payment_expires_at TIMESTAMPTZ,
  attribution JSONB DEFAULT '{}'::jsonb,
  placed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_placed_at ON public.orders(placed_at DESC);

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 7. ORDER ITEMS TABLE (Immutable snapshot of purchased crafts)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_title TEXT NOT NULL,
  variant_title TEXT,
  sku TEXT,
  image_url TEXT,
  hsn_code TEXT NOT NULL DEFAULT '6912',
  gst_rate_percent NUMERIC(4, 2) NOT NULL DEFAULT 5.0,
  mrp_paise BIGINT NOT NULL CHECK (mrp_paise > 0),
  unit_price_paise BIGINT NOT NULL CHECK (unit_price_paise > 0),
  quantity INT NOT NULL CHECK (quantity > 0),
  discount_paise BIGINT NOT NULL DEFAULT 0 CHECK (discount_paise >= 0),
  line_total_paise BIGINT NOT NULL CHECK (line_total_paise >= 0),
  tax_paise BIGINT NOT NULL DEFAULT 0 CHECK (tax_paise >= 0),
  personalization_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- 8. ORDER STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  from_status public.order_status,
  to_status public.order_status NOT NULL,
  note TEXT,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON public.order_status_history(order_id, created_at ASC);

-- 9. INVENTORY LEDGER TABLE (Immutable audit trail of all stock movements)
CREATE TABLE IF NOT EXISTS public.inventory_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  delta INT NOT NULL,
  balance_after INT NOT NULL CHECK (balance_after >= 0),
  transaction_type public.stock_transaction_type NOT NULL,
  reference_id TEXT,
  notes TEXT,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_ledger_product ON public.inventory_ledger(product_id, created_at DESC);

-- 10. EMAIL OUTBOX TABLE (Transactional Outbox Pattern)
CREATE TABLE IF NOT EXISTS public.email_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  template_name TEXT NOT NULL,
  template_data JSONB NOT NULL,
  status public.email_status NOT NULL DEFAULT 'pending'::public.email_status,
  dedupe_key TEXT UNIQUE,
  attempts INT NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_outbox_pending ON public.email_outbox(status, created_at ASC)
  WHERE status = 'pending';

-- 11. PRICING & TOTALS CALCULATION RPC (Single Source of Truth)
CREATE OR REPLACE FUNCTION public.calculate_totals(
  p_items JSONB,
  p_coupon_code TEXT DEFAULT NULL,
  p_pincode TEXT DEFAULT NULL,
  p_payment_method TEXT DEFAULT 'cod',
  p_is_gift BOOLEAN DEFAULT FALSE,
  p_user_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_item RECORD;
  v_prod RECORD;
  v_var RECORD;
  v_offer RECORD;
  v_unit_price BIGINT;
  v_line_mrp BIGINT;
  v_line_sale BIGINT;
  v_total_mrp BIGINT := 0;
  v_total_sale BIGINT := 0;
  v_item_count INT := 0;
  v_items_array JSONB := '[]'::jsonb;
  v_all_free_delivery BOOLEAN := TRUE;
  v_coupon RECORD;
  v_coupon_discount BIGINT := 0;
  v_coupon_code_upper TEXT := NULL;
  v_coupon_applied BOOLEAN := FALSE;
  v_coupon_error TEXT := NULL;
  v_delivery_fee BIGINT := 6000; -- ₹60 default
  v_free_delivery_threshold BIGINT := 99900; -- ₹999 default
  v_cod_enabled BOOLEAN := TRUE;
  v_cod_max BIGINT := 500000; -- ₹5,000 default
  v_cod_fee BIGINT := 0;
  v_gift_wrap_fee BIGINT := 0;
  v_discounted_subtotal BIGINT;
  v_grand_total BIGINT;
  v_tax_breakup BIGINT := 0;
  v_shipping_settings JSONB;
  v_cod_settings JSONB;
  v_coupon_usage_count INT;
  v_order_count INT;
BEGIN
  -- 1. Load store settings
  SELECT value INTO v_shipping_settings FROM public.site_settings WHERE key = 'shipping';
  IF v_shipping_settings IS NOT NULL THEN
    v_delivery_fee := COALESCE((v_shipping_settings->>'standard_delivery_fee_paise')::BIGINT, 6000);
    v_free_delivery_threshold := COALESCE((v_shipping_settings->>'free_delivery_threshold_paise')::BIGINT, 99900);
  END IF;

  SELECT value INTO v_cod_settings FROM public.site_settings WHERE key = 'cod';
  IF v_cod_settings IS NOT NULL THEN
    v_cod_enabled := COALESCE((v_cod_settings->>'enabled')::BOOLEAN, TRUE);
    v_cod_max := COALESCE((v_cod_settings->>'max_amount_paise')::BIGINT, 500000);
    v_cod_fee := COALESCE((v_cod_settings->>'fee_paise')::BIGINT, 0);
  END IF;

  IF p_is_gift THEN
    v_gift_wrap_fee := 5000; -- ₹50 gift packaging fee
  END IF;

  -- 2. Reprice each item from DB
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
    product_id UUID,
    variant_id UUID,
    quantity INT,
    personalization_note TEXT
  )
  LOOP
    IF v_item.quantity <= 0 THEN
      CONTINUE;
    END IF;

    SELECT * INTO v_prod FROM public.products WHERE id = v_item.product_id;
    IF NOT FOUND OR v_prod.status <> 'published' THEN
      RAISE EXCEPTION 'Item not available or no longer published: %', v_item.product_id;
    END IF;

    v_unit_price := v_prod.price_paise;

    -- Check active product offer
    SELECT * INTO v_offer
    FROM public.product_offers
    WHERE product_id = v_prod.id
      AND is_active = TRUE
      AND starts_at <= NOW()
      AND ends_at > NOW()
    ORDER BY sale_price_paise ASC
    LIMIT 1;

    IF FOUND AND v_offer.sale_price_paise < v_unit_price THEN
      v_unit_price := v_offer.sale_price_paise;
    END IF;

    -- Variant override
    IF v_item.variant_id IS NOT NULL THEN
      SELECT * INTO v_var FROM public.product_variants WHERE id = v_item.variant_id AND product_id = v_prod.id;
      IF FOUND AND v_var.price_paise_override IS NOT NULL THEN
        v_unit_price := v_var.price_paise_override;
      END IF;
    END IF;

    IF NOT v_prod.is_free_delivery THEN
      v_all_free_delivery := FALSE;
    END IF;

    v_line_mrp := v_prod.mrp_paise * v_item.quantity;
    v_line_sale := v_unit_price * v_item.quantity;

    v_total_mrp := v_total_mrp + v_line_mrp;
    v_total_sale := v_total_sale + v_line_sale;
    v_item_count := v_item_count + v_item.quantity;

    -- Append priced item
    v_items_array := v_items_array || jsonb_build_object(
      'product_id', v_prod.id,
      'variant_id', v_item.variant_id,
      'title', v_prod.title,
      'sku', COALESCE(v_var.sku, v_prod.sku),
      'quantity', v_item.quantity,
      'mrp_paise', v_prod.mrp_paise,
      'unit_price_paise', v_unit_price,
      'line_total_paise', v_line_sale,
      'hsn_code', v_prod.hsn_code,
      'gst_rate_percent', v_prod.gst_rate_percent,
      'is_free_delivery', v_prod.is_free_delivery
    );
  END LOOP;

  IF v_item_count = 0 THEN
    RETURN jsonb_build_object('error', 'Cart contains no items.');
  END IF;

  -- 3. Evaluate Coupon
  IF p_coupon_code IS NOT NULL AND trim(p_coupon_code) <> '' THEN
    v_coupon_code_upper := upper(trim(p_coupon_code));
    SELECT * INTO v_coupon FROM public.coupons WHERE code = v_coupon_code_upper;

    IF NOT FOUND THEN
      v_coupon_error := 'Invalid coupon code.';
    ELSIF NOT v_coupon.is_active THEN
      v_coupon_error := 'This coupon is no longer active.';
    ELSIF v_coupon.starts_at > NOW() OR v_coupon.expires_at <= NOW() THEN
      v_coupon_error := 'This coupon has expired.';
    ELSIF v_total_sale < v_coupon.min_order_paise THEN
      v_coupon_error := 'Minimum order of ₹' || (v_coupon.min_order_paise / 100) || ' required for this coupon.';
    ELSIF v_coupon.usage_limit_total IS NOT NULL AND v_coupon.used_count >= v_coupon.usage_limit_total THEN
      v_coupon_error := 'This coupon usage limit has been reached.';
    ELSE
      -- Check per-user limit
      IF p_user_id IS NOT NULL THEN
        SELECT COUNT(*) INTO v_coupon_usage_count
        FROM public.coupon_redemptions
        WHERE coupon_id = v_coupon.id AND user_id = p_user_id;

        IF v_coupon_usage_count >= v_coupon.usage_limit_per_user THEN
          v_coupon_error := 'You have already used this coupon.';
        END IF;

        IF v_coupon.is_first_order_only THEN
          SELECT COUNT(*) INTO v_order_count
          FROM public.orders
          WHERE user_id = p_user_id AND status NOT IN ('cancelled'::public.order_status);

          IF v_order_count > 0 THEN
            v_coupon_error := 'This coupon is valid only for first-time orders.';
          END IF;
        END IF;
      END IF;

      IF v_coupon_error IS NULL THEN
        v_coupon_applied := TRUE;
        IF v_coupon.discount_type = 'percent' THEN
          v_coupon_discount := (v_total_sale * v_coupon.discount_value_paise) / 100;
          IF v_coupon.max_discount_paise IS NOT NULL AND v_coupon_discount > v_coupon.max_discount_paise THEN
            v_coupon_discount := v_coupon.max_discount_paise;
          END IF;
        ELSIF v_coupon.discount_type = 'flat' THEN
          v_coupon_discount := LEAST(v_coupon.discount_value_paise, v_total_sale);
        ELSIF v_coupon.discount_type = 'free_delivery' THEN
          v_delivery_fee := 0;
        END IF;
      END IF;
    END IF;
  END IF;

  v_discounted_subtotal := v_total_sale - v_coupon_discount;

  -- 4. Delivery Fee Evaluation
  IF v_all_free_delivery OR v_discounted_subtotal >= v_free_delivery_threshold OR (v_coupon_applied AND v_coupon.discount_type = 'free_delivery') THEN
    v_delivery_fee := 0;
  END IF;

  -- 5. COD Validation
  IF p_payment_method = 'cod' THEN
    IF NOT v_cod_enabled THEN
      RETURN jsonb_build_object('error', 'Cash on Delivery is currently disabled.');
    END IF;
    IF (v_discounted_subtotal + v_delivery_fee) > v_cod_max THEN
      RETURN jsonb_build_object('error', 'Cash on Delivery is only available for orders up to ₹' || (v_cod_max / 100));
    END IF;
  ELSE
    v_cod_fee := 0;
  END IF;

  -- 6. Tax extraction (GST included in prices)
  -- Approx 5% inclusive tax: Tax = Subtotal - (Subtotal / 1.05)
  v_tax_breakup := v_discounted_subtotal - (v_discounted_subtotal * 100 / 105);

  -- 7. Grand Total
  v_grand_total := v_discounted_subtotal + v_delivery_fee + v_cod_fee + v_gift_wrap_fee;

  RETURN jsonb_build_object(
    'items', v_items_array,
    'item_count', v_item_count,
    'subtotal_mrp_paise', v_total_mrp,
    'subtotal_sale_paise', v_total_sale,
    'product_discount_paise', (v_total_mrp - v_total_sale),
    'coupon_code', (CASE WHEN v_coupon_applied THEN v_coupon_code_upper ELSE NULL END),
    'coupon_id', (CASE WHEN v_coupon_applied THEN v_coupon.id ELSE NULL END),
    'coupon_discount_paise', v_coupon_discount,
    'coupon_error', v_coupon_error,
    'delivery_fee_paise', v_delivery_fee,
    'cod_fee_paise', v_cod_fee,
    'gift_wrap_fee_paise', v_gift_wrap_fee,
    'total_tax_paise', v_tax_breakup,
    'grand_total_paise', v_grand_total,
    'savings_paise', ((v_total_mrp - v_total_sale) + v_coupon_discount),
    'free_delivery_progress', jsonb_build_object(
      'threshold_paise', v_free_delivery_threshold,
      'needed_paise', GREATEST(0, v_free_delivery_threshold - v_discounted_subtotal),
      'is_free', (v_delivery_fee = 0)
    )
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '';

-- 12. ATOMIC ORDER PLACEMENT RPC (place_order)
CREATE OR REPLACE FUNCTION public.place_order(
  p_payload JSONB,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_existing_order RECORD;
  v_totals JSONB;
  v_order_id UUID;
  v_order_number TEXT;
  v_item RECORD;
  v_prod RECORD;
  v_var RECORD;
  v_new_stock INT;
  v_order_status public.order_status;
  v_payment_status public.payment_status;
  v_payment_method public.payment_method;
  v_expires_at TIMESTAMPTZ := NULL;
  v_shipping_addr JSONB;
  v_customer_name TEXT;
  v_customer_email TEXT;
  v_customer_phone TEXT;
BEGIN
  v_user_id := auth.uid();

  -- 1. Idempotency Check
  IF p_idempotency_key IS NOT NULL THEN
    SELECT * INTO v_existing_order FROM public.orders WHERE idempotency_key = p_idempotency_key;
    IF FOUND THEN
      RETURN jsonb_build_object(
        'success', true,
        'order_id', v_existing_order.id,
        'order_number', v_existing_order.order_number,
        'status', v_existing_order.status,
        'payment_status', v_existing_order.payment_status,
        'total_paise', v_existing_order.total_paise,
        'is_duplicate', true
      );
    END IF;
  END IF;

  -- 2. Extract Customer & Address Data
  v_shipping_addr := p_payload->'shipping_address';
  IF v_shipping_addr IS NULL THEN
    RAISE EXCEPTION 'Missing shipping_address in order payload.';
  END IF;

  v_customer_name := COALESCE(p_payload->>'customer_name', v_shipping_addr->>'full_name');
  v_customer_email := COALESCE(p_payload->>'customer_email', '');
  v_customer_phone := COALESCE(p_payload->>'customer_phone', v_shipping_addr->>'phone');

  IF v_customer_name = '' OR v_customer_email = '' OR v_customer_phone = '' THEN
    RAISE EXCEPTION 'Customer name, email, and phone number are strictly required.';
  END IF;

  v_payment_method := (p_payload->>'payment_method')::public.payment_method;

  -- 3. Concurrency Lock: Lock products and variants FOR UPDATE
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_payload->'items') AS x(
    product_id UUID,
    variant_id UUID,
    quantity INT
  )
  LOOP
    SELECT * INTO v_prod FROM public.products WHERE id = v_item.product_id FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not found.', v_item.product_id;
    END IF;

    IF v_item.variant_id IS NOT NULL THEN
      SELECT * INTO v_var FROM public.product_variants WHERE id = v_item.variant_id FOR UPDATE;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'Variant % not found.', v_item.variant_id;
      END IF;
      IF v_var.stock < v_item.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for % (Variant: %). Available: %', v_prod.title, v_var.title, v_var.stock;
      END IF;
    ELSE
      IF v_prod.stock < v_item.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for %. Available: %', v_prod.title, v_prod.stock;
      END IF;
    END IF;
  END LOOP;

  -- 4. Calculate Authoritative Totals (Server is single source of truth)
  v_totals := public.calculate_totals(
    p_payload->'items',
    p_payload->>'coupon_code',
    v_shipping_addr->>'pincode',
    v_payment_method::TEXT,
    COALESCE((p_payload->>'is_gift')::BOOLEAN, FALSE),
    v_user_id
  );

  IF v_totals->>'error' IS NOT NULL THEN
    RAISE EXCEPTION 'Order calculation rejected: %', v_totals->>'error';
  END IF;

  -- 5. Determine State Machine Initial Status
  IF v_payment_method = 'cod' THEN
    v_order_status := 'placed'::public.order_status;
    v_payment_status := 'cod_due'::public.payment_status;
  ELSE
    v_order_status := 'pending'::public.order_status;
    v_payment_status := 'pending'::public.payment_status;
    v_expires_at := NOW() + INTERVAL '30 minutes';
  END IF;

  v_order_number := public.generate_order_number();
  v_order_id := gen_random_uuid();

  -- 6. Insert Order Record
  INSERT INTO public.orders (
    id, order_number, idempotency_key, user_id, status, payment_status, payment_method,
    subtotal_mrp_paise, subtotal_sale_paise, discount_paise, coupon_id, coupon_code,
    coupon_discount_paise, delivery_fee_paise, cod_fee_paise, gift_wrap_fee_paise,
    total_tax_paise, total_paise, customer_name, customer_email, customer_phone,
    shipping_address, is_gift, gift_message, payment_expires_at, attribution
  )
  VALUES (
    v_order_id,
    v_order_number,
    p_idempotency_key,
    v_user_id,
    v_order_status,
    v_payment_status,
    v_payment_method,
    (v_totals->>'subtotal_mrp_paise')::BIGINT,
    (v_totals->>'subtotal_sale_paise')::BIGINT,
    (v_totals->>'product_discount_paise')::BIGINT,
    (v_totals->>'coupon_id')::UUID,
    v_totals->>'coupon_code',
    (v_totals->>'coupon_discount_paise')::BIGINT,
    (v_totals->>'delivery_fee_paise')::BIGINT,
    (v_totals->>'cod_fee_paise')::BIGINT,
    (v_totals->>'gift_wrap_fee_paise')::BIGINT,
    (v_totals->>'total_tax_paise')::BIGINT,
    (v_totals->>'grand_total_paise')::BIGINT,
    v_customer_name,
    v_customer_email,
    v_customer_phone,
    v_shipping_addr,
    COALESCE((p_payload->>'is_gift')::BOOLEAN, FALSE),
    p_payload->>'gift_message',
    v_expires_at,
    COALESCE(p_payload->'attribution', '{}'::jsonb)
  );

  -- 7. Insert Order Items & Decrement Stock Ledger
  FOR v_item IN SELECT * FROM jsonb_to_recordset(v_totals->'items') AS x(
    product_id UUID,
    variant_id UUID,
    title TEXT,
    sku TEXT,
    quantity INT,
    mrp_paise BIGINT,
    unit_price_paise BIGINT,
    line_total_paise BIGINT,
    hsn_code TEXT,
    gst_rate_percent NUMERIC
  )
  LOOP
    INSERT INTO public.order_items (
      order_id, product_id, variant_id, product_title, sku,
      hsn_code, gst_rate_percent, mrp_paise, unit_price_paise,
      quantity, line_total_paise
    )
    VALUES (
      v_order_id, v_item.product_id, v_item.variant_id, v_item.title, v_item.sku,
      v_item.hsn_code, v_item.gst_rate_percent, v_item.mrp_paise, v_item.unit_price_paise,
      v_item.quantity, v_item.line_total_paise
    );

    -- Decrement stock and write to inventory_ledger
    IF v_item.variant_id IS NOT NULL THEN
      UPDATE public.product_variants
      SET stock = stock - v_item.quantity
      WHERE id = v_item.variant_id
      RETURNING stock INTO v_new_stock;

      INSERT INTO public.inventory_ledger (
        product_id, variant_id, delta, balance_after, transaction_type, reference_id, notes, actor_id
      )
      VALUES (
        v_item.product_id, v_item.variant_id, -v_item.quantity, v_new_stock,
        'order_placed'::public.stock_transaction_type, v_order_number, 'Order placement deduction', v_user_id
      );
    ELSE
      UPDATE public.products
      SET stock = stock - v_item.quantity
      WHERE id = v_item.product_id
      RETURNING stock INTO v_new_stock;

      INSERT INTO public.inventory_ledger (
        product_id, delta, balance_after, transaction_type, reference_id, notes, actor_id
      )
      VALUES (
        v_item.product_id, -v_item.quantity, v_new_stock,
        'order_placed'::public.stock_transaction_type, v_order_number, 'Order placement deduction', v_user_id
      );
    END IF;
  END LOOP;

  -- 8. Redeem Coupon if applicable
  IF v_totals->>'coupon_id' IS NOT NULL THEN
    INSERT INTO public.coupon_redemptions (coupon_id, order_id, user_id, discount_applied_paise)
    VALUES (
      (v_totals->>'coupon_id')::UUID,
      v_order_id,
      COALESCE(v_user_id, '00000000-0000-0000-0000-000000000000'::UUID),
      (v_totals->>'coupon_discount_paise')::BIGINT
    );

    UPDATE public.coupons
    SET used_count = used_count + 1
    WHERE id = (v_totals->>'coupon_id')::UUID;
  END IF;

  -- 9. Record Initial Status History
  INSERT INTO public.order_status_history (order_id, from_status, to_status, note, actor_id)
  VALUES (v_order_id, NULL, v_order_status, 'Order initiated via ' || v_payment_method::TEXT, v_user_id);

  -- 10. Queue Order Confirmation Email
  INSERT INTO public.email_outbox (
    recipient_email, recipient_name, subject, template_name, template_data, dedupe_key
  )
  VALUES (
    v_customer_email,
    v_customer_name,
    'Order Confirmation - ' || v_order_number || ' | Anu Atelier',
    'order_placed',
    jsonb_build_object(
      'order_number', v_order_number,
      'customer_name', v_customer_name,
      'total_paise', (v_totals->>'grand_total_paise')::BIGINT,
      'payment_method', v_payment_method::TEXT,
      'item_count', v_totals->'item_count'
    ),
    'order_placed_' || v_order_number
  );

  -- 11. Clear Cart for logged-in user
  IF v_user_id IS NOT NULL THEN
    DELETE FROM public.cart_items
    WHERE cart_id IN (SELECT id FROM public.carts WHERE user_id = v_user_id);
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'status', v_order_status,
    'payment_status', v_payment_status,
    'payment_method', v_payment_method,
    'grand_total_paise', (v_totals->>'grand_total_paise')::BIGINT,
    'payment_expires_at', v_expires_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 13. CANCEL ORDER RPC (cancel_order)
CREATE OR REPLACE FUNCTION public.cancel_order(
  p_order_id UUID,
  p_reason TEXT DEFAULT 'Customer requested cancellation'
)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_user_id UUID;
  v_item RECORD;
  v_new_stock INT;
BEGIN
  v_user_id := auth.uid();
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order with ID % not found.', p_order_id;
  END IF;

  -- Customers can only cancel their own orders before shipment
  IF NOT public.is_staff_or_admin() AND auth.role() <> 'service_role' THEN
    IF v_order.user_id <> v_user_id THEN
      RAISE EXCEPTION 'Forbidden: You do not have permission to cancel this order.';
    END IF;
    IF v_order.status NOT IN ('pending'::public.order_status, 'placed'::public.order_status, 'confirmed'::public.order_status) THEN
      RAISE EXCEPTION 'Order cannot be cancelled because it has already reached status: %', v_order.status;
    END IF;
  END IF;

  -- Restore stock to inventory
  FOR v_item IN SELECT * FROM public.order_items WHERE order_id = p_order_id
  LOOP
    IF v_item.variant_id IS NOT NULL THEN
      UPDATE public.product_variants
      SET stock = stock + v_item.quantity
      WHERE id = v_item.variant_id
      RETURNING stock INTO v_new_stock;

      INSERT INTO public.inventory_ledger (
        product_id, variant_id, delta, balance_after, transaction_type, reference_id, notes, actor_id
      )
      VALUES (
        v_item.product_id, v_item.variant_id, v_item.quantity, v_new_stock,
        'order_cancelled'::public.stock_transaction_type, v_order.order_number, 'Restock on cancellation', v_user_id
      );
    ELSE
      UPDATE public.products
      SET stock = stock + v_item.quantity
      WHERE id = v_item.product_id
      RETURNING stock INTO v_new_stock;

      INSERT INTO public.inventory_ledger (
        product_id, delta, balance_after, transaction_type, reference_id, notes, actor_id
      )
      VALUES (
        v_item.product_id, v_item.quantity, v_new_stock,
        'order_cancelled'::public.stock_transaction_type, v_order.order_number, 'Restock on cancellation', v_user_id
      );
    END IF;
  END LOOP;

  -- Release Coupon if used
  IF v_order.coupon_id IS NOT NULL THEN
    UPDATE public.coupons
    SET used_count = GREATEST(0, used_count - 1)
    WHERE id = v_order.coupon_id;

    DELETE FROM public.coupon_redemptions WHERE order_id = p_order_id;
  END IF;

  -- Update order record
  UPDATE public.orders
  SET status = 'cancelled'::public.order_status,
      cancelled_at = NOW(),
      cancellation_reason = p_reason,
      updated_at = NOW()
  WHERE id = p_order_id;

  -- Record status history
  INSERT INTO public.order_status_history (order_id, from_status, to_status, note, actor_id)
  VALUES (p_order_id, v_order.status, 'cancelled'::public.order_status, p_reason, v_user_id);

  -- Queue cancellation notification email
  INSERT INTO public.email_outbox (
    recipient_email, recipient_name, subject, template_name, template_data, dedupe_key
  )
  VALUES (
    v_order.customer_email,
    v_order.customer_name,
    'Order Cancelled - ' || v_order.order_number || ' | Anu Atelier',
    'order_cancelled',
    jsonb_build_object(
      'order_number', v_order.order_number,
      'customer_name', v_order.customer_name,
      'cancellation_reason', p_reason
    ),
    'order_cancelled_' || v_order.order_number
  );

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'order_number', v_order.order_number,
    'status', 'cancelled'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 14. MERGE GUEST CART RPC (merge_guest_cart)
CREATE OR REPLACE FUNCTION public.merge_guest_cart(p_local_items JSONB)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_cart_id UUID;
  v_item RECORD;
  v_prod RECORD;
  v_max_qty INT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to merge cart.';
  END IF;

  -- Get or create cart for user
  INSERT INTO public.carts (user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT id INTO v_cart_id FROM public.carts WHERE user_id = v_user_id;

  -- Merge items
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_local_items) AS x(
    product_id UUID,
    variant_id UUID,
    quantity INT,
    personalization_note TEXT,
    is_gift BOOLEAN
  )
  LOOP
    SELECT * INTO v_prod FROM public.products WHERE id = v_item.product_id;
    IF FOUND AND v_prod.status = 'published' AND v_prod.stock > 0 THEN
      v_max_qty := LEAST(10, v_prod.stock, COALESCE(v_item.quantity, 1));

      INSERT INTO public.cart_items (cart_id, product_id, variant_id, quantity, personalization_note, is_gift)
      VALUES (v_cart_id, v_item.product_id, v_item.variant_id, v_max_qty, v_item.personalization_note, COALESCE(v_item.is_gift, FALSE))
      ON CONFLICT (cart_id, product_id, variant_id) DO UPDATE
      SET quantity = LEAST(10, v_prod.stock, public.cart_items.quantity + EXCLUDED.quantity),
          updated_at = NOW();
    END IF;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'cart_id', v_cart_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 15. ROW-LEVEL SECURITY (RLS) POLICIES FOR B3 TABLES
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.back_in_stock_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY;

-- 15.1 Addresses
DROP POLICY IF EXISTS "addresses_own_manage" ON public.addresses;
CREATE POLICY "addresses_own_manage" ON public.addresses
  FOR ALL USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- 15.2 Carts & Items
DROP POLICY IF EXISTS "carts_own_manage" ON public.carts;
CREATE POLICY "carts_own_manage" ON public.carts
  FOR ALL USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "cart_items_own_manage" ON public.cart_items;
CREATE POLICY "cart_items_own_manage" ON public.cart_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_id AND c.user_id = auth.uid())
    OR public.is_admin()
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_id AND c.user_id = auth.uid())
    OR public.is_admin()
  );

-- 15.3 Wishlists
DROP POLICY IF EXISTS "wishlists_own_manage" ON public.wishlists;
CREATE POLICY "wishlists_own_manage" ON public.wishlists
  FOR ALL USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- 15.4 Coupons (Public can view active coupons)
DROP POLICY IF EXISTS "coupons_select_public" ON public.coupons;
CREATE POLICY "coupons_select_public" ON public.coupons
  FOR SELECT USING (is_active = TRUE OR public.is_staff_or_admin());

DROP POLICY IF EXISTS "coupons_manage_staff_admin" ON public.coupons;
CREATE POLICY "coupons_manage_staff_admin" ON public.coupons
  FOR ALL USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

-- 15.5 Orders & Order Items
DROP POLICY IF EXISTS "orders_own_read" ON public.orders;
CREATE POLICY "orders_own_read" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR public.is_staff_or_admin());

DROP POLICY IF EXISTS "orders_manage_staff_admin" ON public.orders;
CREATE POLICY "orders_manage_staff_admin" ON public.orders
  FOR ALL USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

DROP POLICY IF EXISTS "order_items_own_read" ON public.order_items;
CREATE POLICY "order_items_own_read" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_staff_or_admin()))
  );

-- 15.6 Status History, Inventory Ledger & Outbox
DROP POLICY IF EXISTS "history_select_own_or_staff" ON public.order_status_history;
CREATE POLICY "history_select_own_or_staff" ON public.order_status_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_staff_or_admin()))
  );

DROP POLICY IF EXISTS "inventory_ledger_admin_only" ON public.inventory_ledger;
CREATE POLICY "inventory_ledger_admin_only" ON public.inventory_ledger
  FOR SELECT USING (public.is_staff_or_admin());

DROP POLICY IF EXISTS "email_outbox_service_admin" ON public.email_outbox;
CREATE POLICY "email_outbox_service_admin" ON public.email_outbox
  FOR ALL USING (auth.role() = 'service_role' OR public.is_admin())
  WITH CHECK (auth.role() = 'service_role' OR public.is_admin());
