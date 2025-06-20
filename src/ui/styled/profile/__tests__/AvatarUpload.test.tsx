import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AvatarUpload } from '@/ui/styled/profile/AvatarUpload';

// Mock the profile store
const mockRemoveAvatar = vi.fn().mockResolvedValue(true);
const storeMock = {
  profile: {
    avatar_url: 'https://example.com/avatar.jpg',
    full_name: 'Test User'
  },
  uploadAvatar: vi.fn().mockResolvedValue('https://example.com/new-avatar.jpg'),
  removeAvatar: mockRemoveAvatar,
  isLoading: false,
  error: null
};
vi.mock('@/lib/stores/profile.store', () => ({
  useProfileStore: vi.fn(() => storeMock)
}));

// Mock the UserManagementProvider
vi.mock('@/lib/auth/UserManagementProvider', () => ({
  useUserManagement: () => ({
    platform: 'web',
    isNative: false
  })
}));

// Mock the react-image-crop module
vi.mock('react-image-crop', () => {
  return {
    ReactCrop: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-crop">{children}</div>,
    centerCrop: vi.fn(),
    makeAspectCrop: vi.fn(),
    default: vi.fn()
  };
});

// Mock useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'profile.changeAvatar': 'Change Profile Image',
        'profile.uploadAndSave': 'Upload & Save',
        'profile.selectImage': 'Select Avatar',
        'profile.dragOrClick': 'Drag and drop an image here, or click to select',
        'profile.applyAvatar': 'Apply Selected Avatar',
        'profile.removeAvatar': 'Remove profile picture',
        'profile.chooseAvatar': 'Select Avatar',
        'profile.uploadPhoto': 'Upload',
        'profile.updateAvatar': 'Update Avatar',
        'common.cancel': 'Cancel'
      };
      return translations[key] || key;
    }
  })
}));

// Mock axios api
vi.mock('@/lib/api/axios', () => ({
  api: {
    get: vi.fn().mockResolvedValue({
      data: {
        avatars: [
          { id: 'avatar1', url: '/assets/avatars/avatar1.png', name: 'Default 1' },
          { id: 'avatar2', url: '/assets/avatars/avatar2.png', name: 'Default 2' }
        ]
      }
    }),
    post: vi.fn()
  }
}));

// Mock utils
vi.mock('@/lib/utils/file-upload', () => ({
  isValidImage: vi.fn().mockReturnValue(true),
  fileToBase64: vi.fn().mockResolvedValue('data:image/png;base64,mockbase64'),
  MAX_FILE_SIZE: 5242880,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif']
}));

describe('AvatarUpload Component', () => {
  let user: ReturnType<typeof userEvent.setup>;
  
  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
    
    // Mock canvas and blob URL creation
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      drawImage: vi.fn(),
      canvas: { width: 100, height: 100 }
    })) as any;
  });
  
  test('renders avatar and change button', async () => {
    render(<AvatarUpload />);
    
    expect(
      screen.getByRole('button', { name: /change profile image/i })
    ).toBeInTheDocument();
  });
  
  test('handles avatar removal', async () => {
    render(<AvatarUpload />);
    
    const removeButton = screen.getByRole('button', { name: /remove/i });
    await user.click(removeButton);
    
    expect(mockRemoveAvatar).toHaveBeenCalled();
  });
  
  test('opens modal on avatar click', async () => {
    render(<AvatarUpload />);
    
    // Click the change avatar button
    const openButton = screen.getByRole('button', { name: /change profile image/i });
    await user.click(openButton);
    
    // Check if modal is open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    // Check if tabs are present
    expect(screen.getByRole('tab', { name: /select avatar/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /upload/i })).toBeInTheDocument();
  });

  // More test cases can be added here for the predefined avatar selection and 
  // custom photo upload flows, but these basic tests provide coverage for the 
  // core functionality without getting into complex mocking
}); 