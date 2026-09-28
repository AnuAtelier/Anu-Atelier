/**
 * Anu Atelier - Environment Guard
 * Invariant 3: Strict isolation between Development and Production environments.
 * Prevents any test, seed, or destructive operation from executing against Production.
 */

export class EnvironmentGuardError extends Error {
  constructor(message: string) {
    super(`[ENV_GUARD_VIOLATION] ${message}`);
    this.name = 'EnvironmentGuardError';
  }
}

export interface EnvGuardOptions {
  allowTest?: boolean;
}

/**
 * Asserts that the current runtime environment is development (or test if permitted).
 * Aborts execution immediately with EnvironmentGuardError if running against production.
 */
export function assertDevEnvironment(options: EnvGuardOptions = { allowTest: true }): void {
  const env = process.env.APP_ENV || process.env.NODE_ENV || 'development';
  const supabaseUrl = process.env.SUPABASE_URL || '';

  // Block execution if APP_ENV is explicitly production
  if (env === 'production') {
    throw new EnvironmentGuardError(
      'CRITICAL: Attempted to run a dev/test script or operation in PRODUCTION environment! Execution aborted.'
    );
  }

  // If allowTest is false, ensure env is strictly development
  if (!options.allowTest && env === 'test') {
    throw new EnvironmentGuardError(
      'Execution restricted strictly to development environment (test environment disallowed).'
    );
  }

  // Guard against pointing to production Supabase project while in dev/test mode
  if (supabaseUrl) {
    const isProductionUrl =
      supabaseUrl.includes('anuatelier.com') ||
      supabaseUrl.includes('prod-supabase') ||
      (process.env.PROD_SUPABASE_URL && supabaseUrl === process.env.PROD_SUPABASE_URL);

    if (isProductionUrl) {
      throw new EnvironmentGuardError(
        `CRITICAL: SUPABASE_URL points to a production endpoint (${supabaseUrl}) while APP_ENV is '${env}'. Execution aborted.`
      );
    }
  }
}

/**
 * Checks if current environment is development or test without throwing.
 */
export function isDevEnvironment(): boolean {
  try {
    assertDevEnvironment();
    return true;
  } catch {
    return false;
  }
}
