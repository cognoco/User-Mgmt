import { describe, it, expect, vi } from 'vitest';
import { createMockProfileStore, createMockOAuthStore } from '@/tests/factories/mockStores';

describe('createMockProfileStore', () => {
  it('returns default profile store with mock functions', () => {
    const store = createMockProfileStore();
    expect(store.profile).toEqual({ id: 'u1', firstName: 'Test', lastName: 'User' });
    expect(store.isLoading).toBe(false);
    expect(store.error).toBeNull();
    expect(vi.isMockFunction(store.updateProfile)).toBe(true);
    expect(vi.isMockFunction(store.uploadAvatar)).toBe(true);
    expect(vi.isMockFunction(store.setProfile)).toBe(true);
  });
});

describe('createMockOAuthStore', () => {
  it('returns default oauth store with mock functions', () => {
    const store = createMockOAuthStore();
    expect(store.isLoading).toBe(false);
    expect(store.error).toBeNull();
    expect(vi.isMockFunction(store.login)).toBe(true);
    expect(vi.isMockFunction(store.clearError)).toBe(true);
  });
});

