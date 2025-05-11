// __tests__/integration/user-preferences-flow.test.tsx

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserPreferences } from '@/components/common/UserPreferences';
import { useAuthStore } from '@/lib/stores/auth.store';
import { usePreferencesStore } from '@/lib/stores/preferences.store';

// Import our standardized mock
vi.mock('@/lib/supabase', () => import('@/tests/mocks/supabase'));
// import { supabase } from '@/tests/mocks/supabase'; // Not directly used if stores are fully mocked

// Mock Zustand stores
vi.mock('@/lib/stores/auth.store', () => ({
  useAuthStore: vi.fn(),
}));
vi.mock('@/lib/stores/preferences.store', () => ({
  usePreferencesStore: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('User Preferences Flow', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let mockFetchPreferences: ReturnType<typeof vi.fn>;
  let mockUpdatePreferences: ReturnType<typeof vi.fn>;
  let mockAuthStoreState: any; 
  let mockPreferencesStoreState: any;
  let documentElementClassList: { add: ReturnType<typeof vi.fn>, remove: ReturnType<typeof vi.fn>, contains: ReturnType<typeof vi.fn> };

  beforeEach(() => { // Can be non-async now
    vi.clearAllMocks();
    user = userEvent.setup();
    
    // Mock document.documentElement for theme testing
    documentElementClassList = {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn()
    };
    Object.defineProperty(document, 'documentElement', {
      value: { classList: documentElementClassList },
      writable: true,
      configurable: true, // Allow re-definition in tests if needed
    });

    // --- Mock useAuthStore ---
    mockAuthStoreState = {
      user: { id: 'user-123', email: 'user@example.com', user_metadata: {} }, // Added user_metadata for completeness
      session: { access_token: 'fake-token', user: { id: 'user-123' } }, // Added session for completeness
      isAuthenticated: true,
      // Add other state properties from actual useAuthStore if needed, with default mock values
      // For example:
      // error: null,
      // isLoading: false,
      // initializeAuth: vi.fn(), 
      // etc.
    };
    (vi.mocked(useAuthStore) as any).mockImplementation((selector?: (state: any) => any) => {
      if (typeof selector === 'function') {
        return selector(mockAuthStoreState);
      }
      return mockAuthStoreState;
    });

    // --- Mock usePreferencesStore ---
    mockFetchPreferences = vi.fn().mockResolvedValue(true); 
    mockUpdatePreferences = vi.fn().mockResolvedValue(true); 

    mockPreferencesStoreState = {
      preferences: {
        id: 'pref-1',
        user_id: 'user-123',
        theme: 'light',
        language: 'en',
        timezone: 'America/New_York',
        date_format: 'MM/DD/YYYY',
        items_per_page: 25,
        // Ensure all fields from the component's DEFAULTS and actual store are covered
      },
      isLoading: false,
      error: null,
      fetchPreferences: mockFetchPreferences,
      updatePreferences: mockUpdatePreferences,
      // Add other state properties from actual usePreferencesStore if needed
      // For example:
      // defaultPreferences: { ... },
    };
    (vi.mocked(usePreferencesStore) as any).mockImplementation((selector?: (state: any) => any) => {
      // Allow tests to override the whole store mock or specific parts for their scenario
      const currentState = (globalThis as any).__MOCKED_PREFERENCES_STORE_STATE__ || mockPreferencesStoreState;
      if (typeof selector === 'function') {
        return selector(currentState);
      }
      return currentState;
    });
  });

  afterEach(() => {
    delete (globalThis as any).__MOCKED_PREFERENCES_STORE_STATE__; // Clean up test-specific overrides
  });

  test('User can view and update preferences', async () => {
    // Render user preferences
    await act(async () => {
      render(<UserPreferences />);
    });
    
    // Wait for preferences to load
    await waitFor(() => {
      expect(screen.getByLabelText(/theme/i)).toHaveValue('light');
      expect(screen.getByLabelText(/language/i)).toHaveValue('en');
      expect(screen.getByLabelText(/items per page/i)).toHaveValue('25');
    });
    
    // Update preferences
    await act(async () => {
      await user.selectOptions(screen.getByLabelText(/theme/i), 'dark');
      await user.selectOptions(screen.getByLabelText(/language/i), 'es');
      await user.clear(screen.getByLabelText(/items per page/i));
      await user.type(screen.getByLabelText(/items per page/i), '50');
    });

    // Mock successful update (already default in beforeEach, but can be explicit)
    mockUpdatePreferences.mockResolvedValueOnce(true);
    
    // Save changes
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /save/i }));
    });
    
    await waitFor(() => {
      expect(screen.getByText(/preferences saved/i)).toBeInTheDocument();
    });
    
    // Verify update was called with correct data via the store mock
    expect(mockUpdatePreferences).toHaveBeenCalledWith(expect.objectContaining({
      theme: 'dark',
      language: 'es',
      itemsPerPage: 50 // Ensure this matches the component's payload structure
    }));
  });
  
  test('applies theme change immediately', async () => {
    // Specific setup for this test if needed (e.g. initial theme, though covered by beforeEach)
    // Ensure documentElementClassList is fresh from beforeEach or re-mock if necessary
    
    // Render user preferences
    await act(async () => {
      render(<UserPreferences />);
    });
    
    await waitFor(() => {
      expect(screen.getByLabelText(/theme/i)).toHaveValue('light');
    });
    
    // Change theme
    await act(async () => {
      await user.selectOptions(screen.getByLabelText(/theme/i), 'dark');
    });

    // Save changes
    mockUpdatePreferences.mockResolvedValueOnce(true);
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /save/i }));
    });
    
    // Verify theme was applied. The component itself handles classList changes.
    // The useEffect for theme in UserPreferences component is:
    // root.classList.remove('light-theme', 'dark-theme', 'system-theme');
    // if (form.theme === 'light') root.classList.add('light-theme'); ...
    // So, when changing to 'dark', 'light-theme' should be removed (among others) and 'dark-theme' added.
    await waitFor(() => {
        expect(documentElementClassList.remove).toHaveBeenCalledWith('light-theme', 'dark-theme', 'system-theme');
        expect(documentElementClassList.add).toHaveBeenCalledWith('dark-theme');
    });
  });
  
  test('validates items per page input', async () => {
    await act(async () => {
      render(<UserPreferences />);
    });
    
    await waitFor(() => {
      expect(screen.getByLabelText(/items per page/i)).toBeInTheDocument();
    });
    
    await act(async () => {
      await user.clear(screen.getByLabelText(/items per page/i));
      await user.type(screen.getByLabelText(/items per page/i), '500');
    });
    
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /save/i }));
    });
    
    expect(screen.getByText(/maximum allowed is 100/i)).toBeInTheDocument();
    expect(mockUpdatePreferences).not.toHaveBeenCalled();
  });
  
  test('handles error when saving preferences', async () => {
    // Override store mock for this test
    (globalThis as any).__MOCKED_PREFERENCES_STORE_STATE__ = {
      ...mockPreferencesStoreState,
      error: 'Error saving preferences', // This error is shown by the component if updatePreferences returns false and store.error is set
    };
    mockUpdatePreferences.mockResolvedValueOnce(false); // Simulate failed update

    await act(async () => {
      render(<UserPreferences />);
    });
    
    await waitFor(() => {
      expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
    });
    
    await act(async () => {
      await user.selectOptions(screen.getByLabelText(/theme/i), 'dark');
    });
    
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /save/i }));
    });
    
    await waitFor(() => {
      // The component uses its own error state for "Error saving preferences" if onError prop is not passed
      // or the store's error if updatePreferences sets it and returns false.
      // The component shows `t(error)` from the store.
      expect(screen.getByText(/error saving preferences/i)).toBeInTheDocument();
    });
  });
  
  test('can select timezone from dropdown', async () => {
    await act(async () => {
      render(<UserPreferences />);
    });
    
    await waitFor(() => {
      // Advanced settings need to be shown first
      expect(screen.getByRole('button', {name: /show advanced settings/i})).toBeInTheDocument();
    });
    await act(async () => {
      await user.click(screen.getByRole('button', {name: /show advanced settings/i}));
    });
    await waitFor(() => {
        expect(screen.getByLabelText(/timezone/i)).toBeInTheDocument();
    });

    // The component uses a text input for timezone.
    await act(async () => {
      await user.clear(screen.getByLabelText(/timezone/i));
      await user.type(screen.getByLabelText(/timezone/i), 'Europe/London');
    });
    
    mockUpdatePreferences.mockResolvedValueOnce(true);
    
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /save/i }));
    });
    
    await waitFor(() => {
      expect(screen.getByText(/preferences saved/i)).toBeInTheDocument();
    });

    expect(mockUpdatePreferences).toHaveBeenCalledWith(expect.objectContaining({
      timezone: 'Europe/London'
    }));
  });
  
  test('can select date format', async () => {
    await act(async () => {
      render(<UserPreferences />);
    });

    await waitFor(() => {
      // Advanced settings need to be shown first
      expect(screen.getByRole('button', {name: /show advanced settings/i})).toBeInTheDocument();
    });
    await act(async () => {
      await user.click(screen.getByRole('button', {name: /show advanced settings/i}));
    });
    await waitFor(() => {
        expect(screen.getByLabelText(/date format/i)).toBeInTheDocument();
    });

    // The component uses a text input for date format.
    await act(async () => {
      await user.clear(screen.getByLabelText(/date format/i));
      await user.type(screen.getByLabelText(/date format/i), 'DD/MM/YYYY');
    });
    
    mockUpdatePreferences.mockResolvedValueOnce(true);
    
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /save/i }));
    });
    
    await waitFor(() => {
      expect(screen.getByText(/preferences saved/i)).toBeInTheDocument();
    });
    
    expect(mockUpdatePreferences).toHaveBeenCalledWith(expect.objectContaining({
      dateFormat: 'DD/MM/YYYY' // Ensure this matches the component's payload structure
    }));
    
    // The component does not have a "date format preview" text. Removing this assertion.
    // expect(screen.getByText(/date format preview/i)).toHaveTextContent(/\d{2}\/\d{2}\/\d{4}/); 
  });
  
  test('can toggle advanced settings', async () => {
    await act(async () => {
      render(<UserPreferences />);
    });
    
    await waitFor(() => {
      expect(screen.getByLabelText(/theme/i)).toBeInTheDocument(); // Ensure component is loaded
    });
    
    // Advanced settings should be hidden initially
    expect(screen.queryByLabelText(/timezone/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show advanced settings/i })).toBeInTheDocument();
    
    // Open advanced settings section
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /show advanced settings/i }));
    });
    
    expect(screen.getByLabelText(/timezone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date format/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hide advanced settings/i })).toBeInTheDocument();
    
    // The "keyboard shortcuts" label was incorrect as it's not in the component.
    // This test focuses on toggling visibility of timezone/dateFormat.

    // Toggle to hide advanced settings
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /hide advanced settings/i }));
    });

    expect(screen.queryByLabelText(/timezone/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show advanced settings/i })).toBeInTheDocument();
  });
  
  test('can reset preferences to defaults', async () => {
    await act(async () => {
      render(<UserPreferences />);
    });
    
    await waitFor(() => {
      expect(screen.getByLabelText(/theme/i)).toHaveValue('light'); 
      expect(screen.getByLabelText(/items per page/i)).toHaveValue('25'); 
    });
    
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /reset to defaults/i }));
    });

    await waitFor(() => {
        expect(screen.getByRole('heading', { name: /reset preferences/i })).toBeInTheDocument();
    });
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /reset/i, hidden: true })); 
    });

    mockUpdatePreferences.mockResolvedValueOnce(true);
    
    await waitFor(() => {
        // Values should be reset to component DEFAULTS
        expect(screen.getByLabelText(/language/i)).toHaveValue('en'); 
        expect(screen.getByLabelText(/theme/i)).toHaveValue('system'); 
        expect(screen.getByLabelText(/items per page/i)).toHaveValue('25'); 
        // Check advanced fields too, assuming they become visible or are part of reset form state
        expect(screen.getByLabelText(/timezone/i)).toHaveValue('UTC'); 
        expect(screen.getByLabelText(/date format/i)).toHaveValue('YYYY-MM-DD'); 
        expect(screen.getByText(/preferences reset/i)).toBeInTheDocument();
    });

    expect(mockUpdatePreferences).toHaveBeenCalledWith(expect.objectContaining({
      language: 'en',
      theme: 'system',
      itemsPerPage: 25,
      timezone: 'UTC',
      dateFormat: 'YYYY-MM-DD',
    }));
  });
});
