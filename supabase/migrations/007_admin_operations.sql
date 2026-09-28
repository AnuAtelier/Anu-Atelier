-- ==============================================================================
-- Anu Atelier - Phase B6: Admin Operations & Growth
-- Admin Management RPCs, Inventory Adjustments, Customer Moderation,
-- Sales Analytics & Reports, Customer Privacy (DPDPA 2023), and Growth Features
-- ==============================================================================

-- 1. SCHEMA ENHANCEMENTS FOR ADMIN & GROWTH
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS cod_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_profiles_is_blocked ON public.profiles(is_blocked);
CREATE INDEX IF NOT EXISTS idx_profiles_cod_blocked ON public.profiles(cod_blocked);

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE public.carts
  ADD COLUMN IF NOT EXISTS reminder_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_reminded_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_carts_abandoned ON public.carts(updated_at, reminder_count);

DO $$ BEGIN
  ALTER TABLE public.reviews
    ADD COLUMN moderation_status TEXT NOT NULL DEFAULT 'approved'
    CHECK (moderation_status IN ('approved', 'rejected', 'flagged'));
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_reviews_moderation ON public.reviews(moderation_status);

-- 2. ROLE AUTHORIZATION HELPER
CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin'::public.user_role, 'staff'::public.user_role)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 3. ADMIN ORDER MANAGEMENT RPCS

