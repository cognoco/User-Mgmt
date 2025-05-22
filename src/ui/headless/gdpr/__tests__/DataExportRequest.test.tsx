// @vitest-environment jsdom
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataExportRequest } from '../DataExportRequest';
import { useDataExport } from '@/hooks/gdpr/use-data-export';

vi.mock('@/hooks/gdpr/use-data-export', () => ({ useDataExport: vi.fn() }));

const mockHook = useDataExport as unknown as ReturnType<typeof vi.fn>;

describe('DataExportRequest', () => {
  beforeEach(() => {
    mockHook.mockReturnValue({
      requestExport: vi.fn(),
      isLoading: false,
      error: null,
      downloadUrl: null,
    });
  });

  it('calls requestExport', () => {
    const { requestExport } = mockHook.mock.results[0].value;
    const { getByRole } = render(
      <DataExportRequest
        render={({ requestExport: req }) => (
          <button onClick={req}>export</button>
        )}
      />
    );
    fireEvent.click(getByRole('button'));
    expect(requestExport).toHaveBeenCalled();
  });
});
