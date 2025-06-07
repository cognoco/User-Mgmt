import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CompanyLogoUpload } from '@/src/ui/styled/profile/CompanyLogoUpload'208;
import { useProfileStore } from '@/lib/stores/profile.store';
import * as FileUploadUtils from '@/lib/utils/fileUpload'330; // Import utils to mock
import { Profile } from '@/types/database';

// Mock the Supabase client EARLY
vi.mock('@/lib/supabase');

// Mock the profile store
vi.mock('@/lib/stores/profile.store');

// Mock UI components
vi.mock('@/ui/primitives/button', () => ({ Button: (props: any) => <button {...props}>{props.children}</button> }));
vi.mock('@/ui/primitives/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/ui/primitives/alert', () => ({
  Alert: ({ children }: { children: React.ReactNode }) => <div role="alert">{children}</div>,
  AlertTitle: ({ children }: { children: React.ReactNode }) => <h4>{children}</h4>,
  AlertDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));
vi.mock('@/ui/primitives/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode, open: boolean }) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h5>{children}</h5>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('react-image-crop', () => ({
  default: (props: any) => <div data-testid="react-crop">{props.children}</div>,
  centerCrop: vi.fn(),
  makeAspectCrop: vi.fn(),
}));
vi.mock('lucide-react', async (importOriginal) => {
    const original = await importOriginal<typeof import('lucide-react')>();
    return {
        ...original,
        Building: () => <div data-testid="building-icon">Building</div>,
        Camera: () => <div data-testid="camera-icon">Cam</div>,
        Trash: () => <div data-testid="trash-icon">Trash</div>,
        Upload: () => <div data-testid="upload-icon">Upload</div>,
    };
});

// Mock file upload utils
const mockIsValidImage = vi.spyOn(FileUploadUtils, 'isValidImage').mockReturnValue(true);
const mockGetCroppedImgBlob = vi.fn(() => Promise.resolve(new Blob(['fake-blob-content'], { type: 'image/png' })));
// Need to manually mock the helper function if it's defined in the component file
// Assuming getCroppedImgBlob is imported or globally available for mocking
vi.mock('../CompanyLogoUpload', async (importOriginal) => {
    const mod = await importOriginal<any>();
    return {
        ...mod, // Keep the original export
        // If getCroppedImgBlob is internal, we can't easily mock it this way
        // For testing, better to move getCroppedImgBlob to utils
    };
});

// Mock profile data
const mockProfileBase: Partial<Profile> = {
  id: 'corp-123',
  userId: 'corp-123',
  userType: 'corporate',
  companyName: 'Test Corp',
};

const mockUploadCompanyLogo = vi.fn();
const mockRemoveCompanyLogo = vi.fn();

let currentStoreState: any = { error: null }; // To hold the "live" state of the mock store

