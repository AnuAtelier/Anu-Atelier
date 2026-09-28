/**
 * Anu Atelier - GST Tax Invoice Generation & Download
 * GET /api/invoices/download?order_id=...
 * Generates and returns GST Tax Invoice with intra-state (CGST+SGST) vs inter-state (IGST) tax breakup.
 */

import type { IncomingMessage, ServerResponse } from 'http';
import { getServiceRoleSupabaseClient, getAnonSupabaseClient } from '../../shared/supabaseClient';
import { formatErrorResponse, BadRequestError, ForbiddenError, NotFoundError } from '../../shared/errors';
import { logger } from '../../shared/logger';

interface VercelRequest extends IncomingMessage {
  query?: { order_id?: string; invoice_id?: string };
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (data: unknown) => void;
  setHeader: (name: string, value: string | number | readonly string[]) => this;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const requestId = `req_inv_${Date.now()}`;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Request-Id', requestId);

  if (req.method !== 'GET') {
    res.status(405).json({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET method.' } });
    return;
  }

  try {
    const url = new URL(req.url || '', 'http://localhost');
    const orderId = url.searchParams.get('order_id') || req.query?.order_id;

    if (!orderId) {
      throw new BadRequestError('Missing required parameter: order_id');
    }

    const supabase = getServiceRoleSupabaseClient();

    // 1. Fetch order & invoice records
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      throw new NotFoundError(`Order ${orderId} not found.`);
    }

    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('order_id', orderId)
      .single();

    const shippingAddress = order.shipping_address || {};
    const destStateCode = (shippingAddress as Record<string, string>).state_code || '09';
    const originStateCode = '09'; // Uttar Pradesh

    const isIntraState = destStateCode === originStateCode;
    const totalTaxPaise = order.total_tax_paise;
    const cgstPaise = isIntraState ? Math.floor(totalTaxPaise / 2) : 0;
    const sgstPaise = isIntraState ? totalTaxPaise - cgstPaise : 0;
    const igstPaise = isIntraState ? 0 : totalTaxPaise;

    const invoiceData = {
      invoice_number: invoice?.invoice_number || `INV-2627-${order.order_number.replace('AA-26-', '')}`,
      date: invoice?.created_at || order.placed_at,
      financial_year: '2026-27',
      seller: {
        legal_name: 'Anu Atelier Crafts LLP',
        trade_name: 'Anu Atelier',
        logo_url: '/logo-full.jpg',
        address: 'Artisan Workshop, Gorakhpur, Uttar Pradesh, India - 273001',
        state: 'Uttar Pradesh',
        state_code: originStateCode,
        gstin: '09AAAAA0000A1Z5',
        support_email: 'support@anuatelier.com',
      },
      buyer: {
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
        shipping_address: shippingAddress,
        place_of_supply: `${(shippingAddress as Record<string, string>).state || 'Uttar Pradesh'} (${destStateCode})`,
      },
      items: (order.order_items || []).map((item: any) => ({
        title: item.product_title,
        sku: item.sku,
        hsn_code: item.hsn_code,
        quantity: item.quantity,
        unit_price_paise: item.unit_price_paise,
        mrp_paise: item.mrp_paise,
        line_total_paise: item.line_total_paise,
        gst_rate_percent: item.gst_rate_percent,
      })),
      tax_summary: {
        is_intra_state: isIntraState,
        taxable_amount_paise: order.subtotal_sale_paise - totalTaxPaise,
        cgst_paise: cgstPaise,
        sgst_paise: sgstPaise,
        igst_paise: igstPaise,
        total_tax_paise: totalTaxPaise,
      },
      financials: {
        subtotal_mrp_paise: order.subtotal_mrp_paise,
        subtotal_sale_paise: order.subtotal_sale_paise,
        coupon_discount_paise: order.coupon_discount_paise,
        delivery_fee_paise: order.delivery_fee_paise,
        cod_fee_paise: order.cod_fee_paise,
        gift_wrap_fee_paise: order.gift_wrap_fee_paise,
        grand_total_paise: order.total_paise,
      },
    };

    logger.info('Tax invoice served', { orderId, invoiceNumber: invoiceData.invoice_number }, requestId);
    res.status(200).json({ success: true, invoice: invoiceData });
  } catch (err) {
    const { status, body } = formatErrorResponse(err);
    logger.error('Failed to generate invoice', { error: err }, requestId);
    res.status(status).json(body);
  }
}
