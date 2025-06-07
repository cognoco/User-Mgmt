

import { AdapterRegistry, AdapterFactory } from '@/src/adapters/registry'4;
import { SupabaseAdapterFactory, createSupabaseAdapterFactory } from '@/src/adapters/supabaseFactory'68;
import { AuthService as AuthDataProvider } from '@/core/auth/interfaces';
import { IUserDataProvider as UserDataProvider } from '@/core/user/IUserDataProvider';
import { ITeamDataProvider as TeamDataProvider } from '@/core/team/ITeamDataProvider';
import { IPermissionDataProvider as PermissionDataProvider } from '@/core/permission/IPermissionDataProvider';

// Mock the environment variables
const originalEnv = process.env;

// Mock implementations for testing
class TestAuthProvider implements AuthDataProvider {
  async signInWithEmail() { return { user: null, session: null, error: null }; }
  async signUp() { return { user: null, session: null, error: null }; }
  async signOut() { return { error: null }; }
  async resetPasswordForEmail() { return { error: null }; }
  async updateUser() { return { user: null, error: null }; }
  async getUser() { return { user: null, error: null }; }
  async onAuthStateChange() { return { data: { subscription: { unsubscribe: vi.fn() } } }; }
}

class TestUserProvider implements UserDataProvider {
  async createUser() { return { data: null, error: null }; }
  async getUser() { return { data: null, error: null }; }
  async updateUser() { return { data: null, error: null }; }
  async deleteUser() { return { error: null }; }
}

class TestTeamProvider implements TeamDataProvider {
  async createTeam() { return { data: null, error: null }; }
  async getTeam() { return { data: null, error: null }; }
  async updateTeam() { return { data: null, error: null }; }
  async deleteTeam() { return { error: null }; }
}

class TestPermissionProvider implements PermissionDataProvider {
  async checkPermission() { return { hasPermission: false, error: null }; }
  async assignRole() { return { error: null }; }
  async revokeRole() { return { error: null }; }
}

class TestAdapterFactory implements AdapterFactory {
  createAuthProvider() { return new TestAuthProvider(); }
  createUserProvider() { return new TestUserProvider(); }
  createTeamProvider() { return new TestTeamProvider(); }
  createPermissionProvider() { return new TestPermissionProvider(); }
}

describe('AdapterRegistry', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    (AdapterRegistry as any).factories = {};
    (AdapterRegistry as any).instance = null;
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('registerFactory', () => {
    it('should register a factory', () => {
      const factoryCreator = () => new TestAdapterFactory();
      AdapterRegistry.registerFactory('test', factoryCreator);
      
      expect(AdapterRegistry.listAvailableAdapters()).toContain('test');
    });

    it('should throw if factory is already registered', () => {
      const factoryCreator = () => new TestAdapterFactory();
      AdapterRegistry.registerFactory('test', factoryCreator);
      
      expect(() => {
        AdapterRegistry.registerFactory('test', factoryCreator);
      }).toThrow(/already registered/);
    });
  });

  describe('getFactory', () => {
    it('should get a registered factory', () => {
      const factoryCreator = vi.fn().mockReturnValue(new TestAdapterFactory());
      AdapterRegistry.registerFactory('test', factoryCreator);
      
      const options = { testOption: 'value' };
      const factory = AdapterRegistry.getFactory('test', options);
      
      expect(factory).toBeInstanceOf(TestAdapterFactory);
      expect(factoryCreator).toHaveBeenCalledWith(options);
    });

    it('should throw if factory is not found', () => {
      expect(() => {
        AdapterRegistry.getFactory('nonexistent', {});
      }).toThrow(/not found/);
    });
  });

  describe('isAdapterAvailable', () => {
    it('should return true for registered adapters', () => {
      AdapterRegistry.registerFactory('test', () => new TestAdapterFactory());
      expect(AdapterRegistry.isAdapterAvailable('test')).toBe(true);
    });

    it('should return false for unregistered adapters', () => {
      expect(AdapterRegistry.isAdapterAvailable('nonexistent')).toBe(false);
    });
  });
});

describe('SupabaseAdapterFactory', () => {
  const mockOptions = {
    supabaseUrl: 'https://test.supabase.co',
    supabaseKey: 'test-key'
  };

  it('should create a SupabaseAdapterFactory instance', () => {
    const factory = new SupabaseAdapterFactory(mockOptions);
    expect(factory).toBeInstanceOf(SupabaseAdapterFactory);
  });

  describe('createAuthProvider', () => {
    it('should create an auth provider with the provided options', () => {
      const factory = new SupabaseAdapterFactory(mockOptions);
      const provider = factory.createAuthProvider();
      
      expect(provider).toBeDefined();
      // This is a basic test - in a real test, you'd mock the Supabase client
      // and verify it's instantiated with the correct options
    });
  });

  // Similar tests for other provider methods...
});

describe('createSupabaseAdapterFactory', () => {
  it('should create a SupabaseAdapterFactory with the provided options', () => {
    const options = {
      supabaseUrl: 'https://test.supabase.co',
      supabaseKey: 'test-key',
      extraOption: 'value'
    };
    
    const factory = createSupabaseAdapterFactory(options);
    expect(factory).toBeInstanceOf(SupabaseAdapterFactory);
  });
});

describe('instance adapter registry', () => {
  beforeEach(() => {
    // reset singleton and adapters
    (AdapterRegistry as any).instance = null;
  });

  it('registers and retrieves adapters', () => {
    const registry = AdapterRegistry.getInstance();
    const adapter = { test: true };
    registry.registerAdapter('sample', adapter);
    expect(registry.getAdapter('sample')).toBe(adapter);
  });

  it('throws when adapter missing', () => {
    const registry = AdapterRegistry.getInstance();
    expect(() => registry.getAdapter('missing')).toThrow();
  });
});
