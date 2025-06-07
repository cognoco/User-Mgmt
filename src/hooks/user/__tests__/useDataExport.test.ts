import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDataExport } from '@/src/hooks/user/useDataExport';
import { useAuth } from '@/hooks/auth/useAuth';
import * as exportService from '@/lib/exports/export.service';

vi.mock('@/hooks/auth/useAuth');
vi.mock('@/lib/exports/export.service', () => ({
  isUserRateLimited: vi.fn(),
  createUserDataExport: vi.fn(),
  processUserDataExport: vi.fn(),
  checkUserExportStatus: vi.fn(),
  ExportStatus: { COMPLETED: 'completed', PENDING: 'pending' },
  ExportFormat: { JSON: 'json' }
}));

const { ExportStatus, ExportFormat } = exportService as any;

describe('useDataExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error when user not authenticated', async () => {
    (useAuth as unknown as vi.Mock).mockReturnValue({ user: null });
    const { result } = renderHook(() => useDataExport());
    await act(async () => {
      await result.current.requestExport();
    });
    expect(result.current.error).toBe('User not authenticated');
  });

  it('handles export flow for small dataset', async () => {
    (useAuth as unknown as vi.Mock).mockReturnValue({ user: { id: 'u1' } });
    vi.mocked(exportService.isUserRateLimited).mockResolvedValue(false);
    vi.mocked(exportService.createUserDataExport).mockResolvedValue({ id: 'e1', isLargeDataset: false } as any);
    vi.mocked(exportService.processUserDataExport).mockResolvedValue();
    vi.mocked(exportService.checkUserExportStatus).mockResolvedValue({
      id: 'e1', status: ExportStatus.COMPLETED, isLargeDataset: false, message: 'done', format: ExportFormat.JSON
    });

    const { result } = renderHook(() => useDataExport());
    await act(async () => {
      await result.current.requestExport();
    });

    expect(exportService.createUserDataExport).toHaveBeenCalledWith('u1', undefined);
    expect(exportService.processUserDataExport).toHaveBeenCalledWith('e1', 'u1');
    expect(result.current.status?.status).toBe(ExportStatus.COMPLETED);
    expect(result.current.error).toBeNull();
  });

  it('refreshStatus calls checkUserExportStatus', async () => {
    (useAuth as unknown as vi.Mock).mockReturnValue({ user: { id: 'u1' } });
    vi.mocked(exportService.isUserRateLimited).mockResolvedValue(false);
    vi.mocked(exportService.createUserDataExport).mockResolvedValue({ id: 'e1', isLargeDataset: true } as any);
    vi.mocked(exportService.checkUserExportStatus)
      .mockResolvedValueOnce({ id: 'e1', status: ExportStatus.PENDING, isLargeDataset: true, message: '', format: ExportFormat.JSON })
      .mockResolvedValueOnce({ id: 'e1', status: ExportStatus.COMPLETED, isLargeDataset: true, message: 'done', format: ExportFormat.JSON });

    const { result } = renderHook(() => useDataExport());
    await act(async () => {
      await result.current.requestExport();
    });

    await act(async () => {
      await result.current.refreshStatus();
    });

    expect(exportService.checkUserExportStatus).toHaveBeenLastCalledWith('e1');
    expect(result.current.status?.status).toBe(ExportStatus.COMPLETED);
  });
});
