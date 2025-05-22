import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BusinessSSOSetup from '../BusinessSSOSetup';
import { api } from '@/lib/api/axios';
import type { AxiosResponse } from 'axios';
import type { ReactElement } from 'react';

// Increase default timeout
vi.setConfig({ testTimeout: 10000 });

// Debug helper
const debug = (msg: string) => console.log(`[DEBUG] ${msg}`);

// Mock necessary dependencies
vi.mock('@/lib/api/axios', () => ({
  api: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

// Create mock response factory
function createMockResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };
}



// Mock UI components
vi.mock('@/ui/primitives/card', () => ({
  Card: (props: any) => <div data-testid="card" {...props} />,
  CardHeader: (props: any) => <div data-testid="card-header" {...props} />,
  CardTitle: (props: any) => <div data-testid="card-title">{props.children}</div>,
  CardDescription: (props: any) => <div data-testid="card-description">{props.children}</div>,
  CardContent: (props: any) => <div data-testid="card-content" {...props} />,
  CardFooter: (props: any) => <div data-testid="card-footer" {...props} />,
}));

vi.mock('@/ui/primitives/button', () => ({
  Button: ({ children, disabled, onClick, 'aria-live': ariaLive }: any) => (
    <button 
      data-testid="button" 
      disabled={disabled} 
      onClick={onClick}
      aria-live={ariaLive}
    >
      {typeof children === 'function' ? children({ className: '' }) : children}
    </button>
  ),
}));

vi.mock('@/ui/primitives/alert', () => ({
  Alert: (props: any) => (
    <div data-testid="alert" role="alert" className={props.className}>
      {props.children}
    </div>
  ),
  AlertDescription: (props: any) => (
    <div data-testid="alert-description">{props.children}</div>
  ),
}));

vi.mock('@/ui/primitives/switch', () => ({
  Switch: (props: any) => {
    debug(`Rendering Switch with checked=${props.checked}, disabled=${props.disabled}`);
    return (
      <input
        type="checkbox"
        data-testid="switch"
        role="switch"
        checked={props.checked}
        onChange={(e) => {
          debug(`Switch onChange called with ${e.target.checked}`);
          props.onCheckedChange?.(e.target.checked);
        }}
        disabled={props.disabled}
        aria-label={props['aria-label']}
        id={props.id}
      />
    );
  },
}));

vi.mock('@/ui/primitives/select', () => {
  const components = {
    SelectValue: ({ placeholder }: any) => <span data-testid="select-value">{placeholder}</span>,
    SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
    SelectItem: ({ value, children }: any) => (
      <div data-testid="select-item" data-value={value}>
        {children}
      </div>
    ),
    SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
  };

  return {
    ...components,
    Select: ({ children, value, onValueChange, disabled }: any) => {
      debug(`Rendering Select with value=${value}, disabled=${disabled}`);
      const childArray = React.Children.toArray(children);
      
      const selectValue = childArray.find(
        (child) => React.isValidElement(child) && child.type === components.SelectValue
      ) as ReactElement | undefined;

      const selectContent = childArray.find(
        (child) => React.isValidElement(child) && child.type === components.SelectContent
      ) as ReactElement | undefined;

      const selectItems = selectContent
        ? React.Children.toArray(selectContent.props.children)
            .filter((item): item is ReactElement => 
              React.isValidElement(item) && item.type === components.SelectItem
            )
        : [];

      return (
        <div data-testid="select-wrapper">
          <select 
            data-testid="select"
            role="combobox"
            value={value || ''}
            onChange={(e) => {
              debug(`Select onChange called with ${e.target.value}`);
              onValueChange?.(e.target.value);
            }}
            disabled={disabled}
          >
            <option value="">{selectValue?.props.placeholder}</option>
            {selectItems.map((item) => (
              <option key={item.props.value} value={item.props.value}>
                {item.props.children}
              </option>
            ))}
          </select>
        </div>
      );
    },
  };
});

describe('BusinessSSOSetup', () => {
  const user = userEvent.setup();
  const mockOrgId = '123';
  const mockOnSettingsChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state while fetching initial data', async () => {
    (api.get as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({ 
        data: { enabled: false, idpType: null } 
      }), 100))
    );

    await act(async () => {
      render(<BusinessSSOSetup orgId={mockOrgId} onSettingsChange={mockOnSettingsChange} />);
    });

    // Initially shows loading state
    const header = screen.getByTestId('card-header');
    expect(header.querySelector('.animate-pulse')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      const header = screen.getByTestId('card-header');
      expect(header.querySelector('.animate-pulse')).toBe(null);
    });

    // Shows content after loading
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('shows loading state while saving', async () => {
    // Mock initial load
    (api.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ 
      data: { sso_enabled: false, idp_type: null } 
    });

    // Mock save with delay
    (api.put as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({ 
        data: { sso_enabled: true, idp_type: 'saml' } 
      }), 100))
    );

    render(<BusinessSSOSetup orgId={mockOrgId} onSettingsChange={mockOnSettingsChange} />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    // Enable SSO
    const toggle = screen.getByRole('switch');
    await act(async () => {
      await userEvent.click(toggle);
    });

    // Select IDP type
    const select = screen.getByRole('combobox');
    await act(async () => {
      await userEvent.selectOptions(select, 'saml');
    });

    // Click save
    const saveButton = screen.getByRole('button', { name: /save/i });
    await act(async () => {
      await userEvent.click(saveButton);
    });

    // Shows saving state
    expect(saveButton).toHaveTextContent(/saving/i);

    // Wait for save to complete
    await waitFor(() => {
      expect(saveButton).toHaveTextContent(/save/i);
    });

    // Verify onSettingsChange was called
    expect(mockOnSettingsChange).toHaveBeenCalledWith({ sso_enabled: true, idp_type: 'saml' });
  });

  it('handles save errors correctly', async () => {
    // Mock initial load
    (api.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ 
      data: { sso_enabled: false, idp_type: null } 
    });

    // Mock save error
    (api.put as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Failed to save'));

    render(<BusinessSSOSetup orgId={mockOrgId} onSettingsChange={mockOnSettingsChange} />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    // Enable SSO
    await act(async () => {
      await userEvent.click(screen.getByRole('switch'));
    });

    // Select IDP type
    const select = screen.getByRole('combobox');
    await act(async () => {
      await userEvent.selectOptions(select, 'saml');
    });

    // Click save
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /save/i }));
    });

    // Shows error message
    await waitFor(() => {
      expect(screen.getByTestId('alert')).toHaveTextContent('Failed to save SSO settings');
    });

    // Error state is cleared when making new changes
    await act(async () => {
      await userEvent.click(screen.getByRole('switch'));
    });
    expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
  });
}); 
