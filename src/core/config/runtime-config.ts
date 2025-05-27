import fs from 'fs';
import path from 'path';
import { DEFAULT_CONFIG, UserManagementConfig, UserManagementOptions } from './interfaces';

/** Load configuration from environment variables */
export function loadConfigFromEnv(env: NodeJS.ProcessEnv = process.env): Partial<UserManagementOptions> {
  return {
    baseUrl: env.BASE_URL || DEFAULT_CONFIG.options.baseUrl,
    redirects: {
      afterLogin: env.REDIRECT_AFTER_LOGIN || DEFAULT_CONFIG.options.redirects.afterLogin,
      afterLogout: env.REDIRECT_AFTER_LOGOUT || DEFAULT_CONFIG.options.redirects.afterLogout,
      afterRegistration: env.REDIRECT_AFTER_REGISTRATION || DEFAULT_CONFIG.options.redirects.afterRegistration,
      afterPasswordReset: env.REDIRECT_AFTER_PASSWORD_RESET || DEFAULT_CONFIG.options.redirects.afterPasswordReset,
    },
    api: {
      baseUrl: env.API_BASE_URL || DEFAULT_CONFIG.options.api.baseUrl,
      timeoutMs: parseInt(env.API_TIMEOUT_MS || `${DEFAULT_CONFIG.options.api.timeoutMs}`, 10),
    },
    ui: {
      theme: (env.UI_THEME as 'light' | 'dark') || DEFAULT_CONFIG.options.ui.theme,
      primaryColor: env.UI_PRIMARY_COLOR || DEFAULT_CONFIG.options.ui.primaryColor,
    },
    security: {
      csrfHeaderName: env.CSRF_HEADER_NAME || DEFAULT_CONFIG.options.security.csrfHeaderName,
      allowedOrigins: env.CORS_ALLOWED_ORIGINS ? env.CORS_ALLOWED_ORIGINS.split(',').filter(Boolean) : DEFAULT_CONFIG.options.security.allowedOrigins,
    },
  };
}

/** Load configuration from a JSON file */
export function loadConfigFromFile(filePath: string): Partial<UserManagementOptions> {
  try {
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved)) return {};
    const data = fs.readFileSync(resolved, 'utf-8');
    return JSON.parse(data) as Partial<UserManagementOptions>;
  } catch (err) {
    console.error('[runtime-config] Failed to load config file', err);
    return {};
  }
}

export interface LoadConfigOptions {
  env?: NodeJS.ProcessEnv;
  filePath?: string;
  overrides?: Partial<UserManagementOptions>;
}

/**
 * Load the full user management configuration
 */
export function loadUserManagementConfig(options: LoadConfigOptions = {}): UserManagementConfig {
  const envConfig = loadConfigFromEnv(options.env);
  const fileConfig = options.filePath ? loadConfigFromFile(options.filePath) : {};
  const mergedOptions: UserManagementOptions = {
    ...DEFAULT_CONFIG.options,
    ...envConfig,
    ...fileConfig,
    ...options.overrides,
    redirects: {
      ...DEFAULT_CONFIG.options.redirects,
      ...envConfig.redirects,
      ...(fileConfig as any).redirects,
      ...(options.overrides?.redirects ?? {}),
    },
    api: {
      ...DEFAULT_CONFIG.options.api,
      ...envConfig.api,
      ...(fileConfig as any).api,
      ...(options.overrides?.api ?? {}),
    },
    ui: {
      ...DEFAULT_CONFIG.options.ui,
      ...envConfig.ui,
      ...(fileConfig as any).ui,
      ...(options.overrides?.ui ?? {}),
    },
    security: {
      ...DEFAULT_CONFIG.options.security,
      ...envConfig.security,
      ...(fileConfig as any).security,
      ...(options.overrides?.security ?? {}),
    },
  };

  return {
    featureFlags: DEFAULT_CONFIG.featureFlags,
    serviceProviders: DEFAULT_CONFIG.serviceProviders,
    options: mergedOptions,
  };
}
