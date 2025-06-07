/**
 * @group e2e
 * @group adapters
 */

import { AdapterRegistry } from '@/adapters/registry';
import { initializeUserManagement } from '@/core/initialization/initializeAdapters';
import { UserManagementConfiguration } from '@/core/config';

describe('Adapter Registry - E2E', () => {
  // Store the original environment variables
  const originalEnv = process.env;
  
  beforeAll(() => {
    // Set up test environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-supabase-url.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-supabase-anon-key';
  });
  
  afterEach(() => {
    // Reset the configuration after each test
    UserManagementConfiguration.resetConfiguration();
    
    // Clear all registered factories except the default ones
    const defaultAdapters = ['supabase'];
    AdapterRegistry.listAvailableAdapters().forEach(adapter => {
      if (!defaultAdapters.includes(adapter)) {
        // @ts-expect-error - Accessing private property for testing
        delete AdapterRegistry.factories[adapter];
      }
    });
  });
  
  afterAll(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });
  
  test('should initialize with default Supabase adapter', async () => {
    // Act
    const services = initializeUserManagement({
      type: 'supabase',
      options: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      }
    });
    
    // Assert
    expect(services).toBeDefined();
    expect(services.authService).toBeDefined();
    expect(services.userService).toBeDefined();
    expect(services.teamService).toBeDefined();
    expect(services.permissionService).toBeDefined();
    
    // Verify the adapters are properly initialized
    expect(services.adapters).toBeDefined();
    expect(services.adapters.authAdapter).toBeDefined();
    expect(services.adapters.userAdapter).toBeDefined();
    expect(services.adapters.teamAdapter).toBeDefined();
    expect(services.adapters.permissionAdapter).toBeDefined();
    
    // Verify the configuration was updated
    const config = UserManagementConfiguration.getConfiguration();
    expect(config.serviceProviders.authService).toBe(services.authService);
    expect(config.serviceProviders.userService).toBe(services.userService);
    expect(config.serviceProviders.teamService).toBe(services.teamService);
    expect(config.serviceProviders.permissionService).toBe(services.permissionService);
  });
  
  test('should throw error for invalid adapter type', () => {
    // Act & Assert
    expect(() => {
      initializeUserManagement({
        type: 'invalid-adapter-type',
        options: {}
      });
    }).toThrow(/not found/);
  });
  
  test('should allow registering and using a custom adapter', () => {
    // Arrange
    const mockAuthProvider = {
      signInWithEmail: jest.fn().mockResolvedValue({ user: { id: 'test-user' }, error: null }),
      signUp: jest.fn().mockResolvedValue({ user: { id: 'test-user' }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: jest.fn().mockResolvedValue({ error: null }),
      updateUser: jest.fn().mockResolvedValue({ user: { id: 'test-user' }, error: null }),
      getUser: jest.fn().mockResolvedValue({ user: { id: 'test-user' }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    };
    
    const mockUserProvider = {
      createUser: jest.fn().mockResolvedValue({ data: { id: 'test-user' }, error: null }),
      getUser: jest.fn().mockResolvedValue({ data: { id: 'test-user' }, error: null }),
      updateUser: jest.fn().mockResolvedValue({ data: { id: 'test-user' }, error: null }),
      deleteUser: jest.fn().mockResolvedValue({ error: null }),
    };
    
    const mockTeamProvider = {
      createTeam: jest.fn().mockResolvedValue({ data: { id: 'test-team' }, error: null }),
      getTeam: jest.fn().mockResolvedValue({ data: { id: 'test-team' }, error: null }),
      updateTeam: jest.fn().mockResolvedValue({ data: { id: 'test-team' }, error: null }),
      deleteTeam: jest.fn().mockResolvedValue({ error: null }),
    };
    
    const mockPermissionProvider = {
      checkPermission: jest.fn().mockResolvedValue({ hasPermission: true, error: null }),
      assignRole: jest.fn().mockResolvedValue({ error: null }),
      revokeRole: jest.fn().mockResolvedValue({ error: null }),
    };
    
    // Create and register a custom adapter factory
    const customFactory = {
      createAuthProvider: jest.fn().mockReturnValue(mockAuthProvider),
      createUserProvider: jest.fn().mockReturnValue(mockUserProvider),
      createTeamProvider: jest.fn().mockReturnValue(mockTeamProvider),
      createPermissionProvider: jest.fn().mockReturnValue(mockPermissionProvider),
    };
    
    AdapterRegistry.registerFactory('custom', () => customFactory);
    
    // Act
    const services = initializeUserManagement({
      type: 'custom',
      options: {
        customOption: 'test-value'
      }
    });
    
    // Assert
    expect(services).toBeDefined();
    expect(services.authService).toBeDefined();
    expect(services.userService).toBeDefined();
    expect(services.teamService).toBeDefined();
    expect(services.permissionService).toBeDefined();
    
    // Verify the factory methods were called with the correct options
    expect(customFactory.createAuthProvider).toHaveBeenCalledWith();
    expect(customFactory.createUserProvider).toHaveBeenCalledWith();
    expect(customFactory.createTeamProvider).toHaveBeenCalledWith();
    expect(customFactory.createPermissionProvider).toHaveBeenCalledWith();
    
    // Verify the adapters were properly initialized
    expect(services.adapters).toBeDefined();
    expect(services.adapters.authAdapter).toBe(mockAuthProvider);
    expect(services.adapters.userAdapter).toBe(mockUserProvider);
    expect(services.adapters.teamAdapter).toBe(mockTeamProvider);
    expect(services.adapters.permissionAdapter).toBe(mockPermissionProvider);
  });
  
  test('should use environment variables when options are not provided', () => {
    // Act
    const services = initializeUserManagement({
      type: 'supabase'
    });
    
    // Assert
    expect(services).toBeDefined();
    
    // The actual Supabase client initialization is tested in unit tests
    // Here we just verify the service is created
    expect(services.authService).toBeDefined();
    expect(services.userService).toBeDefined();
    expect(services.teamService).toBeDefined();
    expect(services.permissionService).toBeDefined();
  });
});
