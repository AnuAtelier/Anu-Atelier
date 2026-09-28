/**
 * Anu Atelier - Supabase Client Factories
 * Strict separation between public Anon Client and private Service Role Client.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { assertDevEnvironment } from './envGuard';

let anonClient: SupabaseClient | null = null;
let serviceRoleClient: SupabaseClient | null = null;

export function getAnonSupabaseClient(): SupabaseClient {
  if (anonClient) return anonClient;

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

  if (!url || !anonKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment.');
  }

  anonClient = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return anonClient;
}

export function getServiceRoleSupabaseClient(): SupabaseClient {
  if (serviceRoleClient) return serviceRoleClient;

  // Ensure this is never called against production accidentally by test/dev scripts
  assertDevEnvironment();

  const url = process.env.SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!url || !serviceKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  }

  serviceRoleClient = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serviceRoleClient;
}
