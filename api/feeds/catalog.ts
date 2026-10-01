/**
 * Anu Atelier - Product Catalog Feeds Endpoint
 * GET /api/feeds/catalog?format=google (Google Merchant Center RSS 2.0 XML)
 * GET /api/feeds/catalog?format=meta   (Meta/Instagram Catalog JSON)
 */

import type { IncomingMessage, ServerResponse } from 'http';
import { getServiceRoleSupabaseClient } from '../../shared/supabaseClient';
import { formatErrorResponse } from '../../shared/errors';
import { logger } from '../../shared/logger';

interface VercelRequest extends IncomingMessage {
  query?: Record<string, string>;
  url?: string;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (data: unknown) => void;
  setHeader: (name: string, value: string | number | readonly string[]) => this;
  end: (data?: any) => this;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export function generateGoogleXml(products: any[], baseUrl: string): string {
  const items = products.map((p) => {
    const primaryImg = p.images?.find((img: any) => img.is_primary)?.url || p.images?.[0]?.url || `${baseUrl}/img/hero-artisan.jpg`;
    const priceFormatted = `${((p.price_paise || 0) / 100).toFixed(2)} INR`;
    const availability = (p.stock || 0) > 0 ? 'in stock' : 'out of stock';
    const productUrl = `${baseUrl}/product/${p.slug}`;
    const categoryName = p.category?.name || 'Handicrafts';

    return `
    <item>
      <g:id>${escapeXml(p.sku || p.id)}</g:id>
      <g:title>${escapeXml(p.title)}</g:title>
      <g:description>${escapeXml(p.short_description || p.description || p.title)}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(primaryImg)}</g:image_link>
      <g:brand>Anu Atelier</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${priceFormatted}</g:price>
      <g:google_product_category>Arts &amp; Entertainment &gt; Hobbies &amp; Creative Arts &gt; Crafts &amp; Hobbies</g:google_product_category>
      <g:product_type>${escapeXml(categoryName)}</g:product_type>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard</g:service>
        <g:price>${p.is_free_delivery ? '0.00 INR' : '60.00 INR'}</g:price>
      </g:shipping>
    </item>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Anu Atelier Crafts</title>
    <link>${baseUrl}</link>
    <description>Authentic Indian Handmade Crafts &amp; Heritage Apparel</description>
    ${items}
  </channel>
</rss>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const requestId = `req_feed_${Date.now()}`;
  res.setHeader('X-Request-Id', requestId);

  if (req.method !== 'GET') {
    res.status(405).json({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET method.' } });
    return;
  }

  try {
    const url = new URL(req.url || '/', 'http://localhost');
    const format = url.searchParams.get('format') || 'google';
    const baseUrl = process.env.APP_BASE_URL || 'https://anuatelier.com';

    let items: any[] = [];
    const hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

    if (hasSupabase) {
      try {
        const supabase = getServiceRoleSupabaseClient();
        const { data: products, error } = await supabase
          .from('products')
          .select(`
            id,
            sku,
            title,
            slug,
            short_description,
            description,
            price_paise,
            mrp_paise,
            stock,
            is_free_delivery,
            category:categories(name, slug),
            images:product_images(url, is_primary)
          `)
          .eq('status', 'published')
          .is('deleted_at', null)
          .order('published_at', { ascending: false });

        if (!error && products) {
          items = products;
        }
      } catch (err) {
        logger.warn('Failed to fetch catalog feed from Supabase, using local fallback', { error: err }, requestId);
      }
    }

    if (items.length === 0) {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const filePath = path.resolve(process.cwd(), 'products.json');
        if (fs.existsSync(filePath)) {
          const raw = fs.readFileSync(filePath, 'utf-8');
          const localProducts = JSON.parse(raw);
          items = localProducts.map((p: any) => ({
            id: p.id,
            sku: p.id,
            title: p.name,
            slug: p.slug || p.id,
            short_description: p.description?.slice(0, 150) || p.name,
            description: p.description || p.name,
            price_paise: (p.price || 0) * 100,
            mrp_paise: (p.originalPrice || p.price || 0) * 100,
            stock: p.stock || 10,
            is_free_delivery: (p.price || 0) >= 499,
            category: { name: p.categoryName || 'Handicrafts', slug: p.categoryId },
            images: (p.images || [p.image]).map((img: string, i: number) => ({ url: img, is_primary: i === 0 })),
          }));
        }
      } catch {
        // Fallback gracefully
      }
    }

    if (format === 'meta') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      const metaFeed = {
        catalog_name: 'Anu Atelier Product Feed',
        updated_at: new Date().toISOString(),
        items: items.map((p: any) => ({
          id: p.sku || p.id,
          title: p.title,
          description: p.short_description || p.description,
          availability: (p.stock || 0) > 0 ? 'in stock' : 'out of stock',
          condition: 'new',
          price: `${((p.price_paise || 0) / 100).toFixed(2)} INR`,
          link: `${baseUrl}/product/${p.slug}`,
          image_link: p.images?.find((img: any) => img.is_primary)?.url || p.images?.[0]?.url || `${baseUrl}/img/hero-artisan.jpg`,
          brand: 'Anu Atelier',
          category: p.category?.name || 'Handicrafts',
        })),
      };
      res.status(200).json(metaFeed);
      return;
    }

    // Default: Google Merchant Center RSS 2.0 XML
    const xml = generateGoogleXml(items, baseUrl);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.status(200).end(xml);
    return;
  } catch (err: any) {
    logger.error('Failed to generate catalog feed', { error: err.message, requestId });
    const { status, body } = formatErrorResponse(err);
    res.status(status).json(body);
  }
}
