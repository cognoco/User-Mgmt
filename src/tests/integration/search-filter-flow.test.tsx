// __tests__/integration/search-filter-flow.test.tsx

import { vi } from 'vitest';

// --- Define mock structure ENTIRELY INSIDE vi.mock factory ---

vi.mock('@/lib/database/supabase', () => {
  // Create a reusable function to generate a query builder mock
  const createQueryBuilderMock = () => ({
    ilike: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    then: vi.fn((onfulfilled: (value: any) => void) => {
      // Default resolution for await, can be overridden per instance
      console.log('[Factory QueryBuilder .then] Default resolution');
      return Promise.resolve({ data: [], error: null }).then(onfulfilled);
    }),
    // Add mockClear method for easier resetting
    mockClearAll: function() {
      this.ilike.mockClear();
      this.eq.mockClear();
      this.gte.mockClear();
      this.lte.mockClear();
      this.in.mockClear();
      this.select.mockClear();
      this.then.mockClear();
      return this; // Allow chaining if needed
    }
  });

  // Create specific instances if needed, or just one main one
  const itemsQueryBuilderMock = createQueryBuilderMock();
  const defaultQueryBuilderMock = createQueryBuilderMock();

  const inlineMockSupabase = {
    auth: {
      getUser: vi.fn(),
    },
    storage: { /* Mock if needed */ },
    rpc: { /* Mock if needed */ },
    channel: { /* Mock if needed */ },
    from: vi.fn().mockImplementation((tableName: string) => {
      console.log(`[Inline Mock Factory] supabase.from called with table: "${tableName}"`);
      if (tableName === 'items') {
        console.log(`[Inline Mock Factory] Returning itemsQueryBuilderMock for 'items'.`);
        // Return the dedicated mock instance for the 'items' table
        return itemsQueryBuilderMock;
      }
      console.log(`[Inline Mock Factory] Returning defaultQueryBuilderMock for table: "${tableName}"`);
      return defaultQueryBuilderMock;
    })
  };

  return {
    __esModule: true,
    supabase: inlineMockSupabase,
  };
});
// --- End of mock setup ---

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchPage from '@/components/search/SearchPage'; 

// Import supabase AFTER the mock definition
import { supabase } from '@/lib/database/supabase';