-- 3.1 List Orders with Customer details & Filters
CREATE OR REPLACE FUNCTION public.admin_list_orders(
  p_status TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
  v_orders JSONB;
  v_total_count INT;
  v_clamped_limit INT;
BEGIN
  IF NOT public.is_staff_or_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin or Staff role required';
  END IF;

  v_clamped_limit := LEAST(GREATEST(COALESCE(p_limit, 20), 1), 100);

  -- Count matching orders
  SELECT COUNT(*)
  INTO v_total_count
  FROM public.orders o
  LEFT JOIN public.profiles p ON p.id = o.user_id
  WHERE (p_status IS NULL OR o.status::TEXT = p_status)
    AND (
      p_search IS NULL OR
      o.order_number ILIKE '%' || p_search || '%' OR
      p.full_name ILIKE '%' || p_search || '%' OR
      p.email ILIKE '%' || p_search || '%' OR
      p.phone ILIKE '%' || p_search || '%'
    );

  -- Retrieve orders page
  SELECT COALESCE(jsonb_agg(sub.order_obj ORDER BY sub.created_at DESC), '[]'::jsonb)
  INTO v_orders
  FROM (
    SELECT
      jsonb_build_object(
        'id', o.id,
        'order_number', o.order_number,
        'user_id', o.user_id,
        'status', o.status,
        'payment_status', o.payment_status,
        'payment_method', o.payment_method,
        'total_paise', o.total_paise,
        'subtotal_paise', o.subtotal_paise,
        'discount_paise', o.discount_paise,
        'delivery_fee_paise', o.delivery_fee_paise,
        'created_at', o.created_at,
        'customer_name', COALESCE(p.full_name, 'Guest Customer'),
        'customer_email', p.email,
        'customer_phone', p.phone,
        'items_count', (SELECT COUNT(*) FROM public.order_items WHERE order_id = o.id)
      ) AS order_obj,
      o.created_at
    FROM public.orders o
    LEFT JOIN public.profiles p ON p.id = o.user_id
    WHERE (p_status IS NULL OR o.status::TEXT = p_status)
      AND (
        p_search IS NULL OR
        o.order_number ILIKE '%' || p_search || '%' OR
        p.full_name ILIKE '%' || p_search || '%' OR
        p.email ILIKE '%' || p_search || '%' OR
        p.phone ILIKE '%' || p_search || '%'
      )
    ORDER BY o.created_at DESC
    LIMIT v_clamped_limit
    OFFSET GREATEST(COALESCE(p_offset, 0), 0)
  ) sub;

  RETURN jsonb_build_object(
    'orders', v_orders,
    'total_count', v_total_count,
    'limit', v_clamped_limit,
    'offset', GREATEST(COALESCE(p_offset, 0), 0)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 3.2 Single Order Detail for Admin view
CREATE OR REPLACE FUNCTION public.admin_get_order_detail(
  p_order_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_customer RECORD;
  v_items JSONB;
  v_history JSONB;
  v_payments JSONB;
  v_shipments JSONB;
  v_invoice JSONB;
  v_returns JSONB;
BEGIN
  IF NOT public.is_staff_or_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin or Staff role required';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- Customer profile
  SELECT id, full_name, email, phone, is_blocked, cod_blocked, created_at
  INTO v_customer
  FROM public.profiles
  WHERE id = v_order.user_id;

  -- Order Items with product details
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', oi.id,
      'product_id', oi.product_id,
      'variant_id', oi.variant_id,
      'title', oi.product_title,
      'variant_title', oi.variant_title,
      'sku', oi.sku,
      'image_url', oi.image_url,
      'unit_price_paise', oi.unit_price_paise,
      'mrp_paise', oi.mrp_paise,
      'quantity', oi.quantity,
      'discount_paise', oi.discount_paise,
      'tax_paise', oi.tax_paise,
      'line_total_paise', oi.line_total_paise,
      'personalization_note', oi.personalization_note
    )
  ), '[]'::jsonb)
  INTO v_items
  FROM public.order_items oi
  WHERE oi.order_id = p_order_id;

  -- Status History
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', h.id,
      'from_status', h.from_status,
      'to_status', h.to_status,
      'reason', h.reason,
      'changed_by', h.changed_by,
      'created_at', h.created_at
    ) ORDER BY h.created_at ASC
  ), '[]'::jsonb)
  INTO v_history
  FROM public.order_status_history h
  WHERE h.order_id = p_order_id;

  -- Payments
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', py.id,
      'provider', py.provider,
      'provider_payment_id', py.provider_payment_id,
      'amount_paise', py.amount_paise,
      'status', py.status,
      'payment_method', py.payment_method,
      'created_at', py.created_at
    )
  ), '[]'::jsonb)
  INTO v_payments
  FROM public.payments py
  WHERE py.order_id = p_order_id;

  -- Shipments
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', sh.id,
      'courier_name', sh.courier_name,
      'tracking_number', sh.tracking_number,
      'tracking_url', sh.tracking_url,
      'status', sh.status,
      'shipped_at', sh.shipped_at,
      'delivered_at', sh.delivered_at,
      'events', sh.events
    )
  ), '[]'::jsonb)
  INTO v_shipments
  FROM public.shipments sh
  WHERE sh.order_id = p_order_id;

  -- Invoice
  SELECT to_jsonb(inv)
  INTO v_invoice
  FROM public.invoices inv
  WHERE inv.order_id = p_order_id;

  -- Returns
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', ret.id,
      'status', ret.status,
      'resolution', ret.resolution,
      'reason', ret.reason,
      'notes', ret.notes,
      'photos', ret.photos,
      'created_at', ret.created_at
    )
  ), '[]'::jsonb)
  INTO v_returns
  FROM public.returns ret
  WHERE ret.order_id = p_order_id;

  RETURN jsonb_build_object(
    'order', to_jsonb(v_order),
    'customer', to_jsonb(v_customer),
    'items', v_items,
    'history', v_history,
    'payments', v_payments,
    'shipments', v_shipments,
    'invoice', v_invoice,
    'returns', v_returns
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 3.3 Update Order Status (Admin Override with Automatic Restock/Invoice triggers)
CREATE OR REPLACE FUNCTION public.admin_update_order_status(
  p_order_id UUID,
  p_new_status public.order_status,
  p_reason TEXT DEFAULT NULL,
  p_internal_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_old_status public.order_status;
  v_order RECORD;
  v_item RECORD;
  v_cur_stock INT;
  v_seller_snap JSONB;
BEGIN
  IF NOT public.is_staff_or_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin or Staff role required';
  END IF;

  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;

  v_old_status := v_order.status;

  -- If status is already the same, no action needed
  IF v_old_status = p_new_status THEN
    RETURN jsonb_build_object(
      'success', true,
      'order_id', p_order_id,
      'status', p_new_status,
      'message', 'Status unchanged'
    );
  END IF;

  -- Update order status
  UPDATE public.orders
  SET status = p_new_status,
      updated_at = NOW()
  WHERE id = p_order_id;

  -- Append to order status history
  INSERT INTO public.order_status_history (
    order_id, from_status, to_status, reason, changed_by
  ) VALUES (
    p_order_id, v_old_status, p_new_status,
    COALESCE(p_reason, 'Admin status update: ' || COALESCE(p_internal_notes, 'no note')),
    auth.uid()
  );

  -- If status moves to CANCELLED, restock items into inventory ledger
  IF p_new_status = 'cancelled'::public.order_status AND v_old_status != 'cancelled'::public.order_status THEN
    FOR v_item IN
      SELECT product_id, variant_id, quantity
      FROM public.order_items
      WHERE order_id = p_order_id
    LOOP
      IF v_item.variant_id IS NOT NULL THEN
        UPDATE public.product_variants
        SET stock = stock + v_item.quantity
        WHERE id = v_item.variant_id
        RETURNING stock INTO v_cur_stock;
      END IF;

      UPDATE public.products
      SET stock = stock + v_item.quantity
      WHERE id = v_item.product_id
      RETURNING stock INTO v_cur_stock;

      INSERT INTO public.inventory_ledger (
        product_id, variant_id, delta, balance_after,
        transaction_type, reference_id, notes, actor_id
      ) VALUES (
        v_item.product_id, v_item.variant_id, v_item.quantity, v_cur_stock,
        'order_cancelled'::public.stock_transaction_type, p_order_id::TEXT,
        'Restocked via admin order cancellation: ' || COALESCE(p_reason, 'Admin override'),
        auth.uid()
      );
    END LOOP;
  END IF;

  -- If status moves to SHIPPED and no invoice exists, generate tax invoice
  IF p_new_status = 'shipped'::public.order_status THEN
    IF NOT EXISTS (SELECT 1 FROM public.invoices WHERE order_id = p_order_id) THEN
      SELECT value INTO v_seller_snap FROM public.site_settings WHERE key = 'business_details';
      IF v_seller_snap IS NULL THEN
        v_seller_snap := jsonb_build_object(
          'business_name', 'Anu Atelier Crafts LLP',
          'state', 'Uttar Pradesh',
          'state_code', '09',
          'country', 'India'
        );
      END IF;

      INSERT INTO public.invoices (
        order_id,
        invoice_number,
        financial_year,
        subtotal_paise,
        discount_paise,
        taxable_amount_paise,
        cgst_paise,
        sgst_paise,
        igst_paise,
        total_tax_paise,
        grand_total_paise,
        seller_snapshot
      ) VALUES (
        p_order_id,
        public.generate_invoice_number(),
        '2026-27',
        v_order.subtotal_paise,
        v_order.discount_paise,
        GREATEST(v_order.subtotal_paise - v_order.discount_paise, 0),
        v_order.tax_paise / 2,
        v_order.tax_paise - (v_order.tax_paise / 2),
        0,
        v_order.tax_paise,
        v_order.total_paise,
        v_seller_snap
      );
    END IF;
  END IF;

  -- Record in audit log
  INSERT INTO public.audit_log (
    table_name, record_id, action, actor_id, actor_role, old_data, new_data
  ) VALUES (
    'orders', p_order_id::TEXT, 'STATUS_UPDATE', auth.uid(),
    (SELECT role::TEXT FROM public.profiles WHERE id = auth.uid()),
    jsonb_build_object('status', v_old_status),
    jsonb_build_object('status', p_new_status, 'reason', p_reason, 'notes', p_internal_notes)
  );

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'from_status', v_old_status,
    'to_status', p_new_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 4. ADMIN INVENTORY & STOCK ADJUSTMENT RPC
CREATE OR REPLACE FUNCTION public.admin_adjust_stock(
  p_product_id UUID,
  p_variant_id UUID DEFAULT NULL,
  p_delta INT DEFAULT 0,
  p_reason TEXT DEFAULT 'manual_adjustment',
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_cur_stock INT;
  v_new_stock INT;
  v_tx_type public.stock_transaction_type;
BEGIN
  IF NOT public.is_staff_or_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin or Staff role required';
  END IF;

  IF p_delta = 0 THEN
    RAISE EXCEPTION 'Stock delta cannot be zero';
  END IF;

  IF p_delta > 0 THEN
    v_tx_type := 'purchase'::public.stock_transaction_type;
  ELSE
    v_tx_type := 'manual_adjustment'::public.stock_transaction_type;
  END IF;

  -- Variant stock adjustment if variant ID specified
  IF p_variant_id IS NOT NULL THEN
    SELECT stock INTO v_cur_stock
    FROM public.product_variants
    WHERE id = p_variant_id AND product_id = p_product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Variant % for product % not found', p_variant_id, p_product_id;
    END IF;

    IF (v_cur_stock + p_delta) < 0 THEN
      RAISE EXCEPTION 'Insufficient variant stock: current %, delta %', v_cur_stock, p_delta;
    END IF;

    UPDATE public.product_variants
    SET stock = stock + p_delta,
        updated_at = NOW()
    WHERE id = p_variant_id
    RETURNING stock INTO v_new_stock;
  END IF;

  -- Product stock adjustment
  SELECT stock INTO v_cur_stock
  FROM public.products
  WHERE id = p_product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product % not found', p_product_id;
  END IF;

  IF (v_cur_stock + p_delta) < 0 THEN
    RAISE EXCEPTION 'Insufficient product stock: current %, delta %', v_cur_stock, p_delta;
  END IF;

  UPDATE public.products
  SET stock = stock + p_delta,
      updated_at = NOW()
  WHERE id = p_product_id
  RETURNING stock INTO v_new_stock;

  -- Log into immutable inventory ledger
  INSERT INTO public.inventory_ledger (
    product_id, variant_id, delta, balance_after,
    transaction_type, reference_id, notes, actor_id
  ) VALUES (
    p_product_id, p_variant_id, p_delta, v_new_stock,
    v_tx_type, 'ADMIN_MANUAL',
    COALESCE(p_notes, 'Admin adjustment: ' || COALESCE(p_reason, 'unspecified')),
    auth.uid()
  );

  -- Log into audit log
  INSERT INTO public.audit_log (
    table_name, record_id, action, actor_id, actor_role, old_data, new_data
  ) VALUES (
    'products', p_product_id::TEXT, 'STOCK_ADJUSTMENT', auth.uid(),
    (SELECT role::TEXT FROM public.profiles WHERE id = auth.uid()),
    jsonb_build_object('old_stock', v_cur_stock),
    jsonb_build_object('delta', p_delta, 'new_stock', v_new_stock, 'variant_id', p_variant_id, 'reason', p_reason)
  );

  RETURN jsonb_build_object(
    'success', true,
    'product_id', p_product_id,
    'variant_id', p_variant_id,
    'delta', p_delta,
    'new_stock', v_new_stock
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 5. ADMIN CUSTOMER MANAGEMENT RPCS

-- 5.1 List Customers with Aggregated metrics
CREATE OR REPLACE FUNCTION public.admin_list_customers(
  p_search TEXT DEFAULT NULL,
  p_role TEXT DEFAULT NULL,
  p_is_blocked BOOLEAN DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
  v_customers JSONB;
  v_total_count INT;
  v_clamped_limit INT;
BEGIN
  IF NOT public.is_staff_or_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin or Staff role required';
  END IF;

  v_clamped_limit := LEAST(GREATEST(COALESCE(p_limit, 20), 1), 100);

  -- Count total matching customers
  SELECT COUNT(*)
  INTO v_total_count
  FROM public.profiles p
  WHERE (p_role IS NULL OR p.role::TEXT = p_role)
    AND (p_is_blocked IS NULL OR p.is_blocked = p_is_blocked)
    AND (
      p_search IS NULL OR
      p.full_name ILIKE '%' || p_search || '%' OR
      p.email ILIKE '%' || p_search || '%' OR
      p.phone ILIKE '%' || p_search || '%'
    );

  -- Fetch customer rows with lifetime metrics
  SELECT COALESCE(jsonb_agg(sub.cust_obj ORDER BY sub.created_at DESC), '[]'::jsonb)
  INTO v_customers
  FROM (
    SELECT
      jsonb_build_object(
        'id', p.id,
        'email', p.email,
        'phone', p.phone,
        'full_name', p.full_name,
        'role', p.role,
        'is_blocked', p.is_blocked,
        'cod_blocked', p.cod_blocked,
        'marketing_opt_in', p.marketing_opt_in,
        'created_at', p.created_at,
        'orders_count', COALESCE(agg.orders_count, 0),
        'total_spent_paise', COALESCE(agg.total_spent_paise, 0)
      ) AS cust_obj,
      p.created_at
    FROM public.profiles p
    LEFT JOIN (
      SELECT
        user_id,
        COUNT(id) AS orders_count,
        SUM(total_paise) AS total_spent_paise
      FROM public.orders
      WHERE status NOT IN ('failed'::public.order_status, 'cancelled'::public.order_status)
      GROUP BY user_id
    ) agg ON agg.user_id = p.id
    WHERE (p_role IS NULL OR p.role::TEXT = p_role)
      AND (p_is_blocked IS NULL OR p.is_blocked = p_is_blocked)
      AND (
        p_search IS NULL OR
        p.full_name ILIKE '%' || p_search || '%' OR
        p.email ILIKE '%' || p_search || '%' OR
        p.phone ILIKE '%' || p_search || '%'
      )
    ORDER BY p.created_at DESC
    LIMIT v_clamped_limit
    OFFSET GREATEST(COALESCE(p_offset, 0), 0)
  ) sub;

  RETURN jsonb_build_object(
    'customers', v_customers,
    'total_count', v_total_count,
    'limit', v_clamped_limit,
    'offset', GREATEST(COALESCE(p_offset, 0), 0)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 5.2 Block / Unblock Customer or COD (Super Admin Only)
CREATE OR REPLACE FUNCTION public.admin_set_customer_status(
  p_customer_id UUID,
  p_is_blocked BOOLEAN,
  p_cod_blocked BOOLEAN,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_old_blocked BOOLEAN;
  v_old_cod_blocked BOOLEAN;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Super Admin role required to modify customer status';
  END IF;

  SELECT is_blocked, cod_blocked
  INTO v_old_blocked, v_old_cod_blocked
  FROM public.profiles
  WHERE id = p_customer_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Customer % not found', p_customer_id;
  END IF;

  UPDATE public.profiles
  SET is_blocked = p_is_blocked,
      cod_blocked = p_cod_blocked,
      updated_at = NOW()
  WHERE id = p_customer_id;

  INSERT INTO public.audit_log (
    table_name, record_id, action, actor_id, actor_role, old_data, new_data
  ) VALUES (
    'profiles', p_customer_id::TEXT, 'STATUS_UPDATE', auth.uid(),
    'admin',
    jsonb_build_object('is_blocked', v_old_blocked, 'cod_blocked', v_old_cod_blocked),
    jsonb_build_object('is_blocked', p_is_blocked, 'cod_blocked', p_cod_blocked, 'reason', p_reason)
  );

  RETURN jsonb_build_object(
    'success', true,
    'customer_id', p_customer_id,
    'is_blocked', p_is_blocked,
    'cod_blocked', p_cod_blocked
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 6. ADMIN REVIEW MODERATION RPC
CREATE OR REPLACE FUNCTION public.admin_moderate_review(
  p_review_id UUID,
  p_status TEXT,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_prod_id UUID;
  v_hide BOOLEAN;
BEGIN
  IF NOT public.is_staff_or_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin or Staff role required';
  END IF;

  IF p_status NOT IN ('approved', 'rejected', 'flagged') THEN
    RAISE EXCEPTION 'Invalid review status. Must be approved, rejected, or flagged';
  END IF;

  v_hide := (p_status = 'rejected');

  UPDATE public.reviews
  SET moderation_status = p_status,
      is_hidden = v_hide,
      updated_at = NOW()
  WHERE id = p_review_id
  RETURNING product_id INTO v_prod_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Review % not found', p_review_id;
  END IF;

  -- Log to audit log
  INSERT INTO public.audit_log (
    table_name, record_id, action, actor_id, actor_role, old_data, new_data
  ) VALUES (
    'reviews', p_review_id::TEXT, 'MODERATE', auth.uid(),
    (SELECT role::TEXT FROM public.profiles WHERE id = auth.uid()),
    NULL,
    jsonb_build_object('status', p_status, 'is_hidden', v_hide, 'notes', p_admin_notes)
  );

  RETURN jsonb_build_object(
    'success', true,
    'review_id', p_review_id,
    'product_id', v_prod_id,
    'moderation_status', p_status,
    'is_hidden', v_hide
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 7. ADMIN AUDIT LOG VIEWER & SETTINGS RPCS

-- 7.1 View Audit Log
CREATE OR REPLACE FUNCTION public.admin_get_audit_log(
  p_table_name TEXT DEFAULT NULL,
  p_actor_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
  v_logs JSONB;
  v_total_count INT;
  v_clamped_limit INT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required to view audit logs';
  END IF;

  v_clamped_limit := LEAST(GREATEST(COALESCE(p_limit, 50), 1), 200);

  SELECT COUNT(*)
  INTO v_total_count
  FROM public.audit_log a
  WHERE (p_table_name IS NULL OR a.table_name = p_table_name)
    AND (p_actor_id IS NULL OR a.actor_id = p_actor_id);

  SELECT COALESCE(jsonb_agg(to_jsonb(sub.*)), '[]'::jsonb)
  INTO v_logs
  FROM (
    SELECT
      a.id,
      a.table_name,
      a.record_id,
      a.action,
      a.actor_id,
      a.actor_role,
      a.old_data,
      a.new_data,
      a.ip_address,
      a.created_at
    FROM public.audit_log a
    WHERE (p_table_name IS NULL OR a.table_name = p_table_name)
      AND (p_actor_id IS NULL OR a.actor_id = p_actor_id)
    ORDER BY a.created_at DESC
    LIMIT v_clamped_limit
    OFFSET GREATEST(COALESCE(p_offset, 0), 0)
  ) sub;

  RETURN jsonb_build_object(
    'audit_logs', v_logs,
    'total_count', v_total_count,
    'limit', v_clamped_limit,
    'offset', GREATEST(COALESCE(p_offset, 0), 0)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 7.2 Update Site Setting with Audit
CREATE OR REPLACE FUNCTION public.admin_update_setting(
  p_key TEXT,
  p_value JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_old_value JSONB;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  SELECT value INTO v_old_value
  FROM public.site_settings
  WHERE key = p_key
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Site setting % does not exist', p_key;
  END IF;

  UPDATE public.site_settings
  SET value = p_value,
      updated_at = NOW()
  WHERE key = p_key;

  INSERT INTO public.audit_log (
    table_name, record_id, action, actor_id, actor_role, old_data, new_data
  ) VALUES (
    'site_settings', p_key, 'UPDATE_SETTING', auth.uid(), 'admin',
    v_old_value, p_value
  );

  RETURN jsonb_build_object(
    'success', true,
    'key', p_key,
    'value', p_value
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 7.3 Upsert Promotional Coupon
CREATE OR REPLACE FUNCTION public.admin_upsert_coupon(
  p_code TEXT,
  p_discount_type TEXT,
  p_discount_value_paise BIGINT,
  p_description TEXT DEFAULT NULL,
  p_min_order_paise BIGINT DEFAULT 0,
  p_max_discount_paise BIGINT DEFAULT NULL,
  p_starts_at TIMESTAMPTZ DEFAULT NOW(),
  p_expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  p_usage_limit_total INT DEFAULT NULL,
  p_usage_limit_per_user INT DEFAULT 1,
  p_is_first_order_only BOOLEAN DEFAULT FALSE,
  p_is_active BOOLEAN DEFAULT TRUE
)
RETURNS JSONB AS $$
DECLARE
  v_clean_code TEXT;
  v_coupon_id UUID;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  v_clean_code := UPPER(TRIM(p_code));
  IF length(v_clean_code) < 3 THEN
    RAISE EXCEPTION 'Coupon code must be at least 3 characters';
  END IF;

  IF p_discount_type NOT IN ('percent', 'flat', 'free_delivery') THEN
    RAISE EXCEPTION 'Invalid discount type. Must be percent, flat, or free_delivery';
  END IF;

  IF p_discount_value_paise < 0 THEN
    RAISE EXCEPTION 'Discount value must be non-negative';
  END IF;

  INSERT INTO public.coupons (
    code, description, discount_type, discount_value_paise,
    max_discount_paise, min_order_paise, starts_at, expires_at,
    usage_limit_total, usage_limit_per_user, is_first_order_only, is_active
  ) VALUES (
    v_clean_code, p_description, p_discount_type, p_discount_value_paise,
    p_max_discount_paise, p_min_order_paise, p_starts_at, p_expires_at,
    p_usage_limit_total, p_usage_limit_per_user, p_is_first_order_only, p_is_active
  )
  ON CONFLICT (code) DO UPDATE
  SET description = EXCLUDED.description,
      discount_type = EXCLUDED.discount_type,
      discount_value_paise = EXCLUDED.discount_value_paise,
      max_discount_paise = EXCLUDED.max_discount_paise,
      min_order_paise = EXCLUDED.min_order_paise,
      starts_at = EXCLUDED.starts_at,
      expires_at = EXCLUDED.expires_at,
      usage_limit_total = EXCLUDED.usage_limit_total,
      usage_limit_per_user = EXCLUDED.usage_limit_per_user,
      is_first_order_only = EXCLUDED.is_first_order_only,
      is_active = EXCLUDED.is_active
  RETURNING id INTO v_coupon_id;

  INSERT INTO public.audit_log (
    table_name, record_id, action, actor_id, actor_role, old_data, new_data
  ) VALUES (
    'coupons', v_coupon_id::TEXT, 'UPSERT_COUPON', auth.uid(), 'admin',
    NULL,
    jsonb_build_object('code', v_clean_code, 'discount_type', p_discount_type, 'value', p_discount_value_paise)
  );

  RETURN jsonb_build_object(
    'success', true,
    'id', v_coupon_id,
    'code', v_clean_code,
    'discount_type', p_discount_type,
    'is_active', p_is_active
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 8. GROWTH & ANALYTICS RPCS AND VIEWS

-- 8.1 Sales & Revenue Analytics (IST Timezone Aware)
CREATE OR REPLACE FUNCTION public.get_sales_analytics(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB AS $$
DECLARE
  v_total_revenue BIGINT;
  v_total_orders INT;
  v_avg_order_value BIGINT;
  v_cod_revenue BIGINT;
  v_prepaid_revenue BIGINT;
  v_cod_orders INT;
  v_prepaid_orders INT;
  v_cancelled_orders INT;
  v_delivered_orders INT;
  v_returns_count INT;
BEGIN
  IF NOT public.is_staff_or_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin or Staff role required';
  END IF;

  -- Aggregate valid sales orders (excluding failed & cancelled)
  SELECT
    COALESCE(SUM(total_paise), 0),
    COUNT(id),
    COALESCE(ROUND(AVG(total_paise)), 0),
    COALESCE(SUM(CASE WHEN payment_method = 'cod'::public.payment_method THEN total_paise ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN payment_method = 'razorpay'::public.payment_method THEN total_paise ELSE 0 END), 0),
    COUNT(CASE WHEN payment_method = 'cod'::public.payment_method THEN 1 ELSE NULL END),
    COUNT(CASE WHEN payment_method = 'razorpay'::public.payment_method THEN 1 ELSE NULL END)
  INTO
    v_total_revenue, v_total_orders, v_avg_order_value,
    v_cod_revenue, v_prepaid_revenue,
    v_cod_orders, v_prepaid_orders
  FROM public.orders
  WHERE created_at >= p_start_date AND created_at <= p_end_date
    AND status NOT IN ('failed'::public.order_status, 'cancelled'::public.order_status);

  -- Count cancelled and delivered orders
  SELECT
    COUNT(CASE WHEN status = 'cancelled'::public.order_status THEN 1 ELSE NULL END),
    COUNT(CASE WHEN status = 'delivered'::public.order_status THEN 1 ELSE NULL END)
  INTO v_cancelled_orders, v_delivered_orders
  FROM public.orders
  WHERE created_at >= p_start_date AND created_at <= p_end_date;

  -- Count returns requested in this timeframe
  SELECT COUNT(id)
  INTO v_returns_count
  FROM public.returns
  WHERE created_at >= p_start_date AND created_at <= p_end_date;

  RETURN jsonb_build_object(
    'start_date', p_start_date,
    'end_date', p_end_date,
    'total_revenue_paise', v_total_revenue,
    'total_orders', v_total_orders,
    'average_order_value_paise', v_avg_order_value,
    'cod_revenue_paise', v_cod_revenue,
    'prepaid_revenue_paise', v_prepaid_revenue,
    'cod_orders_count', v_cod_orders,
    'prepaid_orders_count', v_prepaid_orders,
    'cancelled_orders_count', v_cancelled_orders,
    'delivered_orders_count', v_delivered_orders,
    'returns_count', v_returns_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 8.2 Top Selling Products RPC
CREATE OR REPLACE FUNCTION public.get_top_selling_products(
  p_limit INT DEFAULT 10,
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB AS $$
DECLARE
  v_res JSONB;
  v_clamped_limit INT;
BEGIN
  IF NOT public.is_staff_or_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin or Staff role required';
  END IF;

  v_clamped_limit := LEAST(GREATEST(COALESCE(p_limit, 10), 1), 50);

  SELECT COALESCE(jsonb_agg(to_jsonb(sub.*)), '[]'::jsonb)
  INTO v_res
  FROM (
    SELECT
      oi.product_id,
      oi.product_title,
      oi.sku,
      SUM(oi.quantity) AS total_units_sold,
      SUM(oi.line_total_paise) AS total_revenue_paise
    FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE o.created_at >= p_start_date AND o.created_at <= p_end_date
      AND o.status NOT IN ('failed'::public.order_status, 'cancelled'::public.order_status)
    GROUP BY oi.product_id, oi.product_title, oi.sku
    ORDER BY total_units_sold DESC, total_revenue_paise DESC
    LIMIT v_clamped_limit
  ) sub;

  RETURN v_res;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 8.3 Low Stock View (Security Invoker)
CREATE OR REPLACE VIEW public.view_low_stock_products
WITH (security_invoker = true) AS
SELECT
  p.id,
  p.title,
  p.slug,
  p.sku,
  p.stock,
  COALESCE(p.low_stock_threshold, 5) AS low_stock_threshold,
  p.price_paise,
  c.name AS category_name,
  a.name AS artisan_name
FROM public.products p
LEFT JOIN public.categories c ON c.id = p.category_id
LEFT JOIN public.artisans a ON a.id = p.artisan_id
WHERE p.stock <= COALESCE(p.low_stock_threshold, 5)
  AND p.status = 'published'
  AND p.deleted_at IS NULL
ORDER BY p.stock ASC;

-- 8.4 Daily Admin Summary RPC
CREATE OR REPLACE FUNCTION public.admin_get_daily_summary(
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
DECLARE
  v_day_start TIMESTAMPTZ;
  v_day_end TIMESTAMPTZ;
  v_revenue BIGINT;
  v_orders_count INT;
  v_pending_fulfilment INT;
  v_low_stock_count INT;
BEGIN
  IF NOT public.is_staff_or_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin or Staff role required';
  END IF;

  v_day_start := p_date::TIMESTAMPTZ;
  v_day_end := (p_date + 1)::TIMESTAMPTZ;

  SELECT
    COALESCE(SUM(total_paise), 0),
    COUNT(id)
  INTO v_revenue, v_orders_count
  FROM public.orders
  WHERE created_at >= v_day_start AND created_at < v_day_end
    AND status NOT IN ('failed'::public.order_status, 'cancelled'::public.order_status);

  SELECT COUNT(id)
  INTO v_pending_fulfilment
  FROM public.orders
  WHERE status IN ('placed'::public.order_status, 'confirmed'::public.order_status, 'packed'::public.order_status);

  SELECT COUNT(*)
  INTO v_low_stock_count
  FROM public.view_low_stock_products;

  RETURN jsonb_build_object(
    'date', p_date,
    'today_revenue_paise', v_revenue,
    'today_orders_count', v_orders_count,
    'pending_fulfilment_count', v_pending_fulfilment,
    'low_stock_items_count', v_low_stock_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 9. CUSTOMER SELF-SERVICE & PRIVACY (DPDPA 2023 / GDPR)

-- 9.1 Data Export (Right to Access & Portability)
CREATE OR REPLACE FUNCTION public.export_customer_data(
  p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_profile JSONB;
  v_addresses JSONB;
  v_wishlist JSONB;
  v_reviews JSONB;
  v_orders JSONB;
BEGIN
  -- Strict permission: user can only export their own data, or admin
  IF auth.uid() <> p_user_id AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: You may only export your own account data';
  END IF;

  -- 1. Profile
  SELECT to_jsonb(p) INTO v_profile
  FROM public.profiles p WHERE p.id = p_user_id;

  -- 2. Addresses
  SELECT COALESCE(jsonb_agg(to_jsonb(a)), '[]'::jsonb)
  INTO v_addresses
  FROM public.addresses a WHERE a.user_id = p_user_id;

  -- 3. Wishlist
  SELECT COALESCE(jsonb_agg(to_jsonb(w)), '[]'::jsonb)
  INTO v_wishlist
  FROM public.wishlists w WHERE w.user_id = p_user_id;

  -- 4. Reviews
  SELECT COALESCE(jsonb_agg(to_jsonb(r)), '[]'::jsonb)
  INTO v_reviews
  FROM public.reviews r WHERE r.user_id = p_user_id;

  -- 5. Orders Summary
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'order_number', o.order_number,
      'status', o.status,
      'payment_status', o.payment_status,
      'payment_method', o.payment_method,
      'total_paise', o.total_paise,
      'created_at', o.created_at,
      'items', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'title', oi.product_title,
            'quantity', oi.quantity,
            'unit_price_paise', oi.unit_price_paise
          )
        ) FROM public.order_items oi WHERE oi.order_id = o.id
      )
    ) ORDER BY o.created_at DESC
  ), '[]'::jsonb)
  INTO v_orders
  FROM public.orders o WHERE o.user_id = p_user_id;

  RETURN jsonb_build_object(
    'exported_at', NOW(),
    'user_id', p_user_id,
    'profile', v_profile,
    'addresses', v_addresses,
    'wishlist', v_wishlist,
    'reviews', v_reviews,
    'orders', v_orders
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 9.2 Account Deletion & Anonymization (Right to be Forgotten)
-- Note: Under Indian GST & Companies Act, financial transaction records
-- must be retained for 8 financial years. We anonymize profile and delete PII.
CREATE OR REPLACE FUNCTION public.delete_customer_account(
  p_user_id UUID,
  p_confirmation TEXT
)
RETURNS JSONB AS $$
BEGIN
  IF auth.uid() <> p_user_id AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: You may only delete your own account';
  END IF;

  IF p_confirmation <> 'DELETE' THEN
    RAISE EXCEPTION 'Confirmation string must be DELETE';
  END IF;

  -- 1. Delete transient PII
  DELETE FROM public.addresses WHERE user_id = p_user_id;
  DELETE FROM public.carts WHERE user_id = p_user_id;
  DELETE FROM public.wishlists WHERE user_id = p_user_id;

  -- 2. Anonymize reviews
  UPDATE public.reviews
  SET reviewer_display_name = 'Anonymous Artisan Admirer',
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- 3. Anonymize profile
  UPDATE public.profiles
  SET full_name = 'Deleted Customer',
      phone = NULL,
      avatar_url = NULL,
      email = 'deleted_' || id || '@deleted.anuatelier.internal',
      is_blocked = TRUE,
      marketing_opt_in = FALSE,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- 4. Record deletion in audit log
  INSERT INTO public.audit_log (
    table_name, record_id, action, actor_id, actor_role, old_data, new_data
  ) VALUES (
    'profiles', p_user_id::TEXT, 'ANONYMIZE_ACCOUNT', auth.uid(),
    (SELECT role::TEXT FROM public.profiles WHERE id = auth.uid()),
    NULL,
    jsonb_build_object('user_id', p_user_id, 'reason', 'Customer requested account deletion (DPDPA 2023)')
  );

  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'status', 'anonymized',
    'message', 'Personal data removed. Financial records retained for legal compliance.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 10. ABANDONED CARTS QUERY HELPER FOR CRON
CREATE OR REPLACE FUNCTION public.get_abandoned_carts_for_reminder(
  p_older_than_interval INTERVAL DEFAULT INTERVAL '2 hours',
  p_max_reminders INT DEFAULT 2
)
RETURNS TABLE (
  cart_id UUID,
  user_id UUID,
  customer_email TEXT,
  customer_name TEXT,
  reminder_count INT,
  cart_items JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS cart_id,
    c.user_id,
    p.email AS customer_email,
    p.full_name AS customer_name,
    c.reminder_count,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'product_title', pr.title,
          'quantity', ci.quantity,
          'price_paise', pr.price_paise,
          'image_url', (SELECT pi.url FROM public.product_images pi WHERE pi.product_id = pr.id ORDER BY pi.is_primary DESC, pi.display_order ASC LIMIT 1)
        )
      ) FILTER (WHERE ci.id IS NOT NULL),
      '[]'::jsonb
    ) AS cart_items
  FROM public.carts c
  JOIN public.profiles p ON p.id = c.user_id
  JOIN public.cart_items ci ON ci.cart_id = c.id
  JOIN public.products pr ON pr.id = ci.product_id
  WHERE c.updated_at <= (NOW() - p_older_than_interval)
    AND c.reminder_count < p_max_reminders
    AND p.marketing_opt_in = TRUE
    AND p.is_blocked = FALSE
    -- Exclude users who placed an order since the cart was updated
    AND NOT EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.user_id = c.user_id
        AND o.created_at >= c.updated_at
        AND o.status NOT IN ('failed'::public.order_status, 'cancelled'::public.order_status)
    )
  GROUP BY c.id, c.user_id, p.email, p.full_name, c.reminder_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 11. SECURITY PRIVILEGES & PERMISSIONS
REVOKE EXECUTE ON FUNCTION public.is_staff_or_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_staff_or_admin() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.admin_list_orders(TEXT, TEXT, INT, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_orders(TEXT, TEXT, INT, INT) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.admin_get_order_detail(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_get_order_detail(UUID) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.admin_update_order_status(UUID, public.order_status, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_order_status(UUID, public.order_status, TEXT, TEXT) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.admin_adjust_stock(UUID, UUID, INT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_adjust_stock(UUID, UUID, INT, TEXT, TEXT) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.admin_list_customers(TEXT, TEXT, BOOLEAN, INT, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_customers(TEXT, TEXT, BOOLEAN, INT, INT) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.admin_set_customer_status(UUID, BOOLEAN, BOOLEAN, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_customer_status(UUID, BOOLEAN, BOOLEAN, TEXT) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.admin_moderate_review(UUID, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_moderate_review(UUID, TEXT, TEXT) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.admin_get_audit_log(TEXT, UUID, INT, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_get_audit_log(TEXT, UUID, INT, INT) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.admin_update_setting(TEXT, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_setting(TEXT, JSONB) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.admin_upsert_coupon(TEXT, TEXT, BIGINT, TEXT, BIGINT, BIGINT, TIMESTAMPTZ, TIMESTAMPTZ, INT, INT, BOOLEAN, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_upsert_coupon(TEXT, TEXT, BIGINT, TEXT, BIGINT, BIGINT, TIMESTAMPTZ, TIMESTAMPTZ, INT, INT, BOOLEAN, BOOLEAN) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.get_sales_analytics(TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_sales_analytics(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.get_top_selling_products(INT, TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_top_selling_products(INT, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.admin_get_daily_summary(DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_get_daily_summary(DATE) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.export_customer_data(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.export_customer_data(UUID) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.delete_customer_account(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_customer_account(UUID, TEXT) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.get_abandoned_carts_for_reminder(INTERVAL, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_abandoned_carts_for_reminder(INTERVAL, INT) TO service_role;
