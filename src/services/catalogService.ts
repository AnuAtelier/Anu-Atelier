/**
 * Anu Atelier - Catalog & Discovery Service
 * Bridges React Frontend to Supabase Backend Catalog RPCs & Tables
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../constants';

export interface PincodeCheckResult {
  serviceable: boolean;
  city?: string;
  state?: string;
  codAvailable: boolean;
  estimatedDeliveryDays: number;
}

/**
 * Transforms database product record to React frontend Product interface
 */
export function mapDbProductToClient(dbProd: any): Product {
  const images = dbProd.images && Array.isArray(dbProd.images)
    ? dbProd.images.map((img: any) => (typeof img === 'string' ? img : img.url))
    : [];

  const primaryImage =
    dbProd.image ||
    (images.length > 0 ? images[0] : '/img/promo/promo-terracotta.jpg');

  return {
    id: dbProd.id,
    slug: dbProd.slug || dbProd.id,
    name: dbProd.title || dbProd.name,
    description: dbProd.description || dbProd.short_description || '',
    price: typeof dbProd.price_paise === 'number' ? Math.round(dbProd.price_paise / 100) : (dbProd.price || 0),
    originalPrice: typeof dbProd.mrp_paise === 'number' ? Math.round(dbProd.mrp_paise / 100) : (dbProd.originalPrice || null),
    categoryId: dbProd.category_id || dbProd.categoryId || 'terracotta-clay',
    categoryName: dbProd.category?.name || dbProd.categoryName || 'Artisan Crafts',
    subcategoryId: dbProd.subcategoryId || '',
    subcategoryName: dbProd.subcategoryName || '',
    image: primaryImage,
    images: images.length > 0 ? images : [primaryImage],
    stock: typeof dbProd.stock === 'number' ? dbProd.stock : 10,
    status: dbProd.status || 'published',
    rating: dbProd.stats?.avg_rating || dbProd.rating || 4.8,
    reviewsCount: dbProd.stats?.review_count || dbProd.reviewsCount || 12,
    soldCount: dbProd.stats?.bought_count || dbProd.soldCount || 45,
    badge: (dbProd.badges?.[0] as any) || dbProd.badge || 'Handmade',
    highlights: dbProd.highlights?.map((h: any) => (typeof h === 'string' ? h : h.text)) || [
      '100% Handcrafted by master artisans in Uttar Pradesh',
      'Sustainable natural clay / organic fabrics',
      'Direct artisan to doorstep authentic heritage craft',
    ],
    specs: dbProd.specs?.reduce((acc: any, s: any) => {
      acc[s.spec_key] = s.spec_value;
      return acc;
    }, {}) || {
      Craft: 'Handcrafted Artistry',
      Origin: dbProd.country_of_origin || 'India',
      Care: 'Gentle handling with dry cotton cloth',
    },
    createdAt: dbProd.created_at ? new Date(dbProd.created_at).getTime() : Date.now(),
    updatedAt: dbProd.updated_at ? new Date(dbProd.updated_at).getTime() : Date.now(),
  };
}

