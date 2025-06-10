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
    vi.spyOn(supabase, 'from').mockImplementation(() => {
      const builder: any = {};
      builder.select = vi.fn().mockReturnValue(builder);
      builder.eq = vi.fn().mockReturnValue(builder);
      builder.single = vi.fn().mockResolvedValue({
        data: {
          id: '123',
          first_name: 'John',
          last_name: 'Doe',
          avatar_url: 'https://example.com/avatar.jpg',
        },
        error: null,
      });
      return builder;
    });

    // Perform the operation
    const userId = '123';
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Get the builder instance used in this test
    const builder = (supabase.from as any).mock.results[0].value;

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
    vi.spyOn(supabase, 'from').mockImplementation(() => {
      const builder: any = {};
      builder.update = vi.fn().mockReturnValue(builder);
      builder.eq = vi.fn().mockReturnValue(builder);
      builder.single = vi.fn().mockResolvedValue({
        data: {
          id: '123',
          first_name: 'John',
          last_name: 'Smith', // Updated last name
          avatar_url: 'https://example.com/avatar.jpg',
        },
        error: null,
      });
      return builder;
    });

    // Perform the operation
    const userId = '123';
    const updates = { last_name: 'Smith' };
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .single();

    const builder = (supabase.from as any).mock.results[0].value;

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
    const serviceSupabase = getServiceSupabase();
    vi.spyOn(serviceSupabase, 'from').mockImplementation(() => {
      const builder: any = {};
      builder.select = vi.fn().mockResolvedValue({
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
      return builder;
    });

    // Perform the operation
    const { data, error } = await serviceSupabase
      .from('profiles')
      .select('*');

    const builder = (serviceSupabase.from as any).mock.results[0].value;

    // Check if the operation was performed correctly
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
    vi.spyOn(supabase, 'from').mockImplementation(() => {
      const builder: any = {};
      builder.select = vi.fn().mockReturnValue(builder);
      builder.eq = vi.fn().mockReturnValue(builder);
      builder.single = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });
      return builder;
    });

    // Perform the operation
    const userId = '123';
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const builder = (supabase.from as any).mock.results[0].value;

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
    vi.spyOn(supabase, 'from').mockImplementation(() => {
      const builder: any = {};
      builder.insert = vi.fn().mockReturnValue(builder);
      builder.single = vi.fn().mockResolvedValue({
        data: {
          id: '789',
          first_name: 'Alice',
          last_name: 'Johnson',
          email: 'alice@example.com',
        },
        error: null,
      });
      return builder;
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

    const builder = (supabase.from as any).mock.results[0].value;

    // Check if the operation was performed correctly
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(builder.insert).toHaveBeenCalledWith(newUser);
    expect(builder.single).toHaveBeenCalled();

    // Check the result
    expect(error).toBeNull();
    expect(data).toEqual(newUser);
  });

  test('can delete user data', async () => {
    vi.spyOn(supabase, 'from').mockImplementation(() => {
      const builder: any = {};
      builder.delete = vi.fn().mockReturnValue(builder);
      builder.eq = vi.fn().mockReturnValue(builder);
      builder.then = vi.fn().mockImplementation((resolve) => Promise.resolve(resolve({ data: { success: true }, error: null })));
      return builder;
    });

    // Perform the operation
    const userId = '123';
    const result = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    const { data, error } = result;

    const builder = (supabase.from as any).mock.results[0].value;

    // Check if the operation was performed correctly
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith('id', userId);

    // Check the result
    expect(error).toBeNull();
    expect(data).toEqual({ success: true });
  }, 2000);
});
