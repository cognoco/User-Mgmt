/**
 * Platform Abstraction Interfaces
 *
 * Defines the contract for environment-specific utilities. Implementations
 * should provide consistent access to server and client features.
 */

export interface PlatformService {
  /** True when running in a server environment */
  readonly isServer: boolean;
  /** True when running in a client (browser) environment */
  readonly isClient: boolean;

  /**
   * Retrieve a storage instance.
   *
   * Implementations may return browser storage or an in-memory fallback
   * for server-side rendering.
   */
  getStorage(type?: 'local' | 'session'): Storage;

  /** Get the current request context */
  getRequestContext(): Record<string, any>;

  /** Merge values into the current request context */
  setRequestContext(context: Record<string, any>): void;

  /**
   * Execute the callback only on the client side.
   *
   * @param callback Function to run on the client
   * @param fallback Value returned on the server
   */
  clientOnly<T = void>(callback: () => T, fallback?: T): T | undefined;

  /**
   * Execute the callback only on the server side.
   *
   * @param callback Function to run on the server
   * @param fallback Value returned on the client
   */
  serverOnly<T = void>(callback: () => T, fallback?: T): T | undefined;
}