describe('CompanyLogoUpload Component', () => {
  // Helper to mock useProfileStore with selector support
  function mockUseProfileStoreWithSelector(profileData: Partial<Profile>) {
    (useProfileStore as any).mockImplementation((selector?: any) => {
      // Initialize with potentially new profileData but maintain other parts of currentStoreState
      currentStoreState = {
        ...currentStoreState, // Preserve existing error, isLoading unless overridden
        profile: { ...mockProfileBase, ...profileData },
        isLoading: false, // Default isLoading for setup, can be overridden by specific tests
        // error: currentStoreState.error, // Keep existing error unless explicitly reset by test
        uploadCompanyLogo: mockUploadCompanyLogo,
        removeCompanyLogo: mockRemoveCompanyLogo,
      };
      return selector ? selector(currentStoreState) : currentStoreState;
    });
  }

  const setup = async (profileData: Partial<Profile>) => {
    vi.clearAllMocks();
    mockIsValidImage.mockReturnValue(true);
    mockGetCroppedImgBlob.mockClear();
    
    // Default success behavior for actions
    mockUploadCompanyLogo.mockResolvedValue('http://new.logo/url');
    mockRemoveCompanyLogo.mockResolvedValue(true);
    
    // Reset store error state for each setup, unless a test specifically sets it before calling setup
    currentStoreState.error = null;
    currentStoreState.isLoading = false;

    // Use improved mock with selector support
    mockUseProfileStoreWithSelector(profileData);

    await act(async () => {
      render(<CompanyLogoUpload />);
    });
  };

  it('should render fallback icon when no logo URL is present', async () => {
    await setup({ companyLogoUrl: null });
    expect(screen.getByTestId('building-icon')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Remove/i })).not.toBeInTheDocument();
  });

  it('should render company logo image when URL is present', async () => {
    const logoUrl = 'http://example.com/logo.png';
    await setup({ companyLogoUrl: logoUrl });
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', logoUrl);
    expect(screen.queryByTestId('building-icon')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Remove/i })).toBeInTheDocument();
  });

  it('should open file input when change button is clicked', async () => {
    await setup({ companyLogoUrl: null });
    const user = userEvent.setup();
    const changeButton = screen.getByLabelText('profile.changeCompanyLogo');
    // Use the new data-testid for the file input
    const fileInput = screen.getByTestId('company-logo-file-input');
    const clickSpy = vi.spyOn(fileInput as HTMLElement, 'click');
    await user.click(changeButton);
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('should show error if invalid file is selected', async () => {
    await setup({ companyLogoUrl: null });
    const user = userEvent.setup();
    mockIsValidImage.mockReturnValueOnce(false); // Simulate invalid file
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    const fileInput = screen.getByTestId('company-logo-file-input') as HTMLElement;
    
    await act(async () => {
      await user.upload(fileInput, file);
    });
    
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument(); // Modal should not open
    
    // Check for error message
    // The error message is rendered within an Alert component
    const alert = await screen.findByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert.textContent).toMatch(/invalid file type|invalid image/i);
  });

  it('should show error if file is too large', async () => {
    await setup({ companyLogoUrl: null });
    const user = userEvent.setup();
    // Simulate isValidImage returning false (as it checks size too)
    mockIsValidImage.mockReturnValueOnce(false); 
    // Create a file that would be considered too large by actual validation, though mock handles it
    const largeFile = new File([new ArrayBuffer(FileUploadUtils.MAX_FILE_SIZE + 1)], 'large.png', { type: 'image/png' });
    const fileInput = screen.getByTestId('company-logo-file-input') as HTMLElement;

    await act(async () => {
      await user.upload(fileInput, largeFile);
    });

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument(); // Modal should not open

    const alert = await screen.findByRole('alert');
    expect(alert).toBeInTheDocument();
    // The error message from t('profile.errors.invalidImage') includes size info
    expect(alert.textContent).toMatch(/exceeds|too large|size/i);
    // More specific check based on the actual translation key might be better if available
    // For now, checking for keywords related to size.
  });
  
  it('should open crop modal when valid file is selected', async () => {
    await setup({ companyLogoUrl: null });
    const user = userEvent.setup();
    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
    const fileInput = screen.getByTestId('company-logo-file-input') as HTMLElement;
    mockIsValidImage.mockReturnValue(true); // Explicitly ensure valid
    // Debug: check isValidImage result
    // eslint-disable-next-line no-console
    console.log('DEBUG isValidImage(file):', FileUploadUtils.isValidImage(file));
    await user.upload(fileInput, file);
    // Debug: log the DOM after upload
    // eslint-disable-next-line no-console
    console.log('DEBUG DOM after upload:', document.body.innerHTML);
    expect(await screen.findByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('react-crop')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Crop me/i })).toBeInTheDocument();
  });

  it('should call uploadCompanyLogo on crop and save', async () => {
    await setup({ companyLogoUrl: null });
    const user = userEvent.setup();
    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
    const fileInput = screen.getByTestId('company-logo-file-input') as HTMLElement;
    
    mockIsValidImage.mockReturnValue(true);
    // This is a simplified mock for getCroppedImgBlob. In a real scenario, 
    // you might want this to be closer to the actual implementation or ensure 
    // canvasPreview is also mocked if it has side effects/dependencies.
    // For CompanyLogoUpload, the internal getCroppedImgBlob is used.
    // We'll rely on the mock of uploadCompanyLogoAction from the store for the assertion.

    await act(async () => {
      await user.upload(fileInput, file);
    });

    // Wait for the dialog and the crop component to be ready
    const dialog = await screen.findByTestId('dialog');
    expect(dialog).toBeInTheDocument();
    // Simulate that a crop has been "completed" by the ReactCrop component
    // In the actual component, onComplete callback sets completedCrop
    // For this test, we're directly testing the click after modal is open.
    // The button's disabled state depends on completedCrop, so we need to ensure it's clickable.
    // A more robust way would be to mock ReactCrop's onComplete to set a state
    // or ensure the button becomes enabled. For now, let's assume it would be.

    // Find the save button within the dialog
    // The text could be "Upload and Save" or similar based on i18n
    const saveButton = screen.getByRole('button', { name: /upload and save/i });
    expect(saveButton).toBeInTheDocument();
    
    // To ensure the button is enabled, we'd typically need completedCrop to be set.
    // Since we are not deeply mocking ReactCrop's internal state changes,
    // we'll proceed assuming the button would be enabled after a crop.
    // If the test fails due to the button being disabled, this area needs refinement.

    await act(async () => {
      await user.click(saveButton);
    });

    expect(mockUploadCompanyLogo).toHaveBeenCalledTimes(1);
    // Optionally, check arguments if `getCroppedImgBlob` was more precisely mocked:
    // expect(mockUploadCompanyLogo).toHaveBeenCalledWith(expect.stringContaining('data:image/png;base64,'));
    
    // Check if the modal closes (dialog should not be in the document)
    // This depends on uploadCompanyLogo resolving successfully and closeModalAndReset being called
    await waitFor(() => {
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });
  });

  it('should call removeCompanyLogo when remove button is clicked', async () => {
    await setup({ companyLogoUrl: 'http://example.com/logo.png' }); // Ensure button is visible
    const user = userEvent.setup();
    const removeButton = screen.getByRole('button', { name: /Remove/i });
    await user.click(removeButton);
    expect(mockRemoveCompanyLogo).toHaveBeenCalledTimes(1);
  });

  it('should display error from store on upload failure', async () => {
    const storeErrorMessage = 'Upload failed directly from store';
    await setup({ companyLogoUrl: null });

    // Configure mockUploadCompanyLogo to simulate failure and set store error
    mockUploadCompanyLogo.mockImplementation(async () => {
      act(() => {
         // Simulate the store setting its error state upon action failure
        currentStoreState.error = storeErrorMessage;
        currentStoreState.isLoading = false; // Ensure loading is also reset
      });
      return Promise.resolve(null); // Action returns null on failure
    });

    const user = userEvent.setup();
    const file = new File(['(⌐□_□)'], 'validpic.png', { type: 'image/png' });
    const fileInput = screen.getByTestId('company-logo-file-input') as HTMLElement;
    
    mockIsValidImage.mockReturnValue(true);

    await act(async () => {
      await user.upload(fileInput, file);
    });

    const dialog = await screen.findByTestId('dialog');
    expect(dialog).toBeInTheDocument();
    
    const saveButton = screen.getByRole('button', { name: /upload and save/i });
    await act(async () => {
      await user.click(saveButton);
    });

    expect(mockUploadCompanyLogo).toHaveBeenCalledTimes(1);

    // Dialog should close even on failure, error displayed outside
    await waitFor(() => {
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    const alert = await screen.findByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert.textContent).toContain(storeErrorMessage);
  });

  it('should display error from store on remove failure', async () => {
    const storeErrorMessage = 'Remove failed directly from store';
    await setup({ companyLogoUrl: 'http://example.com/logo.png' }); // Ensure remove button is visible

    // Configure mockRemoveCompanyLogo to simulate failure and set store error
    mockRemoveCompanyLogo.mockImplementation(async () => {
      act(() => {
        currentStoreState.error = storeErrorMessage;
        currentStoreState.isLoading = false;
      });
      return Promise.resolve(false); // Action returns false on failure
    });

    const user = userEvent.setup();
    const removeButton = screen.getByRole('button', { name: /Remove/i });
    
    await act(async () => {
      await user.click(removeButton);
    });

    expect(mockRemoveCompanyLogo).toHaveBeenCalledTimes(1);

    const alert = await screen.findByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert.textContent).toContain(storeErrorMessage);
  });

}); 
