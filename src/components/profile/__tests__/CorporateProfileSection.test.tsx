import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n/index';
// Import init function from i18next
import { initReactI18next } from 'react-i18next';
import i18next from 'i18next';
import { MemoryRouter } from 'react-router-dom';

// Import the actual i18n instance used by the app if possible, or create one for tests
// Assuming i18n configuration exists and can be imported/mocked
// import i18nTestConfig from '@/lib/i18n/config/i18n.test.config'; // Adjust path if needed

import { CorporateProfileSection } from '../CorporateProfileSection';
import { UserType, Company } from '@/lib/types/user-type';
import { useUserManagement } from '@/lib/UserManagementProvider';

// Initialize i18next specifically for testing before describing tests
// This ensures the t function behaves predictably (e.g., returns the key)
i18next.use(initReactI18next).init({
  lng: 'en', // Set a default language
  // Provide minimal resources, or rely on fallbackLng/key return
  resources: { 
    en: { 
      translation: { 
        // You can add specific keys here if needed for complex tests,
        // but often just returning the key is sufficient.
      } 
    } 
  },
  // Key options for testing:
  interpolation: {
    escapeValue: false, // React already protects from XSS
  },
  // Make t function return the key if no translation is found
  fallbackLng: false, // Don't fallback to other languages
  nsSeparator: false, 
  keySeparator: false, // Allow dots in keys
  // Return the key itself if not found
  parseMissingKeyHandler: (key) => key,
});

// Mock the UserManagementProvider hook
vi.mock('@/lib/UserManagementProvider', () => ({
  useUserManagement: vi.fn(() => ({
    corporateUsers: { enabled: true }, // Assume corporate users are enabled for this test
  })),
}));

// Mock UI components used
vi.mock('@/components/ui/button', () => ({ Button: (props: any) => <button {...props} /> }));
vi.mock('@/components/ui/input', () => ({ Input: React.forwardRef((props: any, ref: any) => <input ref={ref} {...props} />) }));
vi.mock('@/components/ui/label', () => ({ Label: (props: any) => <label {...props} /> }));
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/components/ui/separator', () => ({ Separator: () => <hr /> }));
vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children }: { children: React.ReactNode }) => <div role="alert">{children}</div>,
  AlertDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));
// Mock CompanyLogoUpload as it has its own tests/dependencies
vi.mock('../CompanyLogoUpload', () => ({ CompanyLogoUpload: () => <div data-testid="company-logo-upload">Logo Upload</div> }));

const mockOnUpdate = vi.fn();

const initialCompanyData: Company = {
  name: 'Acme Corp',
  industry: 'Widgets',
  website: 'https://acme.com',
  position: 'CEO',
  department: 'Management',
  vatId: 'GB123456789',
  size: '51-200',
  address: {
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    postalCode: '90210',
    country: 'USA',
  },
};

