/**
 * SERVER ONLY - This file uses Node.js modules (fs, path) and should never be imported by client components.
 * For client-side configuration, use '@/core/config/clientConfig' instead.
 */
import fs from 'fs';
import path from 'path';
import { loadEnvironment, validateEnvironment, EnvironmentConfig } from '@/core/config/environment';
import { UserManagementConfig, DEFAULT_CONFIG } from '@/core/config/interfaces';

export interface RuntimeConfig extends UserManagementConfig {
  env: EnvironmentConfig;
}

let config: RuntimeConfig = {
  ...DEFAULT_CONFIG,
  env: loadEnvironment(),
};

export function loadConfigFromFile(filePath = 'user-management.config.ts'): Partial<RuntimeConfig> {
  try {
    const resolved = path.resolve(process.cwd(), filePath);
    if (fs.existsSync(resolved)) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fileConfig = require(resolved) as Partial<RuntimeConfig>;
      return fileConfig;
    }
  } catch (err) {
    console.error('[config] Failed to load configuration file', err);
  }
  return {};
}

export function initializeConfiguration(filePath?: string): RuntimeConfig {
  const fileConfig = loadConfigFromFile(filePath);
  configure(fileConfig);
  if (process.env.NODE_ENV !== 'test') {
    validateEnvironment(config.env);
  }
  return config;
}

export function configure(overrides: Partial<RuntimeConfig>): RuntimeConfig {
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

export function getConfig(): RuntimeConfig {
  return config;
}

export function getServerConfig(): RuntimeConfig {
  return config;
}

/**
 * @deprecated Use getClientConfig from '@/core/config/clientConfig' for client-side components
 * This function should only be used on the server side.
 */
export function getClientConfig(): RuntimeConfig {
  const { serviceRoleKey, ...envRest } = config.env;
  return { ...config, env: { ...envRest } };
}

// Export the type for re-export in index.ts
export type { RuntimeConfig };
