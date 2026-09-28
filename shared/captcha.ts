/**
 * Anu Atelier - CAPTCHA Verification Helper (Cloudflare Turnstile)
 * Protects registration, login, password reset, and enquiry endpoints from bot abuse.
 */

import { logger } from './logger';

export interface TurnstileVerificationResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
  action?: string;
  cdata?: string;
}

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<{ success: boolean; errorCodes?: string[] }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  const isDev = process.env.APP_ENV !== 'production';

  // In development, allow bypass if key is not configured or dev dummy token provided
  if (isDev && (!secretKey || token === 'dummy-dev-token' || token === '1x00000000000000000000AA')) {
    logger.debug('Turnstile bypassed in development mode');
    return { success: true };
  }

  if (!secretKey) {
    logger.warn('TURNSTILE_SECRET_KEY is not configured in production');
    return { success: false, errorCodes: ['missing-secret-key'] };
  }

  if (!token) {
    return { success: false, errorCodes: ['missing-input-response'] };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data = (await response.json()) as TurnstileVerificationResponse;

    if (!data.success) {
      logger.warn('Turnstile verification failed', { errorCodes: data['error-codes'] });
      return { success: false, errorCodes: data['error-codes'] || ['verification-failed'] };
    }

    return { success: true };
  } catch (err: any) {
    logger.error('Error during Turnstile token verification', { error: err.message });
    return { success: false, errorCodes: ['internal-verification-error'] };
  }
}
