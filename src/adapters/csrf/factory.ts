import { CsrfDataProvider } from './interfaces';
import { DefaultCsrfProvider } from './default-adapter';

export function createDefaultCsrfProvider(): CsrfDataProvider {
  return new DefaultCsrfProvider();
}

export function createCsrfProvider(config?: { type?: 'default' | string; options?: Record<string, any> }): CsrfDataProvider {
  if (!config || config.type === 'default') {
    return createDefaultCsrfProvider();
  }
  throw new Error(`Unsupported CSRF provider type: ${config.type}`);
}
