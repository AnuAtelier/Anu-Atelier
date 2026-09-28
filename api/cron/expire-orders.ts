/**
 * Anu Atelier - Unpaid Order Expiry Cron Job
 * POST /api/cron/expire-orders
 * Protected by CRON_SECRET: Cancels unpaid orders older than 30 min and restores stock.
 */

import type { IncomingMessage, ServerResponse } from 'http';
import { getServiceRoleSupabaseClient } from '../../shared/supabaseClient';
import { formatErrorResponse, UnauthorizedError } from '../../shared/errors';
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
  const requestId = `req_cron_exp_${Date.now()}`;
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
    const { data: result, error } = await supabase.rpc('expire_unpaid_orders');

    if (error) {
      throw new Error(`Failed to execute expire_unpaid_orders RPC: ${error.message}`);
    }

    logger.info('Expired unpaid orders successfully', { result }, requestId);
    res.status(200).json({ success: true, timestamp: new Date().toISOString(), ...result });
  } catch (err) {
    const { status, body } = formatErrorResponse(err);
    logger.error('Error during unpaid orders expiry job', { error: err }, requestId);
    res.status(status).json(body);
  }
}
