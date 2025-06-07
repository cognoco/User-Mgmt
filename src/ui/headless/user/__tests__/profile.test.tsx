import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Profile from '@/src/ui/headless/user/Profile'97;
import { TestWrapper } from '@/src/tests/utils/testWrapper'132;
import { MockUserService } from '@/src/services/user/__tests__/mocks/mockUserService'201;

vi.unmock('@/hooks/auth/useAuth');

describe('Headless Profile', () => {
  it('renders user profile data', async () => {
    const mockUserService = new MockUserService();
    const getSpy = vi.spyOn(mockUserService, 'getUserProfile');
    mockUserService.setMockProfile('user-123', {
      id: 'user-123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      fullName: 'Test User',
      isActive: true,
      isVerified: true,
      userType: 'private'
    });

    render(
      <TestWrapper authenticated customServices={{ userService: mockUserService }}>
        <Profile>
          {({ profile }) => <div data-testid="profile">{profile?.fullName}</div>}
        </Profile>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getSpy).toHaveBeenCalled();
      expect(screen.getByTestId('profile')).toHaveTextContent('Test User');
    });
  });

  it('shows loading state', () => {
    const mockUserService = new MockUserService();
    mockUserService.getUserProfile = vi.fn(() => new Promise(() => {}));

    render(
      <TestWrapper authenticated customServices={{ userService: mockUserService }}>
        <Profile>
          {({ isLoading, profile }) => (
            <div data-testid="profile">{isLoading ? 'Loading...' : profile?.fullName}</div>
          )}
        </Profile>
      </TestWrapper>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error state', async () => {
    const mockUserService = new MockUserService();
    const errorSpy = vi
      .spyOn(mockUserService, 'getUserProfile')
      .mockRejectedValue(new Error('Failed to load user'));

    render(
      <TestWrapper authenticated customServices={{ userService: mockUserService }}>
        <Profile>
          {({ error, profile, isLoading }) => (
            <div data-testid="profile">
              {error ?? (isLoading ? 'Loading...' : profile?.fullName)}
            </div>
          )}
        </Profile>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
      expect(screen.getByTestId('profile')).toHaveTextContent('Failed to load user');
    });
  });
});
