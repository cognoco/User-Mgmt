import { RuntimeConfig } from '@/src/core/config/runtimeConfig';

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
    database: { provider: 'supabase' },
  },
  featureFlags: {},
};

export default config;
