import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, DELETE } from '@/app/api/storage/files/route'64;
import { getStorageService } from '@/services/storage';
import { createAuthenticatedRequest } from '@/tests/utils/requestHelpers'162;

vi.mock('@/services/storage', () => ({ getStorageService: vi.fn() }));
vi.mock('@/lib/auth/utils', () => ({
  getUserFromRequest: vi.fn().mockResolvedValue({ id: 'u1' })
}));

const service = {
  listFiles: vi.fn().mockResolvedValue(['a']),
  deleteFile: vi.fn().mockResolvedValue({ success: true }),
};

beforeEach(() => {
  vi.resetAllMocks();
  (getStorageService as unknown as vi.Mock).mockReturnValue(service);
});

describe('files route', () => {
  it('lists files', async () => {
    const req = createAuthenticatedRequest('GET', 'http://test');
    const res = await GET(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.files[0]).toBe('a');
  });

  it('deletes file', async () => {
    const req = createAuthenticatedRequest('DELETE', 'http://test');
    (req as any).json = async () => ({ filePath: 'p' });
    const res = await DELETE(req);
    expect(res.status).toBe(200);
    expect(service.deleteFile).toHaveBeenCalledWith('files', 'p');
  });
});
