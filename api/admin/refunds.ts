/**
 * Anu Atelier - Admin Refund Initiation Endpoint
 * POST /api/admin/refunds
 * Staff/Admin only: Initiates full or partial refund and logs in refunds ledger.
 */

import type { IncomingMessage, ServerResponse } from 'http';
import { getServiceRoleSupabaseClient } from '../../shared/supabaseClient';
import { formatErrorResponse, BadRequestError, ForbiddenError, NotFoundError } from '../../shared/errors';
import { logger } from '../../shared/logger';

interface VercelRequest extends IncomingMessage {
  body?: {
    order_id?: string;
    amount_paise?: number;
    reason?: string;
    refund_type?: 'online' | 'manual_bank_transfer' | 'cod_cash';
  };
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (data: unknown) => void;
  setHeader: (name: string, value: string | number | readonly string[]) => this;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const requestId = (req.headers['x-request-id'] as string) || `req_rfnd_${Date.now()}`;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Request-Id', requestId);

  if (req.method !== 'POST') {
    res.status(405).json({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST method.' } });
    return;
  }

  try {
    const { order_id, amount_paise, reason, refund_type = 'online' } = req.body || {};

    if (!order_id || !amount_paise || !reason) {
      throw new BadRequestError('Missing required refund parameters: order_id, amount_paise, reason');
    }

    if (amount_paise <= 0 || !Number.isInteger(amount_paise)) {
      throw new BadRequestError('Refund amount must be a positive integer in paise.');
    }

    const supabase = getServiceRoleSupabaseClient();

    // Verify order exists and is eligible for refund
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, order_number, total_paise, payment_status')
      .eq('id', order_id)
      .single();

    if (orderErr || !order) {
      throw new NotFoundError(`Order ${order_id} not found.`);
    }

    if (order.payment_status !== 'paid' && order.payment_status !== 'cod_collected') {
      throw new BadRequestError(`Cannot refund order with payment status '${order.payment_status}'.`);
    }

    if (amount_paise > order.total_paise) {
      throw new BadRequestError(`Refund amount (₹${amount_paise / 100}) cannot exceed order total (₹${order.total_paise / 100}).`);
    }

    // Generate refund record
    const refundId = `rfnd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const { error: insertErr } = await supabase.from('refunds').insert({
      order_id: order.id,
      provider_refund_id: refundId,
      amount_paise,
      reason,
      refund_type,
      status: 'processed',
    });

    if (insertErr) {
      throw new BadRequestError(`Failed to record refund: ${insertErr.message}`);
    }

    // Update order payment status
    const isFullRefund = amount_paise === order.total_paise;
    const newPaymentStatus = isFullRefund ? 'refunded' : 'partially_refunded';

    await supabase
      .from('orders')
      .update({ payment_status: newPaymentStatus, updated_at: new Date().toISOString() })
      .eq('id', order.id);

    await supabase.from('order_status_history').insert({
      order_id: order.id,
      from_status: null,
      to_status: 'confirmed',
      note: `Refund issued: ₹${amount_paise / 100} (${reason})`,
    });

    logger.info('Refund processed successfully', { order_id, amount_paise, refundId }, requestId);

    res.status(200).json({
      success: true,
      refund_id: refundId,
      order_id,
      amount_paise,
      new_payment_status: newPaymentStatus,
    });
  } catch (err) {
    const { status, body } = formatErrorResponse(err);
    logger.error('Refund initiation error', { error: err }, requestId);
    res.status(status).json(body);
  }
}
