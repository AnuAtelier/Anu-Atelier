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

