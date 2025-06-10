import { describe, it, expect, vi } from 'vitest';
import { DefaultCompanyService } from '@/services/company/companyService';
import { getServiceSupabase } from '@/lib/database/supabase';

vi.mock('@/lib/database/supabase', () => {
  const single = vi.fn();
  const remove = vi.fn();
  const eq: any = vi.fn(() => ({ eq, single }));

  return {
    getServiceSupabase: vi.fn(() => ({
      from: vi.fn(() => ({
        select: vi.fn(() => ({ eq })),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(() => ({ eq })),
      })),
      storage: { from: vi.fn(() => ({ remove })) }
    }))
  };
});

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

describe('DefaultCompanyService profile operations', () => {
  it('creates profile', async () => {
    const supabase = getServiceSupabase();
    (supabase.from('company_profiles').insert as any).mockReturnValue({
      select: vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: { id: 'c1' }, error: null }) }))
    });
    const service = new DefaultCompanyService();
    const result = await service.createProfile('u1', { name: 'C', legal_name: 'C', industry: 'Tech', size_range: '1-10', founded_year: 2020 });
    expect(result).toEqual({ id: 'c1' });
  });

  it('lists domains', async () => {
    const supabase = getServiceSupabase();
    (supabase.from('company_domains').select as any).mockReturnValue({
      eq: vi.fn(() => ({ order: vi.fn(() => ({ order: vi.fn().mockResolvedValue({ data: [], error: null }) })) }))
    });
    const service = new DefaultCompanyService();
    const result = await service.listDomains('comp1');
    expect(Array.isArray(result)).toBe(true);
  });

  it('gets domain by id', async () => {
    const supabase = getServiceSupabase();
    (supabase.from('company_domains').select as any).mockReturnValue({
      eq: vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: { id: 'd1' }, error: null }) }))
    });
    const service = new DefaultCompanyService();
    const result = await service.getDomainById('d1');
    expect(result).toEqual({ id: 'd1' });
  });
});

describe('DefaultCompanyService document operations', () => {
  it('deletes document', async () => {
    const supabase = getServiceSupabase();
    const single = vi.fn().mockResolvedValue({ data: { id: 'doc1', file_path: 'p1', company_id: 'c1' }, error: null });
    (supabase.from as any).mockReturnValue({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ eq: vi.fn(() => ({ single })) })) })),
      delete: vi.fn(() => ({ eq: vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) })) })),
    });
    (supabase.storage.from as any).mockReturnValue({ remove: vi.fn().mockResolvedValue({ error: null }) });

    const service = new DefaultCompanyService();
    await service.deleteDocument('c1', 'doc1');
    expect(single).toHaveBeenCalled();
  });
});
