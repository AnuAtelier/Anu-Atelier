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
