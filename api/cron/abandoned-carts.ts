/**
 * Anu Atelier - Abandoned Cart Reminder Background Worker
 * POST /api/cron/abandoned-carts
 * Protected by CRON_SECRET: Identifies opted-in customer carts untouched for >2 hours,
 * queues personalized reminder email with item preview into email_outbox,
 * and caps reminders at maximum 2 per cart.
 */

import type { IncomingMessage, ServerResponse } from 'http';
import { getServiceRoleSupabaseClient } from '../../shared/supabaseClient';
import { formatErrorResponse } from '../../shared/errors';
import { logger } from '../../shared/logger';
import { renderEmail } from '../../shared/emailTemplates';

interface VercelRequest extends IncomingMessage {
  headers: Record<string, string | string[] | undefined>;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (data: unknown) => void;
  setHeader: (name: string, value: string | number | readonly string[]) => this;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const requestId = `req_cron_cart_${Date.now()}`;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Request-Id', requestId);

  // Validate CRON_SECRET authorization
  const authHeader = (req.headers.authorization as string) || '';
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or missing CRON_SECRET bearer token.' } });
    return;
  }

  try {
    const supabase = getServiceRoleSupabaseClient();
    const appBaseUrl = process.env.APP_BASE_URL || 'https://anuatelier.com';

    // Retrieve eligible abandoned carts (older than 2h, max 2 reminders)
    const { data: eligibleCarts, error: queryErr } = await supabase.rpc(
      'get_abandoned_carts_for_reminder',
      { p_older_than_interval: '2 hours', p_max_reminders: 2 }
    );

    if (queryErr) {
      throw new Error(`Failed to query abandoned carts: ${queryErr.message}`);
    }

    const carts = eligibleCarts || [];
    let queuedCount = 0;

    for (const cart of carts) {
      if (!cart.customer_email || !cart.cart_items || cart.cart_items.length === 0) {
        continue;
      }

      const recoveryUrl = `${appBaseUrl}/cart?recovered=true&utm_source=abandoned_cart&utm_medium=email`;
      const emailContent = renderEmail('abandoned_cart', {
        customer_name: cart.customer_name || 'Artisan Craft Lover',
        cart_items: cart.cart_items,
        recovery_url: recoveryUrl,
      });

      // Queue into transactional outbox
      const { error: insertErr } = await supabase.from('email_outbox').insert({
        recipient_email: cart.customer_email,
        subject: emailContent.subject,
        body_html: emailContent.html,
        body_text: emailContent.text,
        template_name: 'abandoned_cart',
        template_data: { cart_id: cart.cart_id, reminder_number: cart.reminder_count + 1 },
        status: 'pending',
      });

      if (!insertErr) {
        // Increment reminder counter on cart
        await supabase
          .from('carts')
          .update({
            reminder_count: (cart.reminder_count || 0) + 1,
            last_reminded_at: new Date().toISOString(),
          })
          .eq('id', cart.cart_id);

        queuedCount++;
      }
    }

    logger.info('Abandoned cart reminders processed', {
      totalFound: carts.length,
      queuedEmails: queuedCount,
      requestId,
    });

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      processed_carts: carts.length,
      queued_emails: queuedCount,
    });
  } catch (err: any) {
    const { status, body } = formatErrorResponse(err);
    logger.error('Error during abandoned cart reminder job', { error: err.message, requestId });
    res.status(status).json(body);
  }
}
