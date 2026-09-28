/**
 * Anu Atelier - Health Check Endpoint
 * GET /api/health
 * Public endpoint to probe system status, environment, and DB connectivity.
 */

import type { IncomingMessage, ServerResponse } from 'http';
import { getAnonSupabaseClient } from '../shared/supabaseClient';
import { logger } from '../shared/logger';

interface VercelRequest extends IncomingMessage {
  query?: Record<string, string | string[]>;
  body?: unknown;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (data: unknown) => void;
  setHeader: (name: string, value: string | number | readonly string[]) => this;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const startTime = Date.now();
  const requestId = (req.headers['x-request-id'] as string) || `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('X-Request-Id', requestId);

  if (req.method !== 'GET') {
    res.status(405).json({
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: `HTTP ${req.method || 'UNKNOWN'} method is not supported. Use GET.`,
      },
    });
    return;
  }

  let dbStatus = 'unconfigured';
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = getAnonSupabaseClient();
      // Perform lightweight ping to public site_settings table
      const { error } = await supabase.from('site_settings').select('key').limit(1);
      if (error) {
        dbStatus = `degraded: ${error.message}`;
      } else {
        dbStatus = 'healthy';
      }
    } catch (err: unknown) {
      dbStatus = `unreachable: ${err instanceof Error ? err.message : 'connection failure'}`;
    }
  }

  const durationMs = Date.now() - startTime;
  const isHealthy = dbStatus === 'healthy' || dbStatus === 'unconfigured';

  logger.info('Health probe executed', { dbStatus, durationMs }, requestId);

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    requestId,
    environment: process.env.APP_ENV || 'development',
    version: '1.0.0',
    services: {
      database: dbStatus,
      storage: supabaseUrl ? 'configured' : 'unconfigured',
    },
    latencyMs: durationMs,
  });
}
