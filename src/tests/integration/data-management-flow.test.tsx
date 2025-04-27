// __tests__/integration/data-management-flow.test.tsx

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard } from '@/components/dashboard/Dashboard';
// Use static mock import again
import { describe, test, expect, beforeEach, vi, Mock } from 'vitest'; 
// Remove beforeAll, afterAll
// import type { SupabaseClient } from '@supabase/supabase-js'; // Keep type if needed?

// Use top-level vi.mock again
vi.mock('@/lib/supabase', () => require('@/tests/mocks/supabase'));
// Use static import again
import { supabase } from '@/lib/supabase';

describe('Data Management Flow', () => {
  let user: ReturnType<typeof userEvent.setup>;
  // Remove dynamically imported supabase variable
  // let supabase: SupabaseClient; 

  // Remove beforeAll/afterAll blocks
  /*
  beforeAll(async () => {
    vi.doMock('@/lib/supabase', async () => {
      const mock = await vi.importActual<object>('@/tests/__mocks__/supabase');
      return mock;
    });
    const mod = await import('@/lib/supabase');
    supabase = mod.supabase;
  });

  afterAll(() => {
    vi.doUnmock('@/lib/supabase');
  });
  */

  beforeEach(() => {
    // supabase should now come from the static import, implicitly mocked
    vi.clearAllMocks();
    user = userEvent.setup();
    
    // Mock authentication
    (supabase.auth.getUser as Mock).mockResolvedValue({
      data: { user: { id: 'user-123', email: 'user@example.com' } },
      error: null
    });
    
    // *** Debug Log ***
    // console.log('supabase in beforeEach:', supabase);
    // console.log('supabase.from in beforeEach:', supabase?.from);

    // Mock empty data list initially using the new mock structure and correct return type
    vi.mocked(supabase.from('items').select).mockClear(); 
    vi.mocked(supabase.from('items').select).mockResolvedValue({ 
      data: [], 
      error: null, 
      count: 0, 
      status: 200, 
      statusText: 'OK' 
    });
    
    // Mock insert/update/delete with correct return type (data should be null on success)
    vi.mocked(supabase.from('items').insert).mockResolvedValue({ 
      data: null, 
      error: null, 
      count: null, 
      status: 201, 
      statusText: 'Created' 
    });
    vi.mocked(supabase.from('items').update).mockResolvedValue({ 
      data: null, 
      error: null, 
      count: null, 
      status: 200, 
      statusText: 'OK' 
    });
    vi.mocked(supabase.from('items').delete).mockResolvedValue({ 
      data: null,  
      error: null, 
      count: null, 
      status: 204, // Or 200
      statusText: 'No Content' // Or OK
    });
  });

  test('User can create, view, edit and delete content', async () => {
    render(<Dashboard />);
    // Expect initial select call from useEffect
    expect(supabase.from('items').select).toHaveBeenCalledTimes(1);
    await screen.findByText(/no items found/i);

    // --- CREATE --- 
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /create new/i }));
    });
    await act(async () => {
      await user.type(screen.getByLabelText(/title/i), 'Test Item');
    });
    await act(async () => {
      await user.type(screen.getByLabelText(/description/i), 'Test Description');
    });

    // Set up mocks right before the action
    (supabase.from('items').insert as Mock).mockResolvedValueOnce({ data: [{ id: 'item-1', title: 'Test Item', description: 'Test Description' }], error: null });
    (supabase.from('items').select as Mock).mockResolvedValueOnce({ data: [{ id: 'item-1', title: 'Test Item', description: 'Test Description' }], error: null });

    // Perform action within act
    await act(async () => {
      await user.click(screen.getAllByRole('button', { name: /save/i })[0]);
    });
    
    // *** Verify mock calls after create ***
    expect(supabase.from('items').insert).toHaveBeenCalledTimes(1);
    expect(supabase.from('items').select).toHaveBeenCalledTimes(2); // Initial + after create

    // Assert result (this might still fail, but we check mocks first)
    await screen.findByText('Test Item');
    expect(screen.queryByText(/no items found/i)).not.toBeInTheDocument();

    // --- EDIT --- 
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /edit/i }));
    });
    await act(async () => {
      await user.clear(screen.getByLabelText(/title/i));
    });
    await act(async () => {
      await user.type(screen.getByLabelText(/title/i), 'Updated Item');
    });

    // Set up mocks right before the action
    (supabase.from('items').update as Mock).mockResolvedValueOnce({ data: [{ id: 'item-1', title: 'Updated Item', description: 'Test Description' }], error: null });
    (supabase.from('items').select as Mock).mockResolvedValueOnce({ data: [{ id: 'item-1', title: 'Updated Item', description: 'Test Description' }], error: null });

    // Perform action within act
    await act(async () => {
      await user.click(screen.getAllByRole('button', { name: /save/i })[0]);
    });

    // *** Verify mock calls after update ***
    expect(supabase.from('items').update).toHaveBeenCalledTimes(1);
    expect(supabase.from('items').select).toHaveBeenCalledTimes(3); // Initial + after create + after update

    // Assert result (this might still fail)
    await screen.findByText('Updated Item');
    expect(screen.queryByText('Test Item')).not.toBeInTheDocument();

    // --- DELETE --- 
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /delete/i }));
    });

    // Set up mocks right before the action
    vi.spyOn(window, 'confirm').mockReturnValueOnce(true);
    (supabase.from('items').delete as Mock).mockResolvedValueOnce({ data: [{ id: 'item-1' }], error: null });
    (supabase.from('items').select as Mock).mockResolvedValueOnce({ data: [], error: null });

    // Perform action within act
    await act(async () => {
      await user.click(screen.getAllByRole('button', { name: /confirm/i })[0]);
    });

    // *** Verify mock calls after delete ***
    expect(supabase.from('items').delete).toHaveBeenCalledTimes(1);
    expect(supabase.from('items').select).toHaveBeenCalledTimes(4); // Initial + after create + after update + after delete

    // Assert result (this might still fail)
    await screen.findByText(/no items found/i);
    expect(screen.queryByText('Updated Item')).not.toBeInTheDocument();

    // Mock select again for post-creation fetch if necessary
    vi.mocked(supabase.from('items').select).mockResolvedValueOnce({ 
      data: [{ id: 'new-item', name: 'Test Item' }], 
      error: null,
      count: 1,
      status: 200,
      statusText: 'OK'
    });
  });

  test('handles error when creating item', async () => {
    render(<Dashboard />);
    await screen.findByText(/no items found/i);

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /create new/i }));
    });
    await act(async () => {
      await user.type(screen.getByLabelText(/title/i), 'Test Item');
    });
    await act(async () => {
      await user.type(screen.getByLabelText(/description/i), 'Test Description');
    });

    // Set up mock right before the action
    (supabase.from('items').insert as Mock).mockResolvedValueOnce({ data: null, error: { message: 'Error creating item' } });
    // Note: No subsequent select mock needed as fetchItems isn't called on error

    // Perform action within act
    await act(async () => {
      await user.click(screen.getAllByRole('button', { name: /save/i })[0]);
    });

    // Assert result
    await screen.findByText(/error creating item/i);
  });

  test('handles error when updating item', async () => {
    // Mock initial data 
    (supabase.from('items').select as Mock).mockResolvedValueOnce({ data: [{ id: 'item-1', title: 'Original Item', description: 'Original Description' }], error: null });

    render(<Dashboard />);
    await screen.findByText('Original Item');

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /edit/i }));
    });
    await act(async () => {
      await user.clear(screen.getByLabelText(/title/i));
    });
    await act(async () => {
      await user.type(screen.getByLabelText(/title/i), 'Updated Item');
    });

    // Set up mock right before the action
    (supabase.from('items').update as Mock).mockResolvedValueOnce({ data: null, error: { message: 'Error updating item' } });
    // Note: No subsequent select mock needed

    // Perform action within act
    await act(async () => {
      await user.click(screen.getAllByRole('button', { name: /save/i })[0]);
    });

    // Assert result
    await screen.findByText(/error updating item/i);
  });

  test('handles error when deleting item', async () => {
    // Mock initial data
    (supabase.from('items').select as Mock).mockResolvedValueOnce({ data: [{ id: 'item-1', title: 'Test Item', description: 'Test Description' }], error: null });

    render(<Dashboard />);
    await screen.findByText('Test Item');

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /delete/i }));
    });

    // Set up mocks right before the action
    vi.spyOn(window, 'confirm').mockReturnValueOnce(true);
    (supabase.from('items').delete as Mock).mockResolvedValueOnce({ data: null, error: { message: 'Error deleting item' } });
    // Note: No subsequent select mock needed

    // Perform action within act
    await act(async () => {
      await user.click(screen.getAllByRole('button', { name: /confirm/i })[0]);
    });

    // Assert result
    await screen.findByText(/error deleting item/i);
  });
});