describe('CorporateProfileSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock implementation if needed
    (useUserManagement as any).mockImplementation(() => ({
      corporateUsers: { enabled: true },
    }));
  });

  it('should render nothing if corporate users are disabled', async () => {
    (useUserManagement as any).mockImplementation(() => ({
      corporateUsers: { enabled: false },
    }));
    let container: HTMLElement | null = null;
    await act(async () => {
      const result = render(
        <I18nextProvider i18n={i18next}>
          <MemoryRouter>
            <CorporateProfileSection 
              userType={UserType.CORPORATE} 
              company={initialCompanyData} 
              onUpdate={mockOnUpdate} 
            />
          </MemoryRouter>
        </I18nextProvider>
      );
      container = result.container;
    });
    expect(container?.firstChild).toBeNull();
  });

  it('should render nothing if user type is not corporate', async () => {
    let container: HTMLElement | null = null;
    await act(async () => {
      const result = render(
        <I18nextProvider i18n={i18next}>
          <MemoryRouter>
            <CorporateProfileSection 
              userType={UserType.PRIVATE} // Pass PRIVATE type
              company={initialCompanyData} 
              onUpdate={mockOnUpdate} 
            />
          </MemoryRouter>
        </I18nextProvider>
      );
      container = result.container;
    });
    expect(container?.firstChild).toBeNull();
  });

  it('should render the form with initial company data', async () => {
    await act(async () => {
      render(
        <I18nextProvider i18n={i18next}>
          <MemoryRouter>
            <CorporateProfileSection 
              userType={UserType.CORPORATE} 
              company={initialCompanyData} 
              onUpdate={mockOnUpdate} 
            />
          </MemoryRouter>
        </I18nextProvider>
      );
    });

    expect(screen.getByLabelText('profile.corporate.companyName *')).toHaveValue(initialCompanyData.name);
    expect(screen.getByLabelText('profile.corporate.industry')).toHaveValue(initialCompanyData.industry);
    expect(screen.getByLabelText('profile.corporate.companySize')).toHaveValue(initialCompanyData.size);
    expect(screen.getByLabelText('profile.corporate.website')).toHaveValue(initialCompanyData.website);
    expect(screen.getByLabelText('profile.corporate.vatId')).toHaveValue(initialCompanyData.vatId);
    expect(screen.getByLabelText('profile.corporate.position')).toHaveValue(initialCompanyData.position);
    expect(screen.getByLabelText('profile.corporate.department')).toHaveValue(initialCompanyData.department);
    expect(screen.getByLabelText('profile.corporate.street')).toHaveValue(initialCompanyData.address?.street);
    expect(screen.getByLabelText('profile.corporate.city')).toHaveValue(initialCompanyData.address?.city);
    expect(screen.getByLabelText('profile.corporate.state')).toHaveValue(initialCompanyData.address?.state);
    expect(screen.getByLabelText('profile.corporate.postalCode')).toHaveValue(initialCompanyData.address?.postalCode);
    expect(screen.getByLabelText('profile.corporate.country')).toHaveValue(initialCompanyData.address?.country);

    expect(screen.getByTestId('company-logo-upload')).toBeInTheDocument();
  });

  it('should call onUpdate with updated data on form submission', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(
        <I18nextProvider i18n={i18next}>
          <MemoryRouter>
            <CorporateProfileSection 
              userType={UserType.CORPORATE} 
              company={initialCompanyData} 
              onUpdate={mockOnUpdate} 
            />
          </MemoryRouter>
        </I18nextProvider>
      );
    });

    const newCompanyName = 'New Acme Inc.';
    const newIndustry = 'Software';
    const newStreet = '456 Side St';

    await act(async () => {
      await user.clear(screen.getByLabelText('profile.corporate.companyName *'));
      await user.type(screen.getByLabelText('profile.corporate.companyName *'), newCompanyName);
      
      await user.clear(screen.getByLabelText('profile.corporate.industry'));
      await user.type(screen.getByLabelText('profile.corporate.industry'), newIndustry);
  
      await user.clear(screen.getByLabelText('profile.corporate.street'));
      await user.type(screen.getByLabelText('profile.corporate.street'), newStreet);
  
      await user.click(screen.getByRole('button', { name: 'common.save' }));
    });

    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
    // Check that the payload matches the updated fields
    expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({
      name: newCompanyName,
      industry: newIndustry,
      address: expect.objectContaining({
          street: newStreet,
          city: initialCompanyData.address?.city, // Other fields remain the same
      }),
      // Ensure other initial fields are still present
      website: initialCompanyData.website,
      position: initialCompanyData.position,
      size: initialCompanyData.size, 
    }));
  });

  it('should call onUpdate with address as undefined if all address fields are cleared', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(
        <I18nextProvider i18n={i18next}>
          <MemoryRouter>
            <CorporateProfileSection 
              userType={UserType.CORPORATE} 
              company={initialCompanyData} // Start with address data
              onUpdate={mockOnUpdate} 
            />
          </MemoryRouter>
        </I18nextProvider>
      );
    });

    await act(async () => {
      await user.clear(screen.getByLabelText('profile.corporate.street'));
      await user.clear(screen.getByLabelText('profile.corporate.city'));
      await user.clear(screen.getByLabelText('profile.corporate.state'));
      await user.clear(screen.getByLabelText('profile.corporate.postalCode'));
      await user.clear(screen.getByLabelText('profile.corporate.country'));
  
      await user.click(screen.getByRole('button', { name: 'common.save' }));
    });

    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
    // Check that the payload has address: undefined
    expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({
      name: initialCompanyData.name,
      address: undefined, // Address should be undefined now
    }));
  });
  
  // TODO: Add test for error prop rendering
  // TODO: Add test for isLoading prop disabling the button

}); 
