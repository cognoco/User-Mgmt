import { describe, it, expect, vi } from 'vitest';
import { DefaultCompanyService } from '../companyService';
import { getServiceSupabase } from '@/lib/database/supabase';

vi.mock('@/lib/database/supabase', () => ({
  getServiceSupabase: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }))
}));

describe('DefaultCompanyService.getProfileByUserId', () => {
  it('returns profile when found', async () => {
    const supabase = getServiceSupabase();
    (supabase.from('company_profiles').select('*').eq as any).mockReturnValue({
      single: vi.fn().mockResolvedValue({ data: { id: 'c1' }, error: null })
    });
    const service = new DefaultCompanyService();
    const result = await service.getProfileByUserId('u1');
    expect(result).toEqual({ id: 'c1' });
  });

  it('returns null when not found', async () => {
    const supabase = getServiceSupabase();
    (supabase.from('company_profiles').select('*').eq as any).mockReturnValue({
      single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
    });
    const service = new DefaultCompanyService();
    const result = await service.getProfileByUserId('u1');
    expect(result).toBeNull();
  });

  it('throws for other errors', async () => {
    const supabase = getServiceSupabase();
    (supabase.from('company_profiles').select('*').eq as any).mockReturnValue({
      single: vi.fn().mockResolvedValue({ data: null, error: { code: '123', message: 'db error' } })
    });
    const service = new DefaultCompanyService();
    await expect(service.getProfileByUserId('u1')).rejects.toThrow('Failed to fetch company profile');
  });
});
