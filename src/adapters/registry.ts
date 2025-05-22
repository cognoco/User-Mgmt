/**
 * Adapter Registry System
 * 
 * This file implements a registry system for adapter factories.
 * It allows different adapter implementations (Supabase, GraphQL, REST, etc.)
 * to be registered and used interchangeably, making the application truly
 * database-agnostic as per the architecture guidelines.
 */

import { AuthDataProvider } from './auth/interfaces';
import { UserDataProvider } from './user/interfaces';
import { TeamDataProvider } from './team/interfaces';
import { PermissionDataProvider } from './permission/interfaces';
import { SsoDataProvider } from './sso/interfaces';
import { SubscriptionDataProvider } from './subscription/interfaces';
import { ApiKeyDataProvider } from './api-keys/interfaces';


/**
 * Interface for adapter factory options
 */
export interface AdapterFactoryOptions {
  [key: string]: any;
}

/**
 * Interface for adapter factory
 * Defines methods to create different data providers
 */
export interface AdapterFactory {
  /**
   * Create an authentication data provider
   */
  createAuthProvider(): AuthDataProvider;
  
  /**
   * Create a user data provider
   */
  createUserProvider(): UserDataProvider;
  
  /**
   * Create a team data provider
   */
  createTeamProvider(): TeamDataProvider;

  /**
   * Create a permission data provider
   */
  createPermissionProvider(): PermissionDataProvider;

  /**
   * Create an SSO data provider
   */
  createSsoProvider(): SsoDataProvider;

  /**
   * Create a subscription data provider
   */
  createSubscriptionProvider(): SubscriptionDataProvider;

  /**
   * Create an API key data provider
   */
  createApiKeyProvider(): ApiKeyDataProvider;

/**
 * Factory creator function type
 */
export type FactoryCreator = (options: AdapterFactoryOptions) => AdapterFactory;

/**
 * Adapter registry class
 * Manages registration and retrieval of adapter factories
 */
export class AdapterRegistry {
  private static factories: Record<string, FactoryCreator> = {};
  
  /**
   * Register an adapter factory
   * 
   * @param name Name to register the factory under
   * @param factoryCreator Function that creates the factory
   */
  static registerFactory(name: string, factoryCreator: FactoryCreator): void {
    this.factories[name] = factoryCreator;
  }
  
  /**
   * Get an adapter factory by name
   * 
   * @param name Name of the factory to retrieve
   * @param options Options to pass to the factory creator
   * @returns The adapter factory instance
   * @throws Error if factory not found
   */
  static getFactory(name: string, options: AdapterFactoryOptions): AdapterFactory {
    const factoryCreator = this.factories[name];
    if (!factoryCreator) {
      throw new Error(`Adapter factory '${name}' not found. Available factories: ${Object.keys(this.factories).join(', ')}`);
    }
    return factoryCreator(options);
  }
  
  /**
   * List all available adapter types
   * 
   * @returns Array of registered adapter type names
   */
  static listAvailableAdapters(): string[] {
    return Object.keys(this.factories);
  }
  
  /**
   * Check if an adapter type is available
   * 
   * @param name Name of the adapter type to check
   * @returns True if the adapter type is registered, false otherwise
   */
  static isAdapterAvailable(name: string): boolean {
    return !!this.factories[name];
  }
}
