/**
 * Anu Atelier - Razorpay Raw Body Webhook Handler
 * POST /api/webhooks/razorpay
 * Validates HMAC signature over raw body, deduplicates event ID, and dispatches events.
 */

import type { IncomingMessage, ServerResponse } from 'http';
import { getServiceRoleSupabaseClient } from '../../shared/supabaseClient';
import { verifyWebhookSignature } from '../../shared/razorpay';
import { formatErrorResponse, BadRequestError } from '../../shared/errors';
import { logger } from '../../shared/logger';

interface VercelRequest extends IncomingMessage {
  body?: unknown;
  rawBody?: string;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (data: unknown) => void;
  setHeader: (name: string, value: string | number | readonly string[]) => this;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const requestId = (req.headers['x-request-id'] as string) || `req_wh_${Date.now()}`;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Request-Id', requestId);

  if (req.method !== 'POST') {
    res.status(405).json({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST method.' } });
    return;
  }

  try {
    const signature = (req.headers['x-razorpay-signature'] as string) || '';
    const eventId = (req.headers['x-razorpay-event-id'] as string) || `evt_${Date.now()}`;

    // Extract raw payload string
    let rawBody = '';
    if (typeof req.rawBody === 'string') {
      rawBody = req.rawBody;
    } else if (typeof req.body === 'string') {
      rawBody = req.body;
    } else if (req.body) {
      rawBody = JSON.stringify(req.body);
    }

    if (!rawBody) {
      throw new BadRequestError('Empty webhook payload received.');
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      throw new BadRequestError('Invalid webhook signature. Request rejected.');
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event || 'unknown';

    const supabase = getServiceRoleSupabaseClient();

    // 1. Deduplication check in webhook_events
    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id, status')
      .eq('event_id', eventId)
      .single();

    if (existingEvent) {
      logger.info('Webhook event already processed (idempotent ignore)', { eventId, eventType }, requestId);
      res.status(200).json({ received: true, is_duplicate: true });
      return;
    }

    // Record webhook event in ledger
    await supabase.from('webhook_events').insert({
      event_id: eventId,
      event_type: eventType,
      payload,
      status: 'processed',
    });

    // 2. Dispatch relevant payment events
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity || {};
      const notes = paymentEntity.notes || {};
      const orderId = notes.order_id;
      const paymentId = paymentEntity.id;
      const amountPaise = paymentEntity.amount;
      const providerOrderId = paymentEntity.order_id;

      if (orderId && paymentId && amountPaise) {
        await supabase.rpc('mark_order_paid', {
          p_order_id: orderId,
          p_payment_id: paymentId,
          p_provider_order_id: providerOrderId,
          p_amount_paise: amountPaise,
          p_method_type: paymentEntity.method || 'online',
          p_card_network: paymentEntity.card?.network || null,
          p_card_last4: paymentEntity.card?.last4 || null,
          p_vpa: paymentEntity.vpa || null,
          p_bank_name: paymentEntity.bank || null,
          p_raw_meta: { webhook_event_id: eventId },
        });
      }
    } else if (eventType === 'payment.failed') {
      const paymentEntity = payload.payload?.payment?.entity || {};
      const notes = paymentEntity.notes || {};
      const orderId = notes.order_id;
      const paymentId = paymentEntity.id;

      if (orderId && paymentId) {
        await supabase.rpc('mark_payment_failed', {
          p_order_id: orderId,
          p_payment_id: paymentId,
          p_error_desc: paymentEntity.error_description || 'Payment failed',
          p_raw_meta: { webhook_event_id: eventId },
        });
      }
    }

    logger.info('Webhook event dispatched successfully', { eventId, eventType }, requestId);
    res.status(200).json({ received: true, event_id: eventId });
  } catch (err) {
    const { status, body } = formatErrorResponse(err);
    logger.error('Webhook processing error', { error: err }, requestId);
    res.status(status).json(body);
  }
}
