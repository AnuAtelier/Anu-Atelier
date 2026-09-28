-- ==============================================================================
-- Anu Atelier - Phase B4: Payments (Razorpay & COD)
-- Payments, Webhook Events, Refunds Ledger, Payment Alerts,
-- Idempotent mark_order_paid, Expiry Job, and COD Collection Triggers
-- ==============================================================================

-- 1. PAYMENTS TABLE (Audit Trail of all Online & COD Transactions)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'razorpay' CHECK (provider IN ('razorpay', 'cod', 'manual')),
  provider_payment_id TEXT UNIQUE, -- e.g. 'pay_XXXXXX'
  provider_order_id TEXT, -- e.g. 'order_XXXXXX'
  amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  status public.payment_status NOT NULL DEFAULT 'pending'::public.payment_status,
  method_type TEXT, -- 'card', 'upi', 'netbanking', 'wallet', 'cod'
  card_network TEXT, -- 'visa', 'mastercard', 'rupay'
  card_last4 TEXT CHECK (card_last4 IS NULL OR card_last4 ~ '^[0-9]{4}$'), -- Masked last 4 digits only
  vpa TEXT, -- Masked UPI ID hint if provided
  bank_name TEXT, -- Bank name for netbanking
  captured_at TIMESTAMPTZ,
  raw_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_id ON public.payments(provider_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

DROP TRIGGER IF EXISTS trg_payments_updated_at ON public.payments;
CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. WEBHOOK EVENTS TABLE (Deduplicated Webhook Ledger)
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'razorpay',
  event_id TEXT NOT NULL UNIQUE, -- x-razorpay-event-id
  event_type TEXT NOT NULL, -- e.g. 'payment.captured', 'payment.failed', 'refund.processed'
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'processed' CHECK (status IN ('received', 'processed', 'ignored', 'failed')),
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_id ON public.webhook_events(event_id);

-- 3. REFUNDS TABLE (Full & Partial Refund Ledger)
CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
  payment_id UUID REFERENCES public.payments(id) ON DELETE RESTRICT,
  provider_refund_id TEXT UNIQUE, -- e.g. 'rfnd_XXXXXX'
  amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processed' CHECK (status IN ('initiated', 'processed', 'failed')),
  refund_type TEXT NOT NULL DEFAULT 'online' CHECK (refund_type IN ('online', 'manual_bank_transfer', 'cod_cash')),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  raw_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refunds_order ON public.refunds(order_id);

-- 4. PAYMENT ALERTS TABLE (Anomalies, Mismatches & Duplicate Payments)
CREATE TABLE IF NOT EXISTS public.payment_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('amount_mismatch', 'duplicate_payment', 'late_payment_refunded', 'webhook_failure')),
  severity TEXT NOT NULL DEFAULT 'high' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details JSONB NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_alerts_unresolved ON public.payment_alerts(resolved, created_at DESC)
  WHERE resolved = FALSE;

