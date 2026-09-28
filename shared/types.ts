/**
 * Anu Atelier - Core Shared Types & Enums
 * STRICT MONEY CONVENTION: All monetary amounts are integer paise (₹1 = 100 paise).
 */

export type UserRole = 'customer' | 'staff' | 'admin';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'rto';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded'
  | 'cod_due'
  | 'cod_collected';

export type PaymentMethod = 'cod' | 'upi' | 'card' | 'netbanking' | 'wallet';

export type ProductStatus = 'draft' | 'published' | 'archived';

export type ReturnStatus =
  | 'requested'
  | 'approved'
  | 'rejected'
  | 'pickup_scheduled'
  | 'item_received'
  | 'inspected'
  | 'replacement_dispatched'
  | 'refund_processed'
  | 'closed';

export type StockTransactionType =
  | 'purchase'
  | 'order_placed'
  | 'order_cancelled'
  | 'return_restock'
  | 'manual_adjustment'
  | 'damaged';

export type EmailStatus = 'pending' | 'sending' | 'sent' | 'failed';

/**
 * Monetary representation: integer paise (1 INR = 100 Paise).
 * Floats are strictly prohibited for monetary values.
 */
export type Paise = number;

export function assertIntegerPaise(amount: number, fieldName = 'Amount'): void {
  if (!Number.isInteger(amount) || amount < 0) {
    throw new TypeError(
      `[MONEY_INVARIANT_VIOLATION] ${fieldName} must be a non-negative integer representing paise. Received: ${amount}`
    );
  }
}

export function toPaise(rupees: number): Paise {
  const rounded = Math.round(rupees * 100);
  assertIntegerPaise(rounded);
  return rounded;
}

export function toRupees(paise: Paise): number {
  assertIntegerPaise(paise);
  return paise / 100;
}

