/**
 * Anu Atelier - Zod Validation Schemas
 * Runtime input validation for settings, profiles, and core identifiers.
 */

import { z } from 'zod';

export const userRoleSchema = z.enum(['customer', 'staff', 'admin']);

export const paiseSchema = z
  .number()
  .int('Amount must be an integer')
  .nonnegative('Amount cannot be negative');

export const indianPincodeSchema = z
  .string()
  .trim()
  .regex(/^[1-9][0-9]{5}$/, 'Invalid Indian 6-digit PIN code');

export const indianPhoneSchema = z
  .string()
  .trim()
  .transform((val) => val.replace(/[\s-]/g, ''))
  .refine(
    (val) => /^(\+91)?[6-9]\d{9}$/.test(val),
    'Invalid Indian mobile phone number (must be 10 digits starting with 6-9)'
  );

export const profileUpdateSchema = z
  .object({
    full_name: z.string().trim().min(1, 'Name cannot be empty').max(100).optional(),
    phone: indianPhoneSchema.optional(),
    avatar_url: z.string().url('Invalid avatar URL').optional().nullable(),
  })
  .strict(); // Disallows any unauthorized fields like 'role' or 'id'

export const shippingSettingsSchema = z.object({
  standard_delivery_fee_paise: paiseSchema,
  free_delivery_threshold_paise: paiseSchema,
});

export const codSettingsSchema = z.object({
  enabled: z.boolean(),
  max_amount_paise: paiseSchema,
  fee_paise: paiseSchema,
});

export const taxSettingsSchema = z.object({
  gst_registered: z.boolean(),
  gstin: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format')
    .optional(),
  default_gst_rate_percent: z.number().min(0).max(28),
  origin_state_code: z.string().length(2, 'State code must be 2 digits'),
});

export const returnSettingsSchema = z.object({
  window_days: z.number().int().min(0).max(30),
  auto_approve: z.boolean(),
});

export const generalSettingsSchema = z.object({
  store_name: z.string().min(1),
  support_email: z.string().email(),
  support_phone: z.string().min(10),
  currency: z.literal('INR'),
});

export const siteSettingsSchema = z.object({
  shipping: shippingSettingsSchema,
  cod: codSettingsSchema,
  tax: taxSettingsSchema,
  returns: returnSettingsSchema,
  general: generalSettingsSchema,
});

export const productListFilterSchema = z.object({
  category_slug: z.string().trim().optional(),
  min_price_paise: paiseSchema.optional(),
  max_price_paise: paiseSchema.optional(),
  in_stock: z.boolean().optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'rating', 'popularity']).default('newest'),
  limit: z.number().int().min(1).max(50).default(20),
  cursor_published_at: z.string().datetime().optional(),
  cursor_id: z.string().uuid().optional(),
});

export const productSearchFilterSchema = z.object({
  query: z.string().trim().min(1, 'Search query cannot be empty'),
  category_slug: z.string().trim().optional(),
  sort: z.enum(['relevance', 'price_asc', 'price_desc']).default('relevance'),
  limit: z.number().int().min(1).max(50).default(20),
  offset: z.number().int().min(0).default(0),
});

export const productCreateSchema = z
  .object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
    slug: z.string().trim().min(3).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be kebab-case'),
    short_description: z.string().trim().max(300).optional(),
    description: z.string().trim().min(20, 'Description must be at least 20 characters'),
    category_id: z.string().uuid('Invalid category ID'),
    artisan_id: z.string().uuid().optional().nullable(),
    mrp_paise: paiseSchema.min(100, 'MRP must be at least ₹1 (100 paise)'),
    price_paise: paiseSchema.min(100, 'Price must be at least ₹1 (100 paise)'),
    sku: z.string().trim().optional().nullable(),
    stock: z.number().int().min(0).default(0),
    low_stock_threshold: z.number().int().min(0).default(3),
    weight_grams: z.number().int().positive().optional().nullable(),
    dimensions_cm: z.string().trim().optional().nullable(),
    handmade_lead_days: z.number().int().min(0).default(0),
    cod_allowed: z.boolean().default(true),
    is_free_delivery: z.boolean().default(false),
    delivery_days_override: z.number().int().positive().optional().nullable(),
    is_returnable: z.boolean().default(true),
    replacement_days_override: z.number().int().min(0).optional().nullable(),
    badges: z.array(z.string().trim()).default([]),
    tags: z.array(z.string().trim()).default([]),
    materials: z.string().trim().optional().nullable(),
    care_instructions: z.string().trim().optional().nullable(),
    hsn_code: z.string().trim().default('6912'),
    gst_rate_percent: z.number().min(0).max(28).default(5.0),
    country_of_origin: z.string().trim().default('India'),
    meta_title: z.string().trim().optional().nullable(),
    meta_description: z.string().trim().optional().nullable(),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
  })
  .refine((data) => data.price_paise <= data.mrp_paise, {
    message: 'Selling price cannot exceed MRP (mrp_paise)',
    path: ['price_paise'],
  });

