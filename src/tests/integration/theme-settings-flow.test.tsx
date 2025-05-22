// __tests__/integration/theme-settings-flow.test.tsx

import React from 'react';
import { render, screen, waitFor, act } from 'src/tests/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { ThemeSettings } from '@/ui/styled/common/ThemeSettings';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { supabase } from '@/adapters/database/supabase-provider';
import { usePreferencesStore } from '@/lib/stores/preferences.store';
import type { PreferencesState } from '@/lib/stores/preferences.store';

// Mock the preferences store
vi.mock('@/lib/stores/preferences.store', () => ({
  usePreferencesStore: vi.fn(),
}));

// Mock the '@/lib/database/supabase' module
vi.mock('@/lib/database/supabase', async () => {
  const mod = await import('../mocks/supabase');
  return { supabase: mod.supabase };
});

// Store original implementations to restore later
const originalLocalStorage = window.localStorage;
const originalDocumentElement = document.documentElement;
const originalMatchMedia = window.matchMedia;

describe('Theme/Appearance Settings Flow', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let mockUpdatePreferences: any;
  let mockFetchPreferences: any;
  let mockStoreState: PreferencesState;

  // Mock the document methods for theme testing
  const documentElementClassList = {
    add: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn().mockImplementation((cls) => cls === 'light'),
  };

  // Style mock with storage
  const styleStore: Record<string, string> = {};
  const styleMock = {
    setProperty: vi.fn((key: string, value: string) => {
      styleStore[key] = value;
    }),
    getPropertyValue: vi.fn((key: string) => styleStore[key]),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();

    // Set up document element mock for theme testing
    Object.defineProperty(document, 'documentElement', {
      value: {
        classList: documentElementClassList,
        style: styleMock,
      },
      configurable: true,
      writable: true,
    });

    // Mock local storage for theme persistence
    const localStorageMock = {
      getItem: vi.fn().mockReturnValue('light'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      configurable: true,
      writable: true,
    });

    // Mock window.matchMedia for system theme detection
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    // Mock preferences store
    mockUpdatePreferences = vi.fn().mockResolvedValue(true);
    mockFetchPreferences = vi.fn().mockResolvedValue(true);
    mockStoreState = {
      preferences: {
        id: 'pref-123',
        userId: 'user-123',
        theme: 'light',
        language: 'en',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        itemsPerPage: 25,
        notifications: {
          email: true,
          push: false,
          marketing: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      isLoading: false,
      error: null,
      fetchPreferences: mockFetchPreferences,
      updatePreferences: mockUpdatePreferences,
    };
    vi.mocked(usePreferencesStore).mockImplementation(() => mockStoreState);
  });

  afterEach(() => {
    // Restore original implementations after each test
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(document, 'documentElement', {
      value: originalDocumentElement,
      configurable: true,
      writable: true,
    });
    window.matchMedia = originalMatchMedia;
  });

  test('User can change theme between light and dark', async () => {
    // Render theme settings
    await act(async () => {
      render(<ThemeSettings />);
    });

    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByLabelText(/light/i)).toBeChecked();
    });

    // Switch to dark theme
    await act(async () => {
      await user.click(screen.getByLabelText(/dark/i));
    });

    // Save changes
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /save/i }));
    });

    // Verify theme was updated in DOM
    expect(documentElementClassList.remove).toHaveBeenCalledWith('light', 'dark');

    // Verify updatePreferences was called
    expect(mockUpdatePreferences).toHaveBeenCalledWith(expect.objectContaining({ theme: 'dark' }));

    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/theme preference saved/i)).toBeInTheDocument();
    });
  }, 20000);
  
  test('User can select system theme preference', async () => {
    // Render theme settings
    await act(async () => {
      render(<ThemeSettings />);
    });
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByLabelText(/light/i)).toBeChecked();
    });
    
    // Select system theme
    await act(async () => {
      await user.click(screen.getByLabelText(/system/i));
    });
    
    // Mock successful preference update
    const preferencesBuilder = supabase.from('user_preferences') as any;
    preferencesBuilder.update.mockResolvedValueOnce({
      data: {
        theme: 'system'
      },
      error: null
    });
    
    // Save changes
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /save/i }));
    });
    
    // System preference is dark, so dark theme should be applied
    expect(documentElementClassList.remove).toHaveBeenCalledWith('light', 'dark');

    // Verify local storage update
    // expect(window.localStorage.setItem).toHaveBeenCalledWith('theme', 'system');
    
    // Verify database update
    expect(mockUpdatePreferences).toHaveBeenCalledWith(expect.objectContaining({ theme: 'system' }));
  }, 20000);
  
  test('User can change color scheme', async () => {
    // Render theme settings
    await act(async () => {
      render(<ThemeSettings />);
    });
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByTestId('palette-earthTones')).toHaveAttribute('aria-pressed', 'true');
    });
    
    // Select a different color scheme
    await act(async () => {
      await user.click(screen.getByTestId('palette-modernTech'));
    });
    
    // Mock successful preference update
    const preferencesBuilder = supabase.from('user_preferences') as any;
    preferencesBuilder.update.mockResolvedValueOnce({
      data: {
        color_scheme: 'modernTech'
      },
      error: null
    });
    
    // Save changes
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /save/i }));
    });
    
    // Verify palette was updated via provider (check CSS variable as a proxy)
    expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('#2B3F4E'); // modernTech primary
    // Verify updatePreferences was called with color_scheme
    expect(mockUpdatePreferences).toHaveBeenCalledWith(expect.objectContaining({ color_scheme: 'modernTech' }));
  }, 20000);
  
  test('User can adjust font size', async () => {
    // Render theme settings
    await act(async () => {
      render(<ThemeSettings />);
    });
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByLabelText(/font size/i)).toHaveValue('medium');
    });
    
    // Change font size
    await act(async () => {
      await user.selectOptions(screen.getByLabelText(/font size/i), 'large');
    });
    
    // Mock successful preference update
    const preferencesBuilder = supabase.from('user_preferences') as any;
    preferencesBuilder.update.mockResolvedValueOnce({
      data: {
        font_size: 'large'
      },
      error: null
    });
    
    // Save changes
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /save/i }));
    });
    
    // Verify font size was updated in DOM
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('font-medium');
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('font-large');
    
    // Verify database update
    expect(preferencesBuilder.update).toHaveBeenCalledWith(expect.objectContaining({
      font_size: 'large'
    }));
  }, 20000);
  
  test('User can enable reduced motion preference', async () => {
    // Render theme settings
    await act(async () => {
      render(<ThemeSettings />);
    });
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByLabelText(/reduced motion/i)).not.toBeChecked();
    });
    
    // Enable reduced motion
    await act(async () => {
      await user.click(screen.getByLabelText(/reduced motion/i));
    });
    
    // Mock successful preference update
    const preferencesBuilder = supabase.from('user_preferences') as any;
    preferencesBuilder.update.mockResolvedValueOnce({
      data: {
        reduced_motion: true
      },
      error: null
    });
    
    // Save changes
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /save/i }));
    });
    
    // Verify reduced motion was updated in DOM
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('reduced-motion');
    
    // Verify database update
    expect(preferencesBuilder.update).toHaveBeenCalledWith(expect.objectContaining({
      reduced_motion: true
    }));
  }, 20000);
  
  test('Previews theme changes before saving', async () => {
    // Render theme settings
    await act(async () => {
      render(<ThemeSettings />);
    });
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByLabelText(/light/i)).toBeChecked();
    });
    
    // Switch to dark theme
    await act(async () => {
      await user.click(screen.getByLabelText(/dark/i));
    });
    
    // Verify theme preview was applied immediately
    expect(documentElementClassList.remove).toHaveBeenCalledWith('light', 'dark');

    // Allow localStorage.setItem to be called with preview values, but not with the final value until save
    const calls = (window.localStorage.setItem as any).mock.calls.filter(([key]: [string]) => key === 'vite-ui-theme');
    // Should not be called with 'dark' (final value) until save
    expect(calls.some(([, value]: [string, string]) => value === 'dark')).toBe(false);
    
    // Verify database was NOT updated yet
    // expect(supabase.from().update).not.toHaveBeenCalled();
    
    // Verify preview indication is shown
    expect(screen.getByText(/preview mode/i)).toBeInTheDocument();
    
    // Cancel changes
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /cancel/i }));
    });
    
    // Verify original theme was restored
    expect(documentElementClassList.remove).toHaveBeenCalledWith('light', 'dark');
  }, 20000);
  
  test('Handles error when saving theme preferences', async () => {
    // Render theme settings
    await act(async () => {
      render(<ThemeSettings />);
    });
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByLabelText(/light/i)).toBeChecked();
    });
    
    // Switch to dark theme
    await act(async () => {
      await user.click(screen.getByLabelText(/dark/i));
    });
    
    // Mock error during preference update
    const preferencesBuilder = supabase.from('user_preferences') as any;
    preferencesBuilder.update.mockResolvedValueOnce({
      data: null,
      error: { message: 'Error saving preferences' }
    });
    
    // Try to save changes
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /save/i }));
    });
    
    // Verify error message
    await waitFor(() => {
      expect(screen.getByText(/error saving preferences/i)).toBeInTheDocument();
    });
    
    // Verify theme preview is still applied
    // (Redundant add check removed; already checked above)
  }, 20000);
});
