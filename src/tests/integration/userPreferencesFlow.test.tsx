// __tests__/integration/user-preferences-flow.test.tsx

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserPreferencesComponent } from '@/ui/styled/common/UserPreferences';
import { useAuth } from '@/hooks/auth/useAuth';
import { usePreferencesStore } from '@/lib/stores/preferences.store';

// Mock Zustand stores
const mockUseAuth = vi.fn();
vi.mock('@/hooks/auth/useAuth', () => ({
  useAuth: mockUseAuth,
}));
vi.mock('@/lib/stores/preferences.store', () => ({
  usePreferencesStore: vi.fn(),
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

    // --- Mock useAuth ---
    mockAuthStoreState = {
      user: { id: 'user-123', email: 'user@example.com', user_metadata: {} },
      session: { access_token: 'fake-token', user: { id: 'user-123' } },
      isAuthenticated: true,
    };
    mockUseAuth.mockReturnValue(mockAuthStoreState);

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
        dateFormat: 'MM/DD/YYYY',
        itemsPerPage: 25, // Number value from store
        notifications: {
          email: true,
          push: false,
          marketing: false,
        },
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
    // Make sure to reset fake timers in case a test used them
    if (vi.isFakeTimers()) {
      vi.useRealTimers();
    }
  });

  test('User can view and update preferences', async () => {
    // Render component
    await act(async () => {
      render(<UserPreferencesComponent />);
    });

    // Wait for the component to be fully rendered and stable
    await waitFor(() => {
      expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
    });

    // Verify initial values - use toString() for number-to-string comparisons
    expect(screen.getByLabelText(/theme/i)).toHaveValue('light');
    expect(screen.getByLabelText(/language/i)).toHaveValue('en');
    // Use toHaveDisplayValue for numeric input (see TESTING_ISSUES.md IV.B)
    expect(screen.getByLabelText(/items per page/i)).toHaveDisplayValue('25');

    // Change values
    await act(async () => {
      await user.selectOptions(screen.getByLabelText(/theme/i), 'dark');
      await user.selectOptions(screen.getByLabelText(/language/i), 'es');
      await user.clear(screen.getByLabelText(/items per page/i));
      await user.type(screen.getByLabelText(/items per page/i), '50');
    });

    // Mock the update response
    mockUpdatePreferences.mockResolvedValueOnce(true);

    // Save changes
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /save/i }));
    });

    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/preferences saved/i)).toBeInTheDocument();
    });

    // Verify the store was called with the right values - use numbers to match what the component sends
    expect(mockUpdatePreferences).toHaveBeenCalledWith(expect.objectContaining({
      theme: 'dark',
      language: 'es',
      itemsPerPage: 50 // This should be a number as the component converts the string to number
    }));
  });
  
  test('applies theme change immediately', async () => {
    // Render component
    await act(async () => {
      render(<UserPreferencesComponent />);
    });
    
    // Verify initial theme
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
    
    // Verify theme application - component uses useEffect to apply the theme
    await waitFor(() => {
      expect(documentElementClassList.remove).toHaveBeenCalledWith('light-theme', 'dark-theme', 'system-theme');
      expect(documentElementClassList.add).toHaveBeenCalledWith('dark-theme');
    });
  });
  
  test('validates items per page input', async () => {
    // Render component
    await act(async () => {
      render(<UserPreferencesComponent />);
    });
    
    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByLabelText(/items per page/i)).toBeInTheDocument();
    });
    
    // Enter invalid value
    await act(async () => {
      await user.clear(screen.getByLabelText(/items per page/i));
      await user.type(screen.getByLabelText(/items per page/i), '500');
    });
    
    // Try to save
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /save/i }));
    });
    
    // Verify validation error and that update wasn't called
    expect(screen.getByText(/maximum allowed is 100/i)).toBeInTheDocument();
    expect(mockUpdatePreferences).not.toHaveBeenCalled();
  });
  
  test('handles error when saving preferences', async () => {
    // Override store mock for this test - simulate an error state
    (globalThis as any).__MOCKED_PREFERENCES_STORE_STATE__ = {
      ...mockPreferencesStoreState,
      error: 'Error saving preferences', // This error will be displayed by the component
    };
    mockUpdatePreferences.mockResolvedValueOnce(false); // Simulate failed update

    // Render component
    await act(async () => {
      render(<UserPreferencesComponent />);
    });
    
    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
    });
    
    // Change theme
    await act(async () => {
      await user.selectOptions(screen.getByLabelText(/theme/i), 'dark');
    });
    
    // Save changes (this will fail)
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /save/i }));
    });
    
    // Verify error message displayed
    await waitFor(() => {
      expect(screen.getByText(/error saving preferences/i)).toBeInTheDocument();
    });
  });
  
  test('can select timezone from dropdown', async () => {
    // Render component
    await act(async () => {
      render(<UserPreferencesComponent />);
    });
    
    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByRole('button', {name: /show advanced settings/i})).toBeInTheDocument();
    });

    // Show advanced settings
    await act(async () => {
      await user.click(screen.getByRole('button', {name: /show advanced settings/i}));
    });

    // Wait for timezone field to be visible
    await waitFor(() => {
      expect(screen.getByLabelText(/timezone/i)).toBeInTheDocument();
    });

    // Change timezone
    await act(async () => {
      await user.clear(screen.getByLabelText(/timezone/i));
      await user.type(screen.getByLabelText(/timezone/i), 'Europe/London');
    });
    
    // Mock successful update
    mockUpdatePreferences.mockResolvedValueOnce(true);
    
    // Save changes
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /save/i }));
    });
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/preferences saved/i)).toBeInTheDocument();
    });

    // Verify correct timezone was passed
    expect(mockUpdatePreferences).toHaveBeenCalledWith(expect.objectContaining({
      timezone: 'Europe/London'
    }));
  });
  
  test('can select date format', async () => {
    // Render component
    await act(async () => {
      render(<UserPreferencesComponent />);
    });

    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByRole('button', {name: /show advanced settings/i})).toBeInTheDocument();
    });

    // Show advanced settings
    await act(async () => {
      await user.click(screen.getByRole('button', {name: /show advanced settings/i}));
    });

    // Wait for date format field to be visible
    await waitFor(() => {
      expect(screen.getByLabelText(/date format/i)).toBeInTheDocument();
    });

    // Change date format
    await act(async () => {
      await user.clear(screen.getByLabelText(/date format/i));
      await user.type(screen.getByLabelText(/date format/i), 'DD/MM/YYYY');
    });
    
    // Mock successful update
    mockUpdatePreferences.mockResolvedValueOnce(true);
    
    // Save changes
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /save/i }));
    });
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/preferences saved/i)).toBeInTheDocument();
    });
    
    // Verify correct date format was passed
    expect(mockUpdatePreferences).toHaveBeenCalledWith(expect.objectContaining({
      dateFormat: 'DD/MM/YYYY'
    }));
  });
  
  test('can toggle advanced settings', async () => {
    // Render component
    await act(async () => {
      render(<UserPreferencesComponent />);
    });
    
    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
    });
    
    // Advanced settings should be hidden initially
    expect(screen.queryByLabelText(/timezone/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show advanced settings/i })).toBeInTheDocument();
    
    // Show advanced settings
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /show advanced settings/i }));
    });
    
    // Verify fields are now visible
    expect(screen.getByLabelText(/timezone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date format/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hide advanced settings/i })).toBeInTheDocument();
    
    // Hide advanced settings
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /hide advanced settings/i }));
    });

    // Verify fields are hidden again
    expect(screen.queryByLabelText(/timezone/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show advanced settings/i })).toBeInTheDocument();
  });
  
  test('can reset preferences to defaults', async () => {
    // Set mock default values for reset
    const defaultPreferences = {
      theme: 'system',
      language: 'en',
      itemsPerPage: 25, // Keep as number to match component
      timezone: 'UTC',
      dateFormat: 'YYYY-MM-DD',
      notifications: {
        email: false,
        push: false,
        marketing: false
      }
    };

    // Mock updatePreferences to simulate the reset
    mockUpdatePreferences.mockImplementation(() => {
      // Update the global mock state to simulate the reset
      (globalThis as any).__MOCKED_PREFERENCES_STORE_STATE__ = {
        ...mockPreferencesStoreState,
        preferences: {
          ...mockPreferencesStoreState.preferences,
          ...defaultPreferences
        }
      };
      return Promise.resolve(true);
    });

    // Render component
    await act(async () => {
      render(<UserPreferencesComponent />);
    });

    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
    });

    // Verify initial values - use toHaveDisplayValue instead of toHaveValue for numeric inputs (see TESTING_ISSUES.md IV.B)
    expect(screen.getByLabelText(/theme/i)).toHaveValue('light');
    const itemsPerPageInput = screen.getByLabelText(/items per page/i);
    expect(itemsPerPageInput).toHaveDisplayValue('25');
    
    // Click reset button to open dialog
    await act(async () => {
      await user.click(screen.getAllByRole('button', { name: /reset to defaults/i })[0]);
    });
    
    // Check dialog is open
    expect(screen.getByRole('heading', { name: /reset preferences/i })).toBeInTheDocument();
    
    // Confirm reset
    await act(async () => {
      // Get the first reset button (the one in the dialog)
      await user.click(screen.getAllByRole('button', { name: /reset/i })[0]);
    });
    
    // Wait for reset to be processed and success message to appear
    await waitFor(() => {
      expect(screen.getByText(/preferences reset/i)).toBeInTheDocument();
    });
    
    // Show advanced settings to check those values
    await act(async () => {
      if (screen.queryByRole('button', { name: /show advanced settings/i })) {
        await user.click(screen.getByRole('button', { name: /show advanced settings/i }));
      }
    });
    
    // Verify reset values (theme should be 'system' after reset)
    await waitFor(() => {
      expect(screen.getByLabelText(/theme/i)).toHaveValue('system');
      expect(screen.getByLabelText(/language/i)).toHaveValue('en');
      expect(screen.getByLabelText(/items per page/i)).toHaveDisplayValue('25'); // Use toHaveDisplayValue
    });
    
    // Verify updatePreferences was called with the default values
    expect(mockUpdatePreferences).toHaveBeenCalledWith(expect.objectContaining({
      theme: 'system',
      language: 'en',
      itemsPerPage: 25 // Number to match what the component sends
    }));
  });

  test('can toggle notification preferences', async () => {
    // Render component
    await act(async () => {
      render(<UserPreferencesComponent />);
    });
    
    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByLabelText(/email notifications/i)).toBeInTheDocument();
    });
    
    // Toggle notification settings
    await act(async () => {
      await user.click(screen.getByLabelText(/email notifications/i));
      await user.click(screen.getByLabelText(/push notifications/i));
      await user.click(screen.getByLabelText(/marketing notifications/i));
    });

    // Mock successful update
    mockUpdatePreferences.mockResolvedValueOnce(true);
    
    // Save changes
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /save/i }));
    });
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/preferences saved/i)).toBeInTheDocument();
    });

    // Verify correct notification settings
    expect(mockUpdatePreferences).toHaveBeenCalledWith(expect.objectContaining({
      notifications: expect.objectContaining({
        email: true,
        push: true,
        marketing: true,
      }),
    }));
  });

  // --- Export test: simulate file download (see TESTING_ISSUES.md IV.D) ---
  test('can export preferences', async () => {
    // SIMPLIFY: Focus only on verifying that the export function is called correctly
    // Instead of complex anchor mocks, just verify the URL.createObjectURL is called with correct blob
    
    // Mock URL.createObjectURL
    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    const origCreateObjectURL = URL.createObjectURL;
    URL.createObjectURL = mockCreateObjectURL;
    
    // Mock document.createElement to track when anchor is created
    const realCreateElement = document.createElement.bind(document);
    const mockAnchorClick = vi.fn();
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        const anchor = realCreateElement(tag);
        // Add a simple click spy
        anchor.click = mockAnchorClick;
        return anchor;
      }
      return realCreateElement(tag);
    });
    
    // Render component
    render(<UserPreferencesComponent />);
    
    // Find and click export button
    const exportButton = await screen.findByRole('button', { name: /export my data/i });
    await act(async () => {
      await user.click(exportButton);
    });
    
    // Verify a blob was created with JSON data
    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    
    // Verify download was initiated
    expect(mockAnchorClick).toHaveBeenCalledTimes(1);
    
    // Verify success message
    expect(screen.getByText(/your data export has been downloaded successfully/i)).toBeInTheDocument();
    
    // Cleanup
    URL.createObjectURL = origCreateObjectURL;
  });

  // --- Import test: simulate file upload (see TESTING_ISSUES.md IV.D) ---
  test('can import preferences', async () => {
    // SIMPLIFY: Focus only on testing that the component handles file upload and processing
    
    // Preference data to import
    const mockImportData = {
      language: 'fr',
      theme: 'dark',
      notifications: { email: true, push: true, marketing: false },
      itemsPerPage: 30,
      timezone: 'Europe/Paris',
      dateFormat: 'DD/MM/YYYY',
    };
    
    // Create a file input manually for simulation
    let fileInput: HTMLInputElement | null = null;
    
    // Mock document.createElement only for input elements
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string): HTMLElement => {
      if (tag === 'input') {
        // Create a real input element that we can access
        fileInput = originalCreateElement('input') as HTMLInputElement;
        // Set up with proper attributes matching component expectations
        fileInput.type = 'file';
        fileInput.accept = 'application/json,.json';
        return fileInput;
      }
      // For all other tags, use the original implementation directly
      return originalCreateElement(tag);
    });
    
    // Mock FileReader to directly call onload with our data
    const mockFileReader = function(this: any) {
      this.readAsText = vi.fn(() => {
        // Directly simulate successful file read with our test data
        setTimeout(() => {
          if (this.onload) {
            this.onload({ target: { result: JSON.stringify(mockImportData) } });
          }
        }, 0);
      });
    };
    
    const OrigFileReader = window.FileReader;
    window.FileReader = mockFileReader as any;
    
    // Render component
    render(<UserPreferencesComponent />);
    
    // Find and click import button
    const importButton = await screen.findByRole('button', { name: /import data/i });
    await act(async () => {
      await user.click(importButton);
    });
    
    // Verify file input was created
    expect(fileInput).not.toBeNull();
    
    // Manually simulate file selection
    if (fileInput) {
      // Create a mock file
      const testFile = new File(
        [JSON.stringify(mockImportData)], 
        'user-preferences.json', 
        { type: 'application/json' }
      );
      
      // Set up the files array
      Object.defineProperty(fileInput, 'files', {
        value: [testFile],
        writable: true
      });
      
      // Trigger the change event
      await act(async () => {
        if (fileInput) {
          fileInput.dispatchEvent(new Event('change'));
        }
      });
    }
    
    // Verify updatePreferences was called with the correct data
    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith(expect.objectContaining(mockImportData));
    });
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/your data import was successful/i)).toBeInTheDocument();
    });
    
    // Cleanup
    window.FileReader = OrigFileReader;
    vi.restoreAllMocks(); // Restore document.createElement
  });
});
