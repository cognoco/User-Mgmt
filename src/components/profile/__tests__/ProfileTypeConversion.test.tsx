import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { ProfileTypeConversion } from '../ProfileTypeConversion';
import { useProfileStore } from '@/lib/stores/profile.store';
import { vi } from 'vitest'; // Ensure vi is imported
import { api } from '@/lib/api/axios'; // Import api directly
import { apiConfig } from '@/lib/config';

// --- Mocking Setup ---
const mockToastFn = vi.fn();

vi.mock('@/lib/stores/profile.store');
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: mockToastFn }),
}));

// Restore Select mock that reads ID from Trigger child
vi.mock('@/components/ui/select', async (importOriginal) => {
  // Explicitly type the original module import
  const actual = await importOriginal<typeof import('@/components/ui/select')>();
  // Import React inside factory for type checking
  const React = await import('react'); 

  return {
    ...actual, // Keep actual exports like SelectItem
    Select: ({ children, onValueChange, defaultValue, disabled }: any) => {
      let triggerId: string | undefined = undefined;
      let placeholder: string | undefined = "Select...";
      let options: React.ReactNode[] = [];

      // Iterate through children safely
      React.Children.forEach(children, (child) => {
        // Type guard for React elements
        if (!React.isValidElement(child)) return;

        // Find Trigger and get ID
        if (child.type === actual.SelectTrigger) {
          // Assuming props exist if it's a valid element of this type
          const triggerProps = child.props as { id?: string, children?: React.ReactNode };
          triggerId = triggerProps.id;
          
          // Find SelectValue within Trigger for placeholder
          if (triggerProps.children) {
              React.Children.forEach(triggerProps.children, (grandChild) => {
                  if (React.isValidElement(grandChild) && grandChild.type === actual.SelectValue) {
                      const valueProps = grandChild.props as { placeholder?: string };
                      placeholder = valueProps.placeholder || placeholder;
                  }
              });
          }
        }

        // Find Content and map Items to Options
        if (child.type === actual.SelectContent) {
          const contentProps = child.props as { children?: React.ReactNode };
          if (contentProps.children) {
            // Add non-null assertion
            options = React.Children.map(contentProps.children!, (item) => {
                  if (React.isValidElement(item) && item.type === actual.SelectItem) {
                      const itemProps = item.props as { value: any, children?: React.ReactNode };
                      return (
                          <option key={itemProps.value} value={itemProps.value}>
                              {itemProps.children}
                          </option>
                      );
                  }
                  return null;
              })
              .filter(Boolean) as React.ReactNode[]; 
          }
        }
      });

      // Render native select with extracted ID and options
      return (
        <select
          id={triggerId} // Use extracted ID
          name={triggerId}
          data-testid={`select-${triggerId}`}
          defaultValue={defaultValue}
          onChange={(e) => onValueChange?.(e.target.value)}
          disabled={disabled}
        >
          <option value="" disabled hidden>{placeholder}</option>
          {options}
        </select>
      );
    },
  };
});
// --- End Mocking Setup ---

// --- MSW Setup ---
const MOCK_API_BASE_URL = apiConfig.baseUrl;

const handlers = [
  // Add handler for the GET request made by fetchProfile
  http.get(`${MOCK_API_BASE_URL}/api/profile/business`, ({ request }) => {
    console.log('[MSW] Intercepted GET', request.url);
    return HttpResponse.json({
      id: 'test-id',
      userType: 'private',
      name: 'Test User',
      email: 'test@example.com'
    });
  }),
  http.post(`${MOCK_API_BASE_URL}/api/business/validate-domain`, ({ request }) => {
    console.log('[MSW] Intercepted POST', request.url);
    return HttpResponse.json({ isValid: true });
  }),
  http.post(`${MOCK_API_BASE_URL}/api/business/create`, async ({ request }) => {
    console.log('[MSW] Intercepted POST', request.url);
    const body = await request.json();
    return HttpResponse.json({ id: 'new-business-id', ...(body as object) });
  }),
];
const server = setupServer(...handlers);
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
// --- End MSW Setup ---

