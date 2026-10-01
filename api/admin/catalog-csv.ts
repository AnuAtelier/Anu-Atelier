/**
 * Anu Atelier - Bulk Catalog CSV Import & Export Endpoint
 * GET  /api/admin/catalog-csv -> Streams RFC-4180 CSV export of active catalog
 * POST /api/admin/catalog-csv -> Validates (with dry-run) and imports catalog rows
 */

import type { IncomingMessage, ServerResponse } from 'http';
import { getServiceRoleSupabaseClient } from '../../shared/supabaseClient';
import { formatErrorResponse, BadRequestError, UnauthorizedError } from '../../shared/errors';
import { logger } from '../../shared/logger';

interface VercelRequest extends IncomingMessage {
  query?: Record<string, string>;
  body?: {
    dry_run?: boolean;
    csv_data?: string;
  };
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (data: unknown) => void;
  setHeader: (name: string, value: string | number | readonly string[]) => this;
  send?: (data: string) => void;
}

export interface CSVRowError {
  row: number;
  sku: string;
  message: string;
}

export interface CSVValidationResult {
  dry_run: boolean;
  total_rows: number;
  valid_rows: number;
  error_rows: number;
  errors: CSVRowError[];
  imported_count?: number;
  updated_count?: number;
}

// RFC-4180 CSV parser supporting quoted values and line breaks
export function parseCSV(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\r' && nextChar === '\n') {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
        i++; // skip \n
      } else if (char === '\n' || char === '\r') {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  return rows.filter((r) => r.length > 0 && r.some((field) => field.length > 0));
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const requestId = (req.headers['x-request-id'] as string) || `req_csv_${Date.now()}`;
  res.setHeader('X-Request-Id', requestId);

  const supabase = getServiceRoleSupabaseClient();

  // GET: Export Catalog CSV
  if (req.method === 'GET') {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          sku,
          title,
          slug,
          category:categories(slug),
          artisan:artisans(name),
          price_paise,
          mrp_paise,
          stock,
          low_stock_threshold,
          handmade_lead_days,
          cod_allowed,
          is_free_delivery,
          is_returnable,
          hsn_code,
          gst_rate_percent,
          status
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const headers = [
        'sku',
        'title',
        'slug',
        'category_slug',
        'artisan_name',
        'price_rupees',
        'mrp_rupees',
        'stock',
        'low_stock_threshold',
        'lead_time_days',
        'cod_allowed',
        'free_delivery',
        'returnable',
        'hsn_code',
        'gst_rate',
        'status',
      ];

      const rows = (products || []).map((p: any) => [
        p.sku || '',
        `"${(p.title || '').replace(/"/g, '""')}"`,
        p.slug || '',
        p.category?.slug || '',
        `"${(p.artisan?.name || '').replace(/"/g, '""')}"`,
        ((p.price_paise || 0) / 100).toFixed(2),
        ((p.mrp_paise || 0) / 100).toFixed(2),
        String(p.stock ?? 0),
        String(p.low_stock_threshold ?? 3),
        String(p.handmade_lead_days ?? 0),
        p.cod_allowed ? 'true' : 'false',
        p.is_free_delivery ? 'true' : 'false',
        p.is_returnable ? 'true' : 'false',
        p.hsn_code || '6912',
        String(p.gst_rate_percent ?? 5.0),
        p.status || 'draft',
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      const dateStr = new Date().toISOString().slice(0, 10);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="anu_atelier_catalog_${dateStr}.csv"`);
      res.status(200);
      res.end(csvContent);
      return;
    } catch (err: any) {
      logger.error('Failed to export catalog CSV', { error: err.message, requestId });
      const { status, body } = formatErrorResponse(err);
      res.status(status).json(body);
      return;
    }
  }

  // POST: Validate and Import Catalog CSV
  if (req.method === 'POST') {
    try {
      const isDryRun = req.query?.dry_run === 'true' || req.body?.dry_run !== false;
      const csvData = req.body?.csv_data;

      if (!csvData || typeof csvData !== 'string') {
        throw new BadRequestError('Missing csv_data in request body.');
      }

      const parsedRows = parseCSV(csvData);
      if (parsedRows.length <= 1) {
        throw new BadRequestError('CSV file is empty or contains only headers.');
      }

      const headerRow = parsedRows[0].map((h) => h.toLowerCase());
      const skuIdx = headerRow.indexOf('sku');
      const titleIdx = headerRow.indexOf('title');
      const categoryIdx = headerRow.indexOf('category_slug');
      const priceIdx = headerRow.indexOf('price_rupees');
      const mrpIdx = headerRow.indexOf('mrp_rupees');
      const stockIdx = headerRow.indexOf('stock');
      const statusIdx = headerRow.indexOf('status');

      if (skuIdx === -1 || titleIdx === -1 || priceIdx === -1) {
        throw new BadRequestError('CSV must include at minimum: sku, title, price_rupees headers.');
      }

      // Fetch existing categories for foreign key validation
      const { data: categories } = await supabase.from('categories').select('id, slug');
      const categoryMap = new Map((categories || []).map((c: any) => [c.slug, c.id]));

      const errors: CSVRowError[] = [];
      const validItems: any[] = [];
      const seenSkus = new Set<string>();

      for (let r = 1; r < parsedRows.length; r++) {
        const row = parsedRows[r];
        const rowNum = r + 1; // 1-indexed for display
        const sku = row[skuIdx]?.trim();
        const title = row[titleIdx]?.trim();
        const priceStr = row[priceIdx]?.trim();
        const mrpStr = mrpIdx !== -1 ? row[mrpIdx]?.trim() : priceStr;
        const categorySlug = categoryIdx !== -1 ? row[categoryIdx]?.trim() : '';
        const stockStr = stockIdx !== -1 ? row[stockIdx]?.trim() : '0';
        const status = (statusIdx !== -1 ? row[statusIdx]?.trim() : 'draft') || 'draft';

        if (!sku) {
          errors.push({ row: rowNum, sku: '', message: 'Missing SKU' });
          continue;
        }

        if (seenSkus.has(sku.toUpperCase())) {
          errors.push({ row: rowNum, sku, message: `Duplicate SKU '${sku}' in import file` });
          continue;
        }
        seenSkus.add(sku.toUpperCase());

        if (!title) {
          errors.push({ row: rowNum, sku, message: 'Missing product title' });
          continue;
        }

        const priceRupees = parseFloat(priceStr);
        if (isNaN(priceRupees) || priceRupees <= 0) {
          errors.push({ row: rowNum, sku, message: `Invalid price '${priceStr}'. Must be positive number.` });
          continue;
        }

        const mrpRupees = parseFloat(mrpStr) || priceRupees;
        if (mrpRupees < priceRupees) {
          errors.push({ row: rowNum, sku, message: `MRP (₹${mrpRupees}) cannot be less than price (₹${priceRupees})` });
          continue;
        }

        const stock = parseInt(stockStr, 10);
        if (isNaN(stock) || stock < 0) {
          errors.push({ row: rowNum, sku, message: `Invalid stock '${stockStr}'. Must be non-negative integer.` });
          continue;
        }

        if (!['draft', 'published', 'archived'].includes(status)) {
          errors.push({ row: rowNum, sku, message: `Invalid status '${status}'. Must be draft, published, or archived.` });
          continue;
        }

        let categoryId: string | undefined;
        if (categorySlug) {
          categoryId = categoryMap.get(categorySlug);
          if (!categoryId) {
            errors.push({ row: rowNum, sku, message: `Category '${categorySlug}' does not exist.` });
            continue;
          }
        }

        validItems.push({
          sku,
          title,
          category_id: categoryId,
          price_paise: Math.round(priceRupees * 100),
          mrp_paise: Math.round(mrpRupees * 100),
          stock,
          status,
        });
      }

      const result: CSVValidationResult = {
        dry_run: isDryRun,
        total_rows: parsedRows.length - 1,
        valid_rows: validItems.length,
        error_rows: errors.length,
        errors,
      };

      if (!isDryRun && errors.length === 0 && validItems.length > 0) {
        let imported = 0;
        let updated = 0;

        for (const item of validItems) {
          const { data: existing } = await supabase
            .from('products')
            .select('id')
            .eq('sku', item.sku)
            .single();

          if (existing) {
            await supabase.from('products').update(item).eq('id', existing.id);
            updated++;
          } else {
            // Generate clean slug
            const slugBase = item.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '');
            const slug = `${slugBase}-${item.sku.toLowerCase()}`;

            await supabase.from('products').insert({
              ...item,
              slug,
              description: `Authentic handcrafted craft: ${item.title}`,
            });
            imported++;
          }
        }

        result.imported_count = imported;
        result.updated_count = updated;

        logger.info('Catalog CSV import completed', { imported, updated, requestId });
      }

      res.status(200).json({ success: true, result });
      return;
    } catch (err: any) {
      logger.error('Failed to import catalog CSV', { error: err.message, requestId });
      const { status, body } = formatErrorResponse(err);
      res.status(status).json(body);
      return;
    }
  }

  res.status(405).json({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET or POST method.' } });
}