export const catalogService = {
  /**
   * Fetches published products from Supabase database
   * Falls back to INITIAL_PRODUCTS if unconfigured or offline
   */
  async fetchProducts(): Promise<Product[]> {
    if (!isSupabaseConfigured) {
      return this.getLocalFallbackProducts();
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name, slug),
          artisan:artisans(name),
          images:product_images(url, is_primary, display_order),
          stats:product_stats(avg_rating, review_count, bought_count)
        `)
        .eq('status', 'published')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        console.warn('Supabase fetch returned empty/error, using seed data:', error?.message);
        return this.getLocalFallbackProducts();
      }

      const mapped = data.map(mapDbProductToClient);
      // Merge any user-created local crafts
      const localCustom = this.getLocalCustomProducts();
      const dbIds = new Set(mapped.map((p) => p.id));
      return [...localCustom.filter((p) => !dbIds.has(p.id)), ...mapped];
    } catch (err) {
      console.error('Failed to fetch products from Supabase:', err);
      return this.getLocalFallbackProducts();
    }
  },

  /**
   * Fetches single product detail by slug or ID
   */
  async fetchProductBySlug(slugOrId: string): Promise<Product | undefined> {
    if (!isSupabaseConfigured) {
      const products = this.getLocalFallbackProducts();
      return products.find((p) => p.slug === slugOrId || p.id === slugOrId);
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name, slug),
          artisan:artisans(name, bio, location),
          images:product_images(url, is_primary, display_order),
          variants:product_variants(*),
          highlights:product_highlights(text),
          specs:product_specs(spec_key, spec_value),
          stats:product_stats(avg_rating, review_count, bought_count)
        `)
        .or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
        .single();

      if (error || !data) {
        const products = this.getLocalFallbackProducts();
        return products.find((p) => p.slug === slugOrId || p.id === slugOrId);
      }

      return mapDbProductToClient(data);
    } catch (err) {
      const products = this.getLocalFallbackProducts();
      return products.find((p) => p.slug === slugOrId || p.id === slugOrId);
    }
  },

  /**
   * Publishes new craft directly to Supabase backend and local storage
   */
  async publishCraft(craft: Product): Promise<{ success: boolean; product?: Product; error?: string }> {
    try {
      // 1. If Supabase is configured, insert into products table
      if (isSupabaseConfigured) {
        const payload = {
          title: craft.name,
          slug: craft.slug || `${craft.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`,
          short_description: craft.description.slice(0, 150),
          description: craft.description,
          price_paise: Math.round(craft.price * 100),
          mrp_paise: Math.round((craft.originalPrice || craft.price) * 100),
          stock: craft.stock || 10,
          status: 'published',
          cod_allowed: true,
          is_free_delivery: craft.price >= 999,
          badges: craft.badge ? [craft.badge] : ['Handmade'],
        };

        const { data: inserted, error: insertErr } = await supabase
          .from('products')
          .insert(payload)
          .select()
          .single();

        if (insertErr) {
          console.warn('Could not insert craft into Supabase, saving locally:', insertErr.message);
        } else if (inserted && craft.image) {
          // Link image
          await supabase.from('product_images').insert({
            product_id: inserted.id,
            url: craft.image,
            is_primary: true,
            display_order: 1,
          });
        }
      }

      // 2. Always persist to local custom crafts list
      const custom = this.getLocalCustomProducts();
      const updated = [craft, ...custom.filter((p) => p.id !== craft.id)];
      localStorage.setItem('anu_published_products', JSON.stringify(updated));

      return { success: true, product: craft };
    } catch (err: any) {
      console.error('Error in publishCraft:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Checks PIN code serviceability via database or Indian PIN validation
   */
  async checkPincode(pincode: string): Promise<PincodeCheckResult> {
    const cleanPin = pincode.trim();
    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      return {
        serviceable: false,
        codAvailable: false,
        estimatedDeliveryDays: 0,
      };
    }

    if (isSupabaseConfigured) {
      try {
        const { data } = await supabase.rpc('check_pincode', { p_pincode: cleanPin });
        if (data) {
          return {
            serviceable: Boolean(data.serviceable),
            city: data.city,
            state: data.state,
            codAvailable: Boolean(data.cod_available),
            estimatedDeliveryDays: data.estimated_delivery_days || 4,
          };
        }
      } catch (e) {
        // Fall back to safe heuristics
      }
    }

    // Default heuristics for valid 6-digit Indian PIN codes
    return {
      serviceable: true,
      city: cleanPin.startsWith('11') ? 'Delhi' : cleanPin.startsWith('20') ? 'Noida / UP' : 'India',
      state: cleanPin.startsWith('20') ? 'Uttar Pradesh' : 'India',
      codAvailable: true,
      estimatedDeliveryDays: cleanPin.startsWith('20') ? 2 : 4,
    };
  },

  getLocalCustomProducts(): Product[] {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('anu_published_products');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  getLocalFallbackProducts(): Product[] {
    const custom = this.getLocalCustomProducts();
    const customIds = new Set(custom.map((p) => p.id));
    return [...custom, ...INITIAL_PRODUCTS.filter((p) => !customIds.has(p.id))];
  },
};
