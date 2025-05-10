// __tests__/integration/theme-settings-flow.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeSettings } from '@/components/common/ThemeSettings';
import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';

// Import our standardized mock
vi.mock('@/tests/mocks/supabase');
import { supabase } from '@/tests/mocks/supabase';

// Store original implementations to restore later
const originalLocalStorage = window.localStorage;
const originalDocumentElement = document.documentElement;
const originalMatchMedia = window.matchMedia;

describe('Theme/Appearance Settings Flow', () => {
  let user: ReturnType<typeof userEvent.setup>;
  
  // Mock the document methods for theme testing
  const documentElementClassList = {
    add: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn().mockImplementation((cls: string) => cls === 'light')
  };

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
    
    // Set up document element mock for theme testing
    Object.defineProperty(document, 'documentElement', {
      value: { classList: documentElementClassList },
      configurable: true,
      writable: true
    });
    
    // Mock local storage for theme persistence
    const localStorageMock = {
        getItem: vi.fn().mockReturnValue('light'),
        setItem: vi.fn(),
        removeItem: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      configurable: true,
      writable: true
    });
    
    // Mock window.matchMedia for system theme detection
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    
    // Mock authentication
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'user-123', email: 'user@example.com' } },
      error: null
    });
    
    // Mock user preferences fetch
    (supabase.from as any)('user_preferences').select.mockResolvedValueOnce({
      data: {
        id: 'pref-123',
        user_id: 'user-123',
        theme: 'light',
        color_scheme: 'blue',
        font_size: 'medium',
        reduced_motion: false
      },
      error: null
    });
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
    render(<ThemeSettings />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByLabelText(/light/i)).toBeChecked();
    });
    
    // Switch to dark theme
    await user.click(screen.getByLabelText(/dark/i));
    
    // Mock successful preference update
    const preferencesBuilder = supabase.from('user_preferences') as any;
    preferencesBuilder.update.mockResolvedValueOnce({
      data: {
        theme: 'dark'
      },
      error: null
    });
    
    // Save changes
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Verify theme was updated in DOM
    expect(documentElementClassList.remove).toHaveBeenCalledWith('light-theme');
    expect(documentElementClassList.add).toHaveBeenCalledWith('dark-theme');
    
    // Verify local storage was updated
    expect(window.localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    
    // Verify database update
    expect(preferencesBuilder.update).toHaveBeenCalledWith(expect.objectContaining({
      theme: 'dark'
    }));
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/preferences saved/i)).toBeInTheDocument();
    });
  });
  
  test('User can select system theme preference', async () => {
    // Render theme settings
    render(<ThemeSettings />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByLabelText(/light/i)).toBeChecked();
    });
    
    // Select system theme
    await user.click(screen.getByLabelText(/system/i));
    
    // Mock successful preference update
    const preferencesBuilder = supabase.from('user_preferences') as any;
    preferencesBuilder.update.mockResolvedValueOnce({
      data: {
        theme: 'system'
      },
      error: null
    });
    
    // Save changes
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // System preference is dark, so dark theme should be applied
    expect(documentElementClassList.remove).toHaveBeenCalledWith('light-theme');
    expect(documentElementClassList.add).toHaveBeenCalledWith('dark-theme');
    
    // Verify local storage update
    expect(window.localStorage.setItem).toHaveBeenCalledWith('theme', 'system');
    
    // Verify database update
    expect(preferencesBuilder.update).toHaveBeenCalledWith(expect.objectContaining({
      theme: 'system'
    }));
  });
  
  test('User can change color scheme', async () => {
    // Render theme settings
    render(<ThemeSettings />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByTestId('color-scheme-blue')).toHaveClass('selected');
    });
    
    // Select a different color scheme
    await user.click(screen.getByTestId('color-scheme-purple'));
    
    // Mock successful preference update
    const preferencesBuilder = supabase.from('user_preferences') as any;
    preferencesBuilder.update.mockResolvedValueOnce({
      data: {
        color_scheme: 'purple'
      },
      error: null
    });
    
    // Save changes
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Verify color scheme was updated in DOM
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('theme-blue');
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('theme-purple');
    
    // Verify database update
    expect(supabase.from().update).toHaveBeenCalledWith(expect.objectContaining({
      color_scheme: 'purple'
    }));
  });
  
  test('User can adjust font size', async () => {
    // Render theme settings
    render(<ThemeSettings />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByLabelText(/font size/i)).toHaveValue('medium');
    });
    
    // Change font size
    await user.selectOptions(screen.getByLabelText(/font size/i), 'large');
    
    // Mock successful preference update
    supabase.from().update.mockResolvedValueOnce({
      data: {
        font_size: 'large'
      },
      error: null
    });
    
    // Save changes
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Verify font size was updated in DOM
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('font-medium');
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('font-large');
    
    // Verify database update
    expect(supabase.from().update).toHaveBeenCalledWith(expect.objectContaining({
      font_size: 'large'
    }));
  });
  
  test('User can enable reduced motion preference', async () => {
    // Render theme settings
    render(<ThemeSettings />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByLabelText(/reduced motion/i)).not.toBeChecked();
    });
    
    // Enable reduced motion
    await user.click(screen.getByLabelText(/reduced motion/i));
    
    // Mock successful preference update
    supabase.from().update.mockResolvedValueOnce({
      data: {
        reduced_motion: true
      },
      error: null
    });
    
    // Save changes
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Verify reduced motion was updated in DOM
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('reduced-motion');
    
    // Verify database update
    expect(supabase.from().update).toHaveBeenCalledWith(expect.objectContaining({
      reduced_motion: true
    }));
  });
  
  test('Previews theme changes before saving', async () => {
    // Render theme settings
    render(<ThemeSettings />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByLabelText(/light/i)).toBeChecked();
    });
    
    // Switch to dark theme
    await user.click(screen.getByLabelText(/dark/i));
    
    // Verify theme preview was applied immediately
    expect(documentElementClassList.remove).toHaveBeenCalledWith('light-theme');
    expect(documentElementClassList.add).toHaveBeenCalledWith('dark-theme');
    
    // Verify local storage was NOT updated yet
    expect(window.localStorage.setItem).not.toHaveBeenCalled();
    
    // Verify database was NOT updated yet
    expect(supabase.from().update).not.toHaveBeenCalled();
    
    // Verify preview indication is shown
    expect(screen.getByText(/preview mode/i)).toBeInTheDocument();
    
    // Cancel changes
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    
    // Verify original theme was restored
    expect(documentElementClassList.remove).toHaveBeenCalledWith('dark-theme');
    expect(documentElementClassList.add).toHaveBeenCalledWith('light-theme');
  });
  
  test('Handles error when saving theme preferences', async () => {
    // Render theme settings
    render(<ThemeSettings />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByLabelText(/light/i)).toBeChecked();
    });
    
    // Switch to dark theme
    await user.click(screen.getByLabelText(/dark/i));
    
    // Mock error during preference update
    supabase.from().update.mockResolvedValueOnce({
      data: null,
      error: { message: 'Error saving preferences' }
    });
    
    // Try to save changes
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Verify error message
    await waitFor(() => {
      expect(screen.getByText(/error saving preferences/i)).toBeInTheDocument();
    });
    
    // Verify theme preview is still applied
    expect(documentElementClassList.contains('dark-theme')).toBeTruthy();
  });
});
