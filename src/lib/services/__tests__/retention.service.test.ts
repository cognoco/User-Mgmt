import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RetentionStatus, RetentionType } from '../../database/schemas/retention';
import { retentionService } from '../retention.service';
import { getServiceSupabase } from '../../database/supabase';

vi.mock('../../database/supabase');

const supabase = {
  from: vi.fn(() => supabase),
  select: vi.fn(() => supabase),
  eq: vi.fn(() => supabase),
  single: vi.fn(),
  maybeSingle: vi.fn(),
  update: vi.fn(() => ({ eq: vi.fn(), error: null })),
};

(getServiceSupabase as unknown as vi.Mock).mockReturnValue(supabase);

describe('RetentionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reactivates account successfully', async () => {
    supabase.single
      .mockResolvedValueOnce({ data: { last_sign_in_at: '2024-01-01' }, error: null })
      .mockResolvedValueOnce({
        data: { id: '1', status: RetentionStatus.INACTIVE, retention_type: RetentionType.PERSONAL },
        error: null,
      });
    supabase.update.mockReturnValueOnce({ eq: vi.fn().mockResolvedValue({ error: null }) });

    const result = await retentionService.reactivateAccount('123');

    expect(result).toBe(true);
    expect(supabase.update).toHaveBeenCalled();
  });

  it('fails to reactivate anonymized account', async () => {
    supabase.single
      .mockResolvedValueOnce({ data: { last_sign_in_at: '2024-01-01' }, error: null })
      .mockResolvedValueOnce({
        data: { id: '1', status: RetentionStatus.ANONYMIZED, retention_type: RetentionType.PERSONAL },
        error: null,
      });

    await expect(retentionService.reactivateAccount('123')).rejects.toThrow('Cannot reactivate an anonymized account');
  });

  it('gets user retention status', async () => {
    supabase.maybeSingle.mockResolvedValueOnce({ data: { id: '1' }, error: null });

    const result = await retentionService.getUserRetentionStatus('123');

    expect(result).toEqual({ id: '1' });
    expect(supabase.from).toHaveBeenCalledWith('retention_records');
  });

  it('throws on getUserRetentionStatus error', async () => {
    supabase.maybeSingle.mockResolvedValueOnce({ data: null, error: { message: 'fail' } });

    await expect(retentionService.getUserRetentionStatus('123')).rejects.toThrow('fail');
  });
});
