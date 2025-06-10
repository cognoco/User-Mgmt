import { UserManagementConfig, DEFAULT_CONFIG } from '@/core/config/interfaces';

export interface ClientEnvironmentConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  apiUrl: string;
  appUrl: string;
  apiTimeout: number;
  showErrorDetails: boolean;
}

export interface ClientConfig {
  env: ClientEnvironmentConfig;
  featureFlags: typeof DEFAULT_CONFIG.featureFlags;
  serviceProviders: typeof DEFAULT_CONFIG.serviceProviders;
  options: typeof DEFAULT_CONFIG.options;
}

function loadClientEnvironment(): ClientEnvironmentConfig {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    apiUrl: process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api'),
    appUrl: process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : ''),
    apiTimeout: 10000,
    showErrorDetails: process.env.NEXT_PUBLIC_SHOW_ERROR_DETAILS === 'true' || process.env.NODE_ENV === 'development',
  };
}

let config: ClientConfig = {
  ...DEFAULT_CONFIG,
  env: loadClientEnvironment(),
};

export function configureClient(overrides: Partial<ClientConfig>): ClientConfig {
  config = {
    ...config,
    ...overrides,
    env: { ...config.env, ...overrides.env },
    featureFlags: {
      ...config.featureFlags,
      ...overrides.featureFlags,
    },
    serviceProviders: {
      ...config.serviceProviders,
      ...overrides.serviceProviders,
    },
    options: {
      ...config.options,
      ...overrides.options,
      redirects: {
        ...config.options.redirects,
        ...overrides.options?.redirects,
      },
    },
  };
  return config;
}

export function getClientConfig(): ClientConfig {
  return config;
}

// Also export the config object directly for convenience
export const clientConfig = config;

// Export the type for re-export in index.ts
export type { ClientConfig }; 