// @vitest-environment jsdom
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataExport } from '@/ui/headless/profile/DataExport';
import { ExportStatus } from '@/lib/exports/types';
import useDataExport from '@/hooks/user/useDataExport';

vi.mock('@/hooks/user/useDataExport');
const mockHook = useDataExport as unknown as vi.Mock;

describe('DataExport headless', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles immediate export', async () => {
    const requestExport = vi.fn().mockResolvedValue({ status: ExportStatus.COMPLETED, downloadUrl: 'url' });
    mockHook.mockReturnValue({ requestExport, refreshStatus: vi.fn(), status: null, isLoading: false, error: null });

    let props: any;
    render(<DataExport>{p => { props = p; return <div/>; }}</DataExport>);

    await act(async () => {
      await props.onRequestExport();
    });
    expect(props.exportStatus).toBe('ready');
    expect(props.downloadUrl).toBe('url');
  });

  it('handles asynchronous export', async () => {
    const requestExport = vi.fn().mockResolvedValue({ status: ExportStatus.PENDING });
    const refreshStatus = vi.fn().mockResolvedValue({ status: ExportStatus.COMPLETED, downloadUrl: 'url' });
    mockHook.mockReturnValue({ requestExport, refreshStatus, status: null, isLoading: false, error: null });

    let props: any;
    render(<DataExport>{p => { props = p; return <div/>; }}</DataExport>);

    await act(async () => {
      await props.onRequestExport();
    });
    expect(props.exportStatus).toBe('in_progress');
    await act(async () => {
      await props.onDownload();
    });
    expect(props.exportStatus).toBe('ready');
    expect(refreshStatus).toHaveBeenCalled();
  });

  it('handles export error', async () => {
    const requestExport = vi.fn().mockResolvedValue(null);
    mockHook.mockReturnValue({ requestExport, refreshStatus: vi.fn(), status: null, isLoading: false, error: 'fail' });

    let props: any;
    render(<DataExport>{p => { props = p; return <div/>; }}</DataExport>);

    await act(async () => {
      await props.onRequestExport();
    });
    expect(props.exportStatus).toBe('error');
    expect(props.errors).toBe('fail');
  });
});
