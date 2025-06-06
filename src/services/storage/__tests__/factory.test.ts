import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getStorageService } from '../factory';
import { SupabaseStorageAdapter } from '@/adapters/storage/supabase/SupabaseStorageAdapter';

vi.mock('@/adapters/storage/supabase/SupabaseStorageAdapter');

const MockAdapter = SupabaseStorageAdapter as unknown as vi.Mock;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getStorageService', () => {
  it('creates and caches service instance', () => {
    const service1 = getStorageService({ bucket: 'b', reset: true });
    const service2 = getStorageService();
    expect(MockAdapter).toHaveBeenCalledWith('b');
    expect(service1).toBe(service2);
  });
});
