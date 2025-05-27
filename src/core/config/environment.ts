export interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  serviceRoleKey?: string;
  apiBaseUrl: string;
  apiTimeout: number;
  uiTheme?: string;
  rateLimitWindowMs: number;
  rateLimitMax: number;
  sessionCookieName: string;
  tokenExpiryDays: number;
}

const defaults: Pick<EnvironmentConfig, 'apiTimeout' | 'rateLimitWindowMs' | 'rateLimitMax' | 'sessionCookieName' | 'tokenExpiryDays'> = {
  apiTimeout: 10000,
  rateLimitWindowMs: 15 * 60 * 1000,
  rateLimitMax: 100,
  sessionCookieName: 'user-management-session',
  tokenExpiryDays: 7,
};

export function loadEnvironment(): EnvironmentConfig {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    apiBaseUrl:
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://api.example.com'
        : 'http://localhost:3000/api'),
    apiTimeout: parseInt(process.env.API_TIMEOUT || String(defaults.apiTimeout), 10),
    uiTheme: process.env.UI_THEME,
    rateLimitWindowMs: parseInt(
      process.env.RATE_LIMIT_WINDOW_MS || String(defaults.rateLimitWindowMs),
      10
    ),
    rateLimitMax: parseInt(
      process.env.RATE_LIMIT_MAX || String(defaults.rateLimitMax),
      10
    ),
    sessionCookieName: process.env.SESSION_COOKIE_NAME || defaults.sessionCookieName,
    tokenExpiryDays: parseInt(
      process.env.TOKEN_EXPIRY_DAYS || String(defaults.tokenExpiryDays),
      10
    ),
  };
}

export function validateEnvironment(env: EnvironmentConfig): boolean {
  const missing: string[] = [];
  if (!env.supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!env.supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (typeof window === 'undefined' && !env.serviceRoleKey) {
    missing.push('SUPABASE_SERVICE_ROLE_KEY');
  }
  if (missing.length > 0) {
    console.error(`[config] Missing required environment variables: ${missing.join(', ')}`);
    return false;
  }
  return true;
}
