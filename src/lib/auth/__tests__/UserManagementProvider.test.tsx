import { render, screen } from '@testing-library/react';
import { UserManagementProvider } from '@/lib/auth/UserManagementProvider';
import { describe, it, expect } from 'vitest';

describe('UserManagementProvider', () => {
  it('renders children correctly', () => {
    render(
      <UserManagementProvider>
        <div data-testid="child">Test Child</div>
      </UserManagementProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('provides necessary context values', () => {
    // Add tests here to verify context values provided by UserManagementProvider
    // Example: expect(useContext(AuthContext)).toHaveProperty('user');
  });
}); 