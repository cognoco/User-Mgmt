import type { DatabaseConfig } from '@/lib/database/types';

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
  database: DatabaseConfig;
  /** Show detailed error info in development */
  showErrorDetails?: boolean;
  auditLogRetentionDays: number;
  retentionPersonalMonths: number;
  retentionBusinessMonths: number;
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
    database: {
      provider: (process.env.DATABASE_PROVIDER as DatabaseConfig['provider']) || 'supabase',
      connectionString: process.env.DATABASE_URL,
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : undefined,
      database: process.env.DATABASE_NAME,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      ssl: process.env.DATABASE_SSL === 'true',
    },
    showErrorDetails:
      process.env.SHOW_ERROR_DETAILS
        ? process.env.SHOW_ERROR_DETAILS === 'true'
        : process.env.NODE_ENV !== 'production',
    auditLogRetentionDays: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '90', 10),
    retentionPersonalMonths: parseInt(process.env.RETENTION_PERSONAL_MONTHS || '24', 10),
    retentionBusinessMonths: parseInt(process.env.RETENTION_BUSINESS_MONTHS || '36', 10),
  };
}

export function validateEnvironment(env: EnvironmentConfig): boolean {
  const missing: string[] = [];
  if (!env.supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!env.supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (typeof window === 'undefined' && !env.serviceRoleKey) {
    missing.push('SUPABASE_SERVICE_ROLE_KEY');
  }
  if (!env.database.provider) missing.push('DATABASE_PROVIDER');
  if (missing.length > 0) {
    console.error(`[config] Missing required environment variables: ${missing.join(', ')}`);
    return false;
  }
  return true;
}
