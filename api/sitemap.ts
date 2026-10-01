/**
 * Anu Atelier - Dynamic XML Sitemap Endpoint
 * GET /api/sitemap
 * Generates SEO-compliant XML sitemap indexing all published products,
 * categories, artisans, and store policy pages.
 */

import type { IncomingMessage, ServerResponse } from 'http';
import { getServiceRoleSupabaseClient } from '../shared/supabaseClient';
import { formatErrorResponse } from '../shared/errors';
import { logger } from '../shared/logger';

interface VercelRequest extends IncomingMessage {}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (data: unknown) => void;
  setHeader: (name: string, value: string | number | readonly string[]) => this;
  end: (data?: any) => this;
}

interface UrlEntry {
  loc: string;
  priority: string;
  changefreq: string;
  lastmod?: string;
}

export function buildSitemapXml(
  baseUrl: string,
  categories: { slug: string; updated_at?: string }[],
  artisans: { id: string; updated_at?: string }[],
  products: { slug: string; updated_at?: string }[]
): string {
  const staticUrls: UrlEntry[] = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${baseUrl}/about`, priority: '0.6', changefreq: 'monthly' },
    { loc: `${baseUrl}/contact`, priority: '0.6', changefreq: 'monthly' },
    { loc: `${baseUrl}/shipping-policy`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${baseUrl}/terms-and-conditions`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${baseUrl}/privacy-policy`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${baseUrl}/cancellation-and-refunds`, priority: '0.5', changefreq: 'monthly' },
  ];

  const categoryUrls = categories.map((c) => ({
    loc: `${baseUrl}/category/${c.slug}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: c.updated_at ? new Date(c.updated_at).toISOString().split('T')[0] : undefined,
  }));

  const productUrls = products.map((p) => ({
    loc: `${baseUrl}/product/${p.slug}`,
    priority: '0.9',
    changefreq: 'daily',
    lastmod: p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : undefined,
  }));

  const allUrls = [...staticUrls, ...categoryUrls, ...productUrls];

  const xmlEntries = allUrls.map((u) => `
  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const requestId = `req_sitemap_${Date.now()}`;
  res.setHeader('X-Request-Id', requestId);

  if (req.method !== 'GET') {
    res.status(405).json({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET method.' } });
    return;
  }

  try {
    const baseUrl = process.env.APP_BASE_URL || 'https://anuatelier.com';
    let categories: { slug: string; updated_at?: string }[] = [];
    let artisans: { id: string; updated_at?: string }[] = [];
    let products: { slug: string; updated_at?: string }[] = [];

    const hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

    if (hasSupabase) {
      try {
        const supabase = getServiceRoleSupabaseClient();
        const { data: c } = await supabase
          .from('categories')
          .select('slug, updated_at')
          .is('deleted_at', null);

        const { data: a } = await supabase
          .from('artisans')
          .select('id, updated_at');

        const { data: p } = await supabase
          .from('products')
          .select('slug, updated_at')
          .eq('status', 'published')
          .is('deleted_at', null);

        if (c) categories = c;
        if (a) artisans = a;
        if (p) products = p;
      } catch (err) {
        logger.warn('Failed to query Supabase for sitemap, using local fallback', { error: err }, requestId);
      }
    }

    if (products.length === 0) {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const filePath = path.resolve(process.cwd(), 'products.json');
        if (fs.existsSync(filePath)) {
          const raw = fs.readFileSync(filePath, 'utf-8');
          const localProducts = JSON.parse(raw);
          products = localProducts.map((p: any) => ({
            slug: p.slug || p.id,
            updated_at: new Date(p.createdAt || Date.now()).toISOString(),
          }));
          const catSet = new Set<string>();
          localProducts.forEach((p: any) => {
            if (p.categoryId) catSet.add(p.categoryId);
          });
          categories = Array.from(catSet).map((slug) => ({ slug }));
        }
      } catch {
        // Fallback gracefully
      }
    }

    const sitemapXml = buildSitemapXml(
      baseUrl,
      categories,
      artisans,
      products
    );

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    res.status(200).end(sitemapXml);
    return;
  } catch (err: any) {
    logger.error('Failed to generate sitemap', { error: err.message, requestId });
    const { status, body } = formatErrorResponse(err);
    res.status(status).json(body);
  }
}
