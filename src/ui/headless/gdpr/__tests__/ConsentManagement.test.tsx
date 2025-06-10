// @vitest-environment jsdom
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConsentManagement } from '@/ui/headless/gdpr/ConsentManagement';
import { usePreferencesStore } from '@/lib/stores/preferences.store';

vi.mock('@/lib/stores/preferences.store', () => ({ usePreferencesStore: vi.fn() }));

const updatePreferences = vi.fn();
const fetchPreferences = vi.fn();

beforeEach(() => {
  (usePreferencesStore as unknown as vi.Mock).mockReturnValue({
    preferences: null,
    fetchPreferences,
    updatePreferences,
    isLoading: false,
    error: null,
  });
  updatePreferences.mockReset();
  fetchPreferences.mockReset();
});

describe('ConsentManagement', () => {
  it('fetches preferences if missing', () => {
    render(<ConsentManagement render={() => null} />);
    expect(fetchPreferences).toHaveBeenCalled();
  });

  it('saves updated marketing preference', () => {
    (usePreferencesStore as unknown as vi.Mock).mockReturnValue({
      preferences: { notifications: { marketing: false } },
      fetchPreferences,
      updatePreferences,
      isLoading: false,
      error: null,
    });

    const { getByRole, getByTestId } = render(
      <ConsentManagement
        render={({ handleSave, setMarketing, marketing }) => (
          <div>
            <span data-testid="state">{marketing ? 'on' : 'off'}</span>
            <button onClick={() => { setMarketing(true); handleSave(); }}>save</button>
          </div>
        )}
      />
    );

    expect(getByTestId('state').textContent).toBe('off');
    fireEvent.click(getByRole('button'));
    expect(updatePreferences).toHaveBeenCalledWith({ notifications: { marketing: true } });
  });
});
