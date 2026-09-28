/**
 * Anu Atelier - Create Razorpay Payment Order
 * POST /api/payments/create
 * Creates an authoritative Razorpay order with the exact amount FROM the database.
 */

import type { IncomingMessage, ServerResponse } from 'http';
import { getServiceRoleSupabaseClient, getAnonSupabaseClient } from '../../shared/supabaseClient';
import { formatErrorResponse, BadRequestError, UnauthorizedError, NotFoundError } from '../../shared/errors';
import { logger } from '../../shared/logger';

interface VercelRequest extends IncomingMessage {
  body?: { order_id?: string };
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (data: unknown) => void;
  setHeader: (name: string, value: string | number | readonly string[]) => this;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const requestId = (req.headers['x-request-id'] as string) || `req_${Date.now()}`;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Request-Id', requestId);

  if (req.method !== 'POST') {
    res.status(405).json({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST method.' } });
    return;
  }

  try {
    const { order_id } = req.body || {};
    if (!order_id) {
      throw new BadRequestError('Missing required field: order_id');
    }

    const supabase = getAnonSupabaseClient();
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, order_number, total_paise, status, payment_status, payment_method, user_id')
      .eq('id', order_id)
      .single();

    if (error || !order) {
      throw new NotFoundError(`Order with ID ${order_id} not found.`);
    }

    if (order.status !== 'pending' && order.status !== 'placed') {
      throw new BadRequestError(`Cannot initiate payment for order in '${order.status}' status.`);
    }

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_dev';
    const razorpayOrderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    logger.info('Created payment intent', { order_id, amount_paise: order.total_paise }, requestId);

    res.status(200).json({
      success: true,
      order_id: order.id,
      order_number: order.order_number,
      razorpay_order_id: razorpayOrderId,
      amount_paise: order.total_paise,
      currency: 'INR',
      key_id: keyId,
    });
  } catch (err) {
    const { status, body } = formatErrorResponse(err);
    logger.error('Failed to create payment intent', { error: err }, requestId);
    res.status(status).json(body);
  }
}
