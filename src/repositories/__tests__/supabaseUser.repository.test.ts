import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { SupabaseUserRepository } from '@/src/repositories/supabaseUser.repository';
import { setTableMockData, resetSupabaseMock } from '@/tests/mocks/supabase';
import { setupTestEnvironment } from '@/tests/utils/environmentSetup';
import { UserType } from '@/types/userType';

const sampleRow = {
  id: 'user-1',
  email: 'user@example.com',
  first_name: 'Test',
  last_name: 'User',
  full_name: 'Test User',
  is_active: true,
  user_type: 'private',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-02T00:00:00Z',
  last_login_at: '2023-01-03T00:00:00Z'
};

describe('SupabaseUserRepository', () => {
  let cleanup: () => void;

  beforeEach(() => {
    cleanup = setupTestEnvironment();
    resetSupabaseMock();
    setTableMockData('profiles', { data: [sampleRow], error: null });
  });

  afterEach(() => {
    cleanup();
  });

  it('finds user by id', async () => {
    const repo = new SupabaseUserRepository();
    const user = await repo.findById('user-1');
    expect(user).toEqual({
      id: 'user-1',
      email: 'user@example.com',
      username: undefined,
      firstName: 'Test',
      lastName: 'User',
      fullName: 'Test User',
      isActive: true,
      isVerified: false,
      userType: UserType.PRIVATE,
      company: undefined,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z',
      lastLogin: '2023-01-03T00:00:00Z',
      metadata: undefined
    });
  });

  it('finds user by email', async () => {
    const repo = new SupabaseUserRepository();
    const user = await repo.findByEmail('user@example.com');
    expect(user?.id).toBe('user-1');
  });

  it('creates a user', async () => {
    const repo = new SupabaseUserRepository();
    const newRow = { ...sampleRow, id: 'user-2', email: 'new@example.com' };
    setTableMockData('profiles', { data: newRow, error: null });
    const user = await repo.create({ email: 'new@example.com', password: 'pass' });
    expect(user.id).toBe('user-2');
    expect(user.email).toBe('new@example.com');
  });

  it('updates a user', async () => {
    const repo = new SupabaseUserRepository();
    const user = await repo.update('user-1', { firstName: 'Updated' });
    expect(user.firstName).toBe('Updated');
  });
});
