import { RuntimeConfig } from '@/core/config/runtimeConfig';

const config: Partial<RuntimeConfig> = {
  env: {
    apiBaseUrl: 'http://localhost:3000/api',
    apiTimeout: 10000,
    supabaseUrl: '',
    supabaseAnonKey: '',
    rateLimitWindowMs: 900000,
    rateLimitMax: 100,
    sessionCookieName: 'user-management-session',
    tokenExpiryDays: 7,
    auditLogRetentionDays: 90,
    retentionPersonalMonths: 24,
    retentionBusinessMonths: 36,
    database: { provider: 'supabase' },
  },
  featureFlags: {},
};

export default config;