export function formatRupees(paise: Paise, includePaise = false): string {
  assertIntegerPaise(paise);
  const rupees = paise / 100;
  if (!includePaise && paise % 100 === 0) {
    return `₹${rupees.toLocaleString('en-IN')}`;
  }
  return `₹${rupees.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export interface Profile {
  id: string; // matches auth.users(id)
  email: string | null;
  phone: string | null;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLogEntry {
  id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'TRUNCATE';
  actor_id: string | null;
  actor_role: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface ShippingSettings {
  standard_delivery_fee_paise: Paise;
  free_delivery_threshold_paise: Paise;
}

export interface CodSettings {
  enabled: boolean;
  max_amount_paise: Paise;
  fee_paise: Paise;
}

export interface TaxSettings {
  gst_registered: boolean;
  gstin?: string;
  default_gst_rate_percent: number;
  origin_state_code: string;
}

export interface ReturnSettings {
  window_days: number;
  auto_approve: boolean;
}

export interface GeneralSettings {
  store_name: string;
  support_email: string;
  support_phone: string;
  currency: 'INR';
}

export interface SiteSettings {
  shipping: ShippingSettings;
  cod: CodSettings;
  tax: TaxSettings;
  returns: ReturnSettings;
  general: GeneralSettings;
}

export interface RateLimitEntry {
  id: string;
  key: string;
  points: number;
  expire_at: string;
  created_at: string;
}

export type StorageBucketName =
  | 'product-media'
  | 'review-media'
  | 'return-media'
  | 'invoices'
  | 'site-assets';

export interface Category {
  id: string;
  parent_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Artisan {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  photo_url?: string | null;
  location: string;
  craft_speciality: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  short_description?: string | null;
  description: string;
  category_id: string;
  artisan_id?: string | null;
  mrp_paise: Paise;
  price_paise: Paise;
  sku?: string | null;
  stock: number;
  low_stock_threshold: number;
  weight_grams?: number | null;
  dimensions_cm?: string | null;
  handmade_lead_days: number;
  cod_allowed: boolean;
  is_free_delivery: boolean;
  delivery_days_override?: number | null;
  is_returnable: boolean;
  replacement_days_override?: number | null;
  badges: string[];
  tags: string[];
  materials?: string | null;
  care_instructions?: string | null;
  hsn_code: string;
  gst_rate_percent: number;
  country_of_origin: string;
  meta_title?: string | null;
  meta_description?: string | null;
  status: ProductStatus;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string | null;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  title: string;
  sku?: string | null;
  color_name?: string | null;
  color_hex?: string | null;
  size?: string | null;
  price_paise_override?: Paise | null;
  mrp_paise_override?: Paise | null;
  stock: number;
  image_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductHighlight {
  id: string;
  product_id: string;
  icon_key: string;
  title: string;
  display_order: number;
}

export interface ProductSpec {
  id: string;
  product_id: string;
  key: string;
  value: string;
  display_order: number;
}

export interface ProductOffer {
  id: string;
  product_id: string;
  sale_price_paise: Paise;
  label: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  created_at: string;
}

export interface ProductStats {
  product_id: string;
  average_rating: number;
  reviews_count: number;
  ratings_count: number;
  rating_1_count: number;
  rating_2_count: number;
  rating_3_count: number;
  rating_4_count: number;
  rating_5_count: number;
  bought_count: number;
  updated_at: string;
}

export interface PincodeInfo {
  pincode: string;
  city: string;
  state: string;
  state_code: string;
  is_serviceable: boolean;
  is_cod_allowed: boolean;
  min_delivery_days: number;
  max_delivery_days: number;
  zone: string;
}

export interface ProductListItem {
  id: string;
  title: string;
  slug: string;
  short_description?: string | null;
  category_name: string;
  category_slug: string;
  artisan_name?: string | null;
  artisan_location?: string | null;
  mrp_paise: Paise;
  price_paise: Paise;
  primary_image_url?: string | null;
  stock: number;
  is_free_delivery: boolean;
  cod_allowed: boolean;
  badges: string[];
  tags: string[];
  average_rating: number;
  reviews_count: number;
  active_offer_label?: string | null;
  active_offer_sale_price_paise?: Paise | null;
  published_at: string;
}

export interface ProductDetailResult {
  product: Product & {
    category_name: string;
    category_slug: string;
    artisan_name?: string | null;
    artisan_bio?: string | null;
    artisan_photo_url?: string | null;
    artisan_location?: string | null;
    artisan_craft_speciality?: string | null;
  };
  images: ProductImage[];
  variants: ProductVariant[];
  highlights: ProductHighlight[];
  specs: ProductSpec[];
  stats: ProductStats;
  active_offer?: ProductOffer | null;
  related_products: Array<{
    id: string;
    title: string;
    slug: string;
    mrp_paise: Paise;
    price_paise: Paise;
    primary_image_url?: string | null;
    average_rating: number;
    reviews_count: number;
  }>;
  redirect_from?: string | null;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  state_code: string;
  pincode: string;
  address_type: 'home' | 'work' | 'other';
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id?: string | null;
  quantity: number;
  personalization_note?: string | null;
  is_gift: boolean;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  discount_type: 'percent' | 'flat' | 'free_delivery';
  discount_value_paise: Paise;
  max_discount_paise?: Paise | null;
  min_order_paise: Paise;
  starts_at: string;
  expires_at: string;
  usage_limit_total?: number | null;
  usage_limit_per_user: number;
  used_count: number;
  is_first_order_only: boolean;
  scope: 'all' | 'category' | 'product';
  scope_id?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string | null;
  product_title: string;
  variant_title?: string | null;
  sku?: string | null;
  image_url?: string | null;
  hsn_code: string;
  gst_rate_percent: number;
  mrp_paise: Paise;
  unit_price_paise: Paise;
  quantity: number;
  discount_paise: Paise;
  line_total_paise: Paise;
  tax_paise: Paise;
  personalization_note?: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  idempotency_key?: string | null;
  user_id?: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  subtotal_mrp_paise: Paise;
  subtotal_sale_paise: Paise;
  discount_paise: Paise;
  coupon_id?: string | null;
  coupon_code?: string | null;
  coupon_discount_paise: Paise;
  delivery_fee_paise: Paise;
  cod_fee_paise: Paise;
  gift_wrap_fee_paise: Paise;
  total_tax_paise: Paise;
  total_paise: Paise;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: Record<string, unknown>;
  billing_address?: Record<string, unknown> | null;
  is_gift: boolean;
  gift_message?: string | null;
  payment_expires_at?: string | null;
  attribution?: Record<string, unknown>;
  placed_at: string;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface CalculateTotalsResult {
  items: Array<{
    product_id: string;
    variant_id?: string | null;
    title: string;
    sku?: string | null;
    quantity: number;
    mrp_paise: Paise;
    unit_price_paise: Paise;
    line_total_paise: Paise;
    hsn_code: string;
    gst_rate_percent: number;
    is_free_delivery: boolean;
  }>;
  item_count: number;
  subtotal_mrp_paise: Paise;
  subtotal_sale_paise: Paise;
  product_discount_paise: Paise;
  coupon_code?: string | null;
  coupon_id?: string | null;
  coupon_discount_paise: Paise;
  coupon_error?: string | null;
  delivery_fee_paise: Paise;
  cod_fee_paise: Paise;
  gift_wrap_fee_paise: Paise;
  total_tax_paise: Paise;
  grand_total_paise: Paise;
  savings_paise: Paise;
  free_delivery_progress: {
    threshold_paise: Paise;
    needed_paise: Paise;
    is_free: boolean;
  };
  error?: string;
}

export interface PlaceOrderResult {
  success: boolean;
  order_id: string;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  grand_total_paise: Paise;
  payment_expires_at?: string | null;
  is_duplicate?: boolean;
}


