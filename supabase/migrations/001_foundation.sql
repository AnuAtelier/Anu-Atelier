-- ==============================================================================
-- Anu Atelier - Phase B1: Foundation & Security Baseline
-- Extensions, Enums, Profiles, Roles, Audit Log, Settings, Storage & Strict RLS
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- 2. CUSTOM ENUMS
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('customer', 'staff', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM (
    'pending',
    'confirmed',
    'processing',
    'packed',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'rto'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'paid',
    'failed',
    'refunded',
    'partially_refunded',
    'cod_due',
    'cod_collected'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_method AS ENUM (
    'cod',
    'upi',
    'card',
    'netbanking',
    'wallet'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.product_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.return_status AS ENUM (
    'requested',
    'approved',
    'rejected',
    'pickup_scheduled',
    'item_received',
    'inspected',
    'replacement_dispatched',
    'refund_processed',
    'closed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.stock_transaction_type AS ENUM (
    'purchase',
    'order_placed',
    'order_cancelled',
    'return_restock',
    'manual_adjustment',
    'damaged'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.email_status AS ENUM ('pending', 'sending', 'sent', 'failed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3. UTILITY FUNCTIONS & ROLE CHECKERS (search_path = '' enforced)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. PROFILES TABLE (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  phone TEXT,
  full_name TEXT,
  role public.user_role NOT NULL DEFAULT 'customer'::public.user_role,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices on profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Security helper functions
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role AS $$
DECLARE
  v_role public.user_role;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  RETURN COALESCE(v_role, 'customer'::public.user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::public.user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('staff'::public.user_role, 'admin'::public.user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Trigger to prevent self-role escalation
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin() AND auth.role() <> 'service_role' THEN
      RAISE EXCEPTION 'Forbidden: You cannot modify user roles.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_role();

-- Trigger on auth.users for new user signup (Strictly customer role)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'customer'::public.user_role
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. AUDIT LOG (Immutable append-only ledger)
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_role TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON public.audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON public.audit_log(actor_id);

-- 6. SITE SETTINGS (Validated JSON store with Dev Defaults)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Safe Dev Defaults (all amounts strictly in integer paise)
INSERT INTO public.site_settings (key, value, description)
VALUES
  (
    'shipping',
    '{"standard_delivery_fee_paise": 6000, "free_delivery_threshold_paise": 99900}'::jsonb,
    'Shipping rates: ₹60 flat delivery fee, free delivery over ₹999'
  ),
  (
    'cod',
    '{"enabled": true, "max_amount_paise": 500000, "fee_paise": 0}'::jsonb,
    'Cash on delivery: enabled up to ₹5,000 with ₹0 extra fee'
  ),
  (
    'tax',
    '{"gst_registered": false, "default_gst_rate_percent": 5, "origin_state_code": "09"}'::jsonb,
    'Tax settings: 5% default rate placeholder, origin Uttar Pradesh (09)'
  ),
  (
    'returns',
    '{"window_days": 10, "auto_approve": false}'::jsonb,
    'Return policy: 10-day replacement window, manual admin review'
  ),
  (
    'general',
    '{"store_name": "Anu Atelier", "support_email": "support@anuatelier.com", "support_phone": "+91 98765 43210", "currency": "INR"}'::jsonb,
    'General store metadata'
  )
ON CONFLICT (key) DO NOTHING;

-- 7. RATE LIMIT ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.rate_limit_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  points INT NOT NULL DEFAULT 1,
  expire_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_key_expire ON public.rate_limit_entries(key, expire_at);

-- 8. STORAGE BUCKETS INITIALIZATION
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-media', 'product-media', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('site-assets', 'site-assets', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('review-media', 'review-media', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('return-media', 'return-media', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4']),
  ('invoices', 'invoices', false, 5242880, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 9. ROW-LEVEL SECURITY (RLS) DEFAULT-DENY BASELINE

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_entries ENABLE ROW LEVEL SECURITY;

-- 9.1 Profiles Policies
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_delete_admin_only" ON public.profiles;
CREATE POLICY "profiles_delete_admin_only" ON public.profiles
  FOR DELETE USING (public.is_admin());

-- Disallow direct client INSERT on profiles (only auth trigger can insert)
DROP POLICY IF EXISTS "profiles_insert_service_only" ON public.profiles;
CREATE POLICY "profiles_insert_service_only" ON public.profiles
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- 9.2 Audit Log Policies (Append-only, strictly Admin read)
DROP POLICY IF EXISTS "audit_log_select_admin_only" ON public.audit_log;
CREATE POLICY "audit_log_select_admin_only" ON public.audit_log
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "audit_log_insert_service_only" ON public.audit_log;
CREATE POLICY "audit_log_insert_service_only" ON public.audit_log
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- No UPDATE or DELETE policies on audit_log -> completely denied

-- 9.3 Site Settings Policies
DROP POLICY IF EXISTS "site_settings_select_public" ON public.site_settings;
CREATE POLICY "site_settings_select_public" ON public.site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "site_settings_write_admin_only" ON public.site_settings;
CREATE POLICY "site_settings_write_admin_only" ON public.site_settings
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 9.4 Rate Limit Entries Policies (Service-role only)
DROP POLICY IF EXISTS "rate_limit_service_only" ON public.rate_limit_entries;
CREATE POLICY "rate_limit_service_only" ON public.rate_limit_entries
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 9.5 Storage Objects Policies
DROP POLICY IF EXISTS "public_read_product_media" ON storage.objects;
CREATE POLICY "public_read_product_media" ON storage.objects
  FOR SELECT USING (bucket_id IN ('product-media', 'site-assets', 'review-media'));

DROP POLICY IF EXISTS "staff_admin_manage_product_media" ON storage.objects;
CREATE POLICY "staff_admin_manage_product_media" ON storage.objects
  FOR ALL USING (bucket_id IN ('product-media', 'site-assets') AND public.is_staff_or_admin())
  WITH CHECK (bucket_id IN ('product-media', 'site-assets') AND public.is_staff_or_admin());

DROP POLICY IF EXISTS "auth_upload_review_media" ON storage.objects;
CREATE POLICY "auth_upload_review_media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'review-media' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "customer_read_write_return_media" ON storage.objects;
CREATE POLICY "customer_read_write_return_media" ON storage.objects
  FOR ALL USING (
    bucket_id = 'return-media' AND (
      (auth.uid())::text = (storage.foldername(name))[1]
      OR public.is_staff_or_admin()
    )
  )
  WITH CHECK (
    bucket_id = 'return-media' AND (
      (auth.uid())::text = (storage.foldername(name))[1]
      OR public.is_staff_or_admin()
    )
  );

DROP POLICY IF EXISTS "private_read_invoices" ON storage.objects;
CREATE POLICY "private_read_invoices" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'invoices' AND (
      (auth.uid())::text = (storage.foldername(name))[1]
      OR public.is_admin()
    )
  );

DROP POLICY IF EXISTS "admin_service_manage_invoices" ON storage.objects;
CREATE POLICY "admin_service_manage_invoices" ON storage.objects
  FOR ALL USING (bucket_id = 'invoices' AND (public.is_admin() OR auth.role() = 'service_role'))
  WITH CHECK (bucket_id = 'invoices' AND (public.is_admin() OR auth.role() = 'service_role'));
