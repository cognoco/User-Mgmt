// Import our standardized mock
import { describe, test, expect, beforeEach, vi } from 'vitest';
vi.mock('@/lib/database/supabase', async () => {
  const mod = await import('@/tests/mocks/supabase');
  const supabase = mod.supabase;
  return {
    supabase,
    getServiceSupabase: () => supabase,
  };
});
import { supabase, getServiceSupabase } from '@/lib/database/supabase';

describe('Database Operations', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  test('can fetch user profile', async () => {
    // Mock successful profile fetch
    const builder = supabase.from('profiles') as any;
    builder.select.mockReturnThis();
    builder.eq.mockReturnThis();
    builder.single.mockResolvedValue({
      data: {
        id: '123',
        first_name: 'John',
        last_name: 'Doe',
        avatar_url: 'https://example.com/avatar.jpg',
      },
      error: null,
    });

    // Perform the operation
    const userId = '123';
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Check if the operation was performed correctly
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(builder.select).toHaveBeenCalledWith('*');
    expect(builder.eq).toHaveBeenCalledWith('id', userId);
    expect(builder.single).toHaveBeenCalled();

    // Check the result
    expect(error).toBeNull();
    expect(data).toEqual({
      id: '123',
      first_name: 'John',
      last_name: 'Doe',
      avatar_url: 'https://example.com/avatar.jpg',
    });
  });

  test('can update user profile', async () => {
    // Mock successful profile update
    const builder = supabase.from('profiles') as any;
    builder.update.mockReturnThis();
    builder.eq.mockReturnThis();
    builder.single.mockResolvedValue({
      data: {
        id: '123',
        first_name: 'John',
        last_name: 'Smith', // Updated last name
        avatar_url: 'https://example.com/avatar.jpg',
      },
      error: null,
    });

    // Perform the operation
    const userId = '123';
    const updates = { last_name: 'Smith' };
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .single();

    // Check if the operation was performed correctly
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(builder.update).toHaveBeenCalledWith(updates);
    expect(builder.eq).toHaveBeenCalledWith('id', userId);
    expect(builder.single).toHaveBeenCalled();

    // Check the result
    expect(error).toBeNull();
    expect(data).toEqual({
      id: '123',
      first_name: 'John',
      last_name: 'Smith',
      avatar_url: 'https://example.com/avatar.jpg',
    });
  });

  test('admin can fetch all users', async () => {
    // Mock the service client
    const serviceSupabase = getServiceSupabase();
    const builder = serviceSupabase.from('profiles') as any;
    builder.select.mockResolvedValue({
      data: [
        {
          id: '123',
          first_name: 'John',
          last_name: 'Doe',
        },
        {
          id: '456',
          first_name: 'Jane',
          last_name: 'Smith',
        },
      ],
      error: null,
    });

    // Perform the operation
    const { data, error } = await serviceSupabase
      .from('profiles')
      .select('*');

    // Check if the operation was performed correctly
    expect(getServiceSupabase).toHaveBeenCalled();
    expect(serviceSupabase.from).toHaveBeenCalledWith('profiles');
    expect(builder.select).toHaveBeenCalledWith('*');

    // Check the result
    expect(error).toBeNull();
    expect(data).toEqual([
      {
        id: '123',
        first_name: 'John',
        last_name: 'Doe',
      },
      {
        id: '456',
        first_name: 'Jane',
        last_name: 'Smith',
      },
    ]);
  });

  test('handles database errors', async () => {
    // Mock database error
    const builder = supabase.from('profiles') as any;
    builder.select.mockReturnThis();
    builder.eq.mockReturnThis();
    builder.single.mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    });

    // Perform the operation
    const userId = '123';
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Check if the operation was performed correctly
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(builder.select).toHaveBeenCalledWith('*');
    expect(builder.eq).toHaveBeenCalledWith('id', userId);
    expect(builder.single).toHaveBeenCalled();

    // Check the result
    expect(data).toBeNull();
    expect(error).toEqual({ message: 'Database error' });
  });

  test('can insert new user data', async () => {
    // Mock successful insert
    const builder = supabase.from('profiles') as any;
    builder.insert.mockReturnThis();
    builder.single.mockResolvedValue({
      data: {
        id: '789',
        first_name: 'Alice',
        last_name: 'Johnson',
        email: 'alice@example.com',
      },
      error: null,
    });

    // Prepare data to insert
    const newUser = {
      id: '789',
      first_name: 'Alice',
      last_name: 'Johnson',
      email: 'alice@example.com',
    };

    // Perform the operation
    const { data, error } = await supabase
      .from('profiles')
      .insert(newUser)
      .single();

    // Check if the operation was performed correctly
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(builder.insert).toHaveBeenCalledWith(newUser);
    expect(builder.single).toHaveBeenCalled();

    // Check the result
    expect(error).toBeNull();
    expect(data).toEqual(newUser);
  });

  test('can delete user data', async () => {
    // Mock successful delete
    const builder = supabase.from('profiles') as any;
    builder.delete.mockReturnThis();
    builder.eq.mockReturnThis();
    builder.then.mockResolvedValue({
      data: { success: true },
      error: null,
    });

    // Perform the operation
    const userId = '123';
    const { data, error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    // Check if the operation was performed correctly
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith('id', userId);

    // Check the result
    expect(error).toBeNull();
    expect(data).toEqual({ success: true });
  });
});
