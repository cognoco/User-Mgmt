import '@/tests/i18nTestSetup';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { UserManagementProvider } from '@/lib/auth/UserManagementProvider';
import { RegistrationForm } from '../RegistrationForm';
import { ThemeProvider } from '@/ui/primitives/theme-provider';
import { UserType } from '@/types/user-type';
import { OAuthProvider } from '@/types/oauth';

function renderForm() {
  const config = {
    corporateUsers: {
      enabled: true,
      registrationEnabled: true,
      defaultUserType: UserType.PRIVATE,
      requireCompanyValidation: false,
      allowUserTypeChange: true,
      companyFieldsRequired: ['companyName'],
    },
    twoFactor: { enabled: false, required: false, methods: [] },
    oauth: {
      enabled: true,
      providers: [
        { provider: OAuthProvider.GOOGLE, clientId: 'id', redirectUri: 'uri', enabled: true, label: 'Google' },
        { provider: OAuthProvider.APPLE, clientId: 'id', redirectUri: 'uri', enabled: true, label: 'Apple' },
      ],
      autoLink: true,
      allowUnverifiedEmails: false,
      defaultRedirectPath: '/',
    },
  };
  return render(
    <ThemeProvider defaultTheme="light" storageKey="test-theme">
      <UserManagementProvider config={config}>
        <RegistrationForm />
      </UserManagementProvider>
    </ThemeProvider>
  );
}

describe('RegistrationForm integration', () => {
  it('renders OAuth buttons', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /sign up with google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up with apple/i })).toBeInTheDocument();
  });
});
