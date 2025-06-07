import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import BusinessSSOSetup from '@/src/ui/styled/auth/BusinessSSOSetup';

let state: any;

vi.mock('../../../headless/auth/BusinessSSOSetup', () => ({
  BusinessSSOSetup: ({ children }: any) => children(state)
}));

describe('BusinessSSOSetup styled component', () => {
  beforeEach(() => {
    state = {
      availableProviders: [
        {
          id: 'google',
          name: 'Google',
          logoUrl: '',
          configFields: [
            { id: 'clientId', name: 'Client ID', description: '', required: true, type: 'text' }
          ]
        }
      ],
      selectedProvider: {
        id: 'google',
        name: 'Google',
        logoUrl: '',
        configFields: [
          { id: 'clientId', name: 'Client ID', description: '', required: true, type: 'text' }
        ]
      },
      selectProvider: vi.fn((id: string) => {
        state.selectedProvider = state.availableProviders.find((p: any) => p.id === id) || null;
      }),
      configValues: {},
      setConfigValue: vi.fn((id: string, value: string) => {
        state.configValues[id] = value;
      }),
      handleSubmit: vi.fn((e: any) => e.preventDefault()),
      isSubmitting: false,
      isValid: true,
      errors: { config: {}, form: undefined },
      touched: {},
      handleBlur: vi.fn()
    };
  });

  it('allows selecting provider and submitting configuration', async () => {
    const user = userEvent.setup();
    render(<BusinessSSOSetup organizationId="org1" />);

    // select provider
    await user.selectOptions(screen.getByRole('combobox'), 'google');
    expect(state.selectProvider).toHaveBeenCalledWith('google');

    // fill config field
    await user.type(screen.getByLabelText('Client ID'), 'abc');
    expect(state.setConfigValue).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /save/i }));
    expect(state.handleSubmit).toHaveBeenCalled();
  });

  it('displays form error', () => {
    state.errors.form = 'Failed';
    render(<BusinessSSOSetup organizationId="org1" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Failed');
  });
});
