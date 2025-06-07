// @vitest-environment jsdom
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataExportRequest } from '@/src/ui/headless/gdpr/DataExportRequest'155;
import { useDataExport } from '@/hooks/gdpr/useDataExport';

vi.mock('@/hooks/gdpr/useDataExport', () => ({ useDataExport: vi.fn() }));

const mockHook = useDataExport as unknown as ReturnType<typeof vi.fn>;
let requestExportFn: ReturnType<typeof vi.fn>;

describe('DataExportRequest', () => {
  beforeEach(() => {
    requestExportFn = vi.fn();
    mockHook.mockReturnValue({
      requestExport: requestExportFn,
      isLoading: false,
      error: null,
      downloadUrl: null,
    });
  });

  it('calls requestExport', () => {
    const { getByRole } = render(
      <DataExportRequest
        render={({ requestExport: req }) => (
          <button onClick={req}>export</button>
        )}
      />
    );
    fireEvent.click(getByRole('button'));
    expect(requestExportFn).toHaveBeenCalled();
  });
});