-- 5. IDEMPOTENT ORDER CONFIRMATION RPC (mark_order_paid)
-- Called by BOTH /api/payments/verify AND /api/webhooks/razorpay
CREATE OR REPLACE FUNCTION public.mark_order_paid(
  p_order_id UUID,
  p_payment_id TEXT,
  p_provider_order_id TEXT,
  p_amount_paise BIGINT,
  p_method_type TEXT DEFAULT 'online',
  p_card_network TEXT DEFAULT NULL,
  p_card_last4 TEXT DEFAULT NULL,
  p_vpa TEXT DEFAULT NULL,
  p_bank_name TEXT DEFAULT NULL,
  p_raw_meta JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_existing_payment RECORD;
  v_new_payment_id UUID;
BEGIN
  -- Lock order row FOR UPDATE
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order with ID % not found.', p_order_id;
  END IF;

  -- 1. Idempotency: If order is already confirmed and paid
  IF v_order.payment_status = 'paid'::public.payment_status THEN
    -- Check if this is a duplicate distinct payment for the same order
    SELECT * INTO v_existing_payment FROM public.payments WHERE provider_payment_id = p_payment_id;
    IF NOT FOUND THEN
      -- DUPLICATE PAYMENT ANOMALY: Customer paid twice for the same order!
      INSERT INTO public.payment_alerts (order_id, alert_type, severity, details)
      VALUES (
        p_order_id,
        'duplicate_payment',
        'critical',
        jsonb_build_object(
          'message', 'Duplicate payment received for an already paid order. Immediate refund required.',
          'new_payment_id', p_payment_id,
          'amount_paise', p_amount_paise,
          'existing_order_number', v_order.order_number
        )
      );

      INSERT INTO public.payments (
        order_id, provider, provider_payment_id, provider_order_id, amount_paise,
        status, method_type, card_network, card_last4, vpa, bank_name, captured_at, raw_metadata
      )
      VALUES (
        p_order_id, 'razorpay', p_payment_id, p_provider_order_id, p_amount_paise,
        'paid'::public.payment_status, p_method_type, p_card_network, p_card_last4, p_vpa, p_bank_name, NOW(), p_raw_meta
      );

      RETURN jsonb_build_object(
        'success', true,
        'order_id', p_order_id,
        'is_duplicate_payment', true,
        'message', 'Duplicate payment registered for auto-refund.'
      );
    END IF;

    -- Normal replay of verify / webhook for same payment ID
    RETURN jsonb_build_object(
      'success', true,
      'order_id', p_order_id,
      'status', 'confirmed',
      'payment_status', 'paid',
      'is_idempotent_replay', true
    );
  END IF;

  -- 2. Amount Mismatch Defense (Critical Security Invariant)
  IF p_amount_paise <> v_order.total_paise THEN
    INSERT INTO public.payment_alerts (order_id, alert_type, severity, details)
    VALUES (
      p_order_id,
      'amount_mismatch',
      'critical',
      jsonb_build_object(
        'expected_total_paise', v_order.total_paise,
        'received_amount_paise', p_amount_paise,
        'payment_id', p_payment_id,
        'provider_order_id', p_provider_order_id
      )
    );

    RAISE EXCEPTION 'Payment verification failed: Amount mismatch. Expected % paise, received % paise.',
      v_order.total_paise, p_amount_paise;
  END IF;

  -- 3. Late Payment Handling (Order was cancelled by expiry job before payment arrived)
  IF v_order.status = 'cancelled'::public.order_status THEN
    INSERT INTO public.payment_alerts (order_id, alert_type, severity, details)
    VALUES (
      p_order_id,
      'late_payment_refunded',
      'high',
      jsonb_build_object(
        'message', 'Payment arrived after order was cancelled/expired. Flagged for automatic refund.',
        'payment_id', p_payment_id,
        'amount_paise', p_amount_paise
      )
    );

    INSERT INTO public.payments (
      order_id, provider, provider_payment_id, provider_order_id, amount_paise,
      status, method_type, card_network, card_last4, vpa, bank_name, captured_at, raw_metadata
    )
    VALUES (
      p_order_id, 'razorpay', p_payment_id, p_provider_order_id, p_amount_paise,
      'paid'::public.payment_status, p_method_type, p_card_network, p_card_last4, p_vpa, p_bank_name, NOW(), p_raw_meta
    );

    RETURN jsonb_build_object(
      'success', false,
      'order_id', p_order_id,
      'status', 'cancelled',
      'message', 'Order expired before payment was verified. Payment flagged for refund.'
    );
  END IF;

  -- 4. Record Successful Payment
  INSERT INTO public.payments (
    order_id, provider, provider_payment_id, provider_order_id, amount_paise,
    status, method_type, card_network, card_last4, vpa, bank_name, captured_at, raw_metadata
  )
  VALUES (
    p_order_id, 'razorpay', p_payment_id, p_provider_order_id, p_amount_paise,
    'paid'::public.payment_status, p_method_type, p_card_network, p_card_last4, p_vpa, p_bank_name, NOW(), p_raw_meta
  )
  RETURNING id INTO v_new_payment_id;

  -- 5. Advance Order State Machine
  UPDATE public.orders
  SET status = 'confirmed'::public.order_status,
      payment_status = 'paid'::public.payment_status,
      updated_at = NOW()
  WHERE id = p_order_id;

  -- 6. Record Status History
  INSERT INTO public.order_status_history (order_id, from_status, to_status, note)
  VALUES (p_order_id, v_order.status, 'confirmed'::public.order_status, 'Online payment verified (' || p_payment_id || ')');

  -- 7. Queue Order Paid Confirmation Email
  INSERT INTO public.email_outbox (
    recipient_email, recipient_name, subject, template_name, template_data, dedupe_key
  )
  VALUES (
    v_order.customer_email,
    v_order.customer_name,
    'Payment Received & Order Confirmed - ' || v_order.order_number || ' | Anu Atelier',
    'order_confirmed',
    jsonb_build_object(
      'order_number', v_order.order_number,
      'customer_name', v_order.customer_name,
      'amount_paise', p_amount_paise,
      'payment_id', p_payment_id
    ),
    'order_paid_' || v_order.order_number
  );

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'order_number', v_order.order_number,
    'status', 'confirmed',
    'payment_status', 'paid',
    'payment_id', p_payment_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 6. MARK PAYMENT FAILED RPC
CREATE OR REPLACE FUNCTION public.mark_payment_failed(
  p_order_id UUID,
  p_payment_id TEXT,
  p_error_desc TEXT DEFAULT 'Payment failed',
  p_raw_meta JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order with ID % not found.', p_order_id;
  END IF;

  INSERT INTO public.payments (
    order_id, provider, provider_payment_id, amount_paise,
    status, method_type, raw_metadata
  )
  VALUES (
    p_order_id, 'razorpay', p_payment_id, v_order.total_paise,
    'failed'::public.payment_status, 'online', p_raw_meta
  )
  ON CONFLICT (provider_payment_id) DO UPDATE
  SET status = 'failed'::public.payment_status,
      updated_at = NOW();

  INSERT INTO public.order_status_history (order_id, from_status, to_status, note)
  VALUES (p_order_id, v_order.status, v_order.status, 'Payment attempt failed: ' || p_error_desc);

  RETURN jsonb_build_object('success', true, 'order_id', p_order_id, 'payment_status', 'failed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 7. MARK COD COLLECTED RPC
CREATE OR REPLACE FUNCTION public.mark_cod_collected(
  p_order_id UUID,
  p_actor_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
BEGIN
  -- Staff or Admin only
  IF NOT public.is_staff_or_admin() AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Forbidden: Only staff or administrators can mark COD collected.';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order with ID % not found.', p_order_id;
  END IF;

  IF v_order.payment_method <> 'cod'::public.payment_method THEN
    RAISE EXCEPTION 'Cannot mark COD collected on non-COD order.';
  END IF;

  UPDATE public.orders
  SET payment_status = 'cod_collected'::public.payment_status,
      updated_at = NOW()
  WHERE id = p_order_id;

  INSERT INTO public.payments (
    order_id, provider, amount_paise, status, method_type, captured_at
  )
  VALUES (
    p_order_id, 'cod', v_order.total_paise, 'cod_collected'::public.payment_status, 'cod', NOW()
  );

  INSERT INTO public.order_status_history (order_id, from_status, to_status, note, actor_id)
  VALUES (p_order_id, v_order.status, v_order.status, 'Cash on Delivery collected at doorstep', p_actor_id);

  RETURN jsonb_build_object('success', true, 'order_id', p_order_id, 'payment_status', 'cod_collected');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 8. UNPAID ORDER EXPIRY BACKGROUND JOB (expire_unpaid_orders)
CREATE OR REPLACE FUNCTION public.expire_unpaid_orders()
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
  v_new_stock INT;
  v_expired_count INT := 0;
BEGIN
  -- Find unpaid online orders older than 30 minutes
  FOR v_order IN
    SELECT *
    FROM public.orders
    WHERE status = 'pending'::public.order_status
      AND payment_method <> 'cod'::public.payment_method
      AND payment_expires_at IS NOT NULL
      AND payment_expires_at <= NOW()
    FOR UPDATE SKIP LOCKED
  LOOP
    -- 1. Restock items to inventory
    FOR v_item IN SELECT * FROM public.order_items WHERE order_id = v_order.id
    LOOP
      IF v_item.variant_id IS NOT NULL THEN
        UPDATE public.product_variants
        SET stock = stock + v_item.quantity
        WHERE id = v_item.variant_id
        RETURNING stock INTO v_new_stock;

        INSERT INTO public.inventory_ledger (
          product_id, variant_id, delta, balance_after, transaction_type, reference_id, notes
        )
        VALUES (
          v_item.product_id, v_item.variant_id, v_item.quantity, v_new_stock,
          'order_cancelled'::public.stock_transaction_type, v_order.order_number, 'Restock: Payment expired'
        );
      ELSE
        UPDATE public.products
        SET stock = stock + v_item.quantity
        WHERE id = v_item.product_id
        RETURNING stock INTO v_new_stock;

        INSERT INTO public.inventory_ledger (
          product_id, delta, balance_after, transaction_type, reference_id, notes
        )
        VALUES (
          v_item.product_id, v_item.quantity, v_new_stock,
          'order_cancelled'::public.stock_transaction_type, v_order.order_number, 'Restock: Payment expired'
        );
      END IF;
    END LOOP;

    -- 2. Release redeemed coupon
    IF v_order.coupon_id IS NOT NULL THEN
      UPDATE public.coupons
      SET used_count = GREATEST(0, used_count - 1)
      WHERE id = v_order.coupon_id;

      DELETE FROM public.coupon_redemptions WHERE order_id = v_order.id;
    END IF;

    -- 3. Mark order cancelled
    UPDATE public.orders
    SET status = 'cancelled'::public.order_status,
        cancelled_at = NOW(),
        cancellation_reason = 'Payment window expired (30 minutes)',
        updated_at = NOW()
    WHERE id = v_order.id;

    -- 4. Status history
    INSERT INTO public.order_status_history (order_id, from_status, to_status, note)
    VALUES (v_order.id, 'pending'::public.order_status, 'cancelled'::public.order_status, 'Auto-cancelled: Payment expired');

    v_expired_count := v_expired_count + 1;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'expired_orders_count', v_expired_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 9. ROW-LEVEL SECURITY (RLS) FOR PAYMENTS TABLES
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_alerts ENABLE ROW LEVEL SECURITY;

-- 9.1 Payments Policies
DROP POLICY IF EXISTS "payments_own_read" ON public.payments;
CREATE POLICY "payments_own_read" ON public.payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_staff_or_admin()))
  );

DROP POLICY IF EXISTS "payments_manage_service_role" ON public.payments;
CREATE POLICY "payments_manage_service_role" ON public.payments
  FOR ALL USING (auth.role() = 'service_role' OR public.is_admin())
  WITH CHECK (auth.role() = 'service_role' OR public.is_admin());

-- 9.2 Webhook Events (Service role only)
DROP POLICY IF EXISTS "webhook_events_service_only" ON public.webhook_events;
CREATE POLICY "webhook_events_service_only" ON public.webhook_events
  FOR ALL USING (auth.role() = 'service_role' OR public.is_admin())
  WITH CHECK (auth.role() = 'service_role' OR public.is_admin());

-- 9.3 Refunds Policies
DROP POLICY IF EXISTS "refunds_own_read" ON public.refunds;
CREATE POLICY "refunds_own_read" ON public.refunds
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_staff_or_admin()))
  );

DROP POLICY IF EXISTS "refunds_manage_staff_admin" ON public.refunds;
CREATE POLICY "refunds_manage_staff_admin" ON public.refunds
  FOR ALL USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

-- 9.4 Payment Alerts (Admin only)
DROP POLICY IF EXISTS "payment_alerts_admin_only" ON public.payment_alerts;
CREATE POLICY "payment_alerts_admin_only" ON public.payment_alerts
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());
