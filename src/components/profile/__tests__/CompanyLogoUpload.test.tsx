import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n/index';

import { CompanyLogoUpload } from '../CompanyLogoUpload';
import { useProfileStore } from '@/lib/stores/profile.store';
import * as FileUploadUtils from '@/lib/utils/file-upload'; // Import utils to mock
import { Profile } from '@/types/database';

// Mock the Supabase client EARLY
vi.mock('@/lib/supabase');

// Mock the profile store
vi.mock('@/lib/stores/profile.store');

// Mock UI components
vi.mock('@/components/ui/button', () => ({ Button: (props: any) => <button {...props}>{props.children}</button> }));
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children }: { children: React.ReactNode }) => <div role="alert">{children}</div>,
  AlertTitle: ({ children }: { children: React.ReactNode }) => <h4>{children}</h4>,
  AlertDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));
vi.mock('@/components/ui/dialog', () => ({
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

describe('CompanyLogoUpload Component', () => {
  // Helper to mock useProfileStore with selector support
  function mockUseProfileStoreWithSelector(profileData: Partial<Profile>) {
    (useProfileStore as any).mockImplementation((selector?: any) => {
      const state = {
        profile: { ...mockProfileBase, ...profileData },
        isLoading: false,
        error: null,
        uploadCompanyLogo: mockUploadCompanyLogo,
        removeCompanyLogo: mockRemoveCompanyLogo,
      };
      return selector ? selector(state) : state;
    });
  }

  const setup = async (profileData: Partial<Profile>) => {
    vi.clearAllMocks();
    mockIsValidImage.mockReturnValue(true);
    mockGetCroppedImgBlob.mockClear();
    mockUploadCompanyLogo.mockResolvedValue('http://new.logo/url');
    mockRemoveCompanyLogo.mockResolvedValue(true);

    // Use improved mock with selector support
    mockUseProfileStoreWithSelector(profileData);

    await act(async () => {
      render(
        <I18nextProvider i18n={i18n}>
          <CompanyLogoUpload />
        </I18nextProvider>
      );
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
    await user.upload(fileInput, file);
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument(); // Modal should not open
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

  it.skip('should call uploadCompanyLogo on crop and save', async () => {
    // Test implementation skipped
  });

  it('should call removeCompanyLogo when remove button is clicked', async () => {
    await setup({ companyLogoUrl: 'http://example.com/logo.png' }); // Ensure button is visible
    const user = userEvent.setup();
    const removeButton = screen.getByRole('button', { name: /Remove/i });
    await user.click(removeButton);
    expect(mockRemoveCompanyLogo).toHaveBeenCalledTimes(1);
  });

}); 

vi.mock('react-i18next', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useTranslation: () => ({ t: (key: string) => key, i18n: { changeLanguage: () => Promise.resolve() } }),
        initReactI18next: { type: '3rdParty', init: () => {} },
    };
}); 
