export type { ISsoDataProvider } from '@/core/sso/ISsoDataProvider';
export { createSsoProvider } from '@/adapters/sso/factory';
// Import specific exports to avoid conflicts
export { createSupabaseSsoProvider } from '@/adapters/sso/factory';