describe('Search and Filtering Flow', () => {
  let user: ReturnType<typeof userEvent.setup>;
  
  const mockItems = [
    { id: 'item1', title: 'Marketing Report', category: 'report', date: '2023-01-15' },
    { id: 'item2', title: 'Sales Presentation', category: 'presentation', date: '2023-02-20' },
    { id: 'item3', title: 'Budget Spreadsheet', category: 'spreadsheet', date: '2023-03-10' }
  ];

  beforeEach(() => {
    vi.clearAllMocks(); 
    user = userEvent.setup({ delay: null }); 

    const itemsBuilder = supabase.from('items') as any;
    // Clear previous test-specific implementations AND calls
    vi.mocked(itemsBuilder.then).mockRestore(); // Restore original .then (if any)
    itemsBuilder.mockClearAll(); // Clear calls on other builder methods

    // Mock authentication
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { 
        user: { 
          id: 'user-123', 
          email: 'user@example.com',
          app_metadata: { provider: 'email', providers: ['email'] },
          user_metadata: { name: 'Test User' },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } 
      },
      error: null
    });
    
    // Re-apply the default implementation for initial load in EVERY test
    vi.mocked(itemsBuilder.then).mockImplementation(async (resolve: (value: any) => void) => {
      console.log('[itemsBuilder .then] Default resolution (initial load) - Re-applied in beforeEach');
      resolve({ data: mockItems, error: null });
    });

    vi.mocked(supabase.from).mockClear(); 
  });

  // Helper to wait for list items to appear/update
  const waitForItems = async (expectedCount: number) => {
    await waitFor(() => {
      const items = screen.queryAllByRole('listitem'); 
      expect(items).toHaveLength(expectedCount);
    });
  };
  
  // Helper to wait for a specific text element
  const waitForText = async (text: string | RegExp) => {
    await waitFor(() => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  };

  test('User can search and filter content', async () => {
    // Initial load uses default mock resolution set in beforeEach 
    render(<SearchPage />);
    const itemsBuilder = supabase.from('items') as any; // Get the builder instance
    
    await waitForItems(3); 
    await waitForText('Marketing Report');
    await waitForText('Sales Presentation');
    await waitForText('Budget Spreadsheet');
    
    // Verify initial call chain 
    expect(supabase.from).toHaveBeenCalledWith('items'); 
    expect(itemsBuilder.select).toHaveBeenCalledWith('*');
    expect(itemsBuilder.then).toHaveBeenCalledTimes(1); 
    
    // **Search Action**
    vi.mocked(itemsBuilder.then).mockImplementationOnce(async (resolve: (value: any) => void) => {
      console.log('[itemsBuilder .then] Search resolution');
      resolve({ data: [mockItems[1]], error: null });
    });

    await user.type(screen.getByRole('searchbox'), 'presentation');
    
    await waitForText('Sales Presentation'); 
    await waitFor(() => {
      expect(screen.queryByText('Marketing Report')).not.toBeInTheDocument();
      expect(screen.queryByText('Budget Spreadsheet')).not.toBeInTheDocument();
      expect(itemsBuilder.ilike).toHaveBeenCalledWith('title', '%presentation%');
      expect(itemsBuilder.then).toHaveBeenCalledTimes(2);
    });
    
    // **Clear Search Action**
    vi.mocked(itemsBuilder.then).mockImplementationOnce(async (resolve: (value: any) => void) => {
       console.log('[itemsBuilder .then] Clear Search resolution');
       resolve({ data: mockItems, error: null });
    });

    await user.clear(screen.getByRole('searchbox'));
    
    await waitForItems(3);
    await waitForText('Marketing Report');
    await waitForText('Sales Presentation');
    await waitForText('Budget Spreadsheet');
    await waitFor(() => {
       expect(itemsBuilder.then).toHaveBeenCalledTimes(3);
    });

    // **Category Filter Action**
     vi.mocked(itemsBuilder.then).mockImplementationOnce(async (resolve: (value: any) => void) => {
       console.log('[itemsBuilder .then] Category Filter resolution');
       resolve({ data: [mockItems[0]], error: null });
    });

    const reportCheckbox = screen.getByRole('checkbox', { name: /report/i });
    await user.click(reportCheckbox);
    
    await waitForText('Marketing Report');
    await waitFor(() => {
      expect(screen.queryByText('Sales Presentation')).not.toBeInTheDocument();
      expect(screen.queryByText('Budget Spreadsheet')).not.toBeInTheDocument();
      expect(itemsBuilder.in).toHaveBeenCalledWith('category', ['report']);
      expect(itemsBuilder.then).toHaveBeenCalledTimes(4);
    });
  });

  test('handles combined search and filter operations', async () => {
    render(<SearchPage />);
    const itemsBuilder = supabase.from('items') as any; 
    await waitForItems(3); 
    expect(await screen.findByText('Marketing Report')).toBeInTheDocument();

    // **Combined Filter/Search Action - Mock BOTH fetches**
    
    // Mock 1: For the fetch triggered by the checkbox click
    vi.mocked(itemsBuilder.then).mockImplementationOnce(async (resolve: (value: any) => void) => { 
      console.log('[itemsBuilder .then] Combined - Checkbox resolution'); 
      resolve({ data: [mockItems[0]], error: null }); // Only Marketing Report expected after click
    });
    
    // Mock 2: For the fetch triggered by the debounced search term
    vi.mocked(itemsBuilder.then).mockImplementationOnce(async (resolve: (value: any) => void) => { 
       console.log('[itemsBuilder .then] Combined - Debounced Search resolution');
       resolve({ data: [mockItems[0]], error: null }); // Still only Marketing Report expected
    });
    
    // --- User Actions --- 
    const reportCheckbox = screen.getByRole('checkbox', { name: /report/i });
    await user.click(reportCheckbox); 
    
    // Wait for the first update (checkbox click) to reflect in UI
    await waitFor(() => {
        expect(screen.getByText('Marketing Report')).toBeInTheDocument();
        expect(screen.queryByText('Sales Presentation')).not.toBeInTheDocument(); 
        expect(itemsBuilder.in).toHaveBeenCalledWith('category', ['report']); // Check category filter applied
    });
    
    await user.type(screen.getByRole('searchbox'), 'marketing'); 
    
    // Wait for debounce AND the second fetch to complete 
    // The UI might not change here if the result is the same, but we wait for the async operations
    await waitFor(() => {
      // Check that the final fetch completed by looking at the .then count
      // Initial Load (1) + Checkbox Click (1) + Debounced Search (1) = 3
      expect(itemsBuilder.then).toHaveBeenCalledTimes(3); 
    }, { timeout: 3000 }); // Timeout includes debounce delay

    // --- Final Assertions --- 
    // Check final UI state
    expect(screen.getByText('Marketing Report')).toBeInTheDocument();
    expect(screen.queryByText('Sales Presentation')).not.toBeInTheDocument();
    expect(screen.queryByText('Budget Spreadsheet')).not.toBeInTheDocument();
    
    // Verify mock calls for the filters applied in the *last* fetch
    expect(supabase.from).toHaveBeenCalledWith('items'); 
    expect(itemsBuilder.ilike).toHaveBeenCalledWith('title', '%marketing%');
    expect(itemsBuilder.in).toHaveBeenCalledWith('category', ['report']);
    // Check total .then calls again for certainty
    expect(itemsBuilder.then).toHaveBeenCalledTimes(3); 
  });

  test('applying date range filter', async () => {
    render(<SearchPage />);
    const itemsBuilder = supabase.from('items') as any; 
    // This initial waitForItems should now pass due to improved beforeEach cleanup
    await waitForItems(3); 

    // **Date Filter Action**
    // Mock the fetch triggered by the first date change
    vi.mocked(itemsBuilder.then).mockImplementationOnce(async (resolve: (value: any) => void) => { 
      console.log('[itemsBuilder .then] Start date resolution'); 
      // Assume setting start date alone might not filter yet, or mock intermediate state if needed
      // For simplicity, let's assume the filter applies fully only when both dates are set
      resolve({ data: mockItems, error: null }); // Still return all items initially
    });
    // Mock the fetch triggered by the second date change (final state)
    vi.mocked(itemsBuilder.then).mockImplementationOnce(async (resolve: (value: any) => void) => { 
      console.log('[itemsBuilder .then] End date resolution (final)'); 
      resolve({ data: [mockItems[0], mockItems[1]], error: null }); // Report, Presentation
    });

    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);
    
    await user.clear(startDateInput);
    await user.type(startDateInput, '2023-01-01'); 
    await waitFor(() => {}); // Tick
    await user.clear(endDateInput);
    await user.type(endDateInput, '2023-02-28'); 
    await waitFor(() => {}); // Tick
    
    // Wait for the final state
    await waitFor(() => {
      expect(screen.getByText('Marketing Report')).toBeInTheDocument();
      expect(screen.getByText('Sales Presentation')).toBeInTheDocument();
      expect(screen.queryByText('Budget Spreadsheet')).not.toBeInTheDocument();
    }, { timeout: 3000 }); 

    // Verify mocks for the final state
    expect(itemsBuilder.gte).toHaveBeenCalledWith('date', '2023-01-01');
    expect(itemsBuilder.lte).toHaveBeenCalledWith('date', '2023-02-28');
    // Called for initial load + start date change + end date change
    expect(itemsBuilder.then).toHaveBeenCalledTimes(3); 
  });

  test('displays no results message for empty search', async () => {
    render(<SearchPage />);
    const itemsBuilder = supabase.from('items') as any; 
    await waitForItems(3); 

    // **Empty Search Action**
    vi.mocked(itemsBuilder.then).mockImplementationOnce(async (resolve: (value: any) => void) => {
       console.log('[itemsBuilder .then] Empty search resolution');
       resolve({ data: [], error: null });
    });

    await user.type(screen.getByRole('searchbox'), 'nonexistent'); 
    await waitFor(() => {}); // Add small wait/tick after type
    
    // Explicit waitFor for the final state with increased timeout
    await waitFor(() => { 
        expect(screen.getByText(/no results found/i)).toBeInTheDocument(); 
        expect(screen.queryByText('Marketing Report')).not.toBeInTheDocument();
        expect(screen.queryByText('Sales Presentation')).not.toBeInTheDocument();
        expect(screen.queryByText('Budget Spreadsheet')).not.toBeInTheDocument();
    }, { timeout: 3000 }); // Increased timeout
    
    // Keep mock verification outside waitFor
    expect(itemsBuilder.ilike).toHaveBeenCalledWith('title', '%nonexistent%');
    expect(itemsBuilder.then).toHaveBeenCalledTimes(2); 
  });

  test('handles error during search operation', async () => {
    render(<SearchPage />);
    const itemsBuilder = supabase.from('items') as any; 
    await waitForItems(3); 

    // **Error Action**
    const mockError = { message: 'Search operation failed', details: '', hint: '', code: '500' };
    vi.mocked(itemsBuilder.then).mockImplementationOnce(async (resolve: (value: any) => void) => {
       console.log('[itemsBuilder .then] Error resolution');
       resolve({ data: null, error: mockError }); 
    });
    
    await user.type(screen.getByRole('searchbox'), 'query'); 
    await waitFor(() => {}); // Add small wait/tick after type
    
    // Explicit waitFor for the final state with increased timeout
    await waitFor(() => { 
       expect(screen.getByText(/search operation failed/i)).toBeInTheDocument();
        // Check items are not displayed on error
        expect(screen.queryByText('Marketing Report')).not.toBeInTheDocument();
        expect(screen.queryByText('Sales Presentation')).not.toBeInTheDocument();
        expect(screen.queryByText('Budget Spreadsheet')).not.toBeInTheDocument();
    }, { timeout: 3000 }); // Increased timeout
    
    // Keep mock verification outside waitFor
    expect(itemsBuilder.ilike).toHaveBeenCalledWith('title', '%query%');
    expect(itemsBuilder.then).toHaveBeenCalledTimes(2); 
  });

  test('reset filters button clears all active filters', async () => {
    render(<SearchPage />);
    const itemsBuilder = supabase.from('items') as any; 
    await waitForItems(3); 
    expect(await screen.findByText('Marketing Report')).toBeInTheDocument();
    
    // **Apply Filter Action**
    vi.mocked(itemsBuilder.then).mockImplementationOnce(async (resolve: (value: any) => void) => {
       console.log('[itemsBuilder .then] Reset test - Filter resolution');
       resolve({ data: [mockItems[0]], error: null }); // Only Marketing Report
    });
    const reportCheckbox = screen.getByRole('checkbox', { name: /report/i });
    await user.click(reportCheckbox); 
    
    // Explicit waitFor for the filtered state
    await waitFor(() => {
        expect(screen.getByText('Marketing Report')).toBeInTheDocument();
        expect(screen.queryByText('Sales Presentation')).not.toBeInTheDocument();
        expect(screen.queryByText('Budget Spreadsheet')).not.toBeInTheDocument();
    });

    // **Reset Action** 
    vi.mocked(itemsBuilder.then).mockImplementationOnce(async (resolve: (value: any) => void) => {
       console.log('[itemsBuilder .then] Reset test - Reset resolution');
       resolve({ data: mockItems, error: null }); // All items
    });

    await user.click(screen.getByRole('button', { name: /reset filters/i })); 
    
    // Explicit waitFor for the final reset state - SPLIT assertions
    // Wait for items first
    await waitFor(() => {
        expect(screen.getByText('Marketing Report')).toBeInTheDocument();
        expect(screen.getByText('Sales Presentation')).toBeInTheDocument();
        expect(screen.getByText('Budget Spreadsheet')).toBeInTheDocument(); 
    }, { timeout: 3000 }); // Increased timeout
    
    // Wait for checkbox state separately (using getByRole again to ensure it's checked after potential re-renders)
    await waitFor(() => {
         const checkboxAfterReset = screen.getByRole('checkbox', { name: /report/i });
         // Use simpler check for unchecked state if data-state attribute is unreliable/absent
         expect(checkboxAfterReset).not.toBeChecked(); 
         // expect(checkboxAfterReset).toHaveAttribute('data-state', 'unchecked'); // Keep if data-state is consistently used
    }, { timeout: 3000 }); // Increased timeout
    
    // Keep mock verification outside waitFor
    expect(itemsBuilder.then).toHaveBeenCalledTimes(3); 
  });
});