describe('ProfileTypeConversion', () => {
  const user = userEvent.setup();
  let mockUpdateProfile: ReturnType<typeof vi.fn>;
  let mockToast: ReturnType<typeof vi.fn>;
  // Simplify spy type
  let postSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks(); // Use restoreAllMocks to reset spies

    // Mock profile store
    mockUpdateProfile = vi.fn().mockResolvedValue({});
    vi.mocked(useProfileStore).mockReturnValue({
      profile: { id: 'test-id', userType: 'private', name: 'Test User', email: 'test@example.com' } as any,
      isLoading: false,
      error: null,
      updateProfile: mockUpdateProfile,
      fetchProfile: vi.fn(),
      updateBusinessProfile: vi.fn(),
      uploadAvatar: vi.fn(),
      removeAvatar: vi.fn(),
      uploadCompanyLogo: vi.fn(),
      removeCompanyLogo: vi.fn(),
      clearError: vi.fn(),
    });

    mockToast = mockToastFn;

    // Spy on the actual api.post instead
    postSpy = vi.spyOn(api, 'post');
    // We don't need to set a default mockResolvedValue here for the spy
  });

  // Restore fillForm with selectOptions
  const fillForm = async () => {
    await user.type(screen.getByLabelText(/company name/i), 'Test Company');
    // IMPORTANT: The mock requires the component to pass id/name to <Select> matching the label
    // We need to ensure ProfileTypeConversion.tsx passes id="companySize" and id="industry" to the <Select> components
    // If the component was fixed (id removed from Select), this getByLabelText might fail again.
    // Let's assume for now the component passes the ID to the mock correctly.
    await user.selectOptions(screen.getByLabelText(/company size/i), '11-50');
    await user.selectOptions(screen.getByLabelText(/industry/i), 'Technology');
    await user.type(screen.getByLabelText(/business email domain/i), 'example.com');
  };

  test('renders conversion form for personal profile', async () => {
    await act(async () => { // Wrap render
      render(<ProfileTypeConversion />);
    });
    expect(screen.getByRole('heading', { name: /convert to business account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/company size/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/industry/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/business email domain/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /convert profile/i })).toBeEnabled();
  });

  test('successfully validates domain, creates business, and updates profile', async () => {
    await act(async () => { // Wrap render
      render(<ProfileTypeConversion />);
    });
    await fillForm();
    await user.click(screen.getByRole('button', { name: /convert profile/i }));
    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith('/api/business/validate-domain', { domain: 'example.com' });
      expect(postSpy).toHaveBeenCalledWith('/api/business/create', {
        name: 'Test Company', size: '11-50', industry: 'Technology', domain: 'example.com',
      });
      expect(mockUpdateProfile).toHaveBeenCalledWith({ userType: 'corporate', businessId: 'new-business-id' });
    });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Conversion Successful' }));
    });
  });

  test('shows error and stops if domain validation fails', async () => {
    server.use(
      // Update handler to match full URL
      http.post(`${MOCK_API_BASE_URL}/api/business/validate-domain`, () => {
        console.log('[MSW] Intercepted validation failure POST'); // Debug log
        return HttpResponse.json({ isValid: false, message: 'Domain already taken' }, { status: 400 });
      })
    );
    await act(async () => { // Wrap render
      render(<ProfileTypeConversion />);
    });
    await fillForm();
    await user.click(screen.getByRole('button', { name: /convert profile/i }));
    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith('/api/business/validate-domain', { domain: 'example.com' });
    });
    expect(postSpy).not.toHaveBeenCalledWith('/api/business/create', expect.anything());
    expect(mockUpdateProfile).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Validation Failed', description: 'Domain already taken' }));
    });
    expect(screen.getByRole('button', { name: /convert profile/i })).toBeEnabled();
  });

  test('shows error if business creation fails', async () => {
    server.use(
      // Update handler to match full URL
      http.post(`${MOCK_API_BASE_URL}/api/business/create`, () => {
        console.log('[MSW] Intercepted creation failure POST'); // Debug log
        return HttpResponse.json({ error: 'Creation failed on server' }, { status: 500 });
      })
    );
    await act(async () => { // Wrap render
      render(<ProfileTypeConversion />);
    });
    await fillForm();
    await user.click(screen.getByRole('button', { name: /convert profile/i }));
    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith('/api/business/validate-domain', expect.anything());
      expect(postSpy).toHaveBeenCalledWith('/api/business/create', expect.objectContaining({ size: '11-50', industry: 'Technology' }));
    });
    expect(mockUpdateProfile).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Conversion Failed', description: 'Creation failed on server' }));
    });
  });

  test('shows error if profile update fails', async () => {
    mockUpdateProfile.mockRejectedValueOnce(new Error('Store update failed'));
    await act(async () => { // Wrap render
      render(<ProfileTypeConversion />);
    });
    await fillForm();
    await user.click(screen.getByRole('button', { name: /convert profile/i }));
    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith('/api/business/validate-domain', expect.anything());
      expect(postSpy).toHaveBeenCalledWith('/api/business/create', expect.anything());
      expect(mockUpdateProfile).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Conversion Failed', description: 'Store update failed' }));
    });
  });

  // Test loading state - keep waitFor wrapper
  test('shows loading state during conversion', async () => {
    server.use(
      http.post(`${MOCK_API_BASE_URL}/api/business/validate-domain`, async () => {
        console.log('[MSW] Intercepted delayed validation POST'); // Debug log
        await new Promise(res => setTimeout(res, 50)); 
        return HttpResponse.json({ isValid: true });
      })
    );
    mockUpdateProfile.mockImplementationOnce(async () => {
        await new Promise(res => setTimeout(res, 50));
        return {};
    });
    await act(async () => { // Wrap render
      render(<ProfileTypeConversion />);
    });
    await fillForm();
    const submitButton = screen.getByRole('button', { name: /convert profile/i });
    user.click(submitButton); // Don't await click itself

    await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveTextContent(/converting.../i);
    });

    await waitFor(() => {
        expect(submitButton).toBeEnabled();
        expect(submitButton).toHaveTextContent(/convert profile/i);
    }, { timeout: 2000 });
  });
}); 