import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import { vi } from 'vitest'; // Import vi
import DeleteAccountDialog from './DeleteAccountDialog';
import { useDeleteAccount } from '@/hooks/useDeleteAccount';
import enTranslations from '@/lib/i18n/locales/en.json';
import { USER_MANAGEMENT_NAMESPACE } from '@/lib/i18n';

// Mock the custom hook
vi.mock('@/hooks/useDeleteAccount');

// Create a dedicated i18next instance for testing
const testI18nInstance = i18n.createInstance();
testI18nInstance
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    ns: [USER_MANAGEMENT_NAMESPACE],
    defaultNS: USER_MANAGEMENT_NAMESPACE,
    resources: {
      en: {
        [USER_MANAGEMENT_NAMESPACE]: enTranslations,
      },
    },
    interpolation: {
      escapeValue: false, // Not needed for React
    },
  });


describe('DeleteAccountDialog', () => {
  let handleClose: ReturnType<typeof vi.fn>;
  let mockDeleteAccount: ReturnType<typeof vi.fn>;
  let mockUseDeleteAccount = vi.mocked(useDeleteAccount);

  beforeEach(() => {
    // Reset mocks before each test
    handleClose = vi.fn();
    mockDeleteAccount = vi.fn();
    mockUseDeleteAccount.mockReturnValue({
      deleteAccount: mockDeleteAccount,
      isLoading: false,
      error: null,
    });
  });

  const renderComponent = (open = true) => {
    return render(
      <I18nextProvider i18n={testI18nInstance}>
        <MemoryRouter>
          <DeleteAccountDialog open={open} onClose={handleClose} />
        </MemoryRouter>
      </I18nextProvider>
    );
  };

  it('should render the dialog when open is true', () => {
    renderComponent();
    // Use translated text for assertion - assuming 'Delete Account' is the title
    expect(screen.getByRole('heading', { name: /delete account/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete account/i })).toBeInTheDocument();
  });

  it('should not render the dialog when open is false', () => {
    renderComponent(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should call onClose when the cancel button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should call deleteAccount when the delete button is clicked after confirmation', async () => {
    renderComponent();
    
    // Assuming a confirmation input is needed - let's use the text "DELETE"
    // Find the input field (adjust selector if needed)
    const confirmationInput = screen.getByLabelText(/confirm deletion/i); // Adjust label text as needed
    expect(confirmationInput).toBeInTheDocument();
    
    // Initially, the delete button might be disabled
    const deleteButton = screen.getByRole('button', { name: /delete account/i });
    expect(deleteButton).toBeDisabled();

    // Type the confirmation text
    fireEvent.change(confirmationInput, { target: { value: 'DELETE' } });

    // Now the delete button should be enabled
    expect(deleteButton).toBeEnabled();
    
    // Click the delete button
    fireEvent.click(deleteButton);

    // Wait for the async operation if necessary
    await waitFor(() => {
       expect(mockDeleteAccount).toHaveBeenCalledTimes(1);
    });
    // Optionally check if onClose is called after successful deletion
    // await waitFor(() => {
    //   expect(handleClose).toHaveBeenCalledTimes(1);
    // });
  });

   it('should show loading state when isLoading is true', () => {
    mockUseDeleteAccount.mockReturnValue({
      deleteAccount: mockDeleteAccount,
      isLoading: true, // Set loading state
      error: null,
    });

    renderComponent();

    // Expect the delete button to be disabled and potentially show loading indicator
    const deleteButton = screen.getByRole('button', { name: /delete account/i });
    expect(deleteButton).toBeDisabled(); 
    // Add assertion for loading spinner/indicator if applicable
    // expect(screen.getByRole('progressbar')).toBeInTheDocument(); 
  });

}); 
