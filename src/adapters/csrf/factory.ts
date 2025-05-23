import type { ICsrfDataProvider } from '@/core/csrf/ICsrfDataProvider';
import { DefaultCsrfProvider } from './default-adapter';

export function createDefaultCsrfProvider(): ICsrfDataProvider {
  return new DefaultCsrfProvider();
}

export function createCsrfProvider(config?: { type?: 'default' | string; options?: Record<string, any> }): ICsrfDataProvider {
  if (!config || config.type === 'default') {
    return createDefaultCsrfProvider();
  }
  throw new Error(`Unsupported CSRF provider type: ${config.type}`);
}
