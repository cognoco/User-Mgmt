import { describe, it, expect, vi } from 'vitest';
import { DefaultFileStorageService } from '../DefaultFileStorageService';
import type { StorageAdapter } from '@/core/storage/interfaces';

function createAdapterMock(): StorageAdapter {
  return {
    upload: vi.fn(),
    delete: vi.fn(),
    getPublicUrl: vi.fn(),
  };
}

describe('DefaultFileStorageService', () => {
  it('delegates file upload to adapter', async () => {
    const adapter = createAdapterMock();
    (adapter.upload as any).mockResolvedValue({ success: true, path: 'p' });
    const service = new DefaultFileStorageService(adapter);
    const res = await service.uploadFile('bucket', 'p', new ArrayBuffer(4));
    expect(adapter.upload).toHaveBeenCalled();
    expect(res).toEqual({ success: true, path: 'p' });
  });

  it('returns error when adapter upload throws', async () => {
    const adapter = createAdapterMock();
    (adapter.upload as any).mockRejectedValue(new Error('fail'));
    const service = new DefaultFileStorageService(adapter);
    const res = await service.uploadFile('b', 'p', new ArrayBuffer(1));
    expect(res.success).toBe(false);
    expect(res.error).toBe('fail');
  });

  it('delegates delete to adapter', async () => {
    const adapter = createAdapterMock();
    (adapter.delete as any).mockResolvedValue({ success: true });
    const service = new DefaultFileStorageService(adapter);
    const res = await service.deleteFile('b', 'p');
    expect(adapter.delete).toHaveBeenCalledWith('p');
    expect(res.success).toBe(true);
  });

  it('returns error when delete throws', async () => {
    const adapter = createAdapterMock();
    (adapter.delete as any).mockRejectedValue(new Error('oops'));
    const service = new DefaultFileStorageService(adapter);
    const res = await service.deleteFile('b', 'p');
    expect(res.success).toBe(false);
    expect(res.error).toBe('oops');
  });

  it('delegates getFileUrl to adapter', async () => {
    const adapter = createAdapterMock();
    (adapter.getPublicUrl as any).mockReturnValue('url');
    const service = new DefaultFileStorageService(adapter);
    const res = await service.getFileUrl('b', 'p');
    expect(adapter.getPublicUrl).toHaveBeenCalledWith('p');
    expect(res).toBe('url');
  });
});
