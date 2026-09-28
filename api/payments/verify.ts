/**
 * Anu Atelier - Verify Razorpay Payment Signature
 * POST /api/payments/verify
 * Verifies HMAC-SHA256 signature and idempotently confirms the order.
 */

import type { IncomingMessage, ServerResponse } from 'http';
import { getServiceRoleSupabaseClient, getAnonSupabaseClient } from '../../shared/supabaseClient';
import { verifyRazorpaySignature } from '../../shared/razorpay';
import { formatErrorResponse, BadRequestError, UnauthorizedError } from '../../shared/errors';
import { logger } from '../../shared/logger';

interface VercelRequest extends IncomingMessage {
  body?: {
    order_id?: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };
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
    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

    if (!order_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new BadRequestError('Missing required payment verification fields.');
    }

    // Verify HMAC-SHA256 signature
    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      throw new BadRequestError('Invalid payment signature. Verification failed.');
    }

    // Fetch order to get exact total_paise
    const supabase = getServiceRoleSupabaseClient();
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, total_paise')
      .eq('id', order_id)
      .single();

    if (orderErr || !order) {
      throw new BadRequestError(`Order ${order_id} not found.`);
    }

    // Call idempotent mark_order_paid RPC
    const { data: result, error: rpcErr } = await supabase.rpc('mark_order_paid', {
      p_order_id: order.id,
      p_payment_id: razorpay_payment_id,
      p_provider_order_id: razorpay_order_id,
      p_amount_paise: order.total_paise,
      p_method_type: 'online',
    });

    if (rpcErr) {
      throw new BadRequestError(`Order confirmation failed: ${rpcErr.message}`);
    }

    logger.info('Payment verified successfully', { order_id, razorpay_payment_id }, requestId);

    res.status(200).json({
      success: true,
      order_id,
      payment_id: razorpay_payment_id,
      status: 'confirmed',
      details: result,
    });
  } catch (err) {
    const { status, body } = formatErrorResponse(err);
    logger.error('Payment verification failed', { error: err }, requestId);
    res.status(status).json(body);
  }
}
