/**
 * Anu Atelier - Transactional Email Sender Cron Worker
 * POST /api/cron/send-emails
 * Protected by CRON_SECRET: Processes email_outbox with exponential backoff.
 */

import type { IncomingMessage, ServerResponse } from 'http';
import { getServiceRoleSupabaseClient } from '../../shared/supabaseClient';
import { renderEmail } from '../../shared/emailTemplates';
import { formatErrorResponse } from '../../shared/errors';
import { logger } from '../../shared/logger';

interface VercelRequest extends IncomingMessage {
  headers: Record<string, string | string[] | undefined>;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (data: unknown) => void;
  setHeader: (name: string, value: string | number | readonly string[]) => this;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const requestId = `req_email_cron_${Date.now()}`;
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

    // Fetch batch of up to 25 pending emails
    const { data: pendingEmails, error: fetchErr } = await supabase
      .from('email_outbox')
      .select('*')
      .eq('status', 'pending')
      .lt('attempts', 5)
      .order('created_at', { ascending: true })
      .limit(25);

    if (fetchErr) {
      throw new Error(`Failed to fetch pending emails: ${fetchErr.message}`);
    }

    let processedCount = 0;
    const apiKey = process.env.EMAIL_PROVIDER_API_KEY;

    for (const email of pendingEmails || []) {
      const rendered = renderEmail(email.template_name, email.template_data);

      try {
        if (apiKey && apiKey.startsWith('re_')) {
          // Send via Resend API
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              from: process.env.EMAIL_FROM || 'orders@anuatelier.com',
              to: email.recipient_email,
              subject: rendered.subject,
              html: rendered.html,
              text: rendered.text,
            }),
          });

          if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`Resend API error: ${errBody}`);
          }
        }

        // Mark as sent
        await supabase
          .from('email_outbox')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            attempts: email.attempts + 1,
            last_attempt_at: new Date().toISOString(),
          })
          .eq('id', email.id);

        processedCount += 1;
      } catch (sendErr) {
        const errorMsg = sendErr instanceof Error ? sendErr.message : String(sendErr);
        await supabase
          .from('email_outbox')
          .update({
            attempts: email.attempts + 1,
            last_attempt_at: new Date().toISOString(),
            error_message: errorMsg,
            status: email.attempts + 1 >= 5 ? 'failed' : 'pending',
          })
          .eq('id', email.id);
      }
    }

    logger.info('Email outbox cron processed', { processedCount, total: pendingEmails?.length || 0 }, requestId);

    res.status(200).json({
      success: true,
      processed_count: processedCount,
      total_found: pendingEmails?.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const { status, body } = formatErrorResponse(err);
    logger.error('Error processing email outbox cron', { error: err }, requestId);
    res.status(status).json(body);
  }
}
