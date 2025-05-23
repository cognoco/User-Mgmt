// @vitest-environment jsdom
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataDeletionRequest } from '../DataDeletionRequest';
import { useDataDeletion } from '@/hooks/gdpr/useDataDeletion';

vi.mock('@/hooks/gdpr/useDataDeletion', () => ({ useDataDeletion: vi.fn() }));

const mockHook = useDataDeletion as unknown as ReturnType<typeof vi.fn>;

describe('DataDeletionRequest', () => {
  beforeEach(() => {
    mockHook.mockReturnValue({
      requestDeletion: vi.fn(),
      isLoading: false,
      success: false,
      error: null,
    });
  });

  it('calls requestDeletion', () => {
    const { requestDeletion } = mockHook.mock.results[0].value;
    const { getByRole } = render(
      <DataDeletionRequest
        render={({ requestDeletion: del }) => (
          <button onClick={del}>delete</button>
        )}
      />
    );
    fireEvent.click(getByRole('button'));
    expect(requestDeletion).toHaveBeenCalled();
  });
});
