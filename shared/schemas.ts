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
