/**
 * Anu Atelier - Structured Logger
 * Emits structured JSON logs and redacts sensitive data (tokens, passwords, keys).
 */

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'secret',
  'authorization',
  'service_role_key',
  'apikey',
  'api_key',
  'key_secret',
  'pan',
  'card_number',
  'cvv',
  'razorpay_key_secret',
  'razorpay_webhook_secret',
  'email_provider_api_key',
  'cron_secret',
]);

function redactSensitiveData(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item));
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      result[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      result[key] = redactSensitiveData(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  requestId?: string;
  error?: unknown;
}

export const logger = {
  log(level: LogLevel, message: string, context?: Record<string, unknown>, requestId?: string): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(requestId ? { requestId } : {}),
      ...(context ? { context: redactSensitiveData(context) as Record<string, unknown> } : {}),
    };

    const formatted = JSON.stringify(entry);
    if (level === 'error') {
      console.error(formatted);
    } else if (level === 'warn') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  },

  info(message: string, context?: Record<string, unknown>, requestId?: string): void {
    this.log('info', message, context, requestId);
  },

  warn(message: string, context?: Record<string, unknown>, requestId?: string): void {
    this.log('warn', message, context, requestId);
  },

  error(message: string, context?: Record<string, unknown>, requestId?: string): void {
    this.log('error', message, context, requestId);
  },

  debug(message: string, context?: Record<string, unknown>, requestId?: string): void {
    if (process.env.APP_ENV !== 'production') {
      this.log('debug', message, context, requestId);
    }
  },
};
