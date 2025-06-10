import type { MiddlewareConfig } from '@/lib/schemas/middlewareConfig.schema';

export type ApiRouteType = 'public' | 'protected';

const defaultConfig: Record<ApiRouteType, MiddlewareConfig> = {
  public: { errorHandling: true },
  protected: { errorHandling: true, auth: {} },
};

let currentConfig: Record<ApiRouteType, MiddlewareConfig> = { ...defaultConfig };

export function configureApiRoutes(
  overrides: Partial<Record<ApiRouteType, MiddlewareConfig>>
): void {
  currentConfig = { ...currentConfig, ...overrides } as Record<ApiRouteType, MiddlewareConfig>;
}

export function getDefaultMiddlewareConfig(type: ApiRouteType): MiddlewareConfig {
  return currentConfig[type];
}

export function resetApiRoutesConfig(): void {
  currentConfig = { ...defaultConfig };
}

