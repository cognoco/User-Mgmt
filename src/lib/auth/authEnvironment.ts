/**
 * Authentication environment configuration.
 *
 * Centralizes access to auth-related environment variables and provides
 * helper functions for common configuration needs.
 */

export interface AuthEnvironment {
  /** Supabase project URL */
  supabaseUrl: string;
  /** Public anonymous key used by the browser */
  supabaseAnonKey: string;
  /** Service role key for privileged server operations */
  serviceRoleKey?: string;
  /** Cookie name used to store the session access token */
  sessionCookieName: string;
  /** Lifetime of refresh tokens in days */
  tokenExpiryDays: number;
}

function getEnv(name: string, fallback = ''): string {
  return process.env[name] ?? fallback;
}

export const authEnv: AuthEnvironment = {
  supabaseUrl: getEnv('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  serviceRoleKey: getEnv('SUPABASE_SERVICE_ROLE_KEY'),
  sessionCookieName: getEnv('SESSION_COOKIE_NAME', 'user-management-session'),
  tokenExpiryDays: parseInt(getEnv('TOKEN_EXPIRY_DAYS', '7'), 10),
};

/** Check if Supabase credentials are present */
export function isSupabaseConfigured(env: AuthEnvironment = authEnv): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

/** Validate required variables for server and client environments */
export function validateAuthEnv(env: AuthEnvironment = authEnv): boolean {
  const missing: string[] = [];
  if (!env.supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!env.supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (typeof window === 'undefined' && !env.serviceRoleKey) {
    missing.push('SUPABASE_SERVICE_ROLE_KEY');
  }

  if (missing.length > 0) {
    console.error(`[authEnvironment] Missing environment variables: ${missing.join(', ')}`);
    return false;
  }
  return true;
}

/** Options for creating a browser Supabase client */
export function getSupabaseClientConfig(env: AuthEnvironment = authEnv) {
  return {
    url: env.supabaseUrl,
    key: env.supabaseAnonKey,
  };
}

/** Options for creating a server Supabase client */
export function getSupabaseServerConfig(env: AuthEnvironment = authEnv) {
  return {
    url: env.supabaseUrl,
    key: env.serviceRoleKey ?? env.supabaseAnonKey,
  };
}
