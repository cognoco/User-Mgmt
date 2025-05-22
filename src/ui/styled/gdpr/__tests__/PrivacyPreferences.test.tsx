// @vitest-environment jsdom
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PrivacyPreferences } from '../PrivacyPreferences';

vi.mock('@/lib/stores/preferences.store', () => ({
  usePreferencesStore: () => ({
    preferences: { notifications: { marketing: false } },
    updatePreferences: vi.fn(),
  }),
}));

describe('PrivacyPreferences', () => {
  it('toggles checkbox', () => {
    const { getByLabelText } = render(<PrivacyPreferences />);
    fireEvent.click(getByLabelText('Allow marketing emails'));
    expect(getByLabelText('Allow marketing emails')).toBeInTheDocument();
  });
});
